import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import { PAYMENT_INITIATE_TTL_MS } from '../../constants/payment.constants';
import {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProviderAdapter,
  WebhookVerification,
} from '../../types/payment-provider.types';
import { buildClickCheckoutUrl, verifyClickSignature } from './click.utils';

type ClickWebhookBody = {
  click_trans_id?: string | number;
  service_id?: string | number;
  merchant_trans_id?: string;
  amount?: string | number;
  action?: string | number;
  sign_time?: string;
  sign_string?: string;
  error?: string | number;
};

@Injectable()
export class ClickPaymentAdapter implements PaymentProviderAdapter {
  readonly provider = PaymentProvider.click;

  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.merchantId && this.serviceId && this.secretKey);
  }

  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const redirectUrl = buildClickCheckoutUrl(
      this.merchantId,
      this.serviceId,
      input.paymentId,
      input.amount,
      input.returnUrl,
    );

    return Promise.resolve({
      redirectUrl,
      providerRef: input.paymentId,
      expiresAt: new Date(Date.now() + PAYMENT_INITIATE_TTL_MS),
    });
  }

  verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): WebhookVerification {
    const payload = body as ClickWebhookBody;

    if (!verifyClickSignature(payload, this.secretKey)) {
      return { valid: false, status: 'pending' };
    }

    const action = Number(payload.action);
    const failed = Number(payload.error) !== 0;
    const paid = action === 1 && !failed;

    return {
      valid: true,
      providerTxnId: String(payload.click_trans_id ?? ''),
      paymentId: payload.merchant_trans_id,
      amount: payload.amount ? Number(payload.amount) : undefined,
      status: paid ? 'paid' : failed ? 'failed' : 'pending',
      rawPayload: body,
    };
  }

  buildWebhookAcknowledgement(_body: unknown, accepted: boolean): unknown {
    return {
      error: accepted ? 0 : -1,
      error_note: accepted ? 'Success' : 'Rejected',
    };
  }

  private get merchantId(): string {
    return this.configService.get<string>('payments.click.merchantId') ?? '';
  }

  private get serviceId(): string {
    return this.configService.get<string>('payments.click.serviceId') ?? '';
  }

  private get secretKey(): string {
    return this.configService.get<string>('payments.click.secretKey') ?? '';
  }
}
