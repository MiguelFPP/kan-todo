import { Injectable } from '@nestjs/common';
import { IAttachmentRepository } from '../../../core/domain/ports/attachment-repository.port';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttachmentRepository implements IAttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attachment: {
    taskId: string;
    fileName: string;
    s3Key: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<any> {
    return await this.prisma.attachment.create({
      data: {
        taskId: attachment.taskId,
        fileName: attachment.fileName,
        s3Key: attachment.s3Key,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
      },
    });
  }

  async findByTaskId(taskId: string): Promise<any[]> {
    return await this.prisma.attachment.findMany({
      where: { taskId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: { id },
    });
  }
}
