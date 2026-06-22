import { BotErrorCode } from '../constants/bot-error-codes.constants';

export class BotError extends Error {
  constructor(
    readonly code: BotErrorCode,
    message: string,
    readonly recoverable = true,
  ) {
    super(message);
    this.name = 'BotError';
  }
}
