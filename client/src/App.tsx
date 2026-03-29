import { Outlet, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Outlet />
      <ScrollRestoration />
      <AuthModal />
      <Toaster theme="system" richColors />
    </div>
  );
}

export default App;
