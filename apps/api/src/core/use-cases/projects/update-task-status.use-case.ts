import { ITaskRepository } from '../../domain/ports/task-repository.port';
import { CheckPermissionService } from './check-permission.service';
import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { TaskNotFoundError, PermissionDeniedError } from '../../domain/errors/project.errors';

export interface UpdateTaskStatusInput {
  userId: string;
  taskId: string;
  newStatus: TaskStatus;
}

export class UpdateTaskStatusUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly checkPermission: CheckPermissionService,
  ) {}

  async execute(input: UpdateTaskStatusInput): Promise<Task> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(input.taskId);
    }

    const hasPermission = await this.checkPermission.can(
      input.userId,
      task.projectId,
      'task:edit',
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('You do not have permission to edit tasks in this project');
    }

    if (task.isDeleted()) {
      throw new Error('Cannot update status of a deleted task'); // This could be a specific error too but for now it's fine
    }

    const updatedTask = new Task(
      task.id,
      task.title,
      task.description,
      input.newStatus,
      task.priority,
      task.projectId,
      task.assigneeId,
      task.dueDate,
      task.createdAt,
      new Date(),
      task.deletedAt,
    );

    return await this.taskRepository.update(updatedTask);
  }
}
