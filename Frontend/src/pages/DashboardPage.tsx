import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Heart, Scale, Clock, Bell, Settings,
  MapPin, Star, ChevronRight, Sparkles,
} from 'lucide-react';
import { Button, Card, Avatar, CardSkeleton, useToast } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { collegePath } from '../utils/paths';
import { userService } from '../services/userService';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../contexts/WishlistContext';
import type { CollegeWithSlug } from '../services/collegeService';

export function DashboardPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { colleges: savedColleges, count: savedCount } = useWishlist();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedColleges, setRecommendedColleges] = useState<CollegeWithSlug[]>([]);
  const [stats, setStats] = useState({ savedCollegesCount: 0, compareCount: 0, wishlistCount: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; description: string; timestamp: string }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      userService.getDashboard(),
      searchService.getRecent().catch(() => [] as string[]),
    ])
      .then(([dashboard, recent]) => {
        setRecommendedColleges(dashboard.recommendedColleges);
        setStats(dashboard.stats);
        setRecentActivity(dashboard.recentActivity ?? []);
        setRecentSearches(recent);
      })
      .catch(() => {
        setRecommendedColleges([]);
        setRecentSearches([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleNotifications = () => {
    if (recentActivity.length === 0) {
      addToast({ type: 'info', title: 'Notifications', description: 'No new notifications' });
      return;
    }
    const latest = recentActivity[0];
    addToast({
      type: 'info',
      title: 'Recent Activity',
      description: latest.description,
    });
  };

  const displaySaved = savedColleges.slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CardSkeleton className="h-24 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton className="h-48" />
            <CardSkeleton className="h-48" />
          </div>
          <CardSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-display-sm font-heading font-semibold text-primary mb-2">
                Welcome back, {firstName}
              </h1>
              <p className="text-body text-muted">
                Here's what's happening with your college search
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2.5 relative"
                onClick={handleNotifications}
              >
                <Bell className="w-5 h-5" />
                {recentActivity.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full" />
                )}
              </Button>
              <Avatar fallback={initials} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* AI Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-heading-lg font-semibold text-primary">AI Recommendations</h2>
                    <p className="text-body-xs text-muted">Personalized picks for you</p>
                  </div>
                </div>
                <Link to="/colleges">
                  <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {recommendedColleges.length === 0 ? (
                  <p className="text-body-sm text-muted md:col-span-2">
                    No recommendations yet. Update your preferences in settings or explore colleges to get personalized picks.
                  </p>
                ) : (
                  recommendedColleges.slice(0, 2).map((college, index) => (
                  <Link
                    key={college.id}
                    to={collegePath(college)}
                    className="group flex items-start gap-4 p-5 bg-surface rounded-2xl border border-border hover:border-accent/30 transition-all"
                  >
                    <ImageWithFallback
                      src={college.logo}
                      alt={`${college.shortName} logo`}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors">
                          {college.shortName}
                        </h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full shrink-0">
                          <Sparkles className="w-3 h-3 text-success" />
                          <span className="text-body-xs font-medium text-success">
                            {98 - index * 5}% Match
                          </span>
                        </div>
                      </div>
                      <p className="text-body-xs text-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {college.location.city}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-body-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          {college.rating}
                        </span>
                        <span>#{college.ranking.national} NIRF</span>
                        <span>{college.placementRate}% Placement</span>
                      </div>
                    </div>
                  </Link>
                  ))
                )}
              </div>
            </section>

            {/* Saved Colleges */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h2 className="text-heading-lg font-semibold text-primary">Saved Colleges</h2>
                    <p className="text-body-xs text-muted">{savedCount || stats.savedCollegesCount} colleges saved</p>
                  </div>
                </div>
                <Link to="/saved">
                  <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                    View All
                  </Button>
                </Link>
              </div>

              {displaySaved.length === 0 ? (
                <p className="text-body-sm text-muted">No saved colleges yet. Browse colleges to save your favorites.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {displaySaved.map((college) => (
                    <Link
                      key={college.id}
                      to={collegePath(college)}
                      className="group flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-accent/30 transition-all"
                    >
                      <ImageWithFallback
                        src={college.logo}
                        alt={`${college.shortName} campus`}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-sm font-semibold text-primary group-hover:text-accent transition-colors truncate">
                          {college.shortName}
                        </h3>
                        <p className="text-body-xs text-muted">{college.location.city}</p>
                      </div>
                      <Heart className="w-4 h-4 text-error fill-error shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Compare History */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-heading-lg font-semibold text-primary">Compare History</h2>
                    <p className="text-body-xs text-muted">Recent comparisons</p>
                  </div>
                </div>
                <Link to="/compare">
                  <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                    Compare
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border text-body-sm text-muted">
                {stats.compareCount > 0
                  ? `You have ${stats.compareCount} comparison${stats.compareCount !== 1 ? 's' : ''} saved.`
                  : 'No comparisons yet. Start comparing colleges to see your history here.'}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <h3 className="text-heading-sm font-semibold text-primary mb-4">Your Activity</h3>
              <div className="space-y-4">
                {[
                  { icon: Heart, label: 'Saved Colleges', value: String(savedCount || stats.savedCollegesCount) },
                  { icon: Scale, label: 'Comparisons', value: String(stats.compareCount) },
                  { icon: Search, label: 'Searches', value: String(recentSearches.length) },
                  { icon: Clock, label: 'Last Active', value: 'Today' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-4 h-4 text-muted" />
                      <span className="text-body-sm text-muted">{stat.label}</span>
                    </div>
                    <span className="text-body-sm font-medium text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Searches */}
            <Card>
              <h3 className="text-heading-sm font-semibold text-primary mb-4">Recent Searches</h3>
              {recentSearches.length === 0 ? (
                <p className="text-body-sm text-muted">No recent searches yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <Link
                      key={index}
                      to={`/colleges?q=${encodeURIComponent(search)}`}
                      className="flex items-center gap-3 p-3 bg-background rounded-lg text-body-sm text-muted hover:text-primary transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      {search}
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-heading-sm font-semibold text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/colleges">
                  <Button variant="outline" fullWidth icon={<Search className="w-4 h-4" />}>
                    Search Colleges
                  </Button>
                </Link>
                <Link to="/compare">
                  <Button variant="outline" fullWidth icon={<Scale className="w-4 h-4" />}>
                    Compare Colleges
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" fullWidth icon={<Settings className="w-4 h-4" />}>
                    Account Settings
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
