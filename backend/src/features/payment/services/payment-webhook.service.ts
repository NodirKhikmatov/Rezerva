import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  MAX_PAYMENT_RETRY_ATTEMPTS,
  PAYMENT_RETRY_BACKOFF_MS,
  PAYMENT_RETRY_QUEUE,
} from '../constants/payment.constants';
import { PaymentProviderRegistry } from '../adapters/payment-provider.registry';
import { PaymentRepository } from '../repository/payment.repository';
import {
  PaymentRetryJob,
  WebhookVerification,
} from '../types/payment-provider.types';

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly paymentRepository: PaymentRepository,
    @InjectQueue(PAYMENT_RETRY_QUEUE) private readonly retryQueue: Queue,
  ) {}

  async handleProviderWebhook(
    provider: PaymentProvider,
    verification: WebhookVerification,
    body: unknown,
  ): Promise<unknown> {
    const adapter = this.registry.resolve(provider);

    if (verification.status === 'failed') {
      await this.processFailure(provider, verification);
      return adapter.buildWebhookAcknowledgement(body, true);
    }

    if (verification.status !== 'paid' || !verification.paymentId) {
      return adapter.buildWebhookAcknowledgement(body, true);
    }

    try {
      await this.processSuccess(provider, verification);
      return adapter.buildWebhookAcknowledgement(body, true);
    } catch (error) {
      await this.enqueueRetry(provider, verification, error);
      return adapter.buildWebhookAcknowledgement(body, false);
    }
  }

  async retryPayment(job: PaymentRetryJob): Promise<void> {
    if (!job.providerTxnId || !job.paymentId) {
      return;
    }

    const verification: WebhookVerification = {
      valid: true,
      paymentId: job.paymentId,
      providerTxnId: job.providerTxnId,
      status: 'paid',
    };

    await this.processSuccess(job.provider, verification);
  }

  private async processSuccess(
    provider: PaymentProvider,
    verification: WebhookVerification,
  ): Promise<void> {
    const payment = await this.paymentRepository.findPaymentById(
      verification.paymentId!,
    );

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'paid') {
      return;
    }

    if (
      verification.amount !== undefined &&
      Number(payment.amount) !== verification.amount
    ) {
      throw new Error('Amount mismatch');
    }

    const idempotencyKey = `webhook:${provider}:${verification.providerTxnId}`;

    await this.paymentRepository.finalizeSuccessfulPayment({
      paymentId: payment.id,
      provider,
      providerTxnId: verification.providerTxnId!,
      idempotencyKey,
      amount: Number(payment.amount),
      currency: payment.currency,
      rawPayload: verification.rawPayload as object | undefined,
    });
  }

  private async processFailure(
    provider: PaymentProvider,
    verification: WebhookVerification,
  ): Promise<void> {
    if (!verification.paymentId) {
      return;
    }

    await this.paymentRepository.markPaymentFailed(
      verification.paymentId,
      `${provider} webhook reported failure`,
    );
  }

  private async enqueueRetry(
    provider: PaymentProvider,
    verification: WebhookVerification,
    error: unknown,
  ): Promise<void> {
    if (!verification.paymentId) {
      return;
    }

    const reason = error instanceof Error ? error.message : 'Webhook failed';

    this.logger.warn(
      `Payment webhook retry scheduled for ${verification.paymentId}: ${reason}`,
    );

    await this.retryQueue.add(
      'payment-webhook-retry',
      {
        paymentId: verification.paymentId,
        provider,
        providerTxnId: verification.providerTxnId,
        attempt: 1,
        reason,
      } satisfies PaymentRetryJob,
      {
        attempts: MAX_PAYMENT_RETRY_ATTEMPTS,
        backoff: { type: 'fixed', delay: PAYMENT_RETRY_BACKOFF_MS },
      },
    );
  }
}
