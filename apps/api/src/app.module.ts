import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma.service';
import { S3Service } from './infra/storage/s3.service';
import { HealthCheckController } from './web/health-check.controller';

@Global()
@Module({
  imports: [],
  controllers: [HealthCheckController],
  providers: [PrismaService, S3Service],
  exports: [PrismaService, S3Service],
})
export class AppModule {}
