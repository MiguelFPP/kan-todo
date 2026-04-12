import { Permission } from './permission.entity';

export class Role {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly permissions: Permission[] = [],
  ) {}

  hasPermission(slug: string): boolean {
    return this.permissions.some((p) => p.slug === slug);
  }
}
