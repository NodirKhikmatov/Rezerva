import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthMiddlewareFactory } from './middlewares/auth.middleware';
import { ErrorBoundaryMiddlewareFactory } from './middlewares/error-boundary.middleware';
import { LocaleMiddlewareFactory } from './middlewares/locale.middleware';
import { LoggingMiddlewareFactory } from './middlewares/logging.middleware';
import { RateLimitMiddlewareFactory } from './middlewares/rate-limit.middleware';
import { TelegramUserRepository } from './repository/telegram-user.repository';
import { TelegramBotFactory } from './services/telegram-bot-factory.service';
import { TelegramErrorHandlerService } from './services/telegram-error-handler.service';
import { TelegramLocaleService } from './services/telegram-locale.service';
import { TelegramOrchestratorService } from './services/telegram-orchestrator.service';
import { TelegramRedisService } from './services/telegram-redis.service';
import { TelegramSessionService } from './services/telegram-session.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    TelegramRedisService,
    TelegramSessionService,
    TelegramLocaleService,
    TelegramUserRepository,
    TelegramOrchestratorService,
    TelegramErrorHandlerService,
    LoggingMiddlewareFactory,
    ErrorBoundaryMiddlewareFactory,
    RateLimitMiddlewareFactory,
    AuthMiddlewareFactory,
    LocaleMiddlewareFactory,
    TelegramBotFactory,
  ],
  exports: [TelegramBotFactory, TelegramOrchestratorService],
})
export class TelegramCoreModule {}
