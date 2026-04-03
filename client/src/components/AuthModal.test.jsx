import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from './AuthModal';
import { AuthContext } from '../auth/context';

const validateUserMock = vi.fn();
const saveUserMock = vi.fn();
vi.mock('../auth/userStorage', () => ({
  validateUser: (...args) => validateUserMock(...args),
  saveUser: (...args) => saveUserMock(...args),
}));

describe('AuthModal', () => {
  beforeEach(() => {
    validateUserMock.mockReset();
    saveUserMock.mockReset();
  });

  it('logs in successfully from login form', async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    validateUserMock.mockResolvedValue({ id: 'u1', username: 'alice' });

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

    await user.type(screen.getByPlaceholderText('e.g., john_doe'), 'alice');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(validateUserMock).toHaveBeenCalledWith('alice', 'password1');
      expect(login).toHaveBeenCalledWith(
        { id: 'u1', username: 'alice' },
        false,
      );
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
