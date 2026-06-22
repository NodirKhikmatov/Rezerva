import { Injectable } from '@nestjs/common';
import { TelegramUserRepository } from '../repository/telegram-user.repository';
import { BotContext, getSession } from '../types/session-data.type';
import { extractTelegramId } from '../validation/telegram-user.validator';
import { TelegramLocaleService } from './telegram-locale.service';

@Injectable()
export class TelegramOrchestratorService {
  constructor(
    private readonly telegramUserRepository: TelegramUserRepository,
    private readonly localeService: TelegramLocaleService,
  ) {}

  async syncUserFromContext(ctx: BotContext): Promise<void> {
    const telegramId = extractTelegramId(ctx.from);

    if (!telegramId) {
      return;
    }

    const linked =
      await this.telegramUserRepository.findUserByTelegramId(telegramId);

    if (linked) {
      const session = getSession(ctx);
      session.userId = linked.user.id;
      session.locale = linked.user.locale;
      return;
    }

    const user = await this.telegramUserRepository.linkTelegramUser({
      telegramId,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
      username: ctx.from?.username ?? null,
    });

    const session = getSession(ctx);
    session.userId = user.id;
    session.locale = this.localeService.resolveLocale(
      user.locale,
      ctx.from?.language_code,
    );
  }

  touchActivity(ctx: BotContext, command: string | null): void {
    const session = getSession(ctx);
    session.lastCommand = command;
    session.lastActivityAt = new Date().toISOString();
  }
}
