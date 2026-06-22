const TASHKENT_OFFSET_MINUTES = 300;

export function toTimezoneIso(
  date: Date,
  offsetMinutes = TASHKENT_OFFSET_MINUTES,
): string {
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const seconds = String(shifted.getUTCSeconds()).padStart(2, '0');
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const offsetMins = String(absolute % 60).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

export function parseLocalDate(dateValue: string): Date {
  return new Date(`${dateValue}T00:00:00.000Z`);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}
