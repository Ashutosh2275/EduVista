import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button, Badge } from '../components/ui';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md text-center">
        <Badge variant="outline" size="lg" className="mb-6">403 Forbidden</Badge>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-error/10 flex items-center justify-center text-error">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-display-sm font-heading font-semibold text-primary mb-4">
          Unauthorized Access
        </h1>
        <p className="text-body text-muted mb-8">
          You do not have permission to access the admin panel. Please contact support if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button fullWidth>Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" fullWidth>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
