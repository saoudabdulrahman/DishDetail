import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';

import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { user, setAuthModal } = useAuth();

  useEffect(() => {
    if (!user) {
      setAuthModal('login');
      toast.info('Please log in to access this page.');
    }
  }, [user, setAuthModal]);

  if (!user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Authentication Required</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Please log in to view this page.
        </p>
        <button
          onClick={() => setAuthModal('login')}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--text-on-primary)',
            border: 'none',
            borderRadius: '2rem',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
