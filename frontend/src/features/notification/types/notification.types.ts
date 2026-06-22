export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};
