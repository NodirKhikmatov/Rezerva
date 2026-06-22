import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuditEntityType, BookingStatus } from '@prisma/client';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../../shared/types/pagination.type';
import { toTimezoneIso } from '../../../shared/utils/timezone.util';
import { AdminCancelBookingDto } from '../dto/admin-cancel-booking.dto';
import { ListAdminBookingsQueryDto } from '../dto/list-admin-bookings-query.dto';
import { AdminBookingRepository } from '../repositories/admin-booking.repository';
import { AdminBookingListItem, AuditContext } from '../types/admin.types';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminBookingService {
  constructor(
    private readonly bookingRepository: AdminBookingRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listBookings(query: ListAdminBookingsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [rows, total] = await this.bookingRepository.list(query, skip, limit);

    return {
      data: rows.map((row) => this.mapListItem(row)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async forceCancelBooking(
    bookingId: string,
    actorId: string,
    dto: AdminCancelBookingDto,
    context: AuditContext,
  ) {
    const existing = await this.bookingRepository.findById(bookingId);

    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    const result = await this.bookingRepository.forceCancel({
      bookingId,
      actorId,
      reason: dto.reason,
      notes: dto.notes,
      refundOverride: dto.refundOverride,
    });

    if (!result) {
      throw new NotFoundException('Booking not found');
    }

    if ('error' in result) {
      throw new UnprocessableEntityException('Booking is not cancellable');
    }

    await this.auditLogService.log({
      actorId,
      action: 'booking.cancel',
      entityType: AuditEntityType.booking,
      entityId: bookingId,
      oldValues: {
        status: result.previousStatus,
      },
      newValues: {
        status: BookingStatus.cancelled,
        reason: dto.reason,
        refundOverride: dto.refundOverride,
        notes: dto.notes ?? null,
        refundAmount: result.refundAmount,
      },
      context,
    });

    return {
      id: result.booking.id,
      status: BookingStatus.cancelled,
      cancellationFee: result.cancellationFee,
      refundAmount: result.refundAmount,
      refundStatus: result.refundStatus,
    };
  }

  private mapListItem(row: {
    id: string;
    referenceCode: string;
    status: BookingStatus;
    businessId: string;
    userId: string | null;
    walkInName: string | null;
    walkInPhone: string | null;
    paymentMethod: string;
    totalAmount: { toString(): string };
    currency: string;
    startsAt: Date;
    endsAt: Date;
    createdAt: Date;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    business: {
      id: string;
      name: string;
      category: string;
      city: { name: string };
    };
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    } | null;
    payment: { status: string; provider: string | null } | null;
    lineItems: Array<{ name: string }>;
    allocations: Array<{ resource: { name: string } }>;
  }): AdminBookingListItem {
    const nameFromUser = [row.user?.firstName, row.user?.lastName]
      .filter(Boolean)
      .join(' ');
    const customerName = row.walkInName ?? (nameFromUser || null);

    return {
      id: row.id,
      referenceCode: row.referenceCode,
      status: row.status,
      businessId: row.businessId,
      businessName: row.business.name,
      businessCategory: row.business.category,
      userId: row.userId,
      customerName: customerName || null,
      customerPhone: row.walkInPhone ?? row.user?.phone ?? null,
      serviceName: row.lineItems[0]?.name ?? null,
      resourceName: row.allocations[0]?.resource.name ?? null,
      city: row.business.city.name,
      paymentMethod: row.paymentMethod,
      paymentProvider: row.payment?.provider ?? null,
      totalAmount: Number(row.totalAmount),
      currency: row.currency,
      paymentStatus: row.payment?.status ?? null,
      startsAt: toTimezoneIso(row.startsAt),
      endsAt: toTimezoneIso(row.endsAt),
      createdAt: row.createdAt.toISOString(),
      cancelledAt: row.cancelledAt?.toISOString() ?? null,
      cancellationReason: row.cancellationReason,
    };
  }
}
