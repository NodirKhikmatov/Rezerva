import { PlatformRole } from '@rezerva/shared-constants';

import { getRoleFromAccessToken } from '@/shared/lib/jwt';

export function resolvePlatformRole(
  accessToken: string | null,
  userRole?: PlatformRole | null,
): PlatformRole | null {
  if (userRole === PlatformRole.admin || userRole === PlatformRole.consumer) {
    return userRole;
  }

  const tokenRole = getRoleFromAccessToken(accessToken);

  if (tokenRole === PlatformRole.admin || tokenRole === PlatformRole.consumer) {
    return tokenRole;
  }

  return null;
}

export function isAdminSession(
  accessToken: string | null,
  userRole?: PlatformRole | null,
): boolean {
  return resolvePlatformRole(accessToken, userRole) === PlatformRole.admin;
}
