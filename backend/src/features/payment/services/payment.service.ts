import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { PaymentProviderRegistry } from '../adapters/payment-provider.registry';
import { ALLOWED_RETURN_URL_HOSTS } from '../constants/payment.constants';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { PaymentRepository } from '../repository/payment.repository';
import { LedgerService } from './ledger.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly ledgerService: LedgerService,
    private readonly configService: ConfigService,
  ) {}

  listMethods() {
    const online = this.providerRegistry
      .listEnabledMethods()
      .map((adapter) => ({
        id: adapter.provider,
        name: adapter.provider === PaymentProvider.payme ? 'Payme' : 'Click',
        enabled: true,
      }));

    return {
      data: [
        ...online,
        { id: 'pay_at_venue', name: 'Pay at venue', enabled: true },
      ],
    };
  }

  async getPaymentForBooking(bookingId: string) {
    const payment =
      await this.paymentRepository.findPaymentByBooking(bookingId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPayment(payment);
  }

  async initiatePayment(
    bookingId: string,
    userId: string,
    dto: InitiatePaymentDto,
    idempotencyKey: string,
  ) {
    this.assertAllowedReturnUrl(dto.returnUrl);
    this.assertAllowedReturnUrl(dto.cancelUrl);

    const cached =
      await this.paymentRepository.findByIdempotencyKey(idempotencyKey);

    if (cached?.payment.bookingId === bookingId) {
      return this.buildInitiateResponseFromTransaction(cached);
    }

    const payment =
      await this.paymentRepository.findPaymentByBooking(bookingId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const ownsBooking = await this.paymentRepository.isBookingOwner(
      bookingId,
      userId,
    );

    if (!ownsBooking) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.paid) {
      throw new ConflictException('Payment already paid');
    }

    const adapter = this.providerRegistry.resolve(dto.provider);
    const result = await adapter.initiate({
      paymentId: payment.id,
      bookingId,
      amount: Number(payment.amount),
      currency: payment.currency,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl,
      description: `Booking payment ${bookingId}`,
    });

    await this.paymentRepository.updatePaymentProcessing(
      payment.id,
      dto.provider,
      result.providerRef,
    );

    await this.ledgerService.recordInitiateAttempt({
      paymentId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      provider: dto.provider,
      providerTxnId: result.providerRef,
      idempotencyKey,
      rawPayload: {
        redirectUrl: result.redirectUrl,
        expiresAt: result.expiresAt.toISOString(),
      },
    });

    return {
      paymentId: payment.id,
      status: PaymentStatus.processing,
      redirectUrl: result.redirectUrl,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findPaymentForOwner(
      paymentId,
      userId,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      paidAt: payment.paidAt?.toISOString() ?? null,
      bookingStatus: payment.booking.status,
      receiptUrl: payment.status === PaymentStatus.paid ? null : null,
    };
  }

  async listRefunds(bookingId: string) {
    const refunds =
      await this.paymentRepository.findRefundsByBooking(bookingId);

    return {
      data: refunds.map((refund) => ({
        id: refund.id,
        amount: Number(refund.amount),
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        providerRefundId: refund.providerRefundId,
        createdAt: refund.createdAt.toISOString(),
      })),
    };
  }

  private assertAllowedReturnUrl(url: string): void {
    const parsed = new URL(url);
    const isDev = this.configService.get<string>('nodeEnv') !== 'production';
    const hostAllowed = ALLOWED_RETURN_URL_HOSTS.some((host) =>
      parsed.hostname.endsWith(host),
    );

    if (!hostAllowed) {
      throw new UnprocessableEntityException(
        'Return URL domain not allowlisted',
      );
    }

    if (!isDev && parsed.protocol !== 'https:') {
      throw new BadRequestException('Return URL must use HTTPS');
    }
  }

  private mapPayment(payment: {
    id: string;
    bookingId: string;
    status: PaymentStatus;
    amount: { toString(): string };
    currency: string;
    type: string;
    provider: PaymentProvider | null;
    transactions: unknown[];
    createdAt: Date;
  }) {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      type: payment.type,
      provider: payment.provider,
      transactions: payment.transactions,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  private buildInitiateResponseFromTransaction(transaction: {
    payment: { id: string; status: PaymentStatus };
    rawPayload: unknown;
  }) {
    const payload = transaction.rawPayload as {
      redirectUrl?: string;
      expiresAt?: string;
    } | null;

    return {
      paymentId: transaction.payment.id,
      status: transaction.payment.status,
      redirectUrl: payload?.redirectUrl ?? '',
      expiresAt: payload?.expiresAt ?? new Date().toISOString(),
    };
  }
}
