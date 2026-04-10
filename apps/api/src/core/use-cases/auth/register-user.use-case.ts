import { RegisterDto, UserResponseDto } from '@kan-todo/types';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistsError } from '../../domain/errors/auth.errors';
import { IHashService } from '../../domain/ports/hash-service.port';
import { IUserRepository } from '../../domain/ports/user-repository.port';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(dto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const newUser = await this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      createdAt: newUser.createdAt,
    };
  }
}
