import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma.service';
import { S3Service } from './infra/storage/s3.service';
import { HealthCheckController } from './web/health-check.controller';
import { AuthModule } from './infra/security/auth.module';
import { IStorageService } from './core/domain/ports/storage-service.port';
import { IProjectRepository } from './core/domain/ports/project-repository.port';
import { ITaskRepository } from './core/domain/ports/task-repository.port';
import { IRoleRepository } from './core/domain/ports/role-repository.port';
import { PrismaProjectRepository } from './infra/database/repositories/prisma-project.repository';
import { PrismaTaskRepository } from './infra/database/repositories/prisma-task.repository';
import { PrismaRoleRepository } from './infra/database/repositories/prisma-role.repository';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [HealthCheckController],
  providers: [
    PrismaService,
    S3Service,
    {
      provide: IStorageService,
      useClass: S3Service,
    },
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: ITaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: IRoleRepository,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [
    PrismaService,
    S3Service,
    IStorageService,
    IProjectRepository,
    ITaskRepository,
    IRoleRepository,
  ],
})
export class AppModule {}
