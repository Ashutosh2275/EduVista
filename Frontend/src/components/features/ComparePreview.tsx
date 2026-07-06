import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale } from 'lucide-react';
import { cn } from '../../utils/cn';
import { collegePath } from '../../utils/paths';
import { Button, Badge } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { collegeService } from '../../services/collegeService';
import type { CollegeWithSlug } from '../../services/collegeService';

export function ComparePreview() {
  const [compareColleges, setCompareColleges] = useState<CollegeWithSlug[]>([]);

  useEffect(() => {
    collegeService
      .getTrending(3)
      .then(setCompareColleges)
      .catch(() => setCompareColleges([]));
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="animate-fade-up">
            <Badge variant="accent" size="lg" icon={<Scale className="w-3.5 h-3.5" />}>
              Smart Comparison
            </Badge>
            <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary mt-4 mb-6">
              Compare Colleges
              <br />
              Side by Side
            </h2>
            <p className="text-body text-muted mb-8 max-w-lg">
              Make informed decisions by comparing multiple colleges across key metrics
              like placements, fees, rankings, and more.
            </p>

            <Link to="/compare">
              <Button icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Start Comparing
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="space-y-4">
              {compareColleges.map((college, index) => (
                <Link
                  key={college.id}
                  to={collegePath(college)}
                  className={cn(
                    'flex items-center gap-4 p-4 bg-surface rounded-2xl shadow-soft',
                    'transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5',
                    'animate-fade-up'
                  )}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <ImageWithFallback
                    src={college.logo}
                    alt={`${college.shortName} logo`}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-heading-sm font-semibold text-primary truncate">
                      {college.shortName}
                    </h4>
                    <p className="text-body-xs text-muted">{college.location.city}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-xs text-muted">Rating</p>
                    <p className="text-body-sm font-semibold text-primary">{college.rating}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-xs text-muted">Placement</p>
                    <p className="text-body-sm font-semibold text-success">{college.placementRate}%</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -left-6 lg:-left-12 bg-surface shadow-medium rounded-full p-2">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
