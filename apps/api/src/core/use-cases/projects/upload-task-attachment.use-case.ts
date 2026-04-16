import { IStorageService } from '../../domain/ports/storage-service.port';
import { ITaskRepository } from '../../domain/ports/task-repository.port';
import { IAttachmentRepository } from '../../domain/ports/attachment-repository.port';
import { CheckPermissionService } from './check-permission.service';
import { TaskNotFoundError, PermissionDeniedError } from '../../domain/errors/project.errors';
import { randomUUID } from 'crypto';

export interface UploadAttachmentInput {
  taskId: string;
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export class UploadTaskAttachmentUseCase {
  constructor(
    private readonly storageService: IStorageService,
    private readonly taskRepository: ITaskRepository,
    private readonly checkPermission: CheckPermissionService,
    private readonly attachmentRepository: IAttachmentRepository,
  ) {}

  private generateSafeFileName(originalName: string): string {
    // Generate a cryptographically secure UUID for the file name
    const uuid = randomUUID();

    // Extract and sanitize extension from original filename if present
    const lastDotIndex = originalName.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex < originalName.length - 1) {
      const extension = originalName.substring(lastDotIndex);
      // Sanitize extension: only allow alphanumeric and dots, remove path separators
      const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
      // Ensure extension doesn't contain path traversal attempts
      const cleanExtension = safeExtension.replace(/\.\./g, '.');
      return `${uuid}${cleanExtension}`;
    }

    // No extension or invalid filename, just use UUID
    return uuid;
  }

  async execute(input: UploadAttachmentInput): Promise<any> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(input.taskId);
    }

    const hasPermission = await this.checkPermission.can(
      input.userId,
      task.projectId,
      'task:edit',
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to edit tasks in this project');
    }

    const safeFileName = this.generateSafeFileName(input.fileName);
    const s3Key = `projects/${task.projectId}/tasks/${task.id}/${safeFileName}`;

    // 1. Upload to S3
    await this.storageService.uploadFile(input.fileBuffer, s3Key, input.mimeType);

    // 2. Register in DB
    const attachment = await this.attachmentRepository.create({
      taskId: input.taskId,
      fileName: input.fileName, // Store original filename in DB for display
      s3Key,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    return attachment;
  }
}
