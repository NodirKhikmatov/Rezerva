import { SessionData } from './session-data.type';

export type { BotContext } from './session-data.type';

export type BotMiddleware = (
  ctx: import('./session-data.type').BotContext,
  next: () => Promise<void>,
) => Promise<void>;

export type { SessionData };
