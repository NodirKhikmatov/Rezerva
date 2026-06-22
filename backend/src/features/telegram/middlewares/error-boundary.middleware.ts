import { Injectable } from '@nestjs/common';
import { BotContext } from '../types/session-data.type';
import { TelegramErrorHandlerService } from '../services/telegram-error-handler.service';

@Injectable()
export class ErrorBoundaryMiddlewareFactory {
  constructor(private readonly errorHandler: TelegramErrorHandlerService) {}

  create() {
    return async (
      ctx: BotContext,
      next: () => Promise<void>,
    ): Promise<void> => {
      try {
        await next();
      } catch (error) {
        await this.errorHandler.handle(ctx, error);
      }
    };
  }
}
