import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { RequestUser } from '../../shared/types/request-user.type';
import { AdminCancelBookingDto } from './dto/admin-cancel-booking.dto';
import { ApproveVerificationDto } from './dto/approve-verification.dto';
import { ListAdminBookingsQueryDto } from './dto/list-admin-bookings-query.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import { ListVerificationsQueryDto } from './dto/list-verifications-query.dto';
import { RejectVerificationDto } from './dto/reject-verification.dto';
import { SuspendBusinessDto } from './dto/suspend-business.dto';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminBookingService } from './services/admin-booking.service';
import { AdminVerificationService } from './services/admin-verification.service';
import { AdminService } from './services/admin.service';
import { extractAuditContext } from './utils/admin-request.utils';
import { PlatformRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(PlatformRole.admin)
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly verificationService: AdminVerificationService,
    private readonly bookingService: AdminBookingService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin dashboard overview' })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('verifications')
  @ApiOperation({ summary: 'List verification queue' })
  listVerifications(@Query() query: ListVerificationsQueryDto) {
    return this.verificationService.listVerifications(query);
  }

  @Get('verifications/:verificationId')
  @ApiOperation({ summary: 'Get verification detail' })
  getVerification(
    @Param('verificationId', ParseUUIDPipe) verificationId: string,
  ) {
    return this.verificationService.getVerification(verificationId);
  }

  @Post('verifications/:verificationId/approve')
  @ApiOperation({ summary: 'Approve business verification' })
  approveVerification(
    @CurrentUser() user: RequestUser,
    @Param('verificationId', ParseUUIDPipe) verificationId: string,
    @Body() dto: ApproveVerificationDto,
    @Req() request: Request,
  ) {
    return this.verificationService.approveVerification(
      verificationId,
      user.id,
      dto,
      extractAuditContext(request),
    );
  }

  @Post('verifications/:verificationId/reject')
  @ApiOperation({ summary: 'Reject business verification' })
  rejectVerification(
    @CurrentUser() user: RequestUser,
    @Param('verificationId', ParseUUIDPipe) verificationId: string,
    @Body() dto: RejectVerificationDto,
    @Req() request: Request,
  ) {
    return this.verificationService.rejectVerification(
      verificationId,
      user.id,
      dto,
      extractAuditContext(request),
    );
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  listBookings(@Query() query: ListAdminBookingsQueryDto) {
    return this.bookingService.listBookings(query);
  }

  @Post('bookings/:bookingId/cancel')
  @ApiOperation({ summary: 'Force cancel booking (admin)' })
  cancelBooking(
    @CurrentUser() user: RequestUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: AdminCancelBookingDto,
    @Req() request: Request,
  ) {
    return this.bookingService.forceCancelBooking(
      bookingId,
      user.id,
      dto,
      extractAuditContext(request),
    );
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Search audit logs' })
  listAuditLogs(@Query() query: ListAuditLogsQueryDto) {
    return this.auditService.listAuditLogs(query);
  }

  @Post('businesses/:businessId/suspend')
  @ApiOperation({ summary: 'Suspend business' })
  suspendBusiness(
    @CurrentUser() user: RequestUser,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: SuspendBusinessDto,
    @Req() request: Request,
  ) {
    return this.adminService.suspendBusiness(
      businessId,
      user.id,
      dto,
      extractAuditContext(request),
    );
  }

  @Post('businesses/:businessId/reinstate')
  @ApiOperation({ summary: 'Reinstate business' })
  reinstateBusiness(
    @CurrentUser() user: RequestUser,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Req() request: Request,
  ) {
    return this.adminService.reinstateBusiness(
      businessId,
      user.id,
      extractAuditContext(request),
    );
  }
}
