import {
  ApiError,
  parseApiErrorMessage,
  type ApiErrorBody,
} from '@/shared/types/api-error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string;
  body?: unknown;
};

async function parseErrorBody(
  response: Response,
): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    const message = parseApiErrorMessage(
      errorBody,
      `Request failed with status ${response.status}`,
    );
    throw new ApiError(response.status, message, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
