export const BOT_ERROR_CODES = {
  rateLimited: 'ER-11',
  unauthorized: 'ER-10',
  unknown: 'BOT_UNKNOWN',
  serviceDown: 'BOT_SERVICE_DOWN',
} as const;

export type BotErrorCode =
  (typeof BOT_ERROR_CODES)[keyof typeof BOT_ERROR_CODES];
