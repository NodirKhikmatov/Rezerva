type BotLogPayload = {
  requestId?: string;
  telegramId?: number;
  updateType?: string;
  handler?: string;
  durationMs?: number;
  code?: string;
  message: string;
};

export class BotLogger {
  static info(payload: BotLogPayload): void {
    console.info(JSON.stringify({ level: 'info', ...payload }));
  }

  static warn(payload: BotLogPayload): void {
    console.warn(JSON.stringify({ level: 'warn', ...payload }));
  }

  static error(payload: BotLogPayload): void {
    console.error(JSON.stringify({ level: 'error', ...payload }));
  }
}
