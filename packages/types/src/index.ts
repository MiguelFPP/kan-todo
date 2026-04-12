import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  createdAt: z.coerce.date(),
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;

// --- Project & Role Types ---

export const PermissionSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  description: z.string().optional(),
});

export type PermissionDto = z.infer<typeof PermissionSchema>;

export const RoleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(PermissionSchema).optional(),
});

export type RoleDto = z.infer<typeof RoleSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  ownerId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProjectDto = z.infer<typeof ProjectSchema>;

// --- Task Types ---

export const TaskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: TaskStatusEnum.default('BACKLOG'),
  priority: z.number().int().min(0).max(10).default(0),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export type TaskDto = z.infer<typeof TaskSchema>;
