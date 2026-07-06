import { Link } from 'react-router-dom';
import { CAREER_STREAM_LINKS } from '../constants/courseStreams';
import { Badge } from '../components/ui';

export function CareersListPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Badge variant="accent" size="lg" className="mb-4">Career Paths</Badge>
          <h1 className="text-display-md font-heading font-semibold text-primary mb-4">Explore Career Streams</h1>
          <p className="text-body text-muted max-w-2xl">
            Browse courses by career stream and find colleges that match your goals.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAREER_STREAM_LINKS.map((career) => (
          <Link
            key={career.id}
            to={career.href}
            className="p-8 bg-surface rounded-2xl border border-border hover:border-accent/30 transition-colors"
          >
            <h2 className="text-heading-lg font-semibold text-primary mb-2">{career.title}</h2>
            <p className="text-body-sm text-muted">{career.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
