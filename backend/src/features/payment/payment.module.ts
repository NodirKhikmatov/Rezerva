import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueModule } from '../../queue/queue.module';
import { ClickPaymentAdapter } from './adapters/click/click-payment.adapter';
import { PaymePaymentAdapter } from './adapters/payme/payme-payment.adapter';
import { PaymentProviderRegistry } from './adapters/payment-provider.registry';
import { PAYMENT_RETRY_QUEUE } from './constants/payment.constants';
import { BookingOwnerGuard } from './guards/booking-owner.guard';
import {
  ClickWebhookGuard,
  PaymeWebhookGuard,
} from './guards/webhook-signature.guards';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentController } from './payment.controller';
import { PaymentRetryProcessor } from './processors/payment-retry.processor';
import { PaymentRepository } from './repository/payment.repository';
import { LedgerService } from './services/ledger.service';
import { PaymentWebhookService } from './services/payment-webhook.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({ name: PAYMENT_RETRY_QUEUE }),
  ],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [
    PaymentRepository,
    PaymentService,
    PaymentWebhookService,
    LedgerService,
    PaymentProviderRegistry,
    PaymePaymentAdapter,
    ClickPaymentAdapter,
    BookingOwnerGuard,
    PaymeWebhookGuard,
    ClickWebhookGuard,
    PaymentRetryProcessor,
  ],
  exports: [PaymentRepository, PaymentService],
})
export class PaymentModule {}
