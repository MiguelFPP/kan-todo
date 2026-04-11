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
import { AuthController } from '../../web/auth/auth.controller';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable must be defined');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
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
