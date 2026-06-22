export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME ?? '',
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001',
  payments: {
    payme: {
      merchantId: process.env.PAYME_MERCHANT_ID ?? '',
      apiKey: process.env.PAYME_API_KEY ?? '',
    },
    click: {
      merchantId: process.env.CLICK_MERCHANT_ID ?? '',
      serviceId: process.env.CLICK_SERVICE_ID ?? '',
      secretKey: process.env.CLICK_SECRET_KEY ?? '',
    },
  },
  logging: {
    betterStackSourceToken: process.env.BETTER_STACK_SOURCE_TOKEN ?? '',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
});
