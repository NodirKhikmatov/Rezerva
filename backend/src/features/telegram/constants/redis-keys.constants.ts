export const TELEGRAM_REDIS_KEYS = {
  session: (telegramId: number) => `tg:session:${telegramId}`,
  rateMinute: (telegramId: number) => `tg:rate:${telegramId}`,
  rateDaily: (telegramId: number) => `tg:rate:global:${telegramId}`,
  updateDedupe: (updateId: number) => `tg:update:${updateId}`,
} as const;

export const TELEGRAM_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const TELEGRAM_SCENE_TTL_SECONDS = 60 * 30;
export const TELEGRAM_RATE_MINUTE_TTL_SECONDS = 60;
export const TELEGRAM_RATE_DAILY_TTL_SECONDS = 60 * 60 * 24;
export const TELEGRAM_UPDATE_DEDUPE_TTL_SECONDS = 60;
export const TELEGRAM_RATE_MINUTE_LIMIT = 30;
export const TELEGRAM_RATE_DAILY_LIMIT = 500;
