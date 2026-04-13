import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma.service';
import { S3Service } from './infra/storage/s3.service';
import { HealthCheckController } from './web/health-check.controller';
import { AuthModule } from './infra/security/auth.module';
import { ProjectModule } from './infra/project.module';
import { IStorageService } from './core/domain/ports/storage-service.port';

@Global()
@Module({
  imports: [AuthModule, ProjectModule],
  controllers: [HealthCheckController],
  providers: [
    PrismaService,
    S3Service,
    {
      provide: IStorageService,
      useClass: S3Service,
    },
  ],
  exports: [
    PrismaService,
    S3Service,
    IStorageService,
  ],
})
export class AppModule {}
