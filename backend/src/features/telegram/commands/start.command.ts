import { Injectable } from '@nestjs/common';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { TELEGRAM_SCENE_IDS } from '../constants/scene-ids.constants';
import { TelegramLocaleService } from '../services/telegram-locale.service';
import { TelegramOrchestratorService } from '../services/telegram-orchestrator.service';
import { BotContext, getSession } from '../types/session-data.type';

@Update()
@Injectable()
export class StartCommand {
  constructor(
    private readonly orchestrator: TelegramOrchestratorService,
    private readonly localeService: TelegramLocaleService,
  ) {}

  @Start()
  @Command('start')
  async handle(@Ctx() ctx: BotContext): Promise<void> {
    await this.orchestrator.syncUserFromContext(ctx);
    this.orchestrator.touchActivity(ctx, 'start');

    const locale = getSession(ctx).locale;
    await ctx.reply(
      this.localeService.message(locale, {
        uz: 'Rezerva botiga xush kelibsiz! Tilni sozlash uchun davom etamiz.',
        ru: 'Добро пожаловать в бот Rezerva! Продолжим настройку языка.',
        en: 'Welcome to the Rezerva bot! Let us configure your language.',
      }),
    );

    await ctx.scene.enter(TELEGRAM_SCENE_IDS.welcome);
  }
}
