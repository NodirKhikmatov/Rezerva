import { Injectable } from '@nestjs/common';
import { session } from 'telegraf/session';
import { MiddlewareFn } from 'telegraf';
import {
  TELEGRAM_REDIS_KEYS,
  TELEGRAM_SESSION_TTL_SECONDS,
} from '../constants/redis-keys.constants';
import { BotContext } from '../types/session-data.type';
import { createDefaultSession, SessionData } from '../types/session-data.type';
import { extractTelegramId } from '../validation/telegram-user.validator';
import { TelegramRedisService } from './telegram-redis.service';

type SessionStore<T> = {
  get: (key: string) => Promise<T | undefined>;
  set: (key: string, value: T) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

@Injectable()
export class TelegramSessionService {
  constructor(private readonly telegramRedis: TelegramRedisService) {}

  createMiddleware(): MiddlewareFn<BotContext> {
    const middleware = session({
      store: this.createStore() as SessionStore<object>,
      defaultSession: (ctx) => {
        const telegramId = extractTelegramId(ctx.from) ?? 0;
        return createDefaultSession(telegramId);
      },
      getSessionKey: (ctx) => {
        const telegramId = extractTelegramId(ctx.from);
        return telegramId ? TELEGRAM_REDIS_KEYS.session(telegramId) : undefined;
      },
    });

    return middleware;
  }

  private createStore(): SessionStore<SessionData> {
    const redis = this.telegramRedis.redis;

    return {
      get: async (key: string) => {
        const raw = await redis.get(key);
        return raw ? (JSON.parse(raw) as SessionData) : undefined;
      },
      set: async (key: string, value: SessionData) => {
        await redis.set(
          key,
          JSON.stringify(value),
          'EX',
          TELEGRAM_SESSION_TTL_SECONDS,
        );
      },
      delete: async (key: string) => {
        await redis.del(key);
      },
    };
  }
}
