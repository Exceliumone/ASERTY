const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('pablo_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('pablo_refresh_token');
}

function storeTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem('pablo_access_token', accessToken);
  window.localStorage.setItem('pablo_refresh_token', refreshToken);
}

function clearSessionAndRedirectToLogin(): void {
  window.localStorage.removeItem('pablo_access_token');
  window.localStorage.removeItem('pablo_refresh_token');
  window.location.href = '/login';
}

// Deduplicates concurrent refresh attempts (several SWR hooks can 401 at the
// same moment): every caller awaits the same in-flight refresh instead of
// each rotating the refresh token and invalidating the others' attempt.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return null;

      const data = await response.json();
      storeTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    } catch {
      return null;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

/**
 * Thin fetch wrapper for the NestJS API: injects the bearer token, prefixes
 * `/api/v1`, transparently refreshes an expired access token once and
 * retries, and normalizes error handling so every hook/component can rely on
 * a single, predictable failure shape.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const requestWithToken = (token: string | null) =>
    fetch(`${API_URL}/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      cache: 'no-store',
    });

  let token = getAccessToken();
  let response = await requestWithToken(token);

  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      response = await requestWithToken(token);
    } else if (typeof window !== 'undefined') {
      clearSessionAndRedirectToLogin();
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, body.message ?? 'Erreur inconnue');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
