import { Locale } from '@prisma/client';
import { TelegramLocaleService } from './telegram-locale.service';

describe('TelegramLocaleService', () => {
  const service = new TelegramLocaleService();

  it('defaults to uz for unknown language codes', () => {
    expect(service.resolveLocale(undefined, 'fr')).toBe(Locale.uz);
  });

  it('maps ru and en language codes', () => {
    expect(service.resolveLocale(undefined, 'ru')).toBe(Locale.ru);
    expect(service.resolveLocale(undefined, 'en')).toBe(Locale.en);
  });

  it('returns localized message with fallback', () => {
    const message = service.message(Locale.ru, {
      [Locale.uz]: 'uz',
      [Locale.ru]: 'ru',
      [Locale.en]: 'en',
    });

    expect(message).toBe('ru');
  });
});
