export type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(
    status: number,
    message: string,
    body: ApiErrorBody | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function parseApiErrorMessage(
  body: ApiErrorBody | null,
  fallback: string,
): string {
  if (!body?.message) {
    return fallback;
  }

  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}
