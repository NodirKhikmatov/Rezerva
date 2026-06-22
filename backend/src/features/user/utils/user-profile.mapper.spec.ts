import { toUserProfile } from './user-profile.mapper';

describe('user-profile.mapper', () => {
  it('maps database user to API profile shape', () => {
    const createdAt = new Date('2026-01-15T08:00:00.000Z');
    const updatedAt = new Date('2026-06-20T12:00:00.000Z');

    const profile = toUserProfile({
      id: 'user-id',
      phone: '+998901234567',
      email: 'ali@example.com',
      firstName: 'Ali',
      lastName: 'Karimov',
      photoUrl: null,
      locale: 'uz',
      role: 'consumer',
      createdAt,
      updatedAt,
      identities: [{ provider: 'telegram', providerId: '123' }],
    });

    expect(profile).toEqual({
      id: 'user-id',
      phone: '+998901234567',
      email: 'ali@example.com',
      firstName: 'Ali',
      lastName: 'Karimov',
      photoUrl: null,
      locale: 'uz',
      role: 'consumer',
      identities: [{ provider: 'telegram', providerId: '123' }],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });
});
