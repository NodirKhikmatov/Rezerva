import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  BusinessStatus,
  DisputeStatus,
  VerificationStatus,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getTashkentDayBounds } from '../utils/admin-date.utils';

@Injectable()
export class AdminOverviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewMetrics() {
    const { start, end } = getTashkentDayBounds();
    const gmvStatuses: BookingStatus[] = [
      BookingStatus.confirmed,
      BookingStatus.checked_in,
      BookingStatus.completed,
    ];

    const [
      pendingVerifications,
      openDisputes,
      bookingsToday,
      gmvAggregate,
      activeBusinesses,
      newUsersToday,
    ] = await Promise.all([
      this.prisma.businessVerification.count({
        where: { status: VerificationStatus.pending },
      }),
      this.prisma.dispute.count({
        where: {
          status: { in: [DisputeStatus.open, DisputeStatus.investigating] },
        },
      }),
      this.prisma.booking.count({
        where: {
          startsAt: { gte: start, lt: end },
          status: { not: BookingStatus.cancelled },
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          startsAt: { gte: start, lt: end },
          status: { in: gmvStatuses },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.business.count({
        where: {
          status: BusinessStatus.active,
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: start, lt: end },
          deletedAt: null,
        },
      }),
    ]);

    return {
      pendingVerifications,
      openDisputes,
      bookingsToday,
      gmvToday: Number(gmvAggregate._sum.totalAmount ?? 0),
      currency: 'UZS',
      activeBusinesses,
      newUsersToday,
    };
  }
}
