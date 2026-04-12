import { Injectable } from '@nestjs/common';
import { Role } from '../../../core/domain/entities/role.entity';
import { Permission } from '../../../core/domain/entities/permission.entity';
import { IRoleRepository } from '../../../core/domain/ports/role-repository.port';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return null;

    return this.mapToDomain(role);
  }

  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return null;

    return this.mapToDomain(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles.map((role) => this.mapToDomain(role));
  }

  private mapToDomain(prismaRole: any): Role {
    const permissions = prismaRole.permissions.map((rp: any) => {
      return new Permission(
        rp.permission.id,
        rp.permission.slug,
        rp.permission.description,
      );
    });

    return new Role(prismaRole.id, prismaRole.name, permissions);
  }
}
