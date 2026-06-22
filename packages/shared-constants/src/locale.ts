export const Locale = {
  uz: 'uz',
  ru: 'ru',
  en: 'en',
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const LOCALES = Object.values(Locale);
