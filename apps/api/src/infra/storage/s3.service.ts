import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListBucketsCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../core/domain/ports/storage-service.port';

@Injectable()
export class S3Service implements IStorageService, OnModuleInit {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || 'http://localstack:4566';
    console.log(`[S3Service] Initializing with endpoint: ${endpoint}`);

    this.client = new S3Client({
      endpoint: endpoint,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'test',
      },
      forcePathStyle: true,
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'kan-todo-bucket';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      console.log(`[S3Service] Ensuring bucket exists: ${this.bucketName}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
      console.log(`[S3Service] Bucket created or already exists.`);
    } catch (error: any) {
      if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
        return;
      }
      console.error('[S3Service] Error ensuring bucket exists:', error.message);
    }
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
