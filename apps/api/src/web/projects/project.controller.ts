import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateProjectUseCase } from '../../core/use-cases/projects/create-project.use-case';
import { GetProjectTasksUseCase } from '../../core/use-cases/projects/get-project-tasks.use-case';
import { ListUserProjectsUseCase } from '../../core/use-cases/projects/list-user-projects.use-case';
import { UpdateTaskStatusUseCase } from '../../core/use-cases/projects/update-task-status.use-case';
import { AddTaskToProjectUseCase } from '../../core/use-cases/projects/add-task-to-project.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  CreateProjectSchema,
  CreateTaskSchema,
  UpdateTaskStatusSchema,
  TaskStatus,
} from '@kan-todo/types';
import {
  CreateProjectDto,
  ProjectResponseDto,
  TaskResponseDto,
  CreateTaskDto,
  UpdateTaskStatusDto,
} from './dto/project-swagger.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectTasksUseCase: GetProjectTasksUseCase,
    private readonly listUserProjectsUseCase: ListUserProjectsUseCase,
    private readonly addTaskUseCase: AddTaskToProjectUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  async create(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.createProjectUseCase.execute({
      ...dto,
      ownerId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List user projects' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  async list(@CurrentUser() user: any): Promise<ProjectResponseDto[]> {
    return this.listUserProjectsUseCase.execute(user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get tasks of a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] })
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  async getTasks(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Query('status') status?: TaskStatus,
  ): Promise<TaskResponseDto[]> {
    return this.getProjectTasksUseCase.execute(user.id, projectId, status);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Add a task to a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async addTask(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.addTaskUseCase.execute({
      ...dto,
      projectId,
      userId: user.id,
    });
  }
}
