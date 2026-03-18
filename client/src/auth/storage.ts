import type { PublicUser } from '@dishdetail/shared';

const AUTH_KEY = 'dishdetail_auth';

export function saveAuth(user: PublicUser, rememberMe: boolean): void {
  const THREE_WEEKS_MS = 1000 * 60 * 60 * 24 * 21;
  const expiresAt = rememberMe ? Date.now() + THREE_WEEKS_MS : null;
  const payload = { user, expiresAt };

  if (rememberMe) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    sessionStorage.removeItem(AUTH_KEY);
  } else {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    localStorage.removeItem(AUTH_KEY);
  }
}

interface StoredAuth {
  user: PublicUser;
  expiresAt: number | null;
}

export function loadAuth(): PublicUser | null {
  try {
    const stored =
      localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredAuth;

    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      clearAuth();
      return null;
    }

    return parsed.user || null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}
