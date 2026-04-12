export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: TaskStatus,
    public readonly priority: number,
    public readonly projectId: string,
    public readonly assigneeId: string | null,
    public readonly dueDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null,
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
