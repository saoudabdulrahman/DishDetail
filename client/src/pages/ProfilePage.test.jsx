import { describe, expect, it, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../auth/context';
import { server, http, HttpResponse } from '../test/server';
import { createTestQueryClient } from '../test/render';

describe('ProfilePage', () => {
  it('renders profile summary for authenticated user', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/profile/alice']}>
          <AuthContext.Provider
            value={{
              user: {
                id: 'u1',
                username: 'alice',
                bio: 'Food lover',
                role: 'critic',
              },
              updateProfile: vi.fn(),
            }}
          >
            <Routes>
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(await screen.findByText('Your Reviews')).toBeInTheDocument();
  });

  it('renders other user profile and their writing section', async () => {
    server.use(
      http.get('/api/users/username/:username', ({ params }) =>
        HttpResponse.json({
          user: {
            id: 'u2',
            username: params.username,
            bio: 'Visiting critic',
            role: 'critic',
          },
        }),
      ),
      http.get('/api/reviews', () =>
        HttpResponse.json({
          reviews: [
            {
              _id: 'r1',
              reviewer: 'bob',
              establishment: 'e1',
              title: 'Great lunch',
              body: 'Loved it',
              rating: 5,
              date: '2026-01-01T00:00:00.000Z',
            },
          ],
        }),
      ),
      http.get('/api/establishments', () =>
        HttpResponse.json({
          establishments: [
            { _id: 'e1', slug: 'test-bistro', restaurantName: 'Test Bistro' },
          ],
        }),
      ),
    );

    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/profile/bob']}>
          <AuthContext.Provider
            value={{
              user: {
                id: 'u1',
                username: 'alice',
                bio: 'Food lover',
                role: 'critic',
              },
              updateProfile: vi.fn(),
            }}
          >
            <Routes>
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: 'bob' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Their Writing')).toBeInTheDocument();
    expect(screen.queryByText('Your Reviews')).not.toBeInTheDocument();
  });
});
