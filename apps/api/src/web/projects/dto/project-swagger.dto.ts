import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@kan-todo/types';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Awesome Project' })
  name!: string;

  @ApiPropertyOptional({ example: 'Description of the project' })
  description?: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login' })
  title!: string;

  @ApiPropertyOptional({ example: 'User should be able to login with email and password' })
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  priority?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  dueDate?: Date;

  @ApiPropertyOptional({ example: 'uuid-of-assignee' })
  assigneeId?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] })
  status!: TaskStatus;
}

export class TaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty({ enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] })
  status!: TaskStatus;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  projectId!: string;

  @ApiPropertyOptional()
  assigneeId!: string | null;

  @ApiPropertyOptional()
  dueDate!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProjectResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
