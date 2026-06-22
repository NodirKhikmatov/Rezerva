const TASHKENT_OFFSET_MINUTES = 300;

export function getTashkentDayBounds(now = new Date()): {
  start: Date;
  end: Date;
} {
  const offsetMs = TASHKENT_OFFSET_MINUTES * 60 * 1000;
  const shifted = new Date(now.getTime() + offsetMs);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const start = new Date(Date.UTC(year, month, day) - offsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}
