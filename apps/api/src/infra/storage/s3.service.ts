import { Injectable } from '@nestjs/common';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client: S3Client;

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
}
