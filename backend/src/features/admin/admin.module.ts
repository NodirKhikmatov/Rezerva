import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminAuditRepository } from './repositories/admin-audit.repository';
import { AdminBookingRepository } from './repositories/admin-booking.repository';
import { AdminBusinessRepository } from './repositories/admin-business.repository';
import { AdminOverviewRepository } from './repositories/admin-overview.repository';
import { AdminVerificationRepository } from './repositories/admin-verification.repository';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminBookingService } from './services/admin-booking.service';
import { AdminVerificationService } from './services/admin-verification.service';
import { AdminService } from './services/admin.service';
import { AuditLogService } from './services/audit-log.service';
import { AdminGuard } from '../../shared/guards/admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AdminGuard,
    AdminOverviewRepository,
    AdminVerificationRepository,
    AdminBookingRepository,
    AdminBusinessRepository,
    AdminAuditRepository,
    AdminService,
    AdminVerificationService,
    AdminBookingService,
    AdminAuditService,
    AuditLogService,
  ],
})
export class AdminModule {}
