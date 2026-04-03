import { useState, useCallback } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { validateUser, saveUser } from '../auth/userStorage';
import { cn } from '../utils/cn';

// Shared field wrapper
function Field({ label, children }) {
  return (
    <label className="font-ui text-on-surface-variant flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

// Text/email input
function TextInput({ type = 'text', ...props }) {
  return (
    <input
      type={type}
      {...props}
      className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-xl border-none px-5 py-2.5 text-sm font-normal transition-all duration-200 outline-none focus:ring-1"
    />
  );
}

// Password input with reveal toggle
function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-xl border-none py-2.5 pr-11 pl-5 text-sm font-normal transition-all duration-200 outline-none focus:ring-1 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="text-on-surface-variant hover:text-on-surface font-ui absolute right-3.5 cursor-pointer border-none bg-transparent p-0.5 transition-colors duration-200"
      >
        {show ?
          <EyeOff size={16} />
        : <Eye size={16} />}
      </button>
    </div>
  );
}

// Animated checkbox row
function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="text-on-surface-variant flex cursor-pointer items-center gap-2.5 px-1 text-sm select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="border-outline-variant peer-checked:bg-primary peer-checked:border-primary relative flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-sm border-2 transition-all duration-200">
        <Check
          size={11}
          strokeWidth={3.5}
          className={cn(
            'text-on-primary transition-all duration-200',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />
      </span>
      <span className="font-ui font-normal">{label}</span>
    </label>
  );
}

// Error banner
function ErrorBanner({ message, shake }) {
  return (
    <div
      className={cn(
        'font-ui border-error text-error bg-error/10 rounded-xl border px-5 py-2 text-sm',
        shake && 'animate-[shakeX_0.45s_ease-out]',
      )}
    >
      {message}
    </div>
  );
}

// Login form
function LoginForm({ onSwitch, onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      triggerShake();
      return;
    }
    try {
      const validUser = await validateUser(username.trim(), password);
      login(validUser, rememberMe);
      onSuccess();
      toast.success('Logged in successfully.');
    } catch {
      setError('Invalid username or password.');
      triggerShake();
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-secondary font-label mb-1 text-xs font-bold tracking-[0.2em] uppercase">
        Welcome Back
      </span>
      <h2 className="font-headline text-on-surface mb-1 text-3xl font-bold tracking-tight">
        Log In
      </h2>
      <p className="font-ui text-on-surface-variant mb-5 text-sm">
        Sign in to your Dish Detail account.
      </p>
      {error && <ErrorBanner message={error} shake={shake} />}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Username">
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g., john_doe"
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        <CheckboxRow
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Stay logged in for 30 days"
        />

        <button
          type="submit"
          className="gold-gradient text-on-secondary font-ui mt-2 cursor-pointer rounded-xl border-none py-3 text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Log In
        </button>
      </form>
      <p className="font-ui text-on-surface-variant mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary font-ui cursor-pointer border-none bg-transparent p-0 font-semibold transition-colors hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

// Signup form
function SignupForm({ onSwitch, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
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
      const created = await saveUser({ email: e1, username: u1, password });
      login(created, true);
      onSuccess();
      toast.success('Account created successfully.');
    } catch {
      setError('Signup failed. Try a different username.');
      triggerShake();
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-secondary font-label mb-1 text-xs font-bold tracking-[0.2em] uppercase">
        Join Us
      </span>
      <h2 className="font-headline text-on-surface mb-1 text-3xl font-bold tracking-tight">
        Sign Up
      </h2>
      <p className="font-ui text-on-surface-variant mb-5 text-sm">
        Create your Dish Detail account.
      </p>
      {error && <ErrorBanner message={error} shake={shake} />}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@email.com"
          />
        </Field>

        <Field label="Username">
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g., john_doe"
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </Field>

        <Field label="Confirm Password">
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </Field>

        <button
          type="submit"
          className="gold-gradient text-on-secondary font-ui mt-2 cursor-pointer rounded-xl border-none py-3 text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Create Account
        </button>
      </form>
      <p className="font-ui text-on-surface-variant mt-6 text-center text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary font-ui cursor-pointer border-none bg-transparent p-0 font-semibold transition-colors hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}

// Modal shell
export default function AuthModal() {
  const { authModal, setAuthModal } = useAuth();
  // Keep content mounted until close animation completes.
  const [displayModal, setDisplayModal] = useState(authModal);

  // Sync newly opened modal type into local display state.
  if (authModal && authModal !== displayModal) {
    setDisplayModal(authModal);
  }

  const closeModal = useCallback(() => {
    setAuthModal(null);
  }, [setAuthModal]);

  return (
    <Dialog open={!!authModal} onClose={closeModal} className="relative z-1000">
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-250 ease-out data-closed:opacity-0 data-leave:duration-250 data-leave:ease-in"
        style={{ backgroundColor: 'oklch(0 0 0 / 0.55)' }}
      />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="bg-surface-container-low relative w-full max-w-sm overflow-hidden rounded-lg p-8 transition-all duration-250 ease-out data-closed:translate-y-4 data-closed:opacity-0 data-leave:duration-250 data-leave:ease-in"
          >
            {/* Top accent */}
            <div className="gold-gradient absolute top-0 left-0 h-0.5 w-full" />

            {/* Close Button */}
            <button
              onClick={closeModal}
              aria-label="Close"
              className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high absolute top-4 right-4 cursor-pointer rounded-xl border-none bg-transparent p-1.5 transition-colors duration-200"
            >
              <X size={18} />
            </button>

            {displayModal === 'login' && (
              <LoginForm
                onSwitch={() => setAuthModal('signup')}
                onSuccess={closeModal}
              />
            )}
            {displayModal === 'signup' && (
              <SignupForm
                onSwitch={() => setAuthModal('login')}
                onSuccess={closeModal}
              />
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
