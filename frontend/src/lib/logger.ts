import { Logtail } from '@logtail/node';

const sourceToken = process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN;

export const logtail = sourceToken ? new Logtail(sourceToken) : null;

export async function logInfo(
  message: string,
  context?: Record<string, unknown>,
) {
  if (!logtail) return;
  await logtail.info(message, context);
}

export async function logError(
  message: string,
  context?: Record<string, unknown>,
) {
  if (!logtail) return;
  await logtail.error(message, context);
}
