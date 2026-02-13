import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import './Header.css';

export default function Header({ onSearch }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [query, setQuery] = useState('');

	const handleSearch = () => {
		onSearch(query);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') handleSearch();
	};

	const closeMenu = () => setIsMenuOpen(false);

	return (
		<header>
			<div className="logo">
				<h1>
					<Link to="/" onClick={closeMenu}>
						Dish Detail
					</Link>
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
				<button id="searchButton" onClick={handleSearch} aria-label="Search">
					<Search />
				</button>
			</div>

			<button
				id="hamburgerButton"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				aria-label="Toggle navigation menu"
				aria-expanded={isMenuOpen}
			>
				<Menu />
			</button>

			<nav className={`headerActions ${isMenuOpen ? 'open' : ''}`}>
				<Link to="/establishments" onClick={closeMenu}>
					Establishments
				</Link>
				<Link to="/reviews" onClick={closeMenu}>
					Reviews
				</Link>
				<Link id="loginButton" to="/login" onClick={closeMenu}>
					Log In
				</Link>
				<Link id="signupButton" to="/signup" onClick={closeMenu}>
					Sign Up
				</Link>
			</nav>
		</header>
	);
}
