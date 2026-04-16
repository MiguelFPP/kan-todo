import { faker } from '@faker-js/faker';

export interface ProjectInput {
  name: string;
  description?: string;
  ownerId: string;
}

export const createProjectFactory = (overrides: Partial<ProjectInput> & { ownerId: string }): ProjectInput => {
  return {
    name: faker.company.name() + ' Project',
    description: faker.lorem.sentence(),
    ...overrides,
  };
};
