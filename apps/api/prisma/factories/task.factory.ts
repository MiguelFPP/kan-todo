import { faker } from '@faker-js/faker';
import { TaskStatus } from '@prisma/client';

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
}

export const createTaskFactory = (
  overrides: Partial<TaskInput> & { projectId: string }
): TaskInput => {
  return {
    title: faker.hacker.phrase(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]),
    priority: faker.number.int({ min: 1, max: 10 }),
    dueDate: faker.date.future(),
    ...overrides,
  };
};
