import { DomainError } from './auth.errors';

export class ProjectNotFoundError extends DomainError {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`);
    this.name = 'ProjectNotFoundError';
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class PermissionDeniedError extends DomainError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}
