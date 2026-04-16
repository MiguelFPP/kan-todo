export interface IAttachmentRepository {
  create(attachment: {
    taskId: string;
    fileName: string;
    s3Key: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<any>;
  findByTaskId(taskId: string): Promise<any[]>;
  delete(id: string): Promise<void>;
}

export const IAttachmentRepository = Symbol('IAttachmentRepository');
