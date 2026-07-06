import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui';
import { Logo } from '../components/branding';

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
      <div className="text-center">
        <Logo variant="wordmark" asLink className="justify-center mb-8" />
        <div className="text-[12rem] font-heading font-bold text-border leading-none mb-4">
          404
        </div>
        <h1 className="text-display-sm font-heading font-semibold text-primary mb-4">
          Page not found
        </h1>
        <p className="text-body text-muted mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button icon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/colleges">
            <Button variant="outline" icon={<Search className="w-4 h-4" />}>
              Search Colleges
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
