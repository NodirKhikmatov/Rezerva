import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VenueRepository } from './venue.repository';

type ResourceMetadata = {
  surfaceType?: string;
  dimensions?: string;
  lighting?: boolean;
};

@Injectable()
export class VenueService {
  constructor(private readonly venueRepository: VenueRepository) {}

  async listByBusiness(businessId: string) {
    const business = await this.venueRepository.findActiveBusiness(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const venues = await this.venueRepository.listByBusinessId(businessId);

    return {
      data: venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        addressLine: venue.addressLine,
        districtName: venue.district.name,
        cityName: venue.business.city.name,
        latitude: Number(venue.latitude),
        longitude: Number(venue.longitude),
        phone: venue.phone ?? venue.business.phone,
        isPrimary: venue.isPrimary,
        resourceCount: venue._count.resources,
      })),
    };
  }

  async getById(venueId: string) {
    const venue = await this.venueRepository.findActiveVenueById(venueId);

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    return {
      id: venue.id,
      businessId: venue.businessId,
      businessSlug: venue.business.slug,
      name: venue.name,
      addressLine: venue.addressLine,
      districtId: venue.districtId,
      latitude: Number(venue.latitude),
      longitude: Number(venue.longitude),
      phone: venue.phone ?? venue.business.phone,
      workingHours: venue.workingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      })),
      resources: venue.resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        surfaceType: this.extractSurfaceType(resource.metadata),
      })),
    };
  }

  async listResources(venueId: string) {
    const venue = await this.venueRepository.findActiveVenueById(venueId);

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    const resources =
      await this.venueRepository.listResourcesByVenueId(venueId);

    return {
      data: resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        status: resource.status,
        capacity: resource.capacity,
        metadata: (resource.metadata as ResourceMetadata | null) ?? {},
      })),
    };
  }

  private extractSurfaceType(metadata: Prisma.JsonValue): string | undefined {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return undefined;
    }

    const value = (metadata as ResourceMetadata).surfaceType;
    return typeof value === 'string' ? value : undefined;
  }
}
