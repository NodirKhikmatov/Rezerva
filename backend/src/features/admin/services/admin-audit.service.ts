import { Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../../shared/types/pagination.type';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { AdminAuditRepository } from '../repositories/admin-audit.repository';
import { AdminAuditLogItem } from '../types/admin.types';

@Injectable()
export class AdminAuditService {
  constructor(private readonly auditRepository: AdminAuditRepository) {}

  async listAuditLogs(query: ListAuditLogsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [rows, total] = await this.auditRepository.list(query, skip, limit);

    return {
      data: rows.map((row) => this.mapAuditLog(row)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private mapAuditLog(row: {
    id: string;
    actorId: string | null;
    action: string;
    entityType: AdminAuditLogItem['entityType'];
    entityId: string;
    oldValues: unknown;
    newValues: unknown;
    ipAddress: string | null;
    createdAt: Date;
    actor: { email: string | null } | null;
  }): AdminAuditLogItem {
    return {
      id: row.id,
      actorId: row.actorId,
      actorEmail: row.actor?.email ?? null,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      oldValues: (row.oldValues as Record<string, unknown> | null) ?? null,
      newValues: (row.newValues as Record<string, unknown> | null) ?? null,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
