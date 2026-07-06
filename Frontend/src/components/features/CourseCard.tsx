import { Link } from 'react-router-dom';
import { ArrowRight, Star, IndianRupee, Building2, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import { coursePath } from '../../utils/paths';
import { Badge, Button } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import type { CourseCatalogItem } from '../../types';

interface CourseCardProps {
  course: CourseCatalogItem & { slug?: string };
  variant?: 'default' | 'featured';
  className?: string;
}

export function CourseCard({ course, variant = 'default', className }: CourseCardProps) {
  const path = coursePath(course);

  const formatFees = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatPackage = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} LPA`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'group bg-surface rounded-3xl overflow-hidden shadow-soft border border-border',
          'transition-all duration-500 hover:shadow-large hover:-translate-y-1',
          className
        )}
      >
        <Link to={path} className="block">
          <div className="relative h-48 overflow-hidden">
            <ImageWithFallback
              src={course.coverImage}
              alt={course.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              {course.trending && (
                <Badge variant="accent" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                  Trending
                </Badge>
              )}
              <Badge variant="outline" size="sm" className="bg-white/90 border-white/20">
                {course.stream.charAt(0).toUpperCase() + course.stream.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-heading-md font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {course.name}
                </h3>
                <p className="text-body-xs text-muted mt-1">
                  {course.degree} · {course.duration} · {course.mode.replace('-', ' ')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-warning shrink-0">
                <Star className="w-4 h-4 fill-warning" />
                <span className="text-body-sm font-semibold">{course.rating}</span>
              </div>
            </div>

            <p className="text-body-sm text-muted line-clamp-2 mb-4">{course.description}</p>

            <div className="grid grid-cols-2 gap-3 py-4 border-t border-border mb-4">
              <div>
                <p className="text-body-xs text-muted">Avg. Fees</p>
                <p className="text-body-sm font-semibold text-primary flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  {formatFees(course.averageFees)}/yr
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted">Avg. Package</p>
                <p className="text-body-sm font-semibold text-success">{formatPackage(course.averagePackage)}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted">Colleges</p>
                <p className="text-body-sm font-semibold text-primary flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {course.collegesCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted">Level</p>
                <p className="text-body-sm font-semibold text-primary capitalize">
                  {course.level === 'undergraduate' ? 'UG' : course.level === 'postgraduate' ? 'PG' : 'PhD'}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="px-6 pb-6 -mt-2">
          <Link to={path}>
            <Button fullWidth icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={cn(
        'group block bg-surface rounded-2xl p-6 border border-border shadow-soft',
        'transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 overflow-hidden">
          <ImageWithFallback
            src={course.coverImage}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
              {course.name}
            </h3>
            <div className="flex items-center gap-1 text-warning shrink-0">
              <Star className="w-3.5 h-3.5 fill-warning" />
              <span className="text-body-xs font-semibold">{course.rating}</span>
            </div>
          </div>
          <p className="text-body-xs text-muted mt-0.5">
            {course.degree} · {course.duration}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" size="sm">{course.stream}</Badge>
            <Badge variant="default" size="sm">{formatFees(course.averageFees)}/yr</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
