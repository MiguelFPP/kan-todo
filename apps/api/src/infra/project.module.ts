import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { PrismaProjectRepository } from './database/repositories/prisma-project.repository';
import { PrismaTaskRepository } from './database/repositories/prisma-task.repository';
import { PrismaRoleRepository } from './database/repositories/prisma-role.repository';
import { PrismaAttachmentRepository } from './database/repositories/prisma-attachment.repository';
import { IProjectRepository } from '../core/domain/ports/project-repository.port';
import { ITaskRepository } from '../core/domain/ports/task-repository.port';
import { IRoleRepository } from '../core/domain/ports/role-repository.port';
import { IAttachmentRepository } from '../core/domain/ports/attachment-repository.port';
import { IStorageService } from '../core/domain/ports/storage-service.port';
import { CreateProjectUseCase } from '../core/use-cases/projects/create-project.use-case';
import { GetProjectTasksUseCase } from '../core/use-cases/projects/get-project-tasks.use-case';
import { ListUserProjectsUseCase } from '../core/use-cases/projects/list-user-projects.use-case';
import { AddTaskToProjectUseCase } from '../core/use-cases/projects/add-task-to-project.use-case';
import { UpdateTaskStatusUseCase } from '../core/use-cases/projects/update-task-status.use-case';
import { UploadTaskAttachmentUseCase } from '../core/use-cases/projects/upload-task-attachment.use-case';
import { CheckPermissionService } from '../core/use-cases/projects/check-permission.service';
import { ProjectController } from '../web/projects/project.controller';
import { TaskController } from '../web/projects/task.controller';

@Module({
  controllers: [ProjectController, TaskController],
  providers: [
    PrismaService,
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
      provide: GetProjectTasksUseCase,
      useFactory: (taskRepo: ITaskRepository, projectRepo: IProjectRepository) =>
        new GetProjectTasksUseCase(taskRepo, projectRepo),
      inject: [ITaskRepository, IProjectRepository],
    },
    {
      provide: ListUserProjectsUseCase,
      useFactory: (projectRepo: IProjectRepository) =>
        new ListUserProjectsUseCase(projectRepo),
      inject: [IProjectRepository],
    },
    {
      provide: AddTaskToProjectUseCase,
      useFactory: (taskRepo: ITaskRepository, checkPermission: CheckPermissionService) =>
        new AddTaskToProjectUseCase(taskRepo, checkPermission),
      inject: [ITaskRepository, CheckPermissionService],
    },
    {
      provide: UpdateTaskStatusUseCase,
      useFactory: (taskRepo: ITaskRepository, checkPermission: CheckPermissionService) =>
        new UpdateTaskStatusUseCase(taskRepo, checkPermission),
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
    CreateProjectUseCase,
    GetProjectTasksUseCase,
    ListUserProjectsUseCase,
    AddTaskToProjectUseCase,
    UpdateTaskStatusUseCase,
    UploadTaskAttachmentUseCase,
  ],
})
export class ProjectModule {}
