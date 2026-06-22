export const PlatformRole = {
  consumer: 'consumer',
  admin: 'admin',
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];

export const PLATFORM_ROLES = Object.values(PlatformRole);
