import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserProfileInput } from './types/user.types';

const profileInclude = {
  identities: {
    select: {
      provider: true,
      providerId: true,
    },
  },
} satisfies Prisma.UserInclude;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProfileById(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isActive: true,
      },
      include: profileInclude,
    });
  }

  findActiveUserByEmail(email: string, excludeUserId: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        isActive: true,
        NOT: { id: excludeUserId },
      },
      select: { id: true },
    });
  }

  updateProfile(userId: string, input: UpdateUserProfileInput) {
    return this.prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
        isActive: true,
      },
      data: this.buildUpdateData(input),
      include: profileInclude,
    });
  }

  private buildUpdateData(
    input: UpdateUserProfileInput,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    if (input.firstName !== undefined) {
      data.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      data.lastName = input.lastName;
    }

    if (input.email !== undefined) {
      data.email = input.email;
    }

    if (input.locale !== undefined) {
      data.locale = input.locale;
    }

    return data;
  }
}

export type UserProfileRecord = NonNullable<
  Awaited<ReturnType<UserRepository['findProfileById']>>
>;
