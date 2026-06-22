import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../../shared/types/pagination.type';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async list(userId: string, query: ListNotificationsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [notifications, total, unreadCount] =
      await this.notificationRepository.listForUser(
        userId,
        query.unreadOnly ?? false,
        skip,
        limit,
      );

    return {
      data: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        channel: notification.channel,
        isRead: notification.isRead,
        metadata: notification.metadata,
        createdAt: notification.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(page, limit, total),
      unreadCount,
    };
  }

  async markRead(userId: string, notificationId: string) {
    const result = await this.notificationRepository.markRead(
      notificationId,
      userId,
    );

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { id: notificationId, isRead: true };
  }

  async markAllRead(userId: string) {
    const result = await this.notificationRepository.markAllRead(userId);
    return { markedCount: result.count };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationRepository.countUnread(userId);
    return { count };
  }
}
