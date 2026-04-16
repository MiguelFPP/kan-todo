import { Project } from '../entities/project.entity';

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  findAllForUser(userId: string): Promise<Project[]>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  addMember(projectId: string, userId: string, roleId: number): Promise<void>;
  isMember(projectId: string, userId: string): Promise<boolean>;
}

export const IProjectRepository = Symbol('IProjectRepository');
