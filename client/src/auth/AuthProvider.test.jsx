import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthProvider from './AuthProvider';
import { useAuth } from './useAuth';

vi.mock('./userStorage', () => ({
  updateUser: vi.fn(),
}));

import { updateUser } from './userStorage';

function Consumer() {
  const { user, login, logout, updateProfile } = useAuth();
  return (
    <div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
      <button
        onClick={() => login({ id: 'u1', username: 'alice' }, 'token-1', true)}
      >
        login
      </button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => updateProfile({ bio: 'updated' })}>update</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('login persists user and logout clears it', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'login' }));
    expect(screen.getByTestId('username')).toHaveTextContent('alice');

    await user.click(screen.getByRole('button', { name: 'logout' }));
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });

  it('updateProfile updates state and storage', async () => {
    const user = userEvent.setup();
    updateUser.mockResolvedValue({
      id: 'u1',
      username: 'alice',
      bio: 'updated',
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'login' }));
    await user.click(screen.getByRole('button', { name: 'update' }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith('u1', { bio: 'updated' });
    });
  });
});
