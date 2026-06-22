import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Locale } from '@prisma/client';
import { BOT_ERROR_CODES } from '../constants/bot-error-codes.constants';
import { BotError } from '../types/bot-error.type';
import { BotContext, getSession } from '../types/session-data.type';
import { BotLogger } from '../utils/bot-logger.util';
import { TelegramLocaleService } from './telegram-locale.service';

const ERROR_MESSAGES: Record<string, Record<Locale, string>> = {
  [BOT_ERROR_CODES.rateLimited]: {
    uz: "Juda ko'p so'rov. Biroz kuting.",
    ru: 'Слишком много запросов. Подождите немного.',
    en: 'Too many requests. Please wait a moment.',
  },
  [BOT_ERROR_CODES.unauthorized]: {
    uz: 'Avtorizatsiya kerak — /start bosing.',
    ru: 'Требуется авторизация — нажмите /start.',
    en: 'Authorization required — send /start.',
  },
  [BOT_ERROR_CODES.serviceDown]: {
    uz: 'Xizmat vaqtincha ishlamayapti.',
    ru: 'Сервис временно недоступен.',
    en: 'Service is temporarily unavailable.',
  },
  [BOT_ERROR_CODES.unknown]: {
    uz: 'Xatolik yuz berdi. /help yuboring.',
    ru: 'Произошла ошибка. Отправьте /help.',
    en: 'Something went wrong. Send /help.',
  },
};

@Injectable()
export class TelegramErrorHandlerService {
  constructor(private readonly localeService: TelegramLocaleService) {}

  async handle(ctx: BotContext, error: unknown): Promise<void> {
    const code = this.resolveErrorCode(error);
    const locale = getSession(ctx).locale ?? Locale.uz;
    const message = this.localeService.message(
      locale,
      ERROR_MESSAGES[code] ?? ERROR_MESSAGES[BOT_ERROR_CODES.unknown],
    );

    BotLogger.error({
      requestId: ctx.requestId,
      telegramId: ctx.from?.id,
      code,
      message: error instanceof Error ? error.message : 'Unknown bot error',
    });

    if (code === BOT_ERROR_CODES.unknown) {
      Sentry.captureException(error);
    }

    await this.replySafely(ctx, message);
  }

  private resolveErrorCode(error: unknown): string {
    if (error instanceof BotError) {
      return error.code;
    }

    return BOT_ERROR_CODES.unknown;
  }

  private async replySafely(ctx: BotContext, message: string): Promise<void> {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(message, { show_alert: true });
      return;
    }

    await ctx.reply(message);
  }
}
