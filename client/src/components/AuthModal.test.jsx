import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from './AuthModal';
import { AuthContext } from '../auth/context';

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in successfully from login form', async () => {
    const user = userEvent.setup();
    const login = vi.fn();

    render(
      <AuthContext.Provider
        value={{
          user: null,
          authModal: 'login',
          setAuthModal: vi.fn(),
          login,
        }}
      >
        <AuthModal />
      </AuthContext.Provider>,
    );

    await user.type(screen.getByPlaceholderText('e.g., john_doe'), 'tester');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      // The mock MSW server returns { id: 'u1', username: 'tester' }
      expect(login).toHaveBeenCalledWith({ id: 'u1', username: 'tester' });
    });
  });

  it('shows validation error for empty login submit', async () => {
    const user = userEvent.setup();
    render(
      <AuthContext.Provider
        value={{
          user: null,
          authModal: 'login',
          setAuthModal: vi.fn(),
          login: vi.fn(),
        }}
      >
        <AuthModal />
      </AuthContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Log In' }));
    expect(
      screen.getByText('Please enter your username and password.'),
    ).toBeInTheDocument();
  });
});
