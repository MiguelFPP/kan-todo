import { IProjectRepository } from '../../domain/ports/project-repository.port';
import { Project } from '../../domain/entities/project.entity';

export class ListUserProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(userId: string): Promise<Project[]> {
    return this.projectRepository.findAllForUser(userId);
  }
}
