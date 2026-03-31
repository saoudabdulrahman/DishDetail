import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, setAuthModal } = useAuth();

  useEffect(() => {
    if (!user) {
      setAuthModal('login');
      toast.info('Please log in to access this page.');
    }
  }, [user, setAuthModal]);

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center md:px-24">
        <h2 className="font-headline text-on-surface text-4xl font-bold tracking-tight">
          Authentication Required
        </h2>
        <p className="font-ui text-on-surface-variant mt-4 text-lg">
          Please log in to view this page.
        </p>
        <button
          onClick={() => setAuthModal('login')}
          className="font-ui bg-primary text-on-primary mt-6 cursor-pointer rounded-xl border-none px-6 py-3 text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Log In
        </button>
      </main>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
