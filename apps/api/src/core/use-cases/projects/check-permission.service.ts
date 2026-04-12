import { IProjectRepository } from '../../domain/ports/project-repository.port';

export class CheckPermissionService {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async can(userId: string, projectId: string, permissionSlug: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;

    return project.canMemberExecute(userId, permissionSlug);
  }
}
