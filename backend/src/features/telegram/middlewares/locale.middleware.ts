import { Injectable } from '@nestjs/common';
import { BotContext, getSession } from '../types/session-data.type';
import { TelegramLocaleService } from '../services/telegram-locale.service';

@Injectable()
export class LocaleMiddlewareFactory {
  constructor(private readonly localeService: TelegramLocaleService) {}

  create() {
    return async (
      ctx: BotContext,
      next: () => Promise<void>,
    ): Promise<void> => {
      const session = getSession(ctx);
      session.locale = this.localeService.resolveLocale(
        session.locale,
        ctx.from?.language_code,
      );
      await next();
    };
  }
}
