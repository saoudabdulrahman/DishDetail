import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { validateUser, saveUser } from '../auth/userStorage';
import './AuthModal.css';

function LoginForm({ onSwitch, onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const triggerShake = () => {
    setShakeError(true);
    window.setTimeout(() => setShakeError(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    if (!u || !password) {
      setError('Please enter your username and password.');
      triggerShake();
      return;
    }

    try {
      const validUser = await validateUser(u, password);
      login(validUser, rememberMe);
      onSuccess();
      toast.success('Logged in successfully.');
    } catch (error) {
      console.error(error);
      setError('Invalid username or password.');
      triggerShake();
    }
  };

  return (
    <div className="auth-card">
      <h2>Log In</h2>
      <p className="auth-subtext">Welcome back to Dish Detail.</p>

      {error && (
        <div className={`auth-error ${shakeError ? 'shake' : ''}`}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g., john_doe"
          />
        </label>

        <label>
          Password
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ?
                <EyeOff size={18} />
              : <Eye size={18} />}
            </button>
          </div>
        </label>

        <label className="remember-row">
          <input
            type="checkbox"
            className="hidden-checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <div className="custom-checkbox">
            <Check size={14} strokeWidth={3} className="check-icon" />
          </div>
          <span className="label-text">Remember me for 3 weeks</span>
        </label>

        <button type="submit" className="auth-submit-button">
          Log In
        </button>
      </form>

      <div className="auth-alt">
        Don&apos;t have an account yet?{' '}
        <button type="button" onClick={onSwitch} className="auth-alt-button">
          Sign up
        </button>
      </div>
    </div>
  );
}

function SignupForm({ onSwitch, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const triggerShake = () => {
    setShakeError(true);
    window.setTimeout(() => setShakeError(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const e1 = email.trim();
    const u1 = username.trim();

    if (!e1 || !u1 || !password || !confirm) {
      setError('Please fill out all fields.');
      triggerShake();
      return;
    }

    if (!e1.includes('@')) {
      setError('Please enter a valid email.');
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      triggerShake();
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    try {
      const newUser = { email: e1, username: u1, password };
      const created = await saveUser(newUser);
      login(created, true);
      onSuccess();
      toast.success('Account created successfully.');
    } catch (error) {
      console.error(error);
      setError('Signup failed.');
      triggerShake();
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign Up</h2>
      <p className="auth-subtext">Create your Dish Detail account.</p>

      {error && (
        <div className={`auth-error ${shakeError ? 'shake' : ''}`}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@email.com"
          />
        </label>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g., john_doe"
          />
        </label>

        <label>
          Password
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ?
                <EyeOff size={18} />
              : <Eye size={18} />}
            </button>
          </div>
        </label>

        <label>
          Confirm Password
          <div className="password-input-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={
                showConfirm ? 'Hide confirm password' : 'Show confirm password'
              }
            >
              {showConfirm ?
                <EyeOff size={18} />
              : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button type="submit" className="auth-submit-button">
          Create Account
        </button>
      </form>

      <div className="auth-alt">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="auth-alt-button">
          Log in
        </button>
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { authModal, setAuthModal } = useAuth();

  const [activeModal, setActiveModal] = useState(null);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  if (authModal && authModal !== activeModal) {
    setActiveModal(authModal);
  }

  const isClosing = !authModal && !!activeModal;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAuthModal(null);
    };
    if (authModal) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [authModal, setAuthModal]);

  if (!activeModal) return null;

  const closeModal = () => {
    setAuthModal(null);
    setMouseDownOnOverlay(false);
  };

  const handleOverlayMouseDown = (e) => {
    if (e.target.classList.contains('auth-modal-overlay')) {
      setMouseDownOnOverlay(true);
    } else {
      setMouseDownOnOverlay(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (
      mouseDownOnOverlay &&
      e.target.classList.contains('auth-modal-overlay')
    ) {
      closeModal();
    }
    setMouseDownOnOverlay(false);
  };

  const handleAnimationEnd = (e) => {
    if (isClosing && e.target.classList.contains('auth-modal-overlay')) {
      setActiveModal(null);
    }
  };

  return createPortal(
    <div
      className={`auth-modal-overlay ${isClosing ? 'closing' : ''}`}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`auth-modal-content ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="auth-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {activeModal === 'login' && (
          <LoginForm
            onSwitch={() => setAuthModal('signup')}
            onSuccess={closeModal}
          />
        )}

        {activeModal === 'signup' && (
          <SignupForm
            onSwitch={() => setAuthModal('login')}
            onSuccess={closeModal}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
