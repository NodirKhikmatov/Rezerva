'use client';

import { useEffect, useState } from 'react';

import { Typography } from '@/shared/components/ui/typography';

type HoldCountdownProps = {
  expiresAt: string;
  onExpired?: () => void;
};

function getSecondsLeft(expiresAt: string): number {
  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}

export function HoldCountdown({ expiresAt, onExpired }: HoldCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getSecondsLeft(expiresAt),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = getSecondsLeft(expiresAt);
      setSecondsLeft(next);
      if (next <= 0) onExpired?.();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3"
    >
      <Typography variant="small" className="text-warning">
        Slot reserved — expires in {label}
      </Typography>
    </div>
  );
}
