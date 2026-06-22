type JwtPayload = {
  sub?: string;
  role?: string;
  locale?: string;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  return atob(`${normalized}${padding}`);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split('.');

  if (segments.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(segments[1] ?? '')) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoleFromAccessToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  return decodeJwtPayload(token)?.role ?? null;
}
