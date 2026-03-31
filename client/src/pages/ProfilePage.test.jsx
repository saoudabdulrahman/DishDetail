import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../auth/context';

describe('ProfilePage', () => {
  it('renders profile summary for authenticated user', async () => {
    render(
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
      </MemoryRouter>,
    );

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(await screen.findByText('Your Reviews')).toBeInTheDocument();
  });
});
