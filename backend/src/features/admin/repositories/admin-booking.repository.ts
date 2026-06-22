import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  NotificationChannel,
  NotificationType,
  PaymentStatus,
  Prisma,
  RefundReason,
  RefundStatus,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AdminRefundOverride } from '../dto/admin-cancel-booking.dto';
import { ListAdminBookingsQueryDto } from '../dto/list-admin-bookings-query.dto';
import { parseLocalDate } from '../../../shared/utils/timezone.util';

const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.pending_payment,
  BookingStatus.pending_approval,
  BookingStatus.confirmed,
  BookingStatus.checked_in,
];

@Injectable()
export class AdminBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListAdminBookingsQueryDto, skip: number, take: number) {
    const where = this.buildWhere(query);

    return Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              category: true,
              city: { select: { name: true } },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          payment: { select: { status: true, provider: true } },
          lineItems: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { name: true },
          },
          allocations: {
            take: 1,
            include: { resource: { select: { name: true } } },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
  }

  findById(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  forceCancel(input: {
    bookingId: string;
    actorId: string;
    reason: string;
    notes?: string;
    refundOverride: AdminRefundOverride;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: input.bookingId },
        include: { payment: true },
      });

      if (!booking) {
        return null;
      }

      if (!CANCELLABLE_STATUSES.includes(booking.status)) {
        return { error: 'NOT_CANCELLABLE' as const };
      }

      const previousStatus = booking.status;
      const cancelledAt = new Date();
      const totalAmount = Number(booking.totalAmount);
      const policySnapshot = booking.policySnapshot as {
        cancellationFeePercent?: number;
      };
      const feePercent = policySnapshot.cancellationFeePercent ?? 0;
      const policyCancellationFee = Math.floor(
        (totalAmount * feePercent) / 100,
      );

      let refundAmount = 0;
      let cancellationFee = policyCancellationFee;

      if (input.refundOverride === AdminRefundOverride.full) {
        refundAmount = totalAmount;
        cancellationFee = 0;
      }

      if (input.refundOverride === AdminRefundOverride.partial) {
        refundAmount = Math.max(totalAmount - policyCancellationFee, 0);
        cancellationFee = totalAmount - refundAmount;
      }

      if (input.refundOverride === AdminRefundOverride.none) {
        refundAmount = 0;
        cancellationFee = totalAmount;
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.cancelled,
          cancelledAt,
          cancellationReason: input.reason,
          notes: input.notes ?? booking.notes,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: previousStatus,
          toStatus: BookingStatus.cancelled,
          actorId: input.actorId,
          actorType: 'admin',
          note: input.reason,
        },
      });

      let refundStatus: RefundStatus | null = null;

      if (
        refundAmount > 0 &&
        booking.payment &&
        booking.payment.status === PaymentStatus.paid
      ) {
        const refund = await tx.refund.create({
          data: {
            paymentId: booking.payment.id,
            amount: refundAmount,
            currency: booking.currency,
            status: RefundStatus.pending,
            reason: RefundReason.admin_override,
            notes: input.notes,
          },
        });

        refundStatus = refund.status;

        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status:
              refundAmount >= Number(booking.payment.amount)
                ? PaymentStatus.refunded
                : PaymentStatus.partially_refunded,
          },
        });
      }

      if (booking.userId) {
        await tx.notification.create({
          data: {
            userId: booking.userId,
            bookingId: booking.id,
            type: NotificationType.booking_cancelled,
            channel: NotificationChannel.in_app,
            title: 'Booking cancelled',
            body: `Your booking ${booking.referenceCode} was cancelled by support`,
            metadata: { bookingId: booking.id, reason: input.reason },
          },
        });
      }

      return {
        booking,
        previousStatus,
        cancellationFee,
        refundAmount,
        refundStatus,
      };
    });
  }

  private buildWhere(
    query: ListAdminBookingsQueryDto,
  ): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {};

    if (query.referenceCode) {
      where.referenceCode = query.referenceCode;
    }

    if (query.businessId) {
      where.businessId = query.businessId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.startsAt = {};

      if (query.from) {
        where.startsAt.gte = parseLocalDate(query.from);
      }

      if (query.to) {
        const toDate = parseLocalDate(query.to);
        toDate.setUTCDate(toDate.getUTCDate() + 1);
        where.startsAt.lt = toDate;
      }
    }

    return where;
  }
}
