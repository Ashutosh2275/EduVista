import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FolderTree,
  Mail,
  Users,
  Settings,
  ChevronLeft,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '../../utils/cn';
import { Avatar, Button } from '../ui';
import { Logo } from '../branding';
import { useAuth } from '../../hooks/useAuth';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

const baseAdminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: GraduationCap, label: 'Colleges', href: '/admin/colleges' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: Mail, label: 'Enquiries', href: '/admin/enquiries', showBadge: true },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-clip">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-clip">
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-x-clip">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-primary/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-clip">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useAdminNotifications();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'bg-surface border-r border-border transition-all duration-300 flex flex-col z-40',
        'fixed inset-y-0 left-0 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        isCollapsed ? 'w-20' : 'w-72 max-w-[85vw]'
      )}
    >
      <div
        className={cn(
          'border-b border-border flex items-center overflow-visible',
          isCollapsed
            ? 'flex-col justify-center gap-2 px-2 py-3'
            : 'min-h-[4.5rem] px-4 py-3 justify-between gap-3'
        )}
      >
        {!isCollapsed ? (
          <Logo variant="wordmark" asLink />
        ) : (
          <Logo variant="wordmark" asLink imageClassName="!h-10 sm:!h-10" />
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 lg:hidden"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 hidden lg:inline-flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {baseAdminNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive(item.href)
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:text-primary hover:bg-background'
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-body-sm font-medium">{item.label}</span>
                {item.showBadge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {!isCollapsed && user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar fallback={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-primary truncate">{user.name}</p>
              <p className="text-body-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

interface AdminNavbarProps {
  onMenuClick: () => void;
}

function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount, items, refresh } = useAdminNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-14 sm:h-16 bg-surface border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 lg:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-heading-sm sm:text-heading-md font-heading font-semibold text-primary admin-title truncate">
          Admin Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="p-2.5 relative"
            onClick={() => { setShowNotifications(!showNotifications); refresh(); }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 bg-error text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] bg-surface border border-border rounded-2xl shadow-large z-50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-body-sm font-semibold text-primary">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="p-4 text-body-sm text-muted">No notifications</p>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left p-4 hover:bg-background border-b border-border last:border-0"
                      onClick={() => { navigate(item.href); setShowNotifications(false); }}
                    >
                      <p className="text-body-sm font-medium text-primary">{item.title}</p>
                      <p className="text-body-xs text-muted truncate">{item.message}</p>
                      <p className="text-body-xs text-muted mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <Avatar fallback={user?.name ?? 'AD'} size="sm" className="hidden sm:flex" />
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
