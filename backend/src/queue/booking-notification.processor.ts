import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BOOKING_NOTIFICATION_QUEUE } from './queue.constants';

export type BookingNotificationJob = {
  bookingId: string;
  userId: string;
  status: string;
  referenceCode?: string;
};

@Processor(BOOKING_NOTIFICATION_QUEUE)
export class BookingNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingNotificationProcessor.name);

  process(job: Job<BookingNotificationJob>): Promise<{ delivered: boolean }> {
    this.logger.log(
      `Processing booking notification: ${job.data.bookingId} -> ${job.data.status}`,
    );
    return Promise.resolve({ delivered: true });
  }
}
