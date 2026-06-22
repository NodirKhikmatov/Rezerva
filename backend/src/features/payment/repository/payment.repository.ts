import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  NotificationChannel,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  Prisma,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  isBookingOwner(bookingId: string, userId: string): Promise<boolean> {
    return this.prisma.booking
      .findFirst({
        where: { id: bookingId, userId },
        select: { id: true },
      })
      .then(Boolean);
  }

  findPaymentByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  findPaymentById(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  findPaymentForOwner(paymentId: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: { id: paymentId, booking: { userId } },
      include: { booking: true },
    });
  }

  findByProviderTxn(provider: PaymentProvider, providerTxnId: string) {
    return this.prisma.paymentTransaction.findFirst({
      where: { provider, providerTxnId },
      include: { payment: { include: { booking: true } } },
    });
  }

  findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { idempotencyKey },
      include: { payment: { include: { booking: true } } },
    });
  }

  findRefundsByBooking(bookingId: string) {
    return this.prisma.refund.findMany({
      where: { payment: { bookingId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  updatePaymentProcessing(
    paymentId: string,
    provider: PaymentProvider,
    providerRef: string,
  ) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.processing,
        provider,
        providerRef,
      },
    });
  }

  appendTransaction(data: {
    paymentId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    provider?: PaymentProvider;
    providerTxnId?: string;
    idempotencyKey: string;
    rawPayload?: Prisma.InputJsonValue;
  }) {
    return this.prisma.paymentTransaction.create({ data });
  }

  markPaymentFailed(paymentId: string, reason: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.failed,
        failedAt: new Date(),
        failureReason: reason.slice(0, 500),
      },
    });
  }

  async finalizeSuccessfulPayment(input: {
    paymentId: string;
    provider: PaymentProvider;
    providerTxnId: string;
    idempotencyKey: string;
    amount: number;
    currency: string;
    rawPayload?: Prisma.InputJsonValue;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (existing) {
        const payment = await tx.payment.findUniqueOrThrow({
          where: { id: input.paymentId },
          include: { booking: true },
        });
        return payment;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: input.paymentId,
          type: TransactionType.charge,
          amount: input.amount,
          currency: input.currency,
          provider: input.provider,
          providerTxnId: input.providerTxnId,
          idempotencyKey: input.idempotencyKey,
          rawPayload: input.rawPayload,
        },
      });

      const payment = await tx.payment.update({
        where: { id: input.paymentId },
        data: {
          status: PaymentStatus.paid,
          paidAt: new Date(),
          provider: input.provider,
          providerRef: input.providerTxnId,
        },
        include: { booking: true },
      });

      if (payment.booking.status === BookingStatus.pending_payment) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.confirmed },
        });

        await tx.bookingStatusHistory.create({
          data: {
            bookingId: payment.bookingId,
            fromStatus: BookingStatus.pending_payment,
            toStatus: BookingStatus.confirmed,
            actorType: 'system',
          },
        });

        if (payment.booking.userId) {
          await tx.notification.create({
            data: {
              userId: payment.booking.userId,
              bookingId: payment.bookingId,
              type: NotificationType.payment_received,
              channel: NotificationChannel.in_app,
              title: 'Payment received',
              body: `Payment for booking ${payment.booking.referenceCode} confirmed`,
              metadata: { paymentId: payment.id, bookingId: payment.bookingId },
            },
          });

          await tx.notification.create({
            data: {
              userId: payment.booking.userId,
              bookingId: payment.bookingId,
              type: NotificationType.booking_confirmed,
              channel: NotificationChannel.in_app,
              title: 'Booking confirmed',
              body: `Your booking ${payment.booking.referenceCode} is confirmed`,
              metadata: { bookingId: payment.bookingId },
            },
          });
        }
      }

      return payment;
    });
  }

  createPendingPayment(data: {
    bookingId: string;
    amount: number;
    currency: string;
    type: PaymentType;
  }) {
    return this.prisma.payment.create({ data });
  }
}
