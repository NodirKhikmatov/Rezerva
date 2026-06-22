import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  addDays,
  parseLocalDate,
  toTimezoneIso,
} from '../../shared/utils/timezone.util';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../shared/types/pagination.type';
import {
  formatWorkingHoursSummary,
  generateAvailabilitySlots,
} from '../booking/utils/availability-slots.util';
import { BusinessRepository } from './business.repository';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { SearchBusinessesQueryDto } from './dto/search-businesses-query.dto';

const MAX_AVAILABILITY_DAYS = 14;

@Injectable()
export class BusinessService {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async search(query: SearchBusinessesQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { rows, total } = await this.businessRepository.searchActive(
      query,
      skip,
      limit,
    );

    return {
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        category: row.category,
        status: row.status,
        coverImageUrl: row.coverImageUrl,
        averageRating: Number(row.averageRating),
        reviewCount: row.reviewCount,
        districtName: row.districtName,
        cityName: row.cityName,
        priceFrom: row.priceFrom,
        currency: row.currency,
        isFeatured: row.isFeatured,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getBySlug(slug: string) {
    const business = await this.businessRepository.findActiveBySlug(slug);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const primaryLocation =
      business.locations.find((location) => location.isPrimary) ??
      business.locations[0];
    const workingHours = primaryLocation?.workingHours ?? [];

    return {
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      category: business.category,
      status: business.status,
      phone: business.phone,
      averageRating: Number(business.averageRating),
      reviewCount: business.reviewCount,
      coverImageUrl: business.coverImageUrl,
      gallery: business.media.map((item) => ({
        id: item.id,
        url: item.url,
        isCover: item.isCover,
        sortOrder: item.sortOrder,
      })),
      venues: business.locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: `${location.addressLine}, ${location.district.name}`,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      })),
      servicesSummary: business.services.map((service) => ({
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        priceFrom: Number(service.price),
      })),
      policies: business.policy
        ? {
            cancellationHoursBefore: business.policy.cancellationHoursBefore,
            cancellationFeePercent: business.policy.cancellationFeePercent,
            depositPercent: business.policy.depositPercent,
            requiresApproval: business.policy.requiresApproval,
          }
        : null,
      workingHoursSummary: formatWorkingHoursSummary(
        workingHours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime ?? '00:00',
          closeTime: hour.closeTime ?? '00:00',
          isClosed: hour.isClosed,
        })),
      ),
    };
  }

  async listServices(businessId: string, query: ListServicesQueryDto) {
    await this.assertActiveBusiness(businessId);

    const services = await this.businessRepository.listActiveServices(
      businessId,
      query.venueId,
    );

    return {
      data: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: Number(service.price),
        currency: service.currency,
        pricingModel: service.pricingModel,
        isActive: service.isActive,
        resourceIds: service.serviceResources.map((link) => link.resourceId),
        venueId: service.locationId,
      })),
    };
  }

  async getAvailability(businessId: string, query: AvailabilityQueryDto) {
    await this.assertActiveBusiness(businessId);
    this.assertDateRange(query.from, query.to);

    const service = await this.businessRepository.findServiceForBusiness(
      businessId,
      query.serviceId,
    );

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const resources = service.serviceResources
      .map((link) => link.resource)
      .filter(
        (resource) =>
          resource.deletedAt === null && resource.status === 'active',
      )
      .map((resource) => ({ id: resource.id, name: resource.name }));

    if (query.resourceId && !resources.some((r) => r.id === query.resourceId)) {
      throw new NotFoundException('Resource not found');
    }

    const rangeStart = parseLocalDate(query.from);
    const rangeEnd = addDays(parseLocalDate(query.to), 1);
    const resourceIds = query.resourceId
      ? [query.resourceId]
      : resources.map((resource) => resource.id);

    const occupancies = await this.businessRepository.findOccupancies(
      resourceIds,
      rangeStart,
      rangeEnd,
    );

    const slots = generateAvailabilitySlots({
      fromDate: query.from,
      toDate: query.to,
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
      currency: service.currency,
      workingHours: service.location.workingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime ?? '00:00',
        closeTime: hour.closeTime ?? '00:00',
        isClosed: hour.isClosed,
      })),
      blockedDates: service.location.blockedDates.map((blocked) =>
        blocked.date.toISOString().slice(0, 10),
      ),
      resources,
      resourceId: query.resourceId,
      occupancies: occupancies.map((item) => ({
        resourceId: item.resourceId,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
      })),
    });

    return {
      serviceId: service.id,
      timezone: 'Asia/Tashkent',
      slots: slots.map((slot) => ({
        startsAt: toTimezoneIso(slot.startsAt),
        endsAt: toTimezoneIso(slot.endsAt),
        resourceId: slot.resourceId,
        resourceName: slot.resourceName,
        price: slot.price,
        currency: slot.currency,
        available: slot.available,
      })),
    };
  }

  private async assertActiveBusiness(businessId: string): Promise<void> {
    const business = await this.businessRepository.findActiveById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }
  }

  private assertDateRange(from: string, to: string): void {
    const fromDate = parseLocalDate(from);
    const toDate = parseLocalDate(to);
    const maxEnd = addDays(fromDate, MAX_AVAILABILITY_DAYS);

    if (toDate < fromDate) {
      throw new BadRequestException('Invalid date range');
    }

    if (toDate >= maxEnd) {
      throw new BadRequestException('Date range exceeds 14 days');
    }
  }
}
