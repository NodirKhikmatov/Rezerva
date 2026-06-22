import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IdentityProvider, PlatformRole, Locale } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export type JwtPayload = {
  sub: string;
  telegramId?: string;
  role?: PlatformRole;
  locale?: Locale;
};

type TelegramMetadata = {
  username?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        identities: {
          where: { provider: IdentityProvider.telegram },
          take: 1,
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const telegramIdentity = user.identities[0];
    const metadata = telegramIdentity?.metadata as TelegramMetadata | null;

    return {
      id: user.id,
      telegramId: telegramIdentity?.providerId ?? payload.telegramId ?? null,
      firstName: user.firstName,
      lastName: user.lastName,
      username: metadata?.username ?? null,
      role: user.role,
      locale: user.locale,
    };
  }
}
