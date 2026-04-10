import { LoginDto, UserResponseDto } from '@kan-todo/types';
import { InvalidCredentialsError } from '../../domain/errors/auth.errors';
import { IHashService } from '../../domain/ports/hash-service.port';
import { IUserRepository } from '../../domain/ports/user-repository.port';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(dto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }
}
