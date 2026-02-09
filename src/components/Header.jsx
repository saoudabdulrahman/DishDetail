import { useState } from 'react';
import './Header.css';

export default function Header({ onSearch }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [query, setQuery] = useState('');

	const handleSearch = () => {
		onSearch(query);
	};

	// Allow pressing "Enter" to search
	const handleKeyDown = (e) => {
		if (e.key === 'Enter') handleSearch();
	};

	return (
		<header>
			<div className="logo">
				<h1>
					<a href="/">Dish Detail</a>
				</h1>
			</div>

			<div className="searchContainer">
				<input
					id="searchInput"
					type="text"
					placeholder="Search for restaurants..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<button id="searchButton" onClick={handleSearch}>
					Search
				</button>
			</div>

			{/* Hamburger Toggle */}
			<button
				id="hamburgerButton"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				aria-label="Toggle navigation menu"
			>
				&#9776;
			</button>

			{/* Conditional class based on state */}
			<nav className={`headerActions ${isMenuOpen ? 'open' : ''}`}>
				<a href="#">Establishments</a>
				<a href="#">Reviews</a>
				<button
					id="loginButton"
					onClick={() => alert('Login form would appear here.')}
				>
					Log In
				</button>
				<button
					id="signupButton"
					onClick={() => alert('Sign-up form would appear here.')}
				>
					Sign Up
				</button>
			</nav>
		</header>
	);
}
