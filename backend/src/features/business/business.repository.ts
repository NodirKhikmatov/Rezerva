import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  BusinessStatus,
  Prisma,
  SlotHoldStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BLOCKING_BOOKING_STATUSES } from '../booking/constants/booking.constants';
import { SearchBusinessesQueryDto } from './dto/search-businesses-query.dto';

type BusinessSearchRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  coverImageUrl: string | null;
  averageRating: Prisma.Decimal;
  reviewCount: number;
  districtName: string | null;
  cityName: string;
  priceFrom: number | null;
  currency: string;
  isFeatured: boolean;
};

@Injectable()
export class BusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchActive(
    query: SearchBusinessesQueryDto,
    skip: number,
    take: number,
  ): Promise<{ rows: BusinessSearchRow[]; total: number }> {
    const where = this.buildSearchWhere(query);
    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { averageRating: 'desc' },
        include: {
          city: { select: { name: true } },
          locations: {
            where: { deletedAt: null, isPrimary: true },
            take: 1,
            include: { district: { select: { name: true } } },
          },
          services: {
            where: { deletedAt: null, isActive: true },
            orderBy: { price: 'asc' },
            take: 1,
            select: { price: true, currency: true },
          },
          featuredListings: {
            where: {
              startsAt: { lte: new Date() },
              endsAt: { gte: new Date() },
              isActive: true,
            },
            take: 1,
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    const rows = businesses.map((business) => ({
      id: business.id,
      slug: business.slug,
      name: business.name,
      category: business.category,
      status: business.status,
      coverImageUrl: business.coverImageUrl,
      averageRating: business.averageRating,
      reviewCount: business.reviewCount,
      districtName: business.locations[0]?.district.name ?? null,
      cityName: business.city.name,
      priceFrom: business.services[0]
        ? Number(business.services[0].price)
        : null,
      currency: business.services[0]?.currency ?? 'UZS',
      isFeatured: business.featuredListings.length > 0,
    }));

    return { rows, total };
  }

  async findActiveBySlug(slug: string) {
    return this.prisma.business.findFirst({
      where: {
        slug,
        status: BusinessStatus.active,
        deletedAt: null,
      },
      include: {
        policy: true,
        media: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        locations: {
          where: { deletedAt: null },
          include: {
            workingHours: true,
            district: { select: { name: true } },
          },
        },
        services: {
          where: { deletedAt: null, isActive: true },
          orderBy: { price: 'asc' },
          take: 5,
        },
      },
    });
  }

  async findActiveById(businessId: string) {
    return this.prisma.business.findFirst({
      where: {
        id: businessId,
        status: BusinessStatus.active,
        deletedAt: null,
      },
    });
  }

  async listActiveServices(businessId: string, venueId?: string) {
    return this.prisma.service.findMany({
      where: {
        businessId,
        deletedAt: null,
        isActive: true,
        ...(venueId ? { locationId: venueId } : {}),
      },
      include: {
        serviceResources: { select: { resourceId: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findServiceForBusiness(businessId: string, serviceId: string) {
    return this.prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        location: {
          include: {
            workingHours: true,
            blockedDates: true,
          },
        },
        serviceResources: {
          include: {
            resource: {
              select: { id: true, name: true, status: true, deletedAt: true },
            },
          },
        },
      },
    });
  }

  async findOccupancies(
    resourceIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ) {
    const [holds, allocations, blockedSlots] = await Promise.all([
      this.prisma.slotHold.findMany({
        where: {
          resourceId: { in: resourceIds },
          status: SlotHoldStatus.active,
          expiresAt: { gt: new Date() },
          startsAt: { lt: rangeEnd },
          endsAt: { gt: rangeStart },
        },
        select: {
          resourceId: true,
          startsAt: true,
          endsAt: true,
        },
      }),
      this.prisma.bookingResourceAllocation.findMany({
        where: {
          resourceId: { in: resourceIds },
          startsAt: { lt: rangeEnd },
          endsAt: { gt: rangeStart },
          booking: {
            status: { in: [...BLOCKING_BOOKING_STATUSES] as BookingStatus[] },
          },
        },
        select: {
          resourceId: true,
          startsAt: true,
          endsAt: true,
        },
      }),
      this.prisma.resourceBlockedSlot.findMany({
        where: {
          resourceId: { in: resourceIds },
          startsAt: { lt: rangeEnd },
          endsAt: { gt: rangeStart },
        },
        select: {
          resourceId: true,
          startsAt: true,
          endsAt: true,
        },
      }),
    ]);

    return [...holds, ...allocations, ...blockedSlots];
  }

  private buildSearchWhere(
    query: SearchBusinessesQueryDto,
  ): Prisma.BusinessWhereInput {
    const where: Prisma.BusinessWhereInput = {
      status: BusinessStatus.active,
      deletedAt: null,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.districtId) {
      where.locations = {
        some: {
          districtId: query.districtId,
          deletedAt: null,
        },
      };
    }

    if (query.q) {
      where.name = { contains: query.q, mode: 'insensitive' };
    }

    if (query.minRating) {
      where.averageRating = { gte: query.minRating };
    }

    return where;
  }
}
