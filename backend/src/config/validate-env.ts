type EnvConfig = {
  nodeEnv: string;
  database: { url?: string };
  redis: { host: string; port: number };
  jwt: { secret: string };
  frontendUrl: string;
};

const INSECURE_JWT_SECRETS = new Set([
  'change-me-in-production',
  'dev-docker-secret-change-in-prod',
  'test-secret',
]);

export function validateEnvConfig(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const env = config as EnvConfig;

  if (env.nodeEnv !== 'production') {
    return config;
  }

  const missing: string[] = [];

  if (!env.database?.url) {
    missing.push('DATABASE_URL');
  }

  if (!env.redis?.host) {
    missing.push('REDIS_HOST');
  }

  if (!env.jwt?.secret) {
    missing.push('JWT_SECRET');
  }

  if (!env.frontendUrl) {
    missing.push('FRONTEND_URL');
  }

  if (missing.length > 0) {
    throw new Error(
      `Production boot failed — missing env: ${missing.join(', ')}`,
    );
  }

  if (INSECURE_JWT_SECRETS.has(env.jwt.secret)) {
    throw new Error('Production boot failed — JWT_SECRET must be rotated');
  }

  return config;
}
