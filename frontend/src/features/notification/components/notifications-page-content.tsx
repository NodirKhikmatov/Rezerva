'use client';

import { useEffect, useState } from 'react';

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notification/api/notification.api';
import type { NotificationItem } from '@/features/notification/types/notification.types';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

function NotificationsContent() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!accessToken) return;
    const response = await listNotifications(accessToken, { limit: 50 });
    setItems(response.data);
    setUnreadCount(response.unreadCount);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [accessToken]);

  const handleMarkRead = async (id: string) => {
    if (!accessToken) return;
    await markNotificationRead(accessToken, id);
    void load();
  };

  const handleMarkAll = async () => {
    if (!accessToken) return;
    await markAllNotificationsRead(accessToken);
    void load();
  };

  return (
    <Section spacing="default">
      <Container className="flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Typography variant="h1">Notifications</Typography>
            <Typography variant="muted">{unreadCount} unread</Typography>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </div>

        {loading && <Typography variant="muted">Loading...</Typography>}

        {!loading && items.length === 0 && (
          <Typography variant="muted">No notifications yet.</Typography>
        )}

        <div className="grid gap-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={item.isRead ? 'opacity-70' : 'border-primary/30'}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Typography variant="label">{item.title}</Typography>
                  <Typography variant="muted">{item.body}</Typography>
                  <Typography variant="small">
                    {new Date(item.createdAt).toLocaleString()}
                  </Typography>
                </div>
                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(item.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function NotificationsPageContent() {
  return (
    <AuthGuard returnPath="/notifications">
      <NotificationsContent />
    </AuthGuard>
  );
}
