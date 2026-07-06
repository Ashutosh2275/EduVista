import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { collegeService } from '../../services/collegeService';
import { collegePath } from '../../utils/paths';
import type { CollegeWithSlug } from '../../services/collegeService';

export function StudentStories() {
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);

  useEffect(() => {
    collegeService.getTrending(3).then(setColleges).catch(() => setColleges([]));
  }, []);

  if (colleges.length === 0) return null;

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-body-sm font-medium text-accent mb-2">Top Institutions</p>
          <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary mb-4">
            Colleges Students
            <br />
            Are Exploring Now
          </h2>
          <p className="text-body text-muted">
            Live trending colleges from our platform — discover where students are applying today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {colleges.map((college, index) => (
            <Link
              key={college.id}
              to={collegePath(college)}
              className={cn(
                'group relative p-8 bg-surface rounded-3xl shadow-soft overflow-hidden',
                'transition-all duration-500 hover:shadow-large hover:-translate-y-2',
                'animate-fade-up'
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <ImageWithFallback
                  src={college.logo}
                  alt={college.shortName}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors">
                    {college.shortName}
                  </h4>
                  <p className="text-body-xs text-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {college.location.city}, {college.location.state}
                  </p>
                </div>
              </div>

              <p className="text-body-sm text-muted mb-6 line-clamp-3">{college.description}</p>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="success" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                  {college.placementRate}% Placement
                </Badge>
                <span className="text-body-xs text-muted flex items-center gap-1">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  {college.rating}
                </span>
                <Badge variant="accent" size="sm">#{college.ranking.national} NIRF</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
