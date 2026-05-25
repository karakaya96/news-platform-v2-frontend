import type { ApiResponse } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

interface FetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { revalidate, tags, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Try to get auth token from module variable or localStorage
  let token = authToken;
  if (!token && typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('admin_token');
    } catch {
      // localStorage not available
    }
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${BASE_URL}${endpoint}`;

    // Don't use Next.js caching for admin operations (mutations or when auth is needed)
    const isAdmin = endpoint.startsWith('/api/');
    const cacheOptions: Record<string, unknown> = {};
    if (revalidate !== undefined || tags !== undefined) {
      cacheOptions.next = {
        revalidate: revalidate ?? 60,
        tags: tags,
      };
    } else if (!isAdmin || token) {
      cacheOptions.cache = 'no-store';
    } else {
      cacheOptions.next = {
        revalidate: revalidate ?? 60,
        tags: tags,
      };
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      ...cacheOptions,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
