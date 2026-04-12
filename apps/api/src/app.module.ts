import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma.service';
import { S3Service } from './infra/storage/s3.service';
import { HealthCheckController } from './web/health-check.controller';
import { AuthModule } from './infra/security/auth.module';
import { IStorageService } from './core/domain/ports/storage-service.port';
import { IProjectRepository } from './core/domain/ports/project-repository.port';
import { ITaskRepository } from './core/domain/ports/task-repository.port';
import { IRoleRepository } from './core/domain/ports/role-repository.port';
import { IAttachmentRepository } from './core/domain/ports/attachment-repository.port';
import { PrismaProjectRepository } from './infra/database/repositories/prisma-project.repository';
import { PrismaTaskRepository } from './infra/database/repositories/prisma-task.repository';
import { PrismaRoleRepository } from './infra/database/repositories/prisma-role.repository';
import { PrismaAttachmentRepository } from './infra/database/repositories/prisma-attachment.repository';
import { CreateProjectUseCase } from './core/use-cases/projects/create-project.use-case';
import { AddTaskToProjectUseCase } from './core/use-cases/projects/add-task-to-project.use-case';
import { UploadTaskAttachmentUseCase } from './core/use-cases/projects/upload-task-attachment.use-case';
import { CheckPermissionService } from './core/use-cases/projects/check-permission.service';

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
    {
      provide: IAttachmentRepository,
      useClass: PrismaAttachmentRepository,
    },
    {
      provide: CheckPermissionService,
      useFactory: (projectRepo: IProjectRepository) =>
        new CheckPermissionService(projectRepo),
      inject: [IProjectRepository],
    },
    {
      provide: CreateProjectUseCase,
      useFactory: (projectRepo: IProjectRepository, roleRepo: IRoleRepository) =>
        new CreateProjectUseCase(projectRepo, roleRepo),
      inject: [IProjectRepository, IRoleRepository],
    },
    {
      provide: AddTaskToProjectUseCase,
      useFactory: (taskRepo: ITaskRepository, checkPerm: CheckPermissionService) =>
        new AddTaskToProjectUseCase(taskRepo, checkPerm),
      inject: [ITaskRepository, CheckPermissionService],
    },
    {
      provide: UploadTaskAttachmentUseCase,
      useFactory: (
        storage: IStorageService,
        taskRepo: ITaskRepository,
        checkPerm: CheckPermissionService,
        attachRepo: IAttachmentRepository,
      ) => new UploadTaskAttachmentUseCase(storage, taskRepo, checkPerm, attachRepo),
      inject: [IStorageService, ITaskRepository, CheckPermissionService, IAttachmentRepository],
    },
  ],
  exports: [
    PrismaService,
    S3Service,
    IStorageService,
    IProjectRepository,
    ITaskRepository,
    IRoleRepository,
    IAttachmentRepository,
    CreateProjectUseCase,
    AddTaskToProjectUseCase,
    UploadTaskAttachmentUseCase,
    CheckPermissionService,
  ],
})
export class AppModule {}
