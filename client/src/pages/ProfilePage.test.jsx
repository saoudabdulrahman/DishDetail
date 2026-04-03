import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../auth/context';

describe('ProfilePage', () => {
  it('renders profile summary for authenticated user', () => {
    render(
      <MemoryRouter>
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
          <ProfilePage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Your Reviews')).toBeInTheDocument();
  });
});
