import { Injectable } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { TelegramLocaleService } from '../services/telegram-locale.service';
import { TelegramOrchestratorService } from '../services/telegram-orchestrator.service';
import { BotContext, getSession } from '../types/session-data.type';

@Update()
@Injectable()
export class CancelCommand {
  constructor(
    private readonly orchestrator: TelegramOrchestratorService,
    private readonly localeService: TelegramLocaleService,
  ) {}

  @Command('cancel')
  async handle(@Ctx() ctx: BotContext): Promise<void> {
    this.orchestrator.touchActivity(ctx, 'cancel');

    if (ctx.scene?.current) {
      await ctx.scene.leave();
    }

    const locale = getSession(ctx).locale;
    await ctx.reply(
      this.localeService.message(locale, {
        uz: 'Jarayon bekor qilindi.',
        ru: 'Процесс отменён.',
        en: 'Flow cancelled.',
      }),
    );
  }
}
