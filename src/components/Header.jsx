import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router';
import { ChevronDown, Dot, LogOut, Menu, Search, User } from 'lucide-react';
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
			<div className="left-header-actions">
				<div className="logo">
					<h2>
						<Link to="/" onClick={closeMenu}>
							Dish Detail
						</Link>
					</h2>
				</div>

				<nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
					<NavLink to="/establishments" onClick={closeMenu}>
						{({ isActive }) => (
							<>
								Establishments
								{isActive && <Dot size={32} className="nav-active-dot" />}
							</>
						)}
					</NavLink>
					<NavLink to="/reviews" onClick={closeMenu}>
						{({ isActive }) => (
							<>
								Reviews
								{isActive && <Dot size={32} className="nav-active-dot" />}
							</>
						)}
					</NavLink>
				</nav>
			</div>

			<div className="search-container">
				<input
					id="search-input"
					type="text"
					placeholder="Search for restaurants..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					aria-label="Search restaurants"
				/>
				<button id="search-button" onClick={handleSearch} aria-label="Search">
					<Search size={18} />
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

			<div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
				{user ?
					<>
						<Link
							to="/submit-review"
							id="submit-review-button"
							className="button-link"
							onClick={closeMenu}
						>
							Submit Review
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
									size={18}
									className={`chevron ${isDropdownOpen ? 'open' : ''}`}
								/>
							</button>
							<div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
								<NavLink
									to="/profile"
									id="profile-button"
									onClick={() => {
										setIsDropdownOpen(false);
										closeMenu();
									}}
								>
									<User size={16} /> Profile
								</NavLink>
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
						<NavLink
							to="/login"
							id="login-button"
							className="button-link"
							onClick={closeMenu}
						>
							Log In
						</NavLink>
						<NavLink
							to="/signup"
							id="signup-button"
							className="button-link"
							onClick={closeMenu}
						>
							Sign Up
						</NavLink>
					</>
				}
			</div>
		</header>
	);
}
