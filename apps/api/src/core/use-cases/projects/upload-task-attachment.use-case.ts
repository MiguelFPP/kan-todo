import { IStorageService } from '../../domain/ports/storage-service.port';
import { ITaskRepository } from '../../domain/ports/task-repository.port';
import { IAttachmentRepository } from '../../domain/ports/attachment-repository.port';
import { CheckPermissionService } from './check-permission.service';

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

  async execute(input: UploadAttachmentInput): Promise<any> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const hasPermission = await this.checkPermission.can(
      input.userId,
      task.projectId,
      'task:edit',
    );

    if (!hasPermission) {
      throw new Error('User does not have permission to edit tasks in this project');
    }

    const timestamp = Date.now();
    const s3Key = `projects/${task.projectId}/tasks/${task.id}/${timestamp}-${input.fileName}`;

    // 1. Upload to S3
    await this.storageService.uploadFile(input.fileBuffer, s3Key, input.mimeType);

    // 2. Register in DB
    const attachment = await this.attachmentRepository.create({
      taskId: input.taskId,
      fileName: input.fileName,
      s3Key,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    return attachment;
  }
}
