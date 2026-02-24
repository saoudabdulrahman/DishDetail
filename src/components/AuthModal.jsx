import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../auth/useAuth';
import { validateUser, saveUser } from '../auth/userStorage';
import { Check, X } from 'lucide-react';
import './AuthModal.css';

function LoginForm({ onSwitch, onSuccess }) {
	const { login } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');
	const [shakeError, setShakeError] = useState(false);

	const triggerShake = () => {
		setShakeError(true);
		window.setTimeout(() => setShakeError(false), 450);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		const u = username.trim();
		if (!u || !password) {
			setError('Please enter your username and password.');
			triggerShake();
			return;
		}

		const validUser = validateUser(u, password);
		if (!validUser) {
			setError('Invalid username or password.');
			triggerShake();
			return;
		}

		login(validUser, rememberMe);
		onSuccess();
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
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						placeholder="••••••••"
					/>
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
	const [error, setError] = useState('');
	const [shakeError, setShakeError] = useState(false);

	const triggerShake = () => {
		setShakeError(true);
		window.setTimeout(() => setShakeError(false), 450);
	};

	const handleSubmit = (e) => {
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
			saveUser(newUser);
			login(newUser, true);
			onSuccess();
		} catch (err) {
			setError(err.message);
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
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="new-password"
						placeholder="••••••••"
					/>
				</label>

				<label>
					Confirm Password
					<input
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						autoComplete="new-password"
						placeholder="••••••••"
					/>
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

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') setAuthModal(null);
		};
		if (authModal) document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [authModal, setAuthModal]);

	if (!authModal) return null;

	const closeModal = () => setAuthModal(null);

	return createPortal(
		<div className="auth-modal-overlay" onClick={closeModal}>
			<div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="auth-modal-close"
					onClick={closeModal}
					aria-label="Close"
				>
					<X size={24} />
				</button>

				{authModal === 'login' && (
					<LoginForm
						onSwitch={() => setAuthModal('signup')}
						onSuccess={closeModal}
					/>
				)}

				{authModal === 'signup' && (
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
