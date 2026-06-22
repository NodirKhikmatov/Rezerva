import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RequestUser } from '../../shared/types/request-user.type';
import { BookingService } from './booking.service';
import { ConfirmBookingDto, CreateHoldDto } from './dto/booking.dto';
import { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('holds')
  @ApiOperation({ summary: 'Create slot hold' })
  createHold(@CurrentUser() user: RequestUser, @Body() dto: CreateHoldDto) {
    return this.bookingService.createHold(user.id, dto);
  }

  @Delete('holds/:holdId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Release slot hold' })
  async releaseHold(
    @CurrentUser() user: RequestUser,
    @Param('holdId', ParseUUIDPipe) holdId: string,
  ): Promise<void> {
    await this.bookingService.releaseHold(user.id, holdId);
  }

  @Get('me')
  @ApiOperation({ summary: 'List my bookings' })
  listMyBookings(
    @CurrentUser() user: RequestUser,
    @Query() query: ListMyBookingsQueryDto,
  ) {
    return this.bookingService.listMyBookings(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Confirm booking' })
  confirmBooking(
    @CurrentUser() user: RequestUser,
    @Body() dto: ConfirmBookingDto,
  ) {
    return this.bookingService.confirmBooking(user.id, dto);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get booking detail' })
  getBooking(
    @CurrentUser() user: RequestUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.bookingService.getBookingDetail(user.id, bookingId);
  }
}
