import { Injectable } from '@nestjs/common';
import { Project, ProjectMember } from '../../../core/domain/entities/project.entity';
import { Role } from '../../../core/domain/entities/role.entity';
import { Permission } from '../../../core/domain/entities/permission.entity';
import { IProjectRepository } from '../../../core/domain/ports/project-repository.port';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(project: Project): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) return null;

    return this.mapToDomain(project);
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId },
    });

    return projects.map((p) => this.mapToDomain(p));
  }

  async update(project: Project): Promise<Project> {
    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        description: project.description,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string, roleId: number): Promise<void> {
    await this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        roleId,
      },
    });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return !!member;
  }

  private mapToDomain(prismaProject: any): Project {
    const members = prismaProject.members
      ? prismaProject.members.map((m: any) => {
          const permissions = m.role.permissions.map((rp: any) => {
            return new Permission(
              rp.permission.id,
              rp.permission.slug,
              rp.permission.description,
            );
          });

          const role = new Role(m.role.id, m.role.name, permissions);

          return new ProjectMember(m.projectId, m.userId, role, m.joinedAt);
        })
      : [];

    return new Project(
      prismaProject.id,
      prismaProject.name,
      prismaProject.description,
      prismaProject.ownerId,
      prismaProject.createdAt,
      prismaProject.updatedAt,
      members,
    );
  }
}
