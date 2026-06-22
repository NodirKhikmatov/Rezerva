import {
  extractTelegramId,
  assertTelegramUser,
} from './telegram-user.validator';

describe('telegram-user.validator', () => {
  it('extracts telegram user id', () => {
    expect(extractTelegramId({ id: 123, is_bot: false })).toBe(123);
  });

  it('rejects bot accounts', () => {
    expect(extractTelegramId({ id: 123, is_bot: true })).toBeNull();
  });

  it('asserts valid telegram users', () => {
    expect(() => assertTelegramUser({ id: 1, is_bot: false })).not.toThrow();
    expect(() => assertTelegramUser(undefined)).toThrow();
  });
});
