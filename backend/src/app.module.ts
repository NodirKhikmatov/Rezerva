import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './features/admin/admin.module';
import { BookingModule } from './features/booking/booking.module';
import { BusinessModule } from './features/business/business.module';
import { NotificationModule } from './features/notification/notification.module';
import { PaymentModule } from './features/payment/payment.module';
import { UserModule } from './features/user/user.module';
import { VenueModule } from './features/venue/venue.module';
import configuration from './config/configuration';
import { validateEnvConfig } from './config/validate-env';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { TelegramModule } from './features/telegram/telegram.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvConfig,
    }),
    PrismaModule,
    QueueModule,
    AuthModule,
    UserModule,
    BusinessModule,
    VenueModule,
    BookingModule,
    NotificationModule,
    PaymentModule,
    AdminModule,
    StorageModule,
    HealthModule,
    ...(process.env.ENABLE_TELEGRAM_BOT === 'true' ? [TelegramModule] : []),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
