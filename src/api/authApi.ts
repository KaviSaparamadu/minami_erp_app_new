import type { AuthUser, LoginCredentials } from '../types/auth';
import type { ApiResult } from '../types/common';
import { API_BASE_URL } from '../constants/api';

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function postLogin(
  credentials: LoginCredentials,
): Promise<ApiResult<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      return { ok: false, message: 'Invalid credentials. Please try again.' };
    }

    const data: LoginResponse = await response.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: 'Unable to connect. Please check your network and try again.',
    };
  }
}
