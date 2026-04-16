import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findByName(name: string): Promise<Role | null>;
  findById(id: number): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}

export const IRoleRepository = Symbol('IRoleRepository');
