import { Injectable } from '@nestjs/common';
import { BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveBusiness(businessId: string) {
    return this.prisma.business.findFirst({
      where: {
        id: businessId,
        status: BusinessStatus.active,
        deletedAt: null,
      },
      include: {
        city: { select: { name: true } },
      },
    });
  }

  async listByBusinessId(businessId: string) {
    return this.prisma.businessLocation.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      include: {
        district: { select: { name: true } },
        business: {
          select: {
            city: { select: { name: true } },
            phone: true,
          },
        },
        _count: {
          select: {
            resources: {
              where: { deletedAt: null, status: 'active' },
            },
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
    });
  }

  async findActiveVenueById(venueId: string) {
    return this.prisma.businessLocation.findFirst({
      where: {
        id: venueId,
        deletedAt: null,
        business: {
          status: BusinessStatus.active,
          deletedAt: null,
        },
      },
      include: {
        business: { select: { id: true, slug: true, phone: true } },
        workingHours: true,
        resources: {
          where: { deletedAt: null, status: 'active' },
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async listResourcesByVenueId(venueId: string) {
    return this.prisma.resource.findMany({
      where: {
        locationId: venueId,
        deletedAt: null,
        status: 'active',
        location: {
          deletedAt: null,
          business: {
            status: BusinessStatus.active,
            deletedAt: null,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
