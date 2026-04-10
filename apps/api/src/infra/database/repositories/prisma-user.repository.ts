import { Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/entities/user.entity';
import { IUserRepository } from '../../../core/domain/ports/user-repository.port';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
      },
    });

    return this.mapToDomain(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  private mapToDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.fullName,
      prismaUser.createdAt,
    );
  }
}
