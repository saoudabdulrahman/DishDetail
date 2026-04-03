import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

const toastInfo = vi.fn();
vi.mock('sonner', () => ({ toast: { info: (...args) => toastInfo(...args) } }));

const useAuthMock = vi.fn();
vi.mock('../auth/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

describe('ProtectedRoute', () => {
  it('shows auth required state and triggers login modal when unauthenticated', () => {
    const setAuthModal = vi.fn();
    useAuthMock.mockReturnValue({ user: null, setAuthModal });

    render(<ProtectedRoute />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(setAuthModal).toHaveBeenCalledWith('login');
    expect(toastInfo).toHaveBeenCalled();
  });

  it('renders children when authenticated', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1' }, setAuthModal: vi.fn() });
    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
