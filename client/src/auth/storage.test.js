import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuth, loadAuth, saveAuth } from './storage';

describe('auth storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores remembered auth in localStorage', () => {
    saveAuth({ id: 'u1' }, 'token-1', true);
    expect(localStorage.getItem('dishdetail_auth')).toBeTruthy();
    expect(sessionStorage.getItem('dishdetail_auth')).toBeNull();
  });

  it('stores non-remembered auth in sessionStorage', () => {
    saveAuth({ id: 'u1' }, 'token-1', false);
    expect(sessionStorage.getItem('dishdetail_auth')).toBeTruthy();
    expect(localStorage.getItem('dishdetail_auth')).toBeNull();
  });

  it('returns null and clears expired payload', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    localStorage.setItem(
      'dishdetail_auth',
      JSON.stringify({
        user: { id: 'u1' },
        token: 'token-1',
        expiresAt: now - 1,
      }),
    );
    expect(loadAuth()).toBeNull();
    expect(localStorage.getItem('dishdetail_auth')).toBeNull();
  });

  it('returns user and token for valid payload', () => {
    sessionStorage.setItem(
      'dishdetail_auth',
      JSON.stringify({ user: { id: 'u1' }, token: 'token-1', expiresAt: null }),
    );
    expect(loadAuth()).toEqual({
      user: { id: 'u1' },
      token: 'token-1',
      rememberMe: false,
    });
  });

  it('clears malformed payload and returns null', () => {
    localStorage.setItem('dishdetail_auth', '{bad-json');
    expect(loadAuth()).toBeNull();
    expect(localStorage.getItem('dishdetail_auth')).toBeNull();
  });

  it('clearAuth removes both stores', () => {
    localStorage.setItem('dishdetail_auth', '{}');
    sessionStorage.setItem('dishdetail_auth', '{}');
    clearAuth();
    expect(localStorage.getItem('dishdetail_auth')).toBeNull();
    expect(sessionStorage.getItem('dishdetail_auth')).toBeNull();
  });
});
