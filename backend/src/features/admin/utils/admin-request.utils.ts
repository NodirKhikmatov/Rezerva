import { Request } from 'express';
import { AuditContext } from '../types/admin.types';

export function extractAuditContext(request: Request): AuditContext {
  const forwarded = request.headers['x-forwarded-for'];
  const ipAddress =
    (typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : undefined) ?? request.ip;

  return {
    ipAddress,
    userAgent: request.headers['user-agent'],
  };
}
