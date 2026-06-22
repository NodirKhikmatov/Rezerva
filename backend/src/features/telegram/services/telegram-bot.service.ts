import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { BotContext } from '../types/session-data.type';
import { TelegramErrorHandlerService } from './telegram-error-handler.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly errorHandler: TelegramErrorHandlerService,
  ) {}

  onModuleInit(): void {
    this.bot.catch(async (error, ctx) => {
      await this.errorHandler.handle(ctx, error);
    });
  }
}
