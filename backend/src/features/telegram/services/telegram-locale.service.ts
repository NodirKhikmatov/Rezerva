import { Injectable } from '@nestjs/common';
import { Locale } from '@prisma/client';

@Injectable()
export class TelegramLocaleService {
  resolveLocale(
    preferred: Locale | undefined,
    languageCode: string | undefined,
  ): Locale {
    if (preferred) {
      return preferred;
    }

    if (languageCode === 'ru') {
      return Locale.ru;
    }

    if (languageCode === 'en') {
      return Locale.en;
    }

    return Locale.uz;
  }

  message(locale: Locale, messages: Record<Locale, string>): string {
    return messages[locale] ?? messages[Locale.uz];
  }
}
