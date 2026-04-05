import { loadAuth } from './auth/storage';

async function fetchJson(url, options = {}) {
  const auth = loadAuth();
  const authHeader =
    auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

  // Normalize API failures so callers handle a single error shape.
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data;
}

export function api() {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

  return {
    health: () => fetchJson(`${BASE}/api/health`),
    getEstablishments: ({ q = '', minRating = 0 } = {}) =>
      fetchJson(
        `${BASE}/api/establishments?${new URLSearchParams({
          ...(q ? { q } : {}),
          ...(minRating ? { minRating: String(minRating) } : {}),
        })}`,
      ),
    getEstablishment: (slug) => fetchJson(`${BASE}/api/establishments/${slug}`),
    createReview: (slug, payload) =>
      fetchJson(`${BASE}/api/establishments/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getReviews: ({ q = '' } = {}) =>
      fetchJson(`${BASE}/api/reviews?${new URLSearchParams(q ? { q } : {})}`),
    updateReview: (id, updates) =>
      fetchJson(`${BASE}/api/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteReview: (id) =>
      fetchJson(`${BASE}/api/reviews/${id}`, {
        method: 'DELETE',
      }),
    signup: (payload) =>
      fetchJson(`${BASE}/api/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload) =>
      fetchJson(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      fetchJson(`${BASE}/api/auth/logout`, {
        method: 'POST',
      }),
    me: () => fetchJson(`${BASE}/api/auth/me`),
    voteReview: (id, type) =>
      fetchJson(`${BASE}/api/reviews/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      }),
    getUser: (id) => fetchJson(`${BASE}/api/users/${id}`),
    getUserByUsername: (username) =>
      fetchJson(`${BASE}/api/users/username/${encodeURIComponent(username)}`),
    updateUser: (id, updates) =>
      fetchJson(`${BASE}/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  };
}
