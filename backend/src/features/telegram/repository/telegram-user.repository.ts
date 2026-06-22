import { Injectable } from '@nestjs/common';
import { IdentityProvider, Locale, User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

type TelegramProfile = {
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string | null;
};

@Injectable()
export class TelegramUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByTelegramId(telegramId: number) {
    return this.prisma.userIdentity.findUnique({
      where: {
        provider_providerId: {
          provider: IdentityProvider.telegram,
          providerId: telegramId.toString(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async linkTelegramUser(profile: TelegramProfile): Promise<User> {
    const providerId = profile.telegramId.toString();
    const existing = await this.findUserByTelegramId(profile.telegramId);

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.userId },
        data: {
          firstName: profile.firstName ?? undefined,
          lastName: profile.lastName ?? undefined,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        firstName: profile.firstName ?? null,
        lastName: profile.lastName ?? null,
        identities: {
          create: {
            provider: IdentityProvider.telegram,
            providerId,
            metadata: { username: profile.username ?? null },
          },
        },
        notificationPreferences: { create: {} },
      },
    });
  }
}

export type LinkedTelegramUser = {
  userId: string;
  locale: Locale;
};
