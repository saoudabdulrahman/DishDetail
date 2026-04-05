import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('api client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends JSON headers and body for createReview', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ review: { _id: 'r1' } }),
    });

    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    await api().createReview('slug-1', { title: 'Great' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/establishments/slug-1/reviews`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Great' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('sends PUT with correct URL and body for updateReview', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ review: { _id: 'r1', title: 'Updated' } }),
    });

    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    await api().updateReview('r1', { title: 'Updated', rating: 4 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/reviews/r1`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated', rating: 4 }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('sends DELETE with correct URL for deleteReview', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    await api().deleteReview('r1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/reviews/r1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('sends POST with correct payload for login', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u1', username: 'alice' } }),
    });

    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    await api().login({ username: 'alice', password: 'pass123' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'alice', password: 'pass123' }),
      }),
    );
  });

  it('sends POST with correct payload for signup', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u2', username: 'bob' } }),
    });

    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    await api().signup({ username: 'bob', password: 'pass123' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/auth/signup`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'bob', password: 'pass123' }),
      }),
    );
  });

  it('throws normalized error message from server payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Nope' }),
    });

    await expect(api().getReviews()).rejects.toThrow('Nope');
  });

  it('falls back to generic error when response is not JSON', async () => {
    // fetchJson does res.json().catch(() => ({})), so a thrown json() resolves to {}.
    // data.error is then undefined, and the fallback 'Request failed' is used.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('bad json');
      },
    });

    await expect(api().health()).rejects.toThrow('Request failed');
  });
});
