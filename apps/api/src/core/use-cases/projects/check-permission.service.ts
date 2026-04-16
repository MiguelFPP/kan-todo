import { IProjectRepository } from '../../domain/ports/project-repository.port';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';

export class CheckPermissionService {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async can(userId: string, projectId: string, permissionSlug: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);

    return project.canMemberExecute(userId, permissionSlug);
  }
}
