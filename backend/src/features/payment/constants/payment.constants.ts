export const PAYMENT_RETRY_QUEUE = 'payment-retries';

export const PAYMENT_INITIATE_TTL_MS = 30 * 60 * 1000;

export const MAX_PAYMENT_RETRY_ATTEMPTS = 5;

export const PAYMENT_RETRY_BACKOFF_MS = 60_000;

export const ALLOWED_RETURN_URL_HOSTS = [
  'localhost',
  'rezerva.uz',
  'www.rezerva.uz',
];
