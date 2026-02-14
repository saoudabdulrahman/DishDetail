import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './SignupPage.css';

const USERS_KEY = 'dishdetail_users';

function loadUsers() {
	try {
		return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
	} catch {
		return [];
	}
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function SignupPage() {
	const navigate = useNavigate();
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

		// Frontend-only mock signup storage
		const users = loadUsers();

		const usernameTaken = users.some(
			(u) => u.username.toLowerCase() === u1.toLowerCase(),
		);
		if (usernameTaken) {
			setError('That username is already taken.');
			triggerShake();
			return;
		}

		// DEMO ONLY: storing password in plain text (replace with backend later)
		users.push({ email: e1, username: u1, password });
		saveUsers(users);

		// Auto-login after signup (remembered)
		login(u1, true);
		navigate('/');
	};

	return (
		<main className="signupPage">
			<div className="signupCard">
				<h2>Sign Up</h2>
				<p className="signupSubtext">Create your Dish Detail account.</p>

				{error ?
					<div className={`signupError ${shakeError ? 'shake' : ''}`}>
						{error}
					</div>
				:	null}

				<form onSubmit={handleSubmit} className="signupForm">
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

					<button type="submit" className="signupBtn">
						Create Account
					</button>
				</form>

				<div className="signupAlt">
					Already have an account?{' '}
					<Link to="/login" className="signupAltLink">
						Log in
					</Link>
				</div>
			</div>
		</main>
	);
}
