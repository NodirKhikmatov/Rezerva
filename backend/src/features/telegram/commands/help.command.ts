import { Injectable } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { TelegramLocaleService } from '../services/telegram-locale.service';
import { TelegramOrchestratorService } from '../services/telegram-orchestrator.service';
import { BotContext, getSession } from '../types/session-data.type';

@Update()
@Injectable()
export class HelpCommand {
  constructor(
    private readonly orchestrator: TelegramOrchestratorService,
    private readonly localeService: TelegramLocaleService,
  ) {}

  @Command('help')
  async handle(@Ctx() ctx: BotContext): Promise<void> {
    this.orchestrator.touchActivity(ctx, 'help');

    const locale = getSession(ctx).locale;
    await ctx.reply(
      this.localeService.message(locale, {
        uz: 'Buyruqlar:\n/start — boshlash\n/help — yordam\n/cancel — jarayonni bekor qilish',
        ru: 'Команды:\n/start — начать\n/help — помощь\n/cancel — отменить процесс',
        en: 'Commands:\n/start — start\n/help — help\n/cancel — cancel current flow',
      }),
    );
  }
}
