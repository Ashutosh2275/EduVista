import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button, Badge } from '../ui';

export function CallToAction() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-accent via-accent-dark to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-5xl bg-surface p-12 lg:p-20 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary to-transparent" />
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

          {/* Content */}
          <div className="relative z-10">
            <Badge variant="accent" size="lg" className="mb-6" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Start Your Journey
            </Badge>

            <h2 className="text-display-md lg:text-display-lg font-heading font-semibold text-primary mb-6">
              Ready to Find Your
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Perfect College?
              </span>
            </h2>

            <p className="text-body text-muted max-w-xl mx-auto mb-10">
              Join thousands of students who have discovered their ideal institution
              through EduVista's AI-powered platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/colleges">
                <Button variant="ghost" size="lg">
                  Explore Colleges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
