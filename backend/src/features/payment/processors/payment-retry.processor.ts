import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PAYMENT_RETRY_QUEUE } from '../constants/payment.constants';
import { PaymentWebhookService } from '../services/payment-webhook.service';
import { PaymentRetryJob } from '../types/payment-provider.types';

@Processor(PAYMENT_RETRY_QUEUE)
export class PaymentRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentRetryProcessor.name);

  constructor(private readonly webhookService: PaymentWebhookService) {
    super();
  }

  async process(job: Job<PaymentRetryJob>): Promise<void> {
    this.logger.warn(
      `Retrying payment webhook: ${job.data.paymentId} (attempt ${job.data.attempt})`,
    );

    await this.webhookService.retryPayment(job.data);
  }
}
