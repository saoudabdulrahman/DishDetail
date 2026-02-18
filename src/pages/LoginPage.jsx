import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { validateUser } from '../auth/userStorage';
import './LoginPage.css';

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const from = location.state?.from || '/';

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
		navigate(from, { replace: true });
	};

	return (
		<main className="login-page">
			<div className="login-card">
				<h2>Log In</h2>
				<p className="login-subtext">Welcome back to Dish Detail.</p>

				{error ?
					<div className={`login-error ${shakeError ? 'shake' : ''}`}>
						{error}
					</div>
				:	null}

				<form onSubmit={handleSubmit} className="login-form">
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
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
						/>
						Remember me for 3 weeks
					</label>

					<button type="submit" className="login-button">
						Log In
					</button>
				</form>

				<div className="login-alt">
					Don&apos;t have an account yet?{' '}
					<Link to="/signup" className="login-alt-link">
						Sign up
					</Link>
				</div>
			</div>
		</main>
	);
}
