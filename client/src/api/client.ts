/**
 * Shared HTTP client for all API calls.
 * Reads the access token from localStorage (stored by AuthContext on login/register).
 */

const BASE_URL = 'http://localhost:5000/api/v1';

// Auth token is stored in localStorage so every API module can read it without prop-drilling
export const getToken = (): string | null => localStorage.getItem('accessToken');

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include' // send httpOnly refresh-token cookie
  });

  const body: ApiResponse<T> = await response.json();

  if (!response.ok && !body.success) {
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return body;
};

/** Multipart upload helper — does NOT set Content-Type (browser sets boundary automatically) */
export const apiUpload = async <T>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: formData
  });

  const body: ApiResponse<T> = await response.json();

  if (!response.ok && !body.success) {
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return body;
};
