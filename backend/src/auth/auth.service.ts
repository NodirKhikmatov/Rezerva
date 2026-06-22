import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IdentityProvider, User } from '@prisma/client';
import { createHash, createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

type AuthUserResponse = {
  id: string;
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithTelegram(dto: TelegramLoginDto) {
    this.verifyTelegramAuth(dto);

    const user = await this.upsertTelegramUser(dto);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      telegramId: dto.id.toString(),
      role: user.role,
      locale: user.locale,
    });

    return {
      accessToken,
      user: this.toAuthUserResponse(user, dto),
    };
  }

  private async upsertTelegramUser(dto: TelegramLoginDto): Promise<User> {
    const providerId = dto.id.toString();
    const profile = {
      firstName: dto.first_name ?? null,
      lastName: dto.last_name ?? null,
      photoUrl: dto.photo_url ?? null,
    };

    const existing = await this.prisma.userIdentity.findUnique({
      where: {
        provider_providerId: {
          provider: IdentityProvider.telegram,
          providerId,
        },
      },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.userId },
        data: profile,
      });
    }

    return this.prisma.user.create({
      data: {
        ...profile,
        identities: {
          create: {
            provider: IdentityProvider.telegram,
            providerId,
            metadata: { username: dto.username ?? null },
          },
        },
        notificationPreferences: { create: {} },
      },
    });
  }

  private toAuthUserResponse(
    user: User,
    dto: TelegramLoginDto,
  ): AuthUserResponse {
    return {
      id: user.id,
      telegramId: dto.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: dto.username ?? null,
      photoUrl: user.photoUrl,
    };
  }

  private verifyTelegramAuth(dto: TelegramLoginDto) {
    const botToken = this.configService.get<string>('telegram.botToken');
    if (!botToken) {
      throw new UnauthorizedException('Telegram bot is not configured');
    }

    const authAgeSeconds = Math.floor(Date.now() / 1000) - dto.auth_date;
    if (authAgeSeconds > 86400) {
      throw new UnauthorizedException('Telegram auth data expired');
    }

    const dataCheckString = Object.entries(dto)
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== dto.hash) {
      throw new UnauthorizedException('Invalid Telegram auth hash');
    }
  }
}
