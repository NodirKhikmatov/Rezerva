import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  BusinessStatus,
  NotificationChannel,
  NotificationType,
  PaymentMethod,
  Prisma,
  SlotHoldStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BLOCKING_BOOKING_STATUSES,
  MAX_ACTIVE_HOLDS,
} from './constants/booking.constants';
import { buildReferenceCode } from './utils/reference-code.util';

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  countActiveHolds(userId: string): Promise<number> {
    return this.prisma.slotHold.count({
      where: {
        userId,
        status: SlotHoldStatus.active,
        expiresAt: { gt: new Date() },
      },
    });
  }

  findHoldForUser(holdId: string, userId: string) {
    return this.prisma.slotHold.findFirst({
      where: { id: holdId, userId },
      include: {
        service: true,
        business: { include: { policy: true } },
        resource: true,
      },
    });
  }

  findServiceContext(
    businessId: string,
    serviceId: string,
    resourceId: string,
  ) {
    return this.prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        deletedAt: null,
        isActive: true,
        serviceResources: { some: { resourceId } },
      },
      include: {
        business: { include: { policy: true } },
      },
    });
  }

  isSlotOccupied(
    resourceId: string,
    startsAt: Date,
    endsAt: Date,
    excludeHoldId?: string,
  ): Promise<boolean> {
    return this.hasConflict(resourceId, startsAt, endsAt, excludeHoldId);
  }

  createHold(data: {
    userId: string;
    businessId: string;
    locationId: string;
    serviceId: string;
    resourceId: string;
    startsAt: Date;
    endsAt: Date;
    partySize?: number;
    price: number;
    currency: string;
    expiresAt: Date;
  }) {
    return this.prisma.slotHold.create({ data });
  }

  releaseHold(holdId: string) {
    return this.prisma.slotHold.update({
      where: { id: holdId },
      data: { status: SlotHoldStatus.released },
    });
  }

  async getNextReferenceSequence(year: number): Promise<number> {
    const prefix = `RZ-${year}-`;
    const latest = await this.prisma.booking.findFirst({
      where: { referenceCode: { startsWith: prefix } },
      orderBy: { referenceCode: 'desc' },
      select: { referenceCode: true },
    });

    if (!latest) {
      return 1;
    }

    const sequencePart = latest.referenceCode.slice(prefix.length);
    return Number(sequencePart) + 1;
  }

  async confirmFromHold(input: {
    holdId: string;
    userId: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    participants?: Array<{ name: string; phone?: string }>;
    apiBaseUrl: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.slotHold.findFirst({
        where: {
          id: input.holdId,
          userId: input.userId,
          status: SlotHoldStatus.active,
        },
        include: {
          service: true,
          business: { include: { policy: true } },
          resource: true,
        },
      });

      if (!hold) {
        return { error: 'NOT_FOUND' as const };
      }

      if (hold.expiresAt <= new Date()) {
        return { error: 'HOLD_EXPIRED' as const };
      }

      const occupied = await this.hasConflictInTx(
        tx,
        hold.resourceId,
        hold.startsAt,
        hold.endsAt,
        hold.id,
      );

      if (occupied) {
        return { error: 'SLOT_UNAVAILABLE' as const };
      }

      const year = hold.startsAt.getUTCFullYear();
      const sequence = await this.getNextReferenceSequenceInTx(tx, year);
      const referenceCode = buildReferenceCode(year, sequence);
      const policy = hold.business.policy;
      const policySnapshot = policy
        ? {
            cancellationHoursBefore: policy.cancellationHoursBefore,
            cancellationFeePercent: policy.cancellationFeePercent,
            depositPercent: policy.depositPercent,
            requiresApproval: policy.requiresApproval,
          }
        : {};

      const status =
        input.paymentMethod === PaymentMethod.pay_at_venue
          ? BookingStatus.confirmed
          : BookingStatus.pending_payment;

      const depositAmount =
        input.paymentMethod === PaymentMethod.pay_at_venue
          ? 0
          : policy
            ? Math.floor((Number(hold.price) * policy.depositPercent) / 100)
            : 0;

      const booking = await tx.booking.create({
        data: {
          referenceCode,
          userId: input.userId,
          businessId: hold.businessId,
          locationId: hold.locationId,
          status,
          paymentMethod: input.paymentMethod,
          totalAmount: hold.price,
          depositAmount,
          currency: hold.currency,
          partySize: hold.partySize,
          notes: input.notes,
          policySnapshot,
          startsAt: hold.startsAt,
          endsAt: hold.endsAt,
        },
      });

      await tx.bookingLineItem.create({
        data: {
          bookingId: booking.id,
          serviceId: hold.serviceId,
          name: hold.service.name,
          durationMinutes: hold.service.durationMinutes,
          unitPrice: hold.price,
          quantity: 1,
          subtotal: hold.price,
        },
      });

      await tx.bookingResourceAllocation.create({
        data: {
          bookingId: booking.id,
          resourceId: hold.resourceId,
          startsAt: hold.startsAt,
          endsAt: hold.endsAt,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: null,
          toStatus: status,
          actorType: 'system',
        },
      });

      if (input.participants?.length) {
        await tx.bookingParticipant.createMany({
          data: input.participants.map((participant) => ({
            bookingId: booking.id,
            userId: input.userId,
            name: participant.name,
            phone: participant.phone,
          })),
        });
      }

      await tx.slotHold.update({
        where: { id: hold.id },
        data: {
          status: SlotHoldStatus.converted,
          bookingId: booking.id,
        },
      });

      if (status === BookingStatus.confirmed) {
        await tx.notification.create({
          data: {
            userId: input.userId,
            bookingId: booking.id,
            type: NotificationType.booking_confirmed,
            channel: NotificationChannel.in_app,
            title: 'Booking confirmed',
            body: `Your booking ${referenceCode} is confirmed`,
            metadata: { bookingId: booking.id },
          },
        });
      }

      return {
        booking,
        businessName: hold.business.name,
        resourceId: hold.resourceId,
        serviceId: hold.serviceId,
        policySnapshot,
        qrCodeUrl: `${input.apiBaseUrl}/v1/bookings/${referenceCode}/qr`,
      };
    });
  }

  findBookingForAccess(bookingId: string, userId: string) {
    return this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { userId },
          {
            business: {
              members: {
                some: {
                  userId,
                  deletedAt: null,
                },
              },
            },
          },
        ],
      },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, addressLine: true } },
        lineItems: true,
        allocations: {
          include: { resource: { select: { id: true, name: true } } },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
        review: { select: { id: true } },
      },
    });
  }

  listUserBookings(
    userId: string,
    filter: 'upcoming' | 'past' | 'cancelled' | undefined,
    skip: number,
    take: number,
  ) {
    const now = new Date();
    const where: Prisma.BookingWhereInput = { userId };

    if (filter === 'upcoming') {
      where.status = {
        in: [
          BookingStatus.pending_payment,
          BookingStatus.pending_approval,
          BookingStatus.confirmed,
          BookingStatus.checked_in,
        ],
      };
      where.startsAt = { gte: now };
    }

    if (filter === 'past') {
      where.OR = [
        { endsAt: { lt: now } },
        { status: { in: [BookingStatus.completed, BookingStatus.no_show] } },
      ];
    }

    if (filter === 'cancelled') {
      where.status = BookingStatus.cancelled;
    }

    return Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { startsAt: 'desc' },
        include: {
          business: { select: { name: true } },
          location: { select: { name: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
  }

  private async hasConflict(
    resourceId: string,
    startsAt: Date,
    endsAt: Date,
    excludeHoldId?: string,
  ): Promise<boolean> {
    return this.hasConflictInTx(
      this.prisma,
      resourceId,
      startsAt,
      endsAt,
      excludeHoldId,
    );
  }

  private async hasConflictInTx(
    tx: Prisma.TransactionClient | PrismaService,
    resourceId: string,
    startsAt: Date,
    endsAt: Date,
    excludeHoldId?: string,
  ): Promise<boolean> {
    const [hold, allocation, blocked] = await Promise.all([
      tx.slotHold.findFirst({
        where: {
          resourceId,
          status: SlotHoldStatus.active,
          expiresAt: { gt: new Date() },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
          ...(excludeHoldId ? { id: { not: excludeHoldId } } : {}),
        },
      }),
      tx.bookingResourceAllocation.findFirst({
        where: {
          resourceId,
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
          booking: {
            status: { in: [...BLOCKING_BOOKING_STATUSES] as BookingStatus[] },
          },
        },
      }),
      tx.resourceBlockedSlot.findFirst({
        where: {
          resourceId,
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      }),
    ]);

    return Boolean(hold || allocation || blocked);
  }

  private async getNextReferenceSequenceInTx(
    tx: Prisma.TransactionClient,
    year: number,
  ): Promise<number> {
    const prefix = `RZ-${year}-`;
    const latest = await tx.booking.findFirst({
      where: { referenceCode: { startsWith: prefix } },
      orderBy: { referenceCode: 'desc' },
      select: { referenceCode: true },
    });

    if (!latest) {
      return 1;
    }

    return Number(latest.referenceCode.slice(prefix.length)) + 1;
  }

  assertBusinessBookable(businessId: string) {
    return this.prisma.business.findFirst({
      where: {
        id: businessId,
        status: BusinessStatus.active,
        deletedAt: null,
      },
      include: { policy: true },
    });
  }

  getMaxActiveHolds(): number {
    return MAX_ACTIVE_HOLDS;
  }
}
