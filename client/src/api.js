async function fetchJson(url, options = {}) {
  // Normalize API failures so callers handle a single error shape.
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data;
}

export function api() {
  return {
    health: () => fetchJson('/api/health'),
    getEstablishments: ({ q = '', minRating = 0 } = {}) =>
      fetchJson(
        `/api/establishments?${new URLSearchParams({
          ...(q ? { q } : {}),
          ...(minRating ? { minRating: String(minRating) } : {}),
        })}`,
      ),
    getEstablishment: (slug) => fetchJson(`/api/establishments/${slug}`),
    createReview: (slug, payload) =>
      fetchJson(`/api/establishments/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getReviews: ({ q = '' } = {}) =>
      fetchJson(`/api/reviews?${new URLSearchParams(q ? { q } : {})}`),
    updateReview: (id, updates) =>
      fetchJson(`/api/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteReview: (id) =>
      fetchJson(`/api/reviews/${id}`, {
        method: 'DELETE',
      }),
    signup: (payload) =>
      fetchJson('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload) =>
      fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getUser: (id) => fetchJson(`/api/users/${id}`),
    updateUser: (id, updates) =>
      fetchJson(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  };
}
