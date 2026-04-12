import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../core/domain/ports/storage-service.port';

@Injectable()
export class S3Service implements IStorageService {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'test',
      },
      forcePathStyle: true,
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'kan-todo-bucket';
  }

  async checkConnection() {
    try {
      await this.client.send(new ListBucketsCommand({}));
      return true;
    } catch (error) {
      console.error('S3 Connection Error:', error);
      return false;
    }
  }

  async uploadFile(file: Buffer, path: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      Body: file,
      ContentType: mimeType,
    });

    await this.client.send(command);
    return path;
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // Valid por 15 minutos por defecto
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}
