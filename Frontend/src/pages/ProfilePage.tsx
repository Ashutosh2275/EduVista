import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { Badge, Button, Avatar } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Badge variant="accent" size="lg" className="mb-4">Profile</Badge>
          <h1 className="text-display-sm font-heading font-semibold text-primary">My Profile</h1>
          <p className="text-body text-muted mt-2">View and manage your account information.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-surface rounded-2xl p-8 border border-border shadow-soft">
          <div className="flex items-center gap-4 mb-8">
            <Avatar fallback={user.name} size="xl" />
            <div>
              <h2 className="text-heading-lg font-semibold text-primary">{user.name}</h2>
              <p className="text-body-sm text-muted capitalize">{user.role.toLowerCase()} account</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
              <User className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="text-body-xs text-muted">Full Name</p>
                <p className="text-body-sm font-medium text-primary">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
              <Mail className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="text-body-xs text-muted">Email</p>
                <p className="text-body-sm font-medium text-primary">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-body-xs text-muted">Phone</p>
                  <p className="text-body-sm font-medium text-primary">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
              <Shield className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="text-body-xs text-muted">Role</p>
                <p className="text-body-sm font-medium text-primary">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-border">
            <Link to="/settings">
              <Button variant="outline">Account Settings</Button>
            </Link>
            <Link to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}>
              <Button>
                {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
