import { Injectable } from '@nestjs/common';
import { AuditEntityType, Prisma } from '@prisma/client';
import { AdminAuditRepository } from '../repositories/admin-audit.repository';
import { AuditContext } from '../types/admin.types';

type AuditLogInput = {
  actorId: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  context?: AuditContext;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly auditRepository: AdminAuditRepository) {}

  log(input: AuditLogInput) {
    return this.auditRepository.create({
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: input.oldValues as Prisma.InputJsonValue | undefined,
      newValues: input.newValues as Prisma.InputJsonValue | undefined,
      ipAddress: input.context?.ipAddress,
      userAgent: input.context?.userAgent,
    });
  }
}
