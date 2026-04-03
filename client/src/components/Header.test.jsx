import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Header from './Header';
import { AuthContext } from '../auth/context';

describe('Header', () => {
  it('opens login modal for unauthenticated users', async () => {
    const user = userEvent.setup();
    const setAuthModal = vi.fn();
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ user: null, logout: vi.fn(), setAuthModal, authModal: null }}
        >
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Log In' }));
    expect(setAuthModal).toHaveBeenCalledWith('login');
  });
});
