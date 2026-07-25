'use client';

export class ApiClientError extends Error {
  constructor(message: string, public readonly status = 500) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export type DbError = Error & { code?: string };

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: 'none' | 'optional' | 'required';
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = 'none', headers: initialHeaders, ...init } = options;
  const headers = new Headers(initialHeaders);
  headers.set('Accept', 'application/json');

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (init.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !headers.has('Idempotency-Key')) {
    headers.set('Idempotency-Key', crypto.randomUUID());
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: auth === 'none' ? init.credentials : 'same-origin',
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiClientError(
      typeof payload?.error === 'string' ? payload.error : 'No fue posible completar la operación.',
      response.status,
    );
  }

  return payload as T;
}

export async function resultOf<T>(operation: () => Promise<T>) {
  try {
    return { data: await operation(), error: null as DbError | null };
  } catch (error) {
    return { data: null as T | null, error: (error instanceof Error ? error : new Error('Error desconocido')) as DbError };
  }
}
