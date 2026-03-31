import { Link, Outlet, ScrollRestoration } from 'react-router';
import { PenLine } from 'lucide-react';
import { Toaster } from 'sonner';
import AuthModal from './components/AuthModal';

function App() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <Toaster theme="system" richColors />
      <AuthModal />

      {/* Mobile FAB */}
      <Link
        to="/submit-review"
        className="gold-gradient fixed right-6 bottom-8 z-40 flex h-14 w-14 items-center justify-center rounded-xl shadow-2xl transition-transform active:scale-90 md:hidden"
      >
        <PenLine className="text-on-primary" size={22} />
      </Link>
    </>
  );
}

export default App;
