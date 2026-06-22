import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingNotificationProcessor } from './booking-notification.processor';
import { BOOKING_NOTIFICATION_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
    }),
    BullModule.registerQueue({ name: BOOKING_NOTIFICATION_QUEUE }),
  ],
  providers: [BookingNotificationProcessor],
  exports: [BullModule],
})
export class QueueModule {}
