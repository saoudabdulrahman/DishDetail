import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Bell, LogOut, Menu, Search, CircleUser } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export default function Header() {
  const { user, logout, setAuthModal } = useAuth();
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
    <header className="bg-background/80 fixed top-0 z-50 flex w-full shadow-[0_20px_40px_rgba(20,10,25,0.4)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-360 items-center justify-between px-8 py-4">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-on-background font-headline hover:text-on-background text-2xl font-bold tracking-tighter italic no-underline"
        >
          DishDetail
        </Link>

        <nav
          className={`hidden items-center space-x-8 md:flex ${isMenuOpen ? 'open' : ''}`}
        >
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              `font-headline flex items-center gap-1 text-lg font-bold tracking-tight no-underline transition-colors duration-200 ${
                isActive ?
                  'text-primary border-secondary border-b-2 pb-1'
                : 'text-on-surface-variant hover:text-on-background'
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/establishments"
            onClick={closeMenu}
            className={({ isActive }) =>
              `font-headline flex items-center gap-1 text-lg font-bold tracking-tight no-underline transition-colors duration-200 ${
                isActive ?
                  'text-primary border-secondary border-b-2 pb-1'
                : 'text-on-surface-variant hover:text-on-background'
              }`
            }
          >
            Establishments
          </NavLink>
          <NavLink
            to="/reviews"
            onClick={closeMenu}
            className={({ isActive }) =>
              `font-headline flex items-center gap-1 text-lg font-bold tracking-tight no-underline transition-colors duration-200 ${
                isActive ?
                  'text-primary border-secondary border-b-2 pb-1'
                : 'text-on-surface-variant hover:text-on-background'
              }`
            }
          >
            Reviews
          </NavLink>
        </nav>

        <div className="flex items-center space-x-6">
          <div className="group relative hidden sm:block">
            <input
              id="search-input"
              type="text"
              placeholder="Search for restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search restaurants"
              className="bg-background focus:ring-secondary text-on-background font-ui w-64 rounded-full border-none py-2 pr-12 pl-6 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="text-secondary/60 hover:text-secondary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent transition-colors duration-200"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Hamburger - mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="text-on-surface-variant hover:text-on-background cursor-pointer border-none bg-transparent transition-colors duration-200 md:hidden"
          >
            <Menu />
          </button>

          {/* Actions */}
          <div
            className={`flex items-center space-x-4 ${isMenuOpen ? 'open' : ''}`}
          >
            {user ?
              <>
                <Link
                  to="/submit-review"
                  onClick={closeMenu}
                  className="text-on-surface-variant hover:text-on-background font-ui flex cursor-pointer items-center gap-2 border-none bg-transparent text-sm transition-colors duration-200"
                >
                  <Bell size={20} />
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    className="text-on-surface-variant hover:text-on-background font-ui flex cursor-pointer items-center gap-2 border-none bg-transparent text-sm transition-colors duration-200"
                  >
                    <CircleUser />
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="bg-surface-container shadow-m absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg">
                      <NavLink
                        to="/profile"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          closeMenu();
                        }}
                        className="text-on-surface hover:bg-surface-container-high font-ui flex items-center gap-2 px-4 py-3 text-sm no-underline transition-colors duration-200"
                      >
                        <CircleUser size={16} /> Profile
                      </NavLink>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                          closeMenu();
                          toast.success('Logged out successfully.');
                        }}
                        className="text-on-surface hover:bg-surface-container-high font-ui flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            : <>
                <button
                  onClick={() => setAuthModal('login')}
                  className="font-ui text-on-surface-variant hover:text-on-background cursor-pointer border-none bg-transparent px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="font-ui bg-primary text-on-primary cursor-pointer rounded-full border-none px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:brightness-110"
                >
                  Sign Up
                </button>
              </>
            }
          </div>
        </div>
      </div>
    </header>
  );
}
