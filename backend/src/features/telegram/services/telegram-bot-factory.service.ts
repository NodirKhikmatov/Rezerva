import { Injectable } from '@nestjs/common';
import { MiddlewareFn } from 'telegraf';
import { AuthMiddlewareFactory } from '../middlewares/auth.middleware';
import { ErrorBoundaryMiddlewareFactory } from '../middlewares/error-boundary.middleware';
import { LocaleMiddlewareFactory } from '../middlewares/locale.middleware';
import { LoggingMiddlewareFactory } from '../middlewares/logging.middleware';
import { RateLimitMiddlewareFactory } from '../middlewares/rate-limit.middleware';
import { createTelegramStage } from '../scenes/welcome.scene';
import { TelegramLocaleService } from '../services/telegram-locale.service';
import { TelegramSessionService } from '../services/telegram-session.service';
import { BotContext } from '../types/session-data.type';

@Injectable()
export class TelegramBotFactory {
  constructor(
    private readonly errorBoundaryFactory: ErrorBoundaryMiddlewareFactory,
    private readonly loggingFactory: LoggingMiddlewareFactory,
    private readonly sessionService: TelegramSessionService,
    private readonly rateLimitFactory: RateLimitMiddlewareFactory,
    private readonly authFactory: AuthMiddlewareFactory,
    private readonly localeFactory: LocaleMiddlewareFactory,
    private readonly localeService: TelegramLocaleService,
  ) {}

  createMiddlewares(): MiddlewareFn<BotContext>[] {
    const stage = createTelegramStage(this.localeService);

    return [
      this.errorBoundaryFactory.create(),
      this.loggingFactory.create(),
      this.sessionService.createMiddleware(),
      stage.middleware(),
      this.rateLimitFactory.create(),
      this.authFactory.create(),
      this.localeFactory.create(),
    ];
  }
}
