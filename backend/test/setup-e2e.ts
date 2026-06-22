process.env.DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://ordering:ordering@localhost:5435/ordering';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-jwt-secret';
process.env.TELEGRAM_BOT_TOKEN =
  process.env.E2E_TELEGRAM_BOT_TOKEN ?? 'e2e-test-bot-token';
