import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, X, Plus, MapPin, Star, IndianRupee, TrendingUp, BookOpen, Award, Building } from 'lucide-react';
import { Badge, Button, SearchBar, useToast, CardSkeleton, EmptyState } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { compareService } from '../services/compareService';
import { searchService } from '../services/searchService';
import { collegeService } from '../services/collegeService';
import type { CollegeWithSlug } from '../services/collegeService';
import { collegePath } from '../utils/paths';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import type { College } from '../types';

const comparisonMetrics = [
  { key: 'ranking', label: 'NIRF Ranking', icon: Award },
  { key: 'rating', label: 'Overall Rating', icon: Star },
  { key: 'fees', label: 'Annual Fees', icon: IndianRupee },
  { key: 'placement', label: 'Placement Rate', icon: TrendingUp },
  { key: 'package', label: 'Avg Package', icon: IndianRupee },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'type', label: 'Institution Type', icon: Building },
  { key: 'location', label: 'Location', icon: MapPin },
];

export function ComparePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedColleges, setSelectedColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ id: string; text: string; type: 'college' }>>([]);

  const persistCompare = useCallback(
    async (colleges: CollegeWithSlug[]) => {
      await compareService.saveCompare(colleges.map((c) => c.id));
      setSelectedColleges(colleges);
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    compareService
      .getCompare()
      .then(setSelectedColleges)
      .catch(() => setSelectedColleges([]))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, authLoading]);

  const handleAddCollege = async (collegeId: string) => {
    if (selectedColleges.length >= 3) return;
    if (selectedColleges.find((c) => c.id === collegeId)) return;
    try {
      const college = await collegeService.getBySlug(collegeId).catch(async () => {
        const list = await collegeService.getColleges({ q: collegeId, limit: 1 });
        if (!list.colleges[0]) throw new Error('Not found');
        return list.colleges[0];
      });
      const updated = [...selectedColleges, college];
      await persistCompare(updated);
    } catch {
      addToast({ type: 'error', title: 'Could not add college', description: 'College not found.' });
    }
  };

  const handleRemoveCollege = async (collegeId: string) => {
    const updated = selectedColleges.filter((c) => c.id !== collegeId);
    try {
      if (updated.length === 0) {
        await compareService.clearCompare();
      } else {
        await persistCompare(updated);
      }
      setSelectedColleges(updated);
    } catch {
      addToast({ type: 'error', title: 'Action failed', description: 'Could not update compare list.' });
    }
  };

  const getMetricValue = (college: College, key: string) => {
    switch (key) {
      case 'ranking':
        return `#${college.ranking.national}`;
      case 'rating':
        return college.rating;
      case 'fees':
        return `${(college.fees.min / 100000).toFixed(1)}L - ${(college.fees.max / 100000).toFixed(1)}L`;
      case 'placement':
        return `${college.placementRate}%`;
      case 'package':
        return `${(college.averagePackage / 100000).toFixed(0)} LPA`;
      case 'courses':
        return college.courseCount.toString();
      case 'type':
        return college.type.charAt(0).toUpperCase() + college.type.slice(1);
      case 'location':
        return `${college.location.city}, ${college.location.state}`;
      default:
        return '-';
    }
  };

  const getBestMetric = (key: string) => {
    if (selectedColleges.length === 0) return null;
    if (key === 'ranking') {
      let best = selectedColleges[0];
      for (const college of selectedColleges) {
        if (college.ranking.national < best.ranking.national) best = college;
      }
      return best.id;
    }
    if (key === 'rating' || key === 'placement' || key === 'package' || key === 'courses') {
      let best = selectedColleges[0];
      for (const college of selectedColleges) {
        if (key === 'rating' && college.rating > best.rating) best = college;
        if (key === 'placement' && college.placementRate > best.placementRate) best = college;
        if (key === 'package' && college.averagePackage > best.averagePackage) best = college;
        if (key === 'courses' && college.courseCount > best.courseCount) best = college;
      }
      return best.id;
    }
    if (key === 'fees') {
      let best = selectedColleges[0];
      for (const college of selectedColleges) {
        if (college.fees.min < best.fees.min) best = college;
      }
      return best.id;
    }
    return null;
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <EmptyState
          icon={<Scale className="w-8 h-8" />}
          title="Sign in to compare colleges"
          description="Create an account or log in to save and compare colleges side by side."
          action={{ label: 'Log In', onClick: () => navigate('/login') }}
        />
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CardSkeleton className="h-32 mb-8" />
        <CardSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <Badge variant="accent" size="lg" icon={<Scale className="w-3.5 h-3.5" />} className="mb-4">
              Compare Colleges
            </Badge>
            <h1 className="text-display-md md:text-display-lg font-heading font-semibold text-primary mb-4">
              Make Smart
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Decisions
              </span>
            </h1>
            <p className="text-body text-muted">
              Compare up to 3 colleges side by side across key metrics like rankings,
              fees, placements, and more to find your perfect match.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedColleges.length < 3 && (
          <div className="mb-8 p-6 bg-surface rounded-2xl border border-border border-dashed">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-heading-sm font-semibold text-primary mb-1">
                  Add a College to Compare
                </h3>
                <div className="max-w-md">
                  <SearchBar
                    placeholder="Search colleges..."
                    showButton={false}
                    onChange={(q) => {
                      if (q.length < 2) {
                        setSearchSuggestions([]);
                        return;
                      }
                      searchService.getSuggestions(q, 5).then((data) =>
                        setSearchSuggestions(
                          data.colleges
                            .filter((c) => !selectedColleges.find((s) => s.id === c._id))
                            .map((c) => ({ id: c.slug, text: c.name, type: 'college' as const }))
                        )
                      );
                    }}
                    suggestions={searchSuggestions}
                    onSuggestionClick={(suggestion) => handleAddCollege(suggestion.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedColleges.length === 0 ? (
          <EmptyState
            icon={<Scale className="w-8 h-8" />}
            title="No colleges to compare"
            description="Search and add colleges above to start comparing."
            action={{ label: 'Browse Colleges', onClick: () => navigate('/colleges') }}
          />
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[640px] sm:min-w-[800px]">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4" />
                {selectedColleges.map((college) => (
                  <div
                    key={college.id}
                    className="relative bg-surface rounded-2xl p-6 border border-border shadow-soft"
                  >
                    <button
                      onClick={() => handleRemoveCollege(college.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background text-muted hover:text-error transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <Link to={collegePath(college)}>
                      <ImageWithFallback
                        src={college.logo}
                        alt={`${college.shortName} campus`}
                        className="w-16 h-16 rounded-xl object-cover mb-4 hover:shadow-medium transition-shadow"
                      />
                    </Link>

                    <Link to={collegePath(college)}>
                      <h3 className="text-heading-sm font-semibold text-primary mb-1 hover:text-accent transition-colors">
                        {college.shortName}
                      </h3>
                    </Link>

                    <p className="text-body-xs text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {college.location.city}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="accent" size="sm">#{college.ranking.national} NIRF</Badge>
                      <Badge variant={college.type === 'public' ? 'success' : 'warning'} size="sm">
                        {college.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {comparisonMetrics.map((metric) => {
                  const bestId = getBestMetric(metric.key);
                  return (
                    <div key={metric.key} className="grid grid-cols-4 gap-4 items-center">
                      <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border">
                        <metric.icon className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-body-sm font-medium text-primary">{metric.label}</span>
                      </div>
                      {selectedColleges.map((college) => (
                        <div
                          key={college.id}
                          className={cn(
                            'p-4 rounded-xl text-center transition-colors',
                            bestId === college.id
                              ? 'bg-success/10 border-2 border-success/30'
                              : 'bg-surface border border-border'
                          )}
                        >
                          <span
                            className={cn(
                              'text-heading-md font-semibold',
                              bestId === college.id ? 'text-success' : 'text-primary'
                            )}
                          >
                            {getMetricValue(college, metric.key)}
                          </span>
                          {bestId === college.id && (
                            <p className="text-body-xs text-success mt-1">Best</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-12">
                <h2 className="text-heading-lg font-semibold text-primary mb-6">Top Recruiters</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-surface rounded-xl border border-border">
                    <span className="text-body-sm font-medium text-primary">View</span>
                  </div>
                  {selectedColleges.map((college) => (
                    <div key={college.id} className="p-4 bg-surface rounded-xl border border-border">
                      <div className="flex flex-wrap gap-2">
                        {college.topRecruiters.slice(0, 4).map((recruiter) => (
                          <span key={recruiter} className="px-2 py-1 bg-background rounded-lg text-body-xs text-primary">
                            {recruiter}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/colleges">
            <Button variant="outline">Browse More Colleges</Button>
          </Link>
          {selectedColleges.length > 0 && (
            <Button
              onClick={() =>
                addToast({
                  type: 'success',
                  title: 'Comparison saved',
                  description: 'Your comparison list is synced with your account.',
                })
              }
            >
              Save Comparison
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
