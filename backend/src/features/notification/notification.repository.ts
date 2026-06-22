import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string, unreadOnly: boolean, skip: number, take: number) {
    const where: Prisma.NotificationWhereInput = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    return Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);
  }

  markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  findById(notificationId: string, userId: string) {
    return this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
  }
}
