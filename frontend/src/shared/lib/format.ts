export function formatPrice(amount: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Hozirgina';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} daqiqa oldin`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} soat oldin`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} kun oldin`;
}

export function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tashkent',
  }).format(new Date(iso));
}

export function formatSlotDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Tashkent',
  }).format(new Date(iso));
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
