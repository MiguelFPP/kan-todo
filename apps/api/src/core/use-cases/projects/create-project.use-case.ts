import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/ports/project-repository.port';
import { IRoleRepository } from '../../domain/ports/role-repository.port';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProjectInput {
  name: string;
  description?: string;
  ownerId: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const project = new Project(
      uuidv4(),
      input.name,
      input.description || null,
      input.ownerId,
      new Date(),
      new Date(),
    );

    const createdProject = await this.projectRepository.create(project);

    // Get the OWNER role to associate it with the creator
    const ownerRole = await this.roleRepository.findByName('OWNER');

    if (ownerRole) {
      await this.projectRepository.addMember(
        createdProject.id,
        input.ownerId,
        ownerRole.id,
      );
    }

    // Return the project with its members
    const reloadedProject = await this.projectRepository.findById(createdProject.id);
    return reloadedProject || createdProject;
  }
}
