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
import { buildPaymeCheckoutUrl, verifyPaymeAuthorization } from './payme.utils';

type PaymeWebhookBody = {
  method?: string;
  params?: {
    id?: string;
    amount?: number;
    account?: { payment_id?: string };
    state?: number;
  };
};

@Injectable()
export class PaymePaymentAdapter implements PaymentProviderAdapter {
  readonly provider = PaymentProvider.payme;

  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.merchantId && this.apiKey);
  }

  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const amountTiyin = input.amount * 100;
    const redirectUrl = buildPaymeCheckoutUrl(
      this.merchantId,
      input.paymentId,
      amountTiyin,
      input.returnUrl,
    );

    return Promise.resolve({
      redirectUrl,
      providerRef: input.paymentId,
      expiresAt: new Date(Date.now() + PAYMENT_INITIATE_TTL_MS),
    });
  }

  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): WebhookVerification {
    const authorization = this.readHeader(headers, 'authorization');

    if (
      !verifyPaymeAuthorization(authorization, this.merchantId, this.apiKey)
    ) {
      return { valid: false, status: 'pending' };
    }

    return this.mapPaymeBody(body);
  }

  buildWebhookAcknowledgement(body: unknown, accepted: boolean): unknown {
    const payload = body as PaymeWebhookBody;

    return {
      jsonrpc: '2.0',
      id: payload.params?.id ?? null,
      result: accepted
        ? { state: 2, transaction: payload.params?.id }
        : { error: { code: -31050, message: 'Unable to process' } },
    };
  }

  private mapPaymeBody(body: unknown): WebhookVerification {
    const payload = body as PaymeWebhookBody;
    const paymentId = payload.params?.account?.payment_id;
    const isPaid =
      payload.method === 'PerformTransaction' || payload.params?.state === 2;

    return {
      valid: true,
      providerTxnId: payload.params?.id?.toString(),
      paymentId,
      amount: payload.params?.amount
        ? Math.floor(payload.params.amount / 100)
        : undefined,
      status: isPaid ? 'paid' : 'pending',
      rawPayload: body,
    };
  }

  private readHeader(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | undefined {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private get merchantId(): string {
    return this.configService.get<string>('payments.payme.merchantId') ?? '';
  }

  private get apiKey(): string {
    return this.configService.get<string>('payments.payme.apiKey') ?? '';
  }
}
