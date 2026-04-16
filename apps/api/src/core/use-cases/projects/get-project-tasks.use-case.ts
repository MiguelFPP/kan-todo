import { ITaskRepository } from '../../domain/ports/task-repository.port';
import { IProjectRepository } from '../../domain/ports/project-repository.port';
import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { ProjectNotFoundError, PermissionDeniedError } from '../../domain/errors/project.errors';

export class GetProjectTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(userId: string, projectId: string, status?: TaskStatus): Promise<Task[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    if (!project.canMemberExecute(userId, 'project:read')) {
      throw new PermissionDeniedError('You do not have permission to read this project');
    }

    const tasks = await this.taskRepository.findByProjectId(projectId);

    if (status) {
      return tasks.filter((task) => task.status === status && !task.isDeleted());
    }

    return tasks.filter((task) => !task.isDeleted());
  }
}
