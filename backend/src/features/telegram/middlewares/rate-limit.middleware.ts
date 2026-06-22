import { Injectable } from '@nestjs/common';
import {
  TELEGRAM_RATE_DAILY_LIMIT,
  TELEGRAM_RATE_DAILY_TTL_SECONDS,
  TELEGRAM_RATE_MINUTE_LIMIT,
  TELEGRAM_RATE_MINUTE_TTL_SECONDS,
  TELEGRAM_REDIS_KEYS,
  TELEGRAM_UPDATE_DEDUPE_TTL_SECONDS,
} from '../constants/redis-keys.constants';
import { BotError } from '../types/bot-error.type';
import { BOT_ERROR_CODES } from '../constants/bot-error-codes.constants';
import { BotContext } from '../types/session-data.type';
import { extractTelegramId } from '../validation/telegram-user.validator';
import { TelegramRedisService } from '../services/telegram-redis.service';

@Injectable()
export class RateLimitMiddlewareFactory {
  constructor(private readonly telegramRedis: TelegramRedisService) {}

  create() {
    return async (
      ctx: BotContext,
      next: () => Promise<void>,
    ): Promise<void> => {
      const telegramId = extractTelegramId(ctx.from);

      if (!telegramId) {
        await next();
        return;
      }

      await this.assertNotDuplicateUpdate(ctx.update.update_id);
      await this.assertWithinLimits(telegramId);
      await next();
    };
  }

  private async assertNotDuplicateUpdate(updateId: number): Promise<void> {
    const key = TELEGRAM_REDIS_KEYS.updateDedupe(updateId);
    const inserted = await this.telegramRedis.redis.set(
      key,
      '1',
      'EX',
      TELEGRAM_UPDATE_DEDUPE_TTL_SECONDS,
      'NX',
    );

    if (inserted === null) {
      throw new BotError(
        BOT_ERROR_CODES.rateLimited,
        'Duplicate Telegram update',
      );
    }
  }

  private async assertWithinLimits(telegramId: number): Promise<void> {
    const minuteCount = await this.incrementCounter(
      TELEGRAM_REDIS_KEYS.rateMinute(telegramId),
      TELEGRAM_RATE_MINUTE_TTL_SECONDS,
    );
    const dailyCount = await this.incrementCounter(
      TELEGRAM_REDIS_KEYS.rateDaily(telegramId),
      TELEGRAM_RATE_DAILY_TTL_SECONDS,
    );

    if (
      minuteCount > TELEGRAM_RATE_MINUTE_LIMIT ||
      dailyCount > TELEGRAM_RATE_DAILY_LIMIT
    ) {
      throw new BotError(BOT_ERROR_CODES.rateLimited, 'Rate limit exceeded');
    }
  }

  private async incrementCounter(
    key: string,
    ttlSeconds: number,
  ): Promise<number> {
    const redis = this.telegramRedis.redis;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, ttlSeconds);
    }

    return count;
  }
}
