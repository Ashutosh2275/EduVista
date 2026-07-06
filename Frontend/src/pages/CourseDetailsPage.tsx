import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ChevronRight, Star, IndianRupee, Building2, TrendingUp, BookOpen,
  GraduationCap, Clock, ArrowRight, CheckCircle,
} from 'lucide-react';
import { Badge, Button, CardSkeleton } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { CollegeCard } from '../components/features/CollegeCard';
import { streamCoverImage } from '../utils/images';
import { coursePath } from '../utils/paths';
import { courseService } from '../services/courseService';
import { collegeService } from '../services/collegeService';
import type { CourseWithSlug } from '../services/courseService';
import type { CollegeWithSlug } from '../services/collegeService';

export function CourseDetailsPage() {
  const { id: slug } = useParams();
  const [course, setCourse] = useState<CourseWithSlug | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseWithSlug[]>([]);
  const [offeringColleges, setOfferingColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);

    courseService
      .getBySlug(slug)
      .then((data) => {
        setCourse(data);
        return Promise.all([
          courseService.getCourses({ stream: data.stream, limit: 4 }),
          collegeService.getFeatured(3),
        ]);
      })
      .then(([coursesResult, colleges]) => {
        setRelatedCourses(coursesResult.courses.filter((c) => c.slug !== slug).slice(0, 3));
        setOfferingColleges(colleges);
      })
      .catch(() => {
        setCourse(null);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const formatFees = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatPackage = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} LPA`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CardSkeleton className="h-96 mb-8" />
        <CardSkeleton className="h-64" />
      </div>
    );
  }

  if (notFound || !course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="h-72 lg:h-80 relative overflow-hidden">
          <ImageWithFallback
            src={course.coverImage || streamCoverImage(course.stream)}
            alt={course.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-28 pb-8">
            <div className="flex items-center gap-2 text-body-sm text-white/80 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white line-clamp-1">{course.name}</span>
            </div>

            <div className="bg-surface rounded-3xl shadow-large overflow-hidden border border-border">
              <div className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <Badge variant="accent" size="md" className="capitalize">{course.stream}</Badge>
                      <Badge variant="outline" size="md">{course.degree}</Badge>
                      <Badge variant="default" size="md" className="capitalize">{course.mode.replace('-', ' ')}</Badge>
                    </div>
                    <h1 className="text-display-sm font-heading font-semibold text-primary mb-3">{course.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-body-sm text-muted mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>
                      <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" />{course.level === 'undergraduate' ? 'UG' : course.level === 'postgraduate' ? 'PG' : 'PhD'}</span>
                      <span className="flex items-center gap-1 text-warning">
                        <Star className="w-4 h-4 fill-warning" />{course.rating} ({course.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-body text-muted max-w-3xl">{course.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 shrink-0">
                    <Link to="/colleges">
                      <Button fullWidth icon={<Building2 className="w-4 h-4" />}>Find Colleges</Button>
                    </Link>
                    <Link to="/compare">
                      <Button variant="outline" fullWidth icon={<TrendingUp className="w-4 h-4" />}>Compare Colleges</Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border">
                {[
                  { icon: IndianRupee, label: 'Avg. Fees', value: `${formatFees(course.averageFees)}/yr` },
                  { icon: TrendingUp, label: 'Avg. Package', value: formatPackage(course.averagePackage) },
                  { icon: Building2, label: 'Colleges', value: course.collegesCount.toLocaleString() },
                  { icon: BookOpen, label: 'Level', value: course.level === 'undergraduate' ? 'UG' : course.level === 'postgraduate' ? 'PG' : 'PhD' },
                ].map((stat, index) => (
                  <div key={index} className="p-6 border-r border-border last:border-r-0 text-center">
                    <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                    <p className="text-heading-md font-semibold text-primary">{stat.value}</p>
                    <p className="text-body-xs text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {course.careerOpportunities.length > 0 && (
          <section>
            <h2 className="text-heading-lg font-semibold text-primary mb-6">Career Opportunities</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {course.careerOpportunities.map((role) => (
                <div key={role} className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-body-sm text-primary">{role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-heading-lg font-semibold text-primary">Colleges Offering This Course</h2>
            <Link to="/colleges">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">View All</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {offeringColleges.map((college) => (
              <CollegeCard key={college.id} college={college} variant="featured" />
            ))}
          </div>
        </section>

        {relatedCourses.length > 0 && (
          <section>
            <h2 className="text-heading-lg font-semibold text-primary mb-8">Related Courses</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedCourses.map((item) => (
                <Link
                  key={item.id}
                  to={coursePath(item)}
                  className="p-6 bg-surface rounded-2xl border border-border hover:border-accent/30 transition-colors group"
                >
                  <Badge variant="outline" size="sm" className="mb-3 capitalize">{item.stream}</Badge>
                  <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors mb-2">{item.name}</h3>
                  <p className="text-body-xs text-muted">{item.degree} · {item.duration}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
