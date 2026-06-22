import { ConflictException, NotFoundException } from '@nestjs/common';
import { Locale, PlatformRole } from '@prisma/client';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  const profileRecord = {
    id: 'user-id',
    phone: '+998901234567',
    email: null,
    firstName: 'Ali',
    lastName: 'Karimov',
    photoUrl: null,
    locale: Locale.uz,
    role: PlatformRole.consumer,
    createdAt: new Date('2026-01-15T08:00:00.000Z'),
    updatedAt: new Date('2026-06-20T12:00:00.000Z'),
    identities: [{ provider: 'phone' as const, providerId: '+998901234567' }],
  };

  beforeEach(() => {
    userRepository = {
      findProfileById: jest.fn(),
      findActiveUserByEmail: jest.fn(),
      updateProfile: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    userService = new UserService(userRepository);
  });

  it('returns the current user profile', async () => {
    userRepository.findProfileById.mockResolvedValue(profileRecord);

    const profile = await userService.getProfile('user-id');

    expect(profile.id).toBe('user-id');
    expect(profile.identities).toHaveLength(1);
    expect(profile.createdAt).toBe('2026-01-15T08:00:00.000Z');
  });

  it('throws when profile is missing', async () => {
    userRepository.findProfileById.mockResolvedValue(null);

    await expect(userService.getProfile('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates profile fields', async () => {
    userRepository.findProfileById.mockResolvedValue(profileRecord);
    userRepository.updateProfile.mockResolvedValue({
      ...profileRecord,
      firstName: 'Vali',
      locale: Locale.ru,
    });

    const profile = await userService.updateProfile('user-id', {
      firstName: 'Vali',
      locale: Locale.ru,
    });

    expect(userRepository.updateProfile.mock.calls[0]).toEqual([
      'user-id',
      { firstName: 'Vali', locale: Locale.ru },
    ]);
    expect(profile.firstName).toBe('Vali');
    expect(profile.locale).toBe(Locale.ru);
  });

  it('rejects duplicate email addresses', async () => {
    userRepository.findProfileById.mockResolvedValue(profileRecord);
    userRepository.findActiveUserByEmail.mockResolvedValue({ id: 'other-id' });

    await expect(
      userService.updateProfile('user-id', { email: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
