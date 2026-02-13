const AUTH_KEY = "dishdetail_auth";

export function saveAuth(user, rememberMe) {
  const THREE_WEEKS_MS = 1000 * 60 * 60 * 24 * 21;
  const expiresAt = rememberMe ? Date.now() + THREE_WEEKS_MS : null;

  const payload = { user, expiresAt };

  if (rememberMe) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  } else {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  }
}

export function loadAuth() {
  const raw =
    localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      clearAuth();
      return null;
    }

    return parsed.user ?? null;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}
