export type WorkingHourSlot = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type TimeRange = {
  startsAt: Date;
  endsAt: Date;
};

export type AvailabilitySlotCandidate = {
  startsAt: Date;
  endsAt: Date;
  resourceId: string;
  resourceName: string;
  price: number;
  currency: string;
  available: boolean;
};

export type GenerateSlotsInput = {
  fromDate: string;
  toDate: string;
  durationMinutes: number;
  price: number;
  currency: string;
  workingHours: WorkingHourSlot[];
  blockedDates: string[];
  resources: Array<{ id: string; name: string }>;
  resourceId?: string;
  occupancies: Array<TimeRange & { resourceId: string }>;
  timezoneOffsetMinutes?: number;
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function buildUtcDate(baseDate: Date, minutesFromMidnight: number): Date {
  const result = new Date(baseDate);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCMinutes(minutesFromMidnight);
  return result;
}

function eachDateInRange(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function isDateBlocked(date: Date, blockedDates: string[]): boolean {
  const key = date.toISOString().slice(0, 10);
  return blockedDates.includes(key);
}

function getWorkingHourForDay(
  dayOfWeek: number,
  workingHours: WorkingHourSlot[],
): WorkingHourSlot | undefined {
  return workingHours.find((hour) => hour.dayOfWeek === dayOfWeek);
}

function isResourceOccupied(
  resourceId: string,
  startsAt: Date,
  endsAt: Date,
  occupancies: Array<TimeRange & { resourceId: string }>,
): boolean {
  return occupancies.some(
    (occupancy) =>
      occupancy.resourceId === resourceId &&
      startsAt < occupancy.endsAt &&
      occupancy.startsAt < endsAt,
  );
}

export function generateAvailabilitySlots(
  input: GenerateSlotsInput,
): AvailabilitySlotCandidate[] {
  const from = new Date(`${input.fromDate}T00:00:00.000Z`);
  const to = new Date(`${input.toDate}T00:00:00.000Z`);
  const resources = input.resourceId
    ? input.resources.filter((resource) => resource.id === input.resourceId)
    : input.resources;

  const slots: AvailabilitySlotCandidate[] = [];

  for (const date of eachDateInRange(from, to)) {
    if (isDateBlocked(date, input.blockedDates)) {
      continue;
    }

    const dayOfWeek = date.getUTCDay();
    const dayHours = getWorkingHourForDay(dayOfWeek, input.workingHours);

    if (
      !dayHours ||
      dayHours.isClosed ||
      !dayHours.openTime ||
      !dayHours.closeTime
    ) {
      continue;
    }

    const openMinutes = parseTimeToMinutes(dayHours.openTime);
    const closeMinutes = parseTimeToMinutes(dayHours.closeTime);
    let slotStartMinutes = openMinutes;

    while (slotStartMinutes + input.durationMinutes <= closeMinutes) {
      const startsAt = buildUtcDate(date, slotStartMinutes);
      const endsAt = buildUtcDate(
        date,
        slotStartMinutes + input.durationMinutes,
      );

      for (const resource of resources) {
        const occupied = isResourceOccupied(
          resource.id,
          startsAt,
          endsAt,
          input.occupancies,
        );

        slots.push({
          startsAt,
          endsAt,
          resourceId: resource.id,
          resourceName: resource.name,
          price: input.price,
          currency: input.currency,
          available: !occupied,
        });
      }

      slotStartMinutes += input.durationMinutes;
    }
  }

  return slots;
}

export function formatWorkingHoursSummary(
  workingHours: WorkingHourSlot[],
): string {
  const openDays = workingHours.filter(
    (hour) => !hour.isClosed && hour.openTime,
  );

  if (openDays.length === 0) {
    return 'Closed';
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sorted = [...openDays].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const sameHours = sorted.every(
    (hour) =>
      hour.openTime === first.openTime && hour.closeTime === first.closeTime,
  );

  if (sameHours && sorted.length === 7) {
    return `Mon–Sun ${first.openTime}–${first.closeTime}`;
  }

  const fromDay = dayNames[first.dayOfWeek];
  const toDay = dayNames[last.dayOfWeek];
  return `${fromDay}–${toDay} ${first.openTime}–${first.closeTime}`;
}
