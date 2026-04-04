import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { LogOut, Search, CircleUser, X } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuth } from '../auth/useAuth';
import { cn } from '../utils/cn';

export default function Header() {
  const { user, logout, setAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentQuery);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSearch = () => {
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    navigate(`/establishments${params}`);
  };

  const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-background/80 fixed top-0 z-50 flex w-full flex-col shadow-lg backdrop-blur-md transition-colors duration-300">
      {/* Main Header Row */}
      <div className="mx-auto flex w-full max-w-360 items-center justify-between px-8 py-4">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-on-background font-headline hover:text-on-background text-2xl font-bold tracking-tighter italic no-underline"
        >
          DishDetail
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center space-x-8 md:flex">
          <NavLink
            to="/establishments"
            className={({ isActive }) =>
              cn(
                'font-headline flex items-center gap-1 text-lg font-bold tracking-tight no-underline transition-colors duration-200',
                isActive ?
                  'text-primary border-secondary border-b-2 pb-1'
                : 'text-on-surface-variant hover:text-on-background',
              )
            }
          >
            Establishments
          </NavLink>
          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              cn(
                'font-headline flex items-center gap-1 text-lg font-bold tracking-tight no-underline transition-colors duration-200',
                isActive ?
                  'text-primary border-secondary border-b-2 pb-1'
                : 'text-on-surface-variant hover:text-on-background',
              )
            }
          >
            Reviews
          </NavLink>
        </nav>

        <div className="flex items-center space-x-6">
          {/* Desktop Search */}
          <div className="group relative hidden sm:block">
            <input
              id="search-input"
              type="text"
              placeholder="Search for restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search restaurants"
              className="bg-background focus:ring-secondary text-on-background font-ui w-64 rounded-xl border-none py-2 pr-12 pl-6 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="text-secondary/60 hover:text-secondary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent transition-colors duration-200"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden items-center space-x-4 md:flex">
            {user ?
              <>
                {/* User Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="text-on-surface-variant hover:text-on-background focus:ring-primary font-ui flex cursor-pointer items-center gap-2 rounded-full border-none bg-transparent p-1 text-sm transition-colors duration-200 outline-none focus:ring-2">
                    <CircleUser />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="bg-surface-container absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-sm py-1 shadow-lg transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  >
                    <MenuItem>
                      {({ focus }) => (
                        <NavLink
                          to="/profile"
                          className={cn(
                            'text-on-surface font-ui flex items-center gap-2 px-4 py-3 text-sm no-underline transition-colors duration-200',
                            focus && 'bg-surface-container-high',
                          )}
                        >
                          <CircleUser size={16} /> Profile
                        </NavLink>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => {
                            logout();
                            toast.success('Logged out successfully.');
                          }}
                          className={cn(
                            'text-on-surface font-ui flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-3 text-sm transition-colors duration-200',
                            focus && 'bg-surface-container-high',
                          )}
                        >
                          <LogOut size={16} /> Log Out
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
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
                  className="font-ui bg-primary text-on-primary cursor-pointer rounded-xl border-none px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:brightness-110"
                >
                  Sign Up
                </button>
              </>
            }
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="text-on-surface-variant hover:text-on-background cursor-pointer border-none bg-transparent transition-colors duration-200 md:hidden"
          >
            {isMenuOpen ?
              <X />
            : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isMenuOpen && (
        <div className="bg-background border-outline-variant border-t px-8 pb-6 md:hidden">
          {/* Mobile Search */}
          <div className="relative mt-4 mb-4">
            <input
              type="text"
              placeholder="Search for restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  closeMenu();
                }
              }}
              aria-label="Search restaurants"
              className="bg-surface-container text-on-background font-ui focus:ring-secondary w-full rounded-xl border-none py-2 pr-12 pl-6 text-sm transition-colors duration-200 outline-none"
            />
            <button
              onClick={() => {
                handleSearch();
                closeMenu();
              }}
              aria-label="Search"
              className="text-secondary/60 hover:text-secondary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent transition-colors duration-200"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <nav className="mb-4 flex flex-col space-y-1">
            {[
              { to: '/establishments', label: 'Establishments' },
              { to: '/reviews', label: 'Reviews' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'font-headline rounded-sm px-3 py-2 text-base font-bold tracking-tight no-underline transition-colors duration-200',
                    isActive ?
                      'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-on-background hover:bg-surface-container',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Auth Actions */}
          <div className="border-outline-variant border-t pt-4">
            {user ?
              <div className="flex flex-col space-y-1">
                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className="text-on-surface-variant hover:text-on-background hover:bg-surface-container font-ui flex items-center gap-2 rounded-sm px-3 py-2 text-sm no-underline transition-colors duration-200"
                >
                  <CircleUser size={16} /> Profile
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                    toast.success('Logged out successfully.');
                  }}
                  className="text-on-surface-variant hover:text-on-background hover:bg-surface-container font-ui flex w-full cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-3 py-2 text-sm transition-colors duration-200"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            : <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setAuthModal('login');
                    closeMenu();
                  }}
                  className="font-ui text-on-surface-variant hover:text-on-background border-outline-variant w-full cursor-pointer rounded-sm border bg-transparent px-4 py-2 text-sm font-semibold transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModal('signup');
                    closeMenu();
                  }}
                  className="font-ui bg-primary text-on-primary w-full cursor-pointer rounded-xl border-none px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110"
                >
                  Sign Up
                </button>
              </div>
            }
          </div>
        </div>
      )}
    </header>
  );
}
