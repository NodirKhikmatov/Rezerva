import { Locale } from '@prisma/client';
import { BOT_ERROR_CODES } from '../constants/bot-error-codes.constants';
import { BotError } from '../types/bot-error.type';
import { BotContext } from '../types/session-data.type';
import { TelegramErrorHandlerService } from './telegram-error-handler.service';
import { TelegramLocaleService } from './telegram-locale.service';

describe('TelegramErrorHandlerService', () => {
  const service = new TelegramErrorHandlerService(new TelegramLocaleService());

  it('maps BotError codes to localized replies', async () => {
    const reply = jest.fn().mockResolvedValue(undefined);
    const ctx = {
      requestId: 'req-1',
      from: { id: 42 },
      session: { locale: Locale.uz },
      callbackQuery: undefined,
      reply,
    } as unknown as BotContext;

    await service.handle(
      ctx,
      new BotError(BOT_ERROR_CODES.rateLimited, 'limited'),
    );

    expect(reply).toHaveBeenCalledWith("Juda ko'p so'rov. Biroz kuting.");
  });
});
