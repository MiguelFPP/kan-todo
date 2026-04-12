import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export interface UserInput {
  email: string;
  fullName: string;
  passwordHash: string;
}

export const createUserFactory = async (overrides: Partial<UserInput> = {}): Promise<UserInput> => {
  const password = 'password123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  return {
    email: faker.internet.email().toLowerCase(),
    fullName: faker.person.fullName(),
    passwordHash: hash,
    ...overrides,
  };
};
