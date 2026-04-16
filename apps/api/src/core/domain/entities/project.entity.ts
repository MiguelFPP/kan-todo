import { Role } from './role.entity';

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    private readonly _members: ProjectMember[] = [],
  ) {}

  get members(): ProjectMember[] {
    return [...this._members];
  }

  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  canMemberExecute(userId: string, permissionSlug: string): boolean {
    if (this.isOwner(userId)) return true;

    const member = this._members.find((m) => m.userId === userId);
    if (!member) return false;

    return member.role.hasPermission(permissionSlug);
  }
}

export class ProjectMember {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: Role,
    public readonly joinedAt: Date,
  ) {}
}
