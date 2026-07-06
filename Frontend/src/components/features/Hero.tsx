import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, GraduationCap, TrendingUp } from 'lucide-react';
import { Badge, SearchBar } from '../ui';
import { navigateFromSearch, navigateFromSuggestion } from '../../utils/searchNavigation';
import { searchService } from '../../services/searchService';
import { collegeService } from '../../services/collegeService';
import { courseService } from '../../services/courseService';

const popularTags: { label: string; href: string }[] = [
  { label: 'Engineering', href: '/courses?stream=engineering' },
  { label: 'MBA', href: '/courses?stream=management' },
  { label: 'Medical', href: '/courses?stream=medical' },
  { label: 'Design', href: '/courses?stream=design' },
  { label: 'Law', href: '/courses?stream=law' },
];

function formatCount(n: number, suffix = '+'): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K${suffix}`;
  return `${n}${suffix}`;
}

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string; type: 'college' | 'course' | 'location' }>>([]);
  const [collegeCount, setCollegeCount] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [cityCount, setCityCount] = useState<number | null>(null);
  const [avgPlacement, setAvgPlacement] = useState<number | null>(null);

  useEffect(() => {
    collegeService.getColleges({ limit: 100 }).then((r) => {
      setCollegeCount(r.pagination.total);
      const cities = new Set(r.colleges.map((c) => c.location.city));
      setCityCount(cities.size);
      if (r.colleges.length) {
        const avg = r.colleges.reduce((s, c) => s + c.placementRate, 0) / r.colleges.length;
        setAvgPlacement(Math.round(avg));
      }
    }).catch(() => {});
    courseService.getCourses({ limit: 1 }).then((r) => setCourseCount(r.total)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchService
        .getSuggestions(query, 8)
        .then((data) => {
          const collegeSuggestions = data.colleges.map((c) => ({
            id: c._id,
            text: c.name,
            type: 'college' as const,
          }));
          const courseSuggestions = data.courses.map((c) => ({
            id: c._id,
            text: c.name,
            type: 'course' as const,
          }));
          setSuggestions([...collegeSuggestions, ...courseSuggestions]);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const heroStats = [
    { icon: GraduationCap, value: collegeCount !== null ? formatCount(collegeCount) : '—', label: 'Colleges' },
    { icon: MapPin, value: cityCount !== null ? `${cityCount}+` : '—', label: 'Cities' },
    { icon: TrendingUp, value: avgPlacement !== null ? `${avgPlacement}%` : '—', label: 'Avg Placement' },
    { icon: Sparkles, value: courseCount !== null ? formatCount(courseCount) : '—', label: 'Courses' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
        <div className="inline-flex mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Badge variant="accent" size="lg" icon={<Sparkles className="w-3.5 h-3.5" />}>
            AI-Powered Discovery
          </Badge>
        </div>

        <h1 className="text-display-lg md:text-display-xl font-heading font-semibold text-primary mb-6 tracking-tight animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Find Your Perfect
          <br />
          <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Educational Journey</span>
        </h1>

        <p className="text-body-lg text-muted max-w-2xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          Discover colleges, compare courses, and make informed decisions with
          intelligent recommendations tailored to your aspirations.
        </p>

        <div className="relative z-40 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <SearchBar
            suggestions={suggestions}
            value={query}
            onChange={setQuery}
            placeholder="Search colleges, courses, or careers..."
            variant="hero"
            onSearch={(q) => navigateFromSearch(q, navigate)}
            onSuggestionClick={(suggestion) => navigateFromSuggestion(suggestion, navigate)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <span className="text-body-sm text-muted">Popular:</span>
          {popularTags.map((tag) => (
            <Link
              key={tag.label}
              to={tag.href}
              className="px-4 py-1.5 rounded-full text-body-sm text-muted bg-surface border border-border hover:border-accent hover:text-accent transition-all duration-300"
            >
              {tag.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.6s' }}>
          {heroStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <stat.icon className="w-5 h-5 text-accent mb-2" />
              <span className="text-heading-lg font-semibold text-primary">{stat.value}</span>
              <span className="text-body-sm text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
