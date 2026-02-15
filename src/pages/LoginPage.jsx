import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './LoginPage.css';

export default function LoginPage() {
	const navigate = useNavigate();
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

		const users = JSON.parse(localStorage.getItem('dishdetail_users')) || [];
		const validUser = users.find(
			(user) =>
				user.username.toLowerCase() === u.toLowerCase() &&
				user.password === password,
		);

		if (!validUser) {
			setError('Invalid username or password.');
			triggerShake();
			return;
		}

		login(validUser.username, rememberMe);
		navigate('/');
	};

	return (
		<main className="loginPage">
			<div className="loginCard">
				<h2>Log In</h2>
				<p className="loginSubtext">Welcome back to Dish Detail.</p>

				{error ?
					<div className={`loginError ${shakeError ? 'shake' : ''}`}>
						{error}
					</div>
				:	null}

				<form onSubmit={handleSubmit} className="loginForm">
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

					<label className="rememberRow">
						<input
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
						/>
						Remember me for 3 weeks
					</label>

					<button type="submit" className="loginBtn">
						Log In
					</button>
				</form>

				<div className="loginAlt">
					Don&apos;t have an account yet?{' '}
					<Link to="/signup" className="loginAltLink">
						Sign up
					</Link>
				</div>
			</div>
		</main>
	);
}
