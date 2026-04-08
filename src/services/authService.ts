import type { AuthUser, LoginCredentials } from '../types/auth';
import type { ApiResult } from '../types/common';

function validateCredentials(credentials: LoginCredentials): string | null {
  if (!credentials.username.trim()) {
    return 'Username is required.';
  }
  if (!credentials.password) {
    return 'Password is required.';
  }
  return null;
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<ApiResult<{ user: AuthUser; token: string }>> {
  const validationError = validateCredentials(credentials);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  // Hardcoded credentials
  if (credentials.username.trim() === 'admin' && credentials.password === '123') {
    return {
      ok: true,
      data: {
        token: 'hardcoded-token',
        user: {
          id: '1',
          username: 'admin',
          fullName: 'Administrator',
          role: 'admin',
        },
      },
    };
  }

  return { ok: false, message: 'Invalid username or password.' };
}
