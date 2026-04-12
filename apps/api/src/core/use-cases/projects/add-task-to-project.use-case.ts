import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/ports/task-repository.port';
import { CheckPermissionService } from './check-permission.service';
import { v4 as uuidv4 } from 'uuid';

export interface AddTaskInput {
  title: string;
  description?: string;
  projectId: string;
  userId: string; // The user requesting the action
  priority?: number;
  dueDate?: Date;
  assigneeId?: string;
}

export class AddTaskToProjectUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly checkPermission: CheckPermissionService,
  ) {}

  async execute(input: AddTaskInput): Promise<Task> {
    const hasPermission = await this.checkPermission.can(
      input.userId,
      input.projectId,
      'task:create',
    );

    if (!hasPermission) {
      throw new Error('User does not have permission to create tasks in this project');
    }

    const task = new Task(
      uuidv4(),
      input.title,
      input.description || null,
      'BACKLOG', // Default status
      input.priority || 0,
      input.projectId,
      input.assigneeId || null,
      input.dueDate || null,
      new Date(),
      new Date(),
    );

    return await this.taskRepository.create(task);
  }
}
