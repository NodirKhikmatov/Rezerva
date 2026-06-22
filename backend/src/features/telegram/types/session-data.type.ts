import { Locale } from '@prisma/client';
import { Context, Scenes } from 'telegraf';

export type SessionData = Scenes.WizardSessionData & {
  telegramId: number;
  userId: string | null;
  locale: Locale;
  lastCommand: string | null;
  lastActivityAt: string;
};

export type BotContext = Scenes.WizardContext<SessionData> &
  Context & {
    requestId?: string;
  };

export function createDefaultSession(telegramId: number): SessionData {
  return {
    cursor: 0,
    telegramId,
    userId: null,
    locale: Locale.uz,
    lastCommand: null,
    lastActivityAt: new Date().toISOString(),
  };
}

export function getSession(ctx: BotContext): SessionData {
  return ctx.session as unknown as SessionData;
}
