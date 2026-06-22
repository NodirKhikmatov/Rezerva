import { createHash, timingSafeEqual } from 'crypto';

type ClickWebhookPayload = {
  click_trans_id?: string | number;
  service_id?: string | number;
  merchant_trans_id?: string;
  amount?: string | number;
  action?: string | number;
  sign_time?: string;
  sign_string?: string;
};

export function verifyClickSignature(
  body: ClickWebhookPayload,
  secretKey: string,
): boolean {
  const {
    click_trans_id: clickTransId,
    service_id: serviceId,
    merchant_trans_id: merchantTransId,
    amount,
    action,
    sign_time: signTime,
    sign_string: signString,
  } = body;

  if (
    !clickTransId ||
    !serviceId ||
    !merchantTransId ||
    amount === undefined ||
    action === undefined ||
    !signTime ||
    !signString
  ) {
    return false;
  }

  const digest = createHash('md5')
    .update(
      `${clickTransId}${serviceId}${secretKey}${merchantTransId}${amount}${action}${signTime}`,
    )
    .digest('hex');

  if (digest.length !== signString.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(digest), Buffer.from(signString));
}

export function buildClickCheckoutUrl(
  merchantId: string,
  serviceId: string,
  paymentId: string,
  amount: number,
  returnUrl: string,
): string {
  const params = new URLSearchParams({
    merchant_id: merchantId,
    service_id: serviceId,
    merchant_trans_id: paymentId,
    amount: String(amount),
    return_url: returnUrl,
  });

  return `https://my.click.uz/services/pay?${params.toString()}`;
}
