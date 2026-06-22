import { Injectable } from '@nestjs/common';
import { BotContext, getSession } from '../types/session-data.type';
import { TelegramOrchestratorService } from '../services/telegram-orchestrator.service';
import { extractTelegramId } from '../validation/telegram-user.validator';

@Injectable()
export class AuthMiddlewareFactory {
  constructor(private readonly orchestrator: TelegramOrchestratorService) {}

  create() {
    return async (
      ctx: BotContext,
      next: () => Promise<void>,
    ): Promise<void> => {
      const telegramId = extractTelegramId(ctx.from);

      if (telegramId) {
        getSession(ctx).telegramId = telegramId;
        await this.orchestrator.syncUserFromContext(ctx);
      }

      await next();
    };
  }
}
