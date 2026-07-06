import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Heart, ChevronDown, User, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';
import { Logo } from '../branding';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../contexts/WishlistContext';

const navLinks = [
  { label: 'Colleges', href: '/colleges' },
  { label: 'Courses', href: '/courses' },
  { label: 'Compare', href: '/compare' },
  { label: 'Insights', href: '/insights' },
];

const moreLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

const MORE_CLOSE_DELAY_MS = 150;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { count: savedCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMoreCloseTimer = useCallback(() => {
    if (moreCloseTimerRef.current) {
      clearTimeout(moreCloseTimerRef.current);
      moreCloseTimerRef.current = null;
    }
  }, []);

  const openMoreMenu = useCallback(() => {
    clearMoreCloseTimer();
    setIsMoreOpen(true);
  }, [clearMoreCloseTimer]);

  const scheduleCloseMoreMenu = useCallback(() => {
    clearMoreCloseTimer();
    moreCloseTimerRef.current = setTimeout(() => {
      setIsMoreOpen(false);
      moreCloseTimerRef.current = null;
    }, MORE_CLOSE_DELAY_MS);
  }, [clearMoreCloseTimer]);

  useEffect(() => {
    return () => clearMoreCloseTimer();
  }, [clearMoreCloseTimer]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'Dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-surface/95 backdrop-blur-xl border-b border-border shadow-soft py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4 sm:gap-8 overflow-visible min-w-0">
          {/* Logo */}
          <Logo
            variant="wordmark"
            asLink
            className="group-hover:opacity-90 transition-opacity duration-300 min-w-0 shrink"
          />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-full font-medium transition-all duration-200',
                  isActive(link.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-muted hover:text-primary hover:bg-background'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={openMoreMenu}
              onMouseLeave={scheduleCloseMoreMenu}
            >
              <button
                type="button"
                onClick={() => {
                  clearMoreCloseTimer();
                  setIsMoreOpen((prev) => !prev);
                }}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all duration-200',
                  'text-muted hover:text-primary hover:bg-background'
                )}
              >
                More
                <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isMoreOpen && 'rotate-180')} />
              </button>

              {/* pt-2 bridge keeps the gap inside the hover zone */}
              <div
                className={cn(
                  'absolute top-full left-0 pt-2 w-48 z-50',
                  'transition-[opacity,transform] duration-200 ease-out',
                  isMoreOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-1 pointer-events-none'
                )}
                aria-hidden={!isMoreOpen}
              >
                <div className="bg-surface rounded-2xl shadow-large border border-border overflow-hidden">
                  <div className="py-2">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block px-4 py-2.5 text-body-sm text-muted hover:text-primary hover:bg-background transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/colleges">
              <Button variant="ghost" size="sm" className="p-2.5" aria-label="Search colleges">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/wishlist' : '/login'}>
              <Button variant="ghost" size="sm" className="p-2.5" aria-label="Saved colleges">
                <span className="relative inline-flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                  {isAuthenticated && savedCount > 0 && (
                    <span className="pointer-events-none absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 bg-accent text-white text-[10px] font-semibold leading-none rounded-full flex items-center justify-center ring-2 ring-surface">
                      {savedCount > 9 ? '9+' : savedCount}
                    </span>
                  )}
                </span>
              </Button>
            </Link>
            <div className="w-px h-6 bg-border mx-1" />
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Link to={dashboardHref}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {dashboardLabel}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-primary"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              {[...navLinks, ...moreLinks].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-3 rounded-xl font-medium transition-all duration-200',
                    isActive(link.href)
                      ? 'text-accent bg-accent/10'
                      : 'text-muted hover:text-primary hover:bg-background'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="w-full">
                    <Button variant="outline" fullWidth icon={<User className="w-4 h-4" />}>
                      Profile
                    </Button>
                  </Link>
                  <Link to={dashboardHref} className="w-full">
                    <Button variant="outline" fullWidth icon={<LayoutDashboard className="w-4 h-4" />}>
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <Button fullWidth variant="outline" icon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button variant="outline" fullWidth>
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button fullWidth>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
