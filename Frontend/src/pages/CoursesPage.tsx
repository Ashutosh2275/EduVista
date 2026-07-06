import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal, TrendingUp, Briefcase, Cpu, Heart, Palette,
  BookOpen, Scale, FlaskConical, IndianRupee, Search,
} from 'lucide-react';
import { COURSE_STREAMS, CAREER_STREAM_LINKS } from '../constants/courseStreams';
import { CourseCard } from '../components/features/CourseCard';
import { CollegeCard } from '../components/features/CollegeCard';
import {
  Button, Badge, SearchBar, Dropdown, Pagination, EmptyState, CardSkeleton,
} from '../components/ui';
import { courseService } from '../services/courseService';
import { collegeService } from '../services/collegeService';
import { searchService } from '../services/searchService';
import type { CourseWithSlug } from '../services/courseService';
import type { CollegeWithSlug } from '../services/collegeService';
import { cn } from '../utils/cn';
import type { CourseStream, CourseSortOption } from '../types';

const ITEMS_PER_PAGE = 6;

const LEVEL_API_MAP: Record<string, string> = {
  undergraduate: 'UG',
  postgraduate: 'PG',
  doctoral: 'PhD',
};

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'fees_low', label: 'Fees: Low to High' },
  { value: 'fees_high', label: 'Fees: High to Low' },
  { value: 'package', label: 'Highest Package' },
  { value: 'colleges', label: 'Most Colleges' },
  { value: 'name', label: 'Name A-Z' },
];

const levelOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'undergraduate', label: 'Undergraduate (UG)' },
  { value: 'postgraduate', label: 'Postgraduate (PG)' },
  { value: 'doctoral', label: 'Doctoral (PhD)' },
];

const modeOptions = [
  { value: 'all', label: 'All Modes' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'online', label: 'Online' },
];

const durationOptions = [
  { value: 'all', label: 'Any Duration' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '2', label: '2 years' },
  { value: '5', label: '5+ years' },
];

const streamIcons: Record<string, React.ReactNode> = {
  engineering: <Cpu className="w-5 h-5" />,
  medical: <Heart className="w-5 h-5" />,
  management: <Briefcase className="w-5 h-5" />,
  commerce: <IndianRupee className="w-5 h-5" />,
  law: <Scale className="w-5 h-5" />,
  design: <Palette className="w-5 h-5" />,
  science: <FlaskConical className="w-5 h-5" />,
  arts: <BookOpen className="w-5 h-5" />,
};

export function CoursesPage() {
  const [searchParams] = useSearchParams();
  const initialStream = searchParams.get('stream') as CourseStream | null;
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [streamFilter, setStreamFilter] = useState<CourseStream | 'all'>(initialStream ?? 'all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<CourseSortOption>('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithSlug[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<CourseWithSlug[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<CourseWithSlug[]>([]);
  const [relatedColleges, setRelatedColleges] = useState<CollegeWithSlug[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string; type: 'course' }>>([]);

  useEffect(() => {
    courseService.getFeatured(3).then(setFeaturedCourses).catch(() => setFeaturedCourses([]));
    courseService.getTrending(4).then(setTrendingCourses).catch(() => setTrendingCourses([]));
    collegeService.getFeatured(3).then(setRelatedColleges).catch(() => setRelatedColleges([]));
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourses({
        q: searchQuery || undefined,
        stream: streamFilter !== 'all' ? streamFilter : undefined,
        level: levelFilter !== 'all' ? LEVEL_API_MAP[levelFilter] : undefined,
        mode: modeFilter !== 'all' ? modeFilter : undefined,
        duration: durationFilter !== 'all' ? durationFilter : undefined,
        sort: sortBy,
        limit: 100,
      });
      setCourses(data.courses);
    } catch {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, streamFilter, levelFilter, modeFilter, durationFilter, sortBy]);

  useEffect(() => {
    fetchCourses();
    setCurrentPage(1);
  }, [fetchCourses]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchService
        .getSuggestions(searchQuery, 4)
        .then((data) =>
          setSuggestions(
            data.courses.map((c) => ({
              id: c._id,
              text: c.name,
              type: 'course' as const,
            }))
          )
        )
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'fees_low': return a.averageFees - b.averageFees;
        case 'fees_high': return b.averageFees - a.averageFees;
        case 'package': return b.averagePackage - a.averagePackage;
        case 'colleges': return b.collegesCount - a.collegesCount;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [courses, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / ITEMS_PER_PAGE));
  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setStreamFilter('all');
    setLevelFilter('all');
    setModeFilter('all');
    setDurationFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <Badge variant="accent" size="lg" className="mb-4">Explore Courses</Badge>
            <h1 className="text-display-md md:text-display-lg font-heading font-semibold text-primary mb-4">
              Discover Courses
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Across India
              </span>
            </h1>
            <p className="text-body text-muted mb-8">
              Browse thousands of programs across engineering, medicine, management, and more.
              Find the right course at the right college for your career goals.
            </p>
            <div className="max-w-xl mb-6">
              <SearchBar
                placeholder="Search by course name, degree, or stream..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
                suggestions={suggestions}
                onSuggestionClick={(s) => {
                  setSearchQuery(s.text);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {COURSE_STREAMS.slice(0, 6).map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => {
                    setStreamFilter(stream.id as CourseStream);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-body-sm font-medium transition-all duration-200',
                    streamFilter === stream.id
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-border text-muted hover:border-accent hover:text-accent'
                  )}
                >
                  {stream.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <section className="py-12 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-body-sm font-medium text-accent mb-1">Featured</p>
              <h2 className="text-heading-xl font-heading font-semibold text-primary">Top Courses</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Main listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-body-sm text-muted">
              Showing <span className="font-medium text-primary">{sortedCourses.length}</span> courses
            </span>
            {(streamFilter !== 'all' || levelFilter !== 'all' || modeFilter !== 'all') && (
              <button onClick={clearFilters} className="text-body-sm text-accent hover:underline">
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden shrink-0"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <div className="w-full sm:w-44 min-w-0 flex-1 sm:flex-none">
              <Dropdown options={sortOptions} value={sortBy} onChange={(v) => setSortBy(v as CourseSortOption)} fullWidth />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <aside className={cn(
            'lg:block bg-surface rounded-2xl p-6 border border-border h-fit',
            isFilterOpen ? 'block' : 'hidden'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-sm font-semibold text-primary">Filters</h3>
              <button onClick={clearFilters} className="text-body-sm text-accent hover:underline">Clear All</button>
            </div>

            <div className="mb-6">
              <h4 className="text-body-sm font-medium text-primary mb-3">Stream</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { setStreamFilter('all'); setCurrentPage(1); }}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors',
                    streamFilter === 'all' ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-background'
                  )}
                >
                  All Streams
                </button>
                {COURSE_STREAMS.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => { setStreamFilter(stream.id as CourseStream); setCurrentPage(1); }}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors flex items-center gap-2',
                      streamFilter === stream.id ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-background'
                    )}
                  >
                    {streamIcons[stream.id]}
                    {stream.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Dropdown label="Level" options={levelOptions} value={levelFilter} onChange={(v) => { setLevelFilter(v); setCurrentPage(1); }} fullWidth />
            </div>
            <div className="mb-6">
              <Dropdown label="Mode" options={modeOptions} value={modeFilter} onChange={(v) => { setModeFilter(v); setCurrentPage(1); }} fullWidth />
            </div>
            <div>
              <Dropdown label="Duration" options={durationOptions} value={durationFilter} onChange={(v) => { setDurationFilter(v); setCurrentPage(1); }} fullWidth />
            </div>
          </aside>

          {/* Course grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedCourses.length === 0 ? (
              <EmptyState
                icon={<Search className="w-8 h-8" />}
                title="No courses found"
                description="Try adjusting your filters or search terms to find more courses."
                action={{ label: 'Clear Filters', onClick: clearFilters }}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {paginatedCourses.map((course, index) => (
                  <div key={course.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <CourseCard course={course} variant="featured" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && sortedCourses.length > 0 && (
              <div className="flex justify-center mt-12">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Streams */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-body-sm font-medium text-accent mb-2">Browse by Stream</p>
            <h2 className="text-display-sm font-heading font-semibold text-primary">Popular Streams</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COURSE_STREAMS.map((stream) => (
              <button
                key={stream.id}
                onClick={() => { setStreamFilter(stream.id as CourseStream); setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="p-6 bg-background rounded-2xl border border-border text-center hover:border-accent/30 hover:shadow-soft transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  {streamIcons[stream.id]}
                </div>
                <p className="text-body-sm font-semibold text-primary">{stream.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-heading-xl font-heading font-semibold text-primary">Trending Courses</h2>
              <p className="text-body-xs text-muted">Most searched programs this month</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {trendingCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-body-sm font-medium text-accent mb-2">Career Paths</p>
            <h2 className="text-display-sm font-heading font-semibold text-primary mb-4">Career Opportunities</h2>
            <p className="text-body text-muted">Explore high-growth career paths linked to popular courses.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAREER_STREAM_LINKS.map((career) => (
              <Link
                key={career.id}
                to={career.href}
                className="block p-6 bg-background rounded-2xl border border-border hover:border-accent/30 transition-colors"
              >
                <h3 className="text-heading-sm font-semibold text-primary mb-3">{career.title}</h3>
                <p className="text-body-sm text-muted">{career.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Related Colleges */}
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-body-sm font-medium text-accent mb-1">Top Institutions</p>
              <h2 className="text-heading-xl font-heading font-semibold text-primary">Colleges Offering These Courses</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedColleges.map((college) => (
              <CollegeCard key={college.id} college={college} variant="featured" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
