import { PaymentProvider } from '@prisma/client';

export type InitiatePaymentInput = {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  description: string;
};

export type InitiatePaymentResult = {
  redirectUrl: string;
  providerRef: string;
  expiresAt: Date;
};

export type WebhookVerification = {
  valid: boolean;
  providerTxnId?: string;
  paymentId?: string;
  amount?: number;
  status: 'paid' | 'failed' | 'pending';
  rawPayload?: unknown;
};

export type PaymentMethodConfig = {
  id: string;
  name: string;
  enabled: boolean;
};

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  isEnabled(): boolean;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): WebhookVerification;
  buildWebhookAcknowledgement(body: unknown, accepted: boolean): unknown;
}

export type PaymentRetryJob = {
  paymentId: string;
  provider: PaymentProvider;
  providerTxnId?: string;
  attempt: number;
  reason: string;
};
