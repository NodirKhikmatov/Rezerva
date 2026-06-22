import { Locale } from '@prisma/client';
import { Scenes } from 'telegraf';
import { TELEGRAM_SCENE_IDS } from '../constants/scene-ids.constants';
import { BotContext, getSession } from '../types/session-data.type';
import { TelegramLocaleService } from '../services/telegram-locale.service';

const LOCALE_LABELS: Record<Locale, string> = {
  [Locale.uz]: "O'zbekcha",
  [Locale.ru]: 'Русский',
  [Locale.en]: 'English',
};

export function createWelcomeScene(
  localeService: TelegramLocaleService,
): Scenes.WizardScene<BotContext> {
  return new Scenes.WizardScene<BotContext>(
    TELEGRAM_SCENE_IDS.welcome,
    async (ctx) => {
      const locale = getSession(ctx).locale ?? Locale.uz;
      await ctx.reply(
        localeService.message(locale, {
          [Locale.uz]: 'Rezervaga xush kelibsiz! Tilni tanlang.',
          [Locale.ru]: 'Добро пожаловать в Rezerva! Выберите язык.',
          [Locale.en]: 'Welcome to Rezerva! Choose your language.',
        }),
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      const locale = getSession(ctx).locale ?? Locale.uz;
      const label = LOCALE_LABELS[locale];

      await ctx.reply(
        localeService.message(locale, {
          [Locale.uz]: `Tayyor! Tanlangan til: ${label}. /help buyrug'i bilan davom eting.`,
          [Locale.ru]: `Готово! Выбранный язык: ${label}. Продолжайте с /help.`,
          [Locale.en]: `Done! Selected language: ${label}. Continue with /help.`,
        }),
      );

      return ctx.scene.leave();
    },
  );
}

export function createTelegramStage(
  localeService: TelegramLocaleService,
): Scenes.Stage<BotContext> {
  const welcomeScene = createWelcomeScene(localeService);
  return new Scenes.Stage<BotContext>([welcomeScene]);
}
