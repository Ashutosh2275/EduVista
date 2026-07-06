import { Link } from 'react-router-dom';
import { Brain, Code, BarChart3, TrendingUp, Package, Dna } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CAREER_STREAM_LINKS } from '../../constants/courseStreams';

const icons: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  BarChart: <BarChart3 className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Package: <Package className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
};

export function CareerPaths() {
  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-body-sm font-medium text-accent mb-2">Career Pathways</p>
          <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary mb-4">
            Explore Your Future
          </h2>
          <p className="text-body text-muted">
            Discover in-demand career paths and find colleges that specialize in your field of interest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_STREAM_LINKS.map((path) => (
            <Link
              key={path.id}
              to={path.href}
              className={cn(
                'group p-8 bg-background rounded-3xl border border-border',
                'transition-all duration-300',
                'hover:border-accent hover:shadow-medium hover:-translate-y-1'
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {icons[path.icon] || <Code className="w-6 h-6" />}
              </div>

              <h3 className="text-heading-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                {path.title}
              </h3>
              <p className="text-body-sm text-muted mb-6">{path.description}</p>

              <span className="text-body-sm font-medium text-accent">Browse courses →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
