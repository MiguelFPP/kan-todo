import { PrismaService } from '../infra/database/prisma.service';
import { S3Service } from '../infra/storage/s3.service';
export declare class HealthCheckController {
    private readonly prisma;
    private readonly s3;
    constructor(prisma: PrismaService, s3: S3Service);
    check(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            storage: string;
        };
    }>;
    private checkDb;
}
