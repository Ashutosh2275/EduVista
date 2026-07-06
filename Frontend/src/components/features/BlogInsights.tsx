import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button, Badge } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { courseService } from '../../services/courseService';
import { coursePath } from '../../utils/paths';
import type { CourseWithSlug } from '../../services/courseService';

export function BlogInsights() {
  const [courses, setCourses] = useState<CourseWithSlug[]>([]);

  useEffect(() => {
    courseService.getTrending(3).then(setCourses).catch(() => setCourses([]));
  }, []);

  if (courses.length === 0) return null;

  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-body-sm font-medium text-accent mb-2">Trending Programs</p>
            <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary">
              Popular Courses Right Now
            </h2>
          </div>
          <Link to="/courses">
            <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              View All Courses
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to={coursePath(course)}
              className={cn(
                'group block bg-background rounded-3xl overflow-hidden shadow-soft',
                'transition-all duration-500 hover:shadow-large hover:-translate-y-2',
                'animate-fade-up'
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={course.coverImage}
                  alt={course.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" size="sm" className="capitalize">{course.stream}</Badge>
                  <Badge variant="accent" size="sm">{course.degree}</Badge>
                </div>

                <h3 className="text-heading-md font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {course.name}
                </h3>

                <p className="text-body-sm text-muted line-clamp-2 mb-4">{course.description}</p>

                <div className="flex items-center justify-between text-body-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {course.collegesCount} colleges
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <Star className="w-3 h-3 fill-warning" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
