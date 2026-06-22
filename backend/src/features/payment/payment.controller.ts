import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { RequestUser } from '../../shared/types/request-user.type';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { BookingOwnerGuard } from './guards/booking-owner.guard';
import { PaymentService } from './services/payment.service';

@ApiTags('payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Get('payments/methods')
  @ApiOperation({ summary: 'List available payment methods' })
  listMethods() {
    return this.paymentService.listMethods();
  }

  @ApiBearerAuth()
  @Get('payments/:paymentId/status')
  @ApiOperation({ summary: 'Poll payment status' })
  getPaymentStatus(
    @CurrentUser() user: RequestUser,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.paymentService.getPaymentStatus(paymentId, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(BookingOwnerGuard)
  @Get('bookings/:bookingId/payment')
  @ApiOperation({ summary: 'Get payment for booking' })
  getPaymentForBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.paymentService.getPaymentForBooking(bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(BookingOwnerGuard)
  @Post('bookings/:bookingId/payment/initiate')
  @ApiOperation({ summary: 'Initiate online payment' })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  initiatePayment(
    @CurrentUser() user: RequestUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: InitiatePaymentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    return this.paymentService.initiatePayment(
      bookingId,
      user.id,
      dto,
      idempotencyKey.trim(),
    );
  }

  @ApiBearerAuth()
  @UseGuards(BookingOwnerGuard)
  @Get('bookings/:bookingId/refunds')
  @ApiOperation({ summary: 'List refunds for booking' })
  listRefunds(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.paymentService.listRefunds(bookingId);
  }
}
