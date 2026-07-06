import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import type { InfoPageConfig } from '../data/infoPagesData';

interface InfoPageProps {
  page: InfoPageConfig;
}

export function InfoPage({ page }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="accent" size="lg" className="mb-6">{page.badge}</Badge>
            <h1 className="text-display-md lg:text-display-lg font-heading font-semibold text-primary mb-6">
              {page.title}
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                {page.highlight}
              </span>
            </h1>
            <p className="text-body text-muted">{page.description}</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {page.sections.map((section) => (
            <div key={section.heading} className="bg-surface rounded-2xl p-8 border border-border">
              <h2 className="text-heading-lg font-semibold text-primary mb-3">{section.heading}</h2>
              <p className="text-body text-muted leading-relaxed">{section.body}</p>
            </div>
          ))}

          {page.cta && (
            <div className="text-center pt-4">
              <Link to={page.cta.href}>
                <Button icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  {page.cta.label}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
