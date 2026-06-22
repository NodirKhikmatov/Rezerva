import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuditEntityType, VerificationStatus } from '@prisma/client';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../../shared/types/pagination.type';
import { ApproveVerificationDto } from '../dto/approve-verification.dto';
import { ListVerificationsQueryDto } from '../dto/list-verifications-query.dto';
import { RejectVerificationDto } from '../dto/reject-verification.dto';
import { AdminVerificationRepository } from '../repositories/admin-verification.repository';
import {
  AdminVerificationDetail,
  AdminVerificationListItem,
  AuditContext,
} from '../types/admin.types';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminVerificationService {
  constructor(
    private readonly verificationRepository: AdminVerificationRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listVerifications(query: ListVerificationsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [rows, total] = await this.verificationRepository.list(
      query,
      skip,
      limit,
    );

    return {
      data: rows.map((row) => this.mapListItem(row)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getVerification(
    verificationId: string,
  ): Promise<AdminVerificationDetail> {
    const verification =
      await this.verificationRepository.findById(verificationId);

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    const owner = await this.verificationRepository.findOwner(
      verification.business.ownerId,
    );

    return {
      ...this.mapListItem(verification),
      notes: verification.notes,
      rejectReason: verification.rejectReason,
      rejectMessage: verification.rejectMessage,
      documents: verification.documents.map((document) => ({
        id: document.id,
        type: document.type,
        url: document.url,
        createdAt: document.createdAt.toISOString(),
      })),
      business: {
        ...this.mapListItem(verification).business,
        description: verification.business.description,
        phone: verification.business.phone,
        onboardingStep: verification.business.onboardingStep,
        owner: {
          id: owner?.id ?? verification.business.ownerId,
          firstName: owner?.firstName ?? null,
          lastName: owner?.lastName ?? null,
          phone: owner?.phone ?? null,
          email: owner?.email ?? null,
        },
      },
    };
  }

  async approveVerification(
    verificationId: string,
    actorId: string,
    dto: ApproveVerificationDto,
    context: AuditContext,
  ) {
    const existing = await this.verificationRepository.findById(verificationId);

    if (!existing) {
      throw new NotFoundException('Verification not found');
    }

    if (existing.status !== VerificationStatus.pending) {
      throw new UnprocessableEntityException('Verification is not pending');
    }

    const result = await this.verificationRepository.approve({
      verificationId,
      reviewerId: actorId,
      notes: dto.notes,
    });

    if (!result) {
      throw new NotFoundException('Verification not found');
    }

    await this.auditLogService.log({
      actorId,
      action: 'verification.approve',
      entityType: AuditEntityType.verification,
      entityId: verificationId,
      oldValues: {
        status: existing.status,
        businessStatus: existing.business.status,
      },
      newValues: {
        status: VerificationStatus.approved,
        businessStatus: 'active',
        notes: dto.notes ?? null,
      },
      context,
    });

    return {
      businessId: result.businessId,
      status: 'active',
      approvedAt: result.approvedAt.toISOString(),
    };
  }

  async rejectVerification(
    verificationId: string,
    actorId: string,
    dto: RejectVerificationDto,
    context: AuditContext,
  ) {
    const existing = await this.verificationRepository.findById(verificationId);

    if (!existing) {
      throw new NotFoundException('Verification not found');
    }

    if (existing.status !== VerificationStatus.pending) {
      throw new UnprocessableEntityException('Verification is not pending');
    }

    const result = await this.verificationRepository.reject({
      verificationId,
      reviewerId: actorId,
      reason: dto.reason,
      message: dto.message,
    });

    if (!result) {
      throw new NotFoundException('Verification not found');
    }

    await this.auditLogService.log({
      actorId,
      action: 'verification.reject',
      entityType: AuditEntityType.verification,
      entityId: verificationId,
      oldValues: {
        status: existing.status,
        businessStatus: existing.business.status,
      },
      newValues: {
        status: VerificationStatus.rejected,
        businessStatus: 'rejected',
        reason: dto.reason,
        message: dto.message,
      },
      context,
    });

    return { status: 'rejected' };
  }

  private mapListItem(row: {
    id: string;
    status: VerificationStatus;
    submittedAt: Date;
    reviewedAt: Date | null;
    notes?: string | null;
    rejectReason?: string | null;
    rejectMessage?: string | null;
    business: {
      id: string;
      name: string;
      slug: string;
      category: string;
      status: string;
      phone?: string;
      email?: string | null;
      city: { name: string };
      locations: Array<{
        addressLine: string;
        district: { name: string };
      }>;
      members: Array<{
        user: {
          firstName: string | null;
          lastName: string | null;
          phone: string | null;
          email: string | null;
        };
      }>;
    };
    documents: Array<{ id: string }>;
  }): AdminVerificationListItem {
    const primaryLocation = row.business.locations[0];
    const owner = row.business.members[0]?.user;
    const ownerName = [owner?.firstName, owner?.lastName]
      .filter(Boolean)
      .join(' ');

    return {
      id: row.id,
      status: row.status,
      submittedAt: row.submittedAt.toISOString(),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      rejectReason: row.rejectReason ?? null,
      rejectMessage: row.rejectMessage ?? null,
      notes: row.notes ?? null,
      business: {
        id: row.business.id,
        name: row.business.name,
        slug: row.business.slug,
        category: row.business.category,
        status: row.business.status,
        cityName: row.business.city.name,
        districtName: primaryLocation?.district.name ?? null,
        addressLine: primaryLocation?.addressLine ?? null,
        ownerName: ownerName || '—',
        ownerPhone: owner?.phone ?? row.business.phone ?? null,
        ownerEmail: owner?.email ?? row.business.email ?? null,
      },
      documentsCount: row.documents.length,
    };
  }
}
