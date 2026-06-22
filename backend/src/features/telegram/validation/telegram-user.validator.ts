import { BadRequestException } from '@nestjs/common';

type TelegramUserLike = {
  id?: number;
  is_bot?: boolean;
};

export function assertTelegramUser(
  user: TelegramUserLike | undefined,
): asserts user is TelegramUserLike & { id: number } {
  if (!user?.id || user.is_bot) {
    throw new BadRequestException('Telegram user is required');
  }
}

export function extractTelegramId(
  user: TelegramUserLike | undefined,
): number | null {
  if (!user?.id || user.is_bot) {
    return null;
  }

  return user.id;
}
