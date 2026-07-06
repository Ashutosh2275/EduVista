import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Building2, Star } from 'lucide-react';
import { Badge, CardSkeleton } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { courseService } from '../services/courseService';
import { collegeService } from '../services/collegeService';
import { coursePath } from '../utils/paths';
import { collegePath } from '../utils/paths';
import type { CourseWithSlug } from '../services/courseService';
import type { CollegeWithSlug } from '../services/collegeService';

export function InsightsPage() {
  const [courses, setCourses] = useState<CourseWithSlug[]>([]);
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseService.getFeatured(6),
      collegeService.getFeatured(6),
    ])
      .then(([c, col]) => {
        setCourses(c);
        setColleges(col);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Badge variant="accent" size="lg" className="mb-4">Discover</Badge>
          <h1 className="text-display-md font-heading font-semibold text-primary mb-4">Programs & Institutions</h1>
          <p className="text-body text-muted max-w-2xl">
            Live featured courses and colleges from the EduVista platform.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section>
          <h2 className="text-heading-xl font-semibold text-primary mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" /> Featured Courses
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="h-64" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} to={coursePath(course)} className="block bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/30">
                  <ImageWithFallback src={course.coverImage} alt={course.name} className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-heading-sm font-semibold text-primary">{course.name}</h3>
                    <p className="text-body-xs text-muted mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-warning text-warning" />{course.rating}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-heading-xl font-semibold text-primary mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent" /> Featured Colleges
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <Link key={college.id} to={collegePath(college)} className="flex gap-4 p-5 bg-surface rounded-2xl border border-border hover:border-accent/30">
                <ImageWithFallback src={college.logo} alt={college.shortName} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h3 className="text-heading-sm font-semibold text-primary">{college.shortName}</h3>
                  <p className="text-body-xs text-muted">{college.location.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
