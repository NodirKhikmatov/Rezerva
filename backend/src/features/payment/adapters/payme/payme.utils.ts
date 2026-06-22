import { createHmac, timingSafeEqual } from 'crypto';

export function verifyPaymeAuthorization(
  authorizationHeader: string | undefined,
  merchantId: string,
  apiKey: string,
): boolean {
  if (!authorizationHeader?.startsWith('Basic ')) {
    return false;
  }

  const encoded = authorizationHeader.slice('Basic '.length).trim();
  const expected = Buffer.from(`${merchantId}:${apiKey}`).toString('base64');

  if (encoded.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(encoded), Buffer.from(expected));
}

export function signPaymeCheckoutPayload(
  payload: string,
  apiKey: string,
): string {
  return createHmac('sha256', apiKey).update(payload).digest('hex');
}

export function buildPaymeCheckoutUrl(
  merchantId: string,
  paymentId: string,
  amount: number,
  returnUrl: string,
): string {
  const params = Buffer.from(
    JSON.stringify({
      m: merchantId,
      ac: { payment_id: paymentId },
      a: amount,
      c: returnUrl,
    }),
  ).toString('base64url');

  return `https://checkout.paycom.uz/${params}`;
}
