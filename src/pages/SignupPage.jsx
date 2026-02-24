import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { saveUser } from '../auth/userStorage';
import './SignupPage.css';

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

		try {
			// Frontend-only mock signup storage
			// DEMO ONLY: storing password in plain text (replace with backend later)
			const newUser = { email: e1, username: u1, password };
			saveUser(newUser);

			// Auto-login after signup (remembered)
			login(newUser, true);
			navigate('/');
		} catch (err) {
			setError(err.message);
			triggerShake();
		}
	};

	return (
		<main className="signup-page">
			<div className="signup-card">
				<h2>Sign Up</h2>
				<p className="signup-subtext">Create your Dish Detail account.</p>

				{error ?
					<div className={`signup-error ${shakeError ? 'shake' : ''}`}>
						{error}
					</div>
				:	null}

				<form onSubmit={handleSubmit} className="signup-form">
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

					<button type="submit" className="signup-button">
						Create Account
					</button>
				</form>

				<div className="signup-alt">
					Already have an account?{' '}
					<Link to="/login" className="signup-alt-link">
						Log in
					</Link>
				</div>
			</div>
		</main>
	);
}
