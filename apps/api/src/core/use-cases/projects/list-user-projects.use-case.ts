import { IProjectRepository } from '../../domain/ports/project-repository.port';
import { Project } from '../../domain/entities/project.entity';

export class ListUserProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(userId: string): Promise<Project[]> {
    // Note: For now we only list projects where the user is the owner.
    // In the future, we should also list projects where the user is a member.
    return this.projectRepository.findByOwnerId(userId);
  }
}
