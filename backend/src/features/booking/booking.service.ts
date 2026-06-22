import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../shared/types/pagination.type';
import { toTimezoneIso } from '../../shared/utils/timezone.util';
import { BookingRepository } from './booking.repository';
import {
  HOLD_TTL_SECONDS,
  MAX_ACTIVE_HOLDS,
} from './constants/booking.constants';
import { ConfirmBookingDto, CreateHoldDto } from './dto/booking.dto';
import { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly configService: ConfigService,
  ) {}

  async createHold(userId: string, dto: CreateHoldDto) {
    const business = await this.bookingRepository.assertBusinessBookable(
      dto.businessId,
    );

    if (!business) {
      throw new UnprocessableEntityException('Business is not bookable');
    }

    const service = await this.bookingRepository.findServiceContext(
      dto.businessId,
      dto.serviceId,
      dto.resourceId,
    );

    if (!service) {
      throw new NotFoundException('Service or resource not found');
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    const durationMs = endsAt.getTime() - startsAt.getTime();
    const expectedMs = service.durationMinutes * 60 * 1000;

    if (durationMs !== expectedMs) {
      throw new UnprocessableEntityException(
        'Slot duration must match service duration',
      );
    }

    const activeHolds = await this.bookingRepository.countActiveHolds(userId);

    if (activeHolds >= MAX_ACTIVE_HOLDS) {
      throw new UnprocessableEntityException('Hold limit exceeded');
    }

    const occupied = await this.bookingRepository.isSlotOccupied(
      dto.resourceId,
      startsAt,
      endsAt,
    );

    if (occupied) {
      throw new ConflictException('Slot unavailable');
    }

    const expiresAt = new Date(Date.now() + HOLD_TTL_SECONDS * 1000);
    const price = Number(service.price);
    const depositPercent = business.policy?.depositPercent ?? 0;
    const depositAmount = Math.floor((price * depositPercent) / 100);

    const hold = await this.bookingRepository.createHold({
      userId,
      businessId: dto.businessId,
      locationId: service.locationId,
      serviceId: dto.serviceId,
      resourceId: dto.resourceId,
      startsAt,
      endsAt,
      partySize: dto.partySize,
      price,
      currency: service.currency,
      expiresAt,
    });

    return {
      holdId: hold.id,
      expiresAt: hold.expiresAt.toISOString(),
      expiresInSeconds: HOLD_TTL_SECONDS,
      serviceId: hold.serviceId,
      resourceId: hold.resourceId,
      startsAt: toTimezoneIso(hold.startsAt),
      endsAt: toTimezoneIso(hold.endsAt),
      price,
      currency: hold.currency,
      depositAmount,
    };
  }

  async releaseHold(userId: string, holdId: string): Promise<void> {
    const hold = await this.bookingRepository.findHoldForUser(holdId, userId);

    if (!hold || hold.status !== 'active') {
      throw new NotFoundException('Hold not found');
    }

    await this.bookingRepository.releaseHold(holdId);
  }

  async confirmBooking(userId: string, dto: ConfirmBookingDto) {
    if (dto.paymentMethod === PaymentMethod.online) {
      throw new UnprocessableEntityException(
        'Online payment is not implemented',
      );
    }

    const apiBaseUrl =
      this.configService.get<string>('apiBaseUrl') ?? 'https://api.rezerva.uz';

    const result = await this.bookingRepository.confirmFromHold({
      holdId: dto.holdId,
      userId,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      participants: dto.participants,
      apiBaseUrl,
    });

    if ('error' in result) {
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Hold not found');
      }

      if (result.error === 'HOLD_EXPIRED') {
        throw new UnprocessableEntityException('Hold expired');
      }

      throw new ConflictException('Slot unavailable');
    }

    const {
      booking,
      businessName,
      resourceId,
      serviceId,
      policySnapshot,
      qrCodeUrl,
    } = result;

    return {
      id: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      businessId: booking.businessId,
      businessName,
      venueId: booking.locationId,
      serviceId,
      resourceId,
      startsAt: toTimezoneIso(booking.startsAt),
      endsAt: toTimezoneIso(booking.endsAt),
      totalAmount: Number(booking.totalAmount),
      depositAmount: Number(booking.depositAmount),
      currency: booking.currency,
      paymentMethod: booking.paymentMethod,
      policySnapshot,
      qrCodeUrl,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  async listMyBookings(userId: string, query: ListMyBookingsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [bookings, total] = await this.bookingRepository.listUserBookings(
      userId,
      query.status,
      skip,
      limit,
    );

    return {
      data: bookings.map((booking) => ({
        id: booking.id,
        referenceCode: booking.referenceCode,
        status: booking.status,
        businessName: booking.business.name,
        venueName: booking.location.name,
        startsAt: toTimezoneIso(booking.startsAt),
        endsAt: toTimezoneIso(booking.endsAt),
        totalAmount: Number(booking.totalAmount),
        currency: booking.currency,
        createdAt: booking.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getBookingDetail(userId: string, bookingId: string) {
    const booking = await this.bookingRepository.findBookingForAccess(
      bookingId,
      userId,
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const apiBaseUrl =
      this.configService.get<string>('apiBaseUrl') ?? 'https://api.rezerva.uz';

    return {
      id: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      timeline: booking.statusHistory.map((entry) => ({
        status: entry.toStatus,
        at: entry.createdAt.toISOString(),
        actor: entry.actorType,
      })),
      business: booking.business,
      venue: booking.location,
      lineItems: booking.lineItems.map((item) => ({
        serviceId: item.serviceId,
        name: item.name,
        durationMinutes: item.durationMinutes,
        price: Number(item.unitPrice),
      })),
      allocations: booking.allocations.map((allocation) => ({
        resourceId: allocation.resourceId,
        resourceName: allocation.resource.name,
        startsAt: toTimezoneIso(allocation.startsAt),
        endsAt: toTimezoneIso(allocation.endsAt),
      })),
      totalAmount: Number(booking.totalAmount),
      payment: booking.payment
        ? {
            status: booking.payment.status,
            provider: booking.payment.provider,
            paidAt: booking.payment.paidAt?.toISOString() ?? null,
          }
        : null,
      canCancel: ['confirmed', 'pending_approval', 'pending_payment'].includes(
        booking.status,
      ),
      canReview: booking.status === 'completed' && booking.review === null,
      policySnapshot: booking.policySnapshot,
      qrCodeUrl: `${apiBaseUrl}/v1/bookings/${booking.referenceCode}/qr`,
    };
  }
}
