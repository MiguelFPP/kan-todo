import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { IHashService } from '../../core/domain/ports/hash-service.port';
import { IUserRepository } from '../../core/domain/ports/user-repository.port';
import { LoginUserUseCase } from '../../core/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase } from '../../core/use-cases/auth/register-user.use-case';
import { PrismaUserRepository } from '../database/repositories/prisma-user.repository';
import { PrismaService } from '../database/prisma.service';
import { BcryptService } from './bcrypt.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    PrismaService,
    JwtStrategy,
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: IHashService,
      useClass: BcryptService,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: IUserRepository, hash: IHashService) =>
        new RegisterUserUseCase(repo, hash),
      inject: [IUserRepository, IHashService],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (repo: IUserRepository, hash: IHashService) =>
        new LoginUserUseCase(repo, hash),
      inject: [IUserRepository, IHashService],
    },
  ],
  exports: [RegisterUserUseCase, LoginUserUseCase, IUserRepository],
})
export class AuthModule {}
