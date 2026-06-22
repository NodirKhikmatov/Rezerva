import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentRepository } from '../repository/payment.repository';

@Injectable()
export class BookingOwnerGuard implements CanActivate {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: string };
      params: { bookingId?: string };
    }>();

    const userId = request.user?.id;
    const bookingId = request.params.bookingId;

    if (!userId || !bookingId) {
      throw new ForbiddenException();
    }

    const ownsBooking = await this.paymentRepository.isBookingOwner(
      bookingId,
      userId,
    );

    if (!ownsBooking) {
      throw new NotFoundException('Booking not found');
    }

    return true;
  }
}
