import {
  generateAvailabilitySlots,
  formatWorkingHoursSummary,
} from './availability-slots.util';

describe('generateAvailabilitySlots', () => {
  const baseInput = {
    fromDate: '2026-06-23',
    toDate: '2026-06-23',
    durationMinutes: 120,
    price: 300000,
    currency: 'UZS',
    workingHours: [
      {
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '23:00',
        isClosed: false,
      },
    ],
    blockedDates: [],
    resources: [{ id: 'resource-a', name: 'Pitch A' }],
    occupancies: [],
  };

  it('generates slots within working hours', () => {
    const monday = new Date('2026-06-23T00:00:00.000Z');
    const dayOfWeek = monday.getUTCDay();

    const slots = generateAvailabilitySlots({
      ...baseInput,
      workingHours: [
        {
          dayOfWeek,
          openTime: '08:00',
          closeTime: '12:00',
          isClosed: false,
        },
      ],
    });

    expect(slots).toHaveLength(2);
    expect(slots[0].available).toBe(true);
    expect(slots[0].startsAt.toISOString()).toBe('2026-06-23T08:00:00.000Z');
    expect(slots[1].endsAt.toISOString()).toBe('2026-06-23T12:00:00.000Z');
  });

  it('marks occupied slots as unavailable', () => {
    const monday = new Date('2026-06-23T00:00:00.000Z');
    const dayOfWeek = monday.getUTCDay();

    const slots = generateAvailabilitySlots({
      ...baseInput,
      workingHours: [
        {
          dayOfWeek,
          openTime: '08:00',
          closeTime: '12:00',
          isClosed: false,
        },
      ],
      occupancies: [
        {
          resourceId: 'resource-a',
          startsAt: new Date('2026-06-23T08:00:00.000Z'),
          endsAt: new Date('2026-06-23T10:00:00.000Z'),
        },
      ],
    });

    expect(slots[0].available).toBe(false);
    expect(slots[1].available).toBe(true);
  });

  it('skips blocked dates', () => {
    const monday = new Date('2026-06-23T00:00:00.000Z');
    const dayOfWeek = monday.getUTCDay();

    const slots = generateAvailabilitySlots({
      ...baseInput,
      blockedDates: ['2026-06-23'],
      workingHours: [
        {
          dayOfWeek,
          openTime: '08:00',
          closeTime: '12:00',
          isClosed: false,
        },
      ],
    });

    expect(slots).toHaveLength(0);
  });
});

describe('formatWorkingHoursSummary', () => {
  it('formats full week with same hours', () => {
    const hours = Array.from({ length: 7 }, (_, index) => ({
      dayOfWeek: index,
      openTime: '08:00',
      closeTime: '23:00',
      isClosed: false,
    }));

    expect(formatWorkingHoursSummary(hours)).toBe('Mon–Sun 08:00–23:00');
  });
});
