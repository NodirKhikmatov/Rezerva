import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileInput, UserProfile } from './types/user.types';
import { toUserProfile } from './utils/user-profile.mapper';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findProfileById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserProfile> {
    await this.assertUserExists(userId);

    const input = this.toUpdateInput(dto);
    await this.assertEmailAvailable(userId, input.email);

    const user = await this.userRepository.updateProfile(userId, input);
    return toUserProfile(user);
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findProfileById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async assertEmailAvailable(
    userId: string,
    email?: string | null,
  ): Promise<void> {
    if (!email) {
      return;
    }

    const existing = await this.userRepository.findActiveUserByEmail(
      email,
      userId,
    );

    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  private toUpdateInput(dto: UpdateUserDto): UpdateUserProfileInput {
    const input: UpdateUserProfileInput = {};

    if (dto.firstName !== undefined) {
      input.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      input.lastName = dto.lastName;
    }

    if (dto.email !== undefined) {
      input.email = dto.email;
    }

    if (dto.locale !== undefined) {
      input.locale = dto.locale;
    }

    return input;
  }
}
