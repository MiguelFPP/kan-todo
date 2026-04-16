import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListBucketsCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  NoSuchBucket,
  BucketAlreadyExists,
  BucketAlreadyOwnedByYou,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../core/domain/ports/storage-service.port';

@Injectable()
export class S3Service implements IStorageService, OnModuleInit {
  private client: S3Client;
  private bucketName: string;
  private readonly isLocalStack: boolean;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || 'http://localstack:4566';
    console.log(`[S3Service] Initializing with endpoint: ${endpoint}`);

    this.isLocalStack = endpoint.includes('localstack') || endpoint.includes('localhost');
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
      // First, try to check if bucket exists and we have access
      console.log(`[S3Service] Checking bucket existence: ${this.bucketName}`);
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`[S3Service] Bucket exists and is accessible.`);
      return;
    } catch (error: any) {
      if (error instanceof NoSuchBucket || error.name === 'NoSuchBucket') {
        // Bucket doesn't exist, try to create it
        console.log(`[S3Service] Bucket not found, creating: ${this.bucketName}`);
        await this.createBucket();
        return;
      }

      // For other HeadBucket errors (access denied, etc.), log and rethrow
      console.error(`[S3Service] Error accessing bucket ${this.bucketName}:`, error.message);
      throw new Error(`Cannot access S3 bucket ${this.bucketName}: ${error.message}`);
    }
  }

  private async createBucket() {
    try {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
      console.log(`[S3Service] Bucket created successfully: ${this.bucketName}`);
    } catch (error: any) {
      // Handle specific bucket creation errors
      if (error instanceof BucketAlreadyOwnedByYou || error.name === 'BucketAlreadyOwnedByYou') {
        // We own the bucket, this is fine (race condition during startup)
        console.log(`[S3Service] Bucket already owned by us: ${this.bucketName}`);
        return;
      }

      if (error instanceof BucketAlreadyExists || error.name === 'BucketAlreadyExists') {
        // Bucket exists but we may not own it
        if (this.isLocalStack) {
          // In LocalStack, this is fine (bucket auto-created or exists from previous runs)
          console.log(`[S3Service] Bucket already exists in LocalStack: ${this.bucketName}`);
          return;
        } else {
          // In real AWS, this could be a serious configuration error
          const message = `Bucket ${this.bucketName} already exists in AWS but may not be accessible. ` +
                         `Check bucket permissions and ownership.`;
          console.error(`[S3Service] ${message}`);
          throw new Error(message);
        }
      }

      // For any other errors, fail fast
      console.error(`[S3Service] Failed to create bucket ${this.bucketName}:`, error.message);
      throw new Error(`Failed to create S3 bucket ${this.bucketName}: ${error.message}`);
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
