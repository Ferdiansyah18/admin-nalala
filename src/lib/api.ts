import { ApiResponse } from '@/types/admin';

const DEFAULT_API_URL = 'https://nalala-be.belanjamu.company/api/v1';

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  // Di client browser, gunakan relative path /api/v1 jika URL menuju nalala-be
  // agar diproxy oleh Next.js rewrites sehingga bebas dari batasan CORS browser
  if (typeof window !== 'undefined') {
    if (envUrl.includes('nalala-be.belanjamu.company')) {
      return '/api/v1';
    }
  }
  return envUrl.replace(/\/+$/, '');
}

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('nalala_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
      const errorMsg = json?.message || `Terjadi kesalahan (HTTP ${res.status})`;
      throw new ApiError(errorMsg, res.status);
    }

    if (!json) {
      throw new ApiError('Respons tidak valid dari server.');
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Gagal terhubung ke server backend.');
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
