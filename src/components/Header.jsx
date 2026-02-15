import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import './Header.css';

export default function Header() {
	const { user, logout } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const dropdownRef = useRef(null);

	const currentQuery = searchParams.get('q') || '';
	const [query, setQuery] = useState(currentQuery);

	useEffect(() => {
		setQuery(currentQuery);
	}, [currentQuery]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearch = () => {
		const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
		navigate(`/establishments${params}`);
	};

	const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
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

			<div className="search-container">
				<input
					id="search-input"
					type="text"
					placeholder="Search for restaurants..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<button id="search-button" onClick={handleSearch} aria-label="Search">
					<Search />
				</button>
			</div>

			<button
				id="hamburger-button"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				aria-label="Toggle navigation menu"
				aria-expanded={isMenuOpen}
			>
				<Menu />
			</button>

			<nav className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
				<Link to="/establishments" onClick={closeMenu}>
					Establishments
				</Link>
				<Link to="/reviews" onClick={closeMenu}>
					Reviews
				</Link>
				{user ?
					<>
						<Link to="/submit-review" onClick={closeMenu}>
							<button id="submit-review-button">Submit Review</button>
						</Link>
						<div className="user-dropdown" ref={dropdownRef}>
							<button
								className="user-info-toggle"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								aria-expanded={isDropdownOpen}
							>
								<User size={18} />
								<span className="username">{user.username}</span>
								<ChevronDown
									size={14}
									className={`chevron ${isDropdownOpen ? 'open' : ''}`}
								/>
							</button>
							<div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
								<button
									id="logout-button"
									onClick={() => {
										logout();
										setIsDropdownOpen(false);
										closeMenu();
									}}
								>
									<LogOut size={16} /> Log Out
								</button>
							</div>
						</div>
					</>
				:	<>
						<Link to="/login" onClick={closeMenu}>
							<button id="login-button">Log In</button>
						</Link>
						<Link to="/signup" onClick={closeMenu}>
							<button id="signup-button">Sign Up</button>
						</Link>
					</>
				}
			</nav>
		</header>
	);
}
