import type { PublicUser, Establishment, Review } from '@dishdetail/shared';

/**
 * Centralized API client wrapper.
 * This handles common tasks like setting content headers and parsing JSON,
 * but more importantly, it standardizes error responses into throw/catch blocks
 * so the UI components only need to deal with the final data or a generic error.
 */
async function fetchJson<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data as T;
}

export function api() {
  return {
    health: () => fetchJson<{ ok: boolean }>('/api/health'),
    getEstablishments: ({
      q = '',
      minRating = 0,
    }: { q?: string; minRating?: number } = {}) =>
      fetchJson<{ establishments: Establishment[] }>(
        `/api/establishments?${new URLSearchParams({
          ...(q ? { q } : {}),
          ...(minRating ? { minRating: String(minRating) } : {}),
        })}`,
      ),
    getEstablishment: (slug: string) =>
      fetchJson<{ establishment: Establishment; reviews: Review[] }>(
        `/api/establishments/${slug}`,
      ),
    createReview: (slug: string, payload: Partial<Review>) =>
      fetchJson<{ review: Review }>(`/api/establishments/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getReviews: ({ q = '' }: { q?: string } = {}) =>
      fetchJson<{ reviews: Review[] }>(
        `/api/reviews?${new URLSearchParams(q ? { q } : {})}`,
      ),
    updateReview: (id: string, updates: Partial<Review>) =>
      fetchJson<{ review: Review }>(`/api/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteReview: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/reviews/${id}`, {
        method: 'DELETE',
      }),
    signup: (payload: Record<string, unknown>) =>
      fetchJson<{ user: PublicUser }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: Record<string, unknown>) =>
      fetchJson<{ user: PublicUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getUser: (id: string) =>
      fetchJson<{ user: PublicUser }>(`/api/users/${id}`),
    updateUser: (id: string, updates: Partial<PublicUser>) =>
      fetchJson<{ user: PublicUser }>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  };
}
