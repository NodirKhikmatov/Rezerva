import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BotContext } from '../types/session-data.type';
import { BotLogger } from '../utils/bot-logger.util';
import { extractTelegramId } from '../validation/telegram-user.validator';

@Injectable()
export class LoggingMiddlewareFactory {
  create() {
    return async (
      ctx: BotContext,
      next: () => Promise<void>,
    ): Promise<void> => {
      const startedAt = Date.now();
      ctx.requestId = randomUUID();

      BotLogger.info({
        requestId: ctx.requestId,
        telegramId: extractTelegramId(ctx.from) ?? undefined,
        updateType: ctx.updateType,
        message: 'telegram update received',
      });

      await next();

      BotLogger.info({
        requestId: ctx.requestId,
        telegramId: extractTelegramId(ctx.from) ?? undefined,
        updateType: ctx.updateType,
        durationMs: Date.now() - startedAt,
        message: 'telegram update handled',
      });
    };
  }
}
