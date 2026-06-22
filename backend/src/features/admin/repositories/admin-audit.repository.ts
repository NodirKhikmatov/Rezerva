import { Injectable } from '@nestjs/common';
import { AuditEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { parseLocalDate } from '../../../shared/utils/timezone.util';

type CreateAuditLogInput = {
  actorId?: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AdminAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues,
        newValues: input.newValues,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
      include: {
        actor: { select: { email: true } },
      },
    });
  }

  list(query: ListAuditLogsQueryDto, skip: number, take: number) {
    const where = this.buildWhere(query);

    return Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
  }

  private buildWhere(query: ListAuditLogsQueryDto): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.from || query.to) {
      where.createdAt = {};

      if (query.from) {
        where.createdAt.gte = parseLocalDate(query.from);
      }

      if (query.to) {
        const toDate = parseLocalDate(query.to);
        toDate.setUTCDate(toDate.getUTCDate() + 1);
        where.createdAt.lt = toDate;
      }
    }

    return where;
  }
}
