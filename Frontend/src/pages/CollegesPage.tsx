import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, MapPin, IndianRupee, Star, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { CollegeCard } from '../components/features/CollegeCard';
import { Button, Badge, SearchBar, Dropdown, Pagination, CardSkeleton, EmptyState } from '../components/ui';
import { navigateFromSearch } from '../utils/searchNavigation';
import { collegeService } from '../services/collegeService';
import { searchService } from '../services/searchService';
import type { CollegeWithSlug } from '../services/collegeService';
import { cn } from '../utils/cn';

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'fees_low', label: 'Fees: Low to High' },
  { value: 'fees_high', label: 'Fees: High to Low' },
  { value: 'placement', label: 'Placement Rate' },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const feeRanges: Record<string, [number, number]> = {
  'Under ₹1 Lakh': [0, 100000],
  '₹1-5 Lakh': [100000, 500000],
  '₹5-10 Lakh': [500000, 1000000],
  'Above ₹10 Lakh': [1000000, 50000000],
};

export function CollegesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState<string | null>(searchParams.get('location'));
  const [feeFilter, setFeeFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string; type: 'college' }>>([]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
    setLocationFilter(searchParams.get('location'));
    setCurrentPage(1);
  }, [searchParams]);

  const fetchColleges = useCallback(async () => {
    setIsLoading(true);
    try {
      const feeRange = feeFilter ? feeRanges[feeFilter] : undefined;
      const result = await collegeService.getColleges({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        city: locationFilter ?? undefined,
        minFees: feeRange?.[0],
        maxFees: feeRange?.[1] === Infinity ? undefined : feeRange?.[1],
        minRating: ratingFilter ?? undefined,
        sort: sortBy,
      });
      setColleges(result.colleges);
      setTotalCount(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch {
      setColleges([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, typeFilter, locationFilter, feeFilter, ratingFilter, sortBy]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchService
        .getSuggestions(searchQuery, 5)
        .then((data) =>
          setSuggestions(
            data.colleges.map((c) => ({
              id: c._id,
              text: c.name,
              type: 'college' as const,
            }))
          )
        )
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = () => {
    setTypeFilter('all');
    setLocationFilter(null);
    setFeeFilter(null);
    setRatingFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <Badge variant="accent" size="lg" className="mb-4">
              Explore Colleges
            </Badge>
            <h1 className="text-display-md md:text-display-lg font-heading font-semibold text-primary mb-4">
              Find the Perfect
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                College for You
              </span>
            </h1>
            <p className="text-body text-muted mb-8">
              Browse through thousands of colleges, compare programs, and discover
              institutions that match your academic and career goals.
            </p>

            <div className="max-w-xl">
              <SearchBar
                placeholder="Search by college name, location, or course..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(query) => {
                  handleSearch(query);
                  navigateFromSearch(query, navigate);
                }}
                suggestions={suggestions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-body-sm text-muted">
              Showing <span className="font-medium text-primary">{totalCount}</span> colleges
            </span>
            {(typeFilter !== 'all' || locationFilter || feeFilter || ratingFilter || searchQuery) && (
              <button onClick={clearFilters} className="text-body-sm text-accent hover:underline">
                Clear all filters
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

            <div className="w-full sm:w-40 min-w-0 flex-1 sm:flex-none">
              <Dropdown options={sortOptions} value={sortBy} onChange={(v) => { setSortBy(v); setCurrentPage(1); }} fullWidth />
            </div>

            <div className="hidden sm:flex items-center bg-surface rounded-xl border border-border p-1">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  view === 'grid' ? 'bg-accent text-white' : 'text-muted hover:text-primary'
                )}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  view === 'list' ? 'bg-accent text-white' : 'text-muted hover:text-primary'
                )}
                aria-label="List view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className={cn(
            'lg:block bg-surface rounded-2xl p-6 border border-border',
            isFilterOpen ? 'block' : 'hidden'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-sm font-semibold text-primary">Filters</h3>
              <button className="text-body-sm text-accent hover:underline" onClick={clearFilters}>
                Clear All
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-body-sm font-medium text-primary mb-3">Institution Type</h4>
              <div className="space-y-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setTypeFilter(option.value); setCurrentPage(1); }}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors',
                      typeFilter === option.value
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-muted hover:bg-background'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-body-sm font-medium text-primary mb-3">Location</h4>
              <div className="space-y-2">
                {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'].map((city) => (
                  <button
                    key={city}
                    onClick={() => { setLocationFilter(locationFilter === city ? null : city); setCurrentPage(1); }}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors flex items-center gap-2',
                      locationFilter === city ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-background'
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-body-sm font-medium text-primary mb-3">Annual Fees</h4>
              <div className="space-y-2">
                {Object.keys(feeRanges).map((range) => (
                  <button
                    key={range}
                    onClick={() => { setFeeFilter(feeFilter === range ? null : range); setCurrentPage(1); }}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors flex items-center gap-2',
                      feeFilter === range ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-background'
                    )}
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-body-sm font-medium text-primary mb-3">Rating</h4>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => { setRatingFilter(ratingFilter === rating ? null : rating); setCurrentPage(1); }}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-left text-body-sm transition-colors flex items-center gap-2',
                      ratingFilter === rating ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-background'
                    )}
                  >
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {rating}+ Rating
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading && (
              <div className={cn('grid gap-6', view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} className="h-72" />
                ))}
              </div>
            )}

            {!isLoading && colleges.length === 0 && (
              <EmptyState
                title="No colleges found"
                description="Try adjusting your filters or search query."
                action={{ label: 'Clear filters', onClick: clearFilters }}
              />
            )}

            {!isLoading && colleges.length > 0 && (
              <div className={cn('grid gap-6', view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                {colleges.map((college, index) => (
                  <div key={college.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <CollegeCard college={college} variant={view === 'grid' ? 'featured' : 'default'} />
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
