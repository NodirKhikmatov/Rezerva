import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuditEntityType, BusinessStatus } from '@prisma/client';
import { SuspendBusinessDto } from '../dto/suspend-business.dto';
import { AdminBusinessRepository } from '../repositories/admin-business.repository';
import { AdminOverviewRepository } from '../repositories/admin-overview.repository';
import { AuditLogService } from './audit-log.service';
import { AuditContext } from '../types/admin.types';

@Injectable()
export class AdminService {
  constructor(
    private readonly overviewRepository: AdminOverviewRepository,
    private readonly businessRepository: AdminBusinessRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  getOverview() {
    return this.overviewRepository.getOverviewMetrics();
  }

  async suspendBusiness(
    businessId: string,
    actorId: string,
    dto: SuspendBusinessDto,
    context: AuditContext,
  ) {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.status === BusinessStatus.suspended) {
      return { status: business.status };
    }

    const updated = await this.businessRepository.suspend(businessId);

    await this.auditLogService.log({
      actorId,
      action: 'business.suspend',
      entityType: AuditEntityType.business,
      entityId: businessId,
      oldValues: { status: business.status },
      newValues: {
        status: updated.status,
        reason: dto.reason,
        message: dto.message,
      },
      context,
    });

    return { status: updated.status };
  }

  async reinstateBusiness(
    businessId: string,
    actorId: string,
    context: AuditContext,
  ) {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.status !== BusinessStatus.suspended) {
      throw new UnprocessableEntityException('Business is not suspended');
    }

    const updated = await this.businessRepository.reinstate(businessId);

    await this.auditLogService.log({
      actorId,
      action: 'business.reinstate',
      entityType: AuditEntityType.business,
      entityId: businessId,
      oldValues: { status: business.status },
      newValues: { status: updated.status },
      context,
    });

    return { status: updated.status };
  }
}
