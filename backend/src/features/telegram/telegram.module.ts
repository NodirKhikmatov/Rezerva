import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { CancelCommand } from './commands/cancel.command';
import { HelpCommand } from './commands/help.command';
import { StartCommand } from './commands/start.command';
import { TelegramBotService } from './services/telegram-bot.service';
import { TelegramBotFactory } from './services/telegram-bot-factory.service';
import { TelegramCoreModule } from './telegram-core.module';

@Module({
  imports: [
    TelegramCoreModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, TelegramCoreModule],
      inject: [ConfigService, TelegramBotFactory],
      useFactory: (
        configService: ConfigService,
        botFactory: TelegramBotFactory,
      ) => ({
        token: configService.getOrThrow<string>('telegram.botToken'),
        middlewares: botFactory.createMiddlewares(),
        launchOptions:
          configService.get<string>('nodeEnv') === 'production'
            ? false
            : { dropPendingUpdates: true },
      }),
    }),
  ],
  providers: [TelegramBotService, StartCommand, HelpCommand, CancelCommand],
  exports: [TelegramCoreModule],
})
export class TelegramModule {}
