import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, IndianRupee, ArrowRight, Bookmark, Scale, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge, useToast } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { collegePath } from '../../utils/paths';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../contexts/WishlistContext';
import { compareService } from '../../services/compareService';
import type { College } from '../../types';

interface CollegeCardProps {
  college: College;
  variant?: 'default' | 'featured' | 'compact';
  showMatchScore?: boolean;
  className?: string;
}

export function CollegeCard({
  college,
  variant = 'default',
  showMatchScore = false,
  className,
}: CollegeCardProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const [isBusy, setIsBusy] = useState(false);
  const saved = isSaved(college.id);

  const formatFees = (fees: { min: number; max: number }) => {
    const formatNumber = (num: number) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };
    return `${formatNumber(fees.min)} - ${formatNumber(fees.max)}`;
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Sign in required', description: 'Please log in to save colleges.' });
      navigate('/login');
      return;
    }
    setIsBusy(true);
    try {
      const isNowSaved = await toggle(college.id);
      addToast({
        type: 'success',
        title: isNowSaved ? 'College saved' : 'Removed from saved',
        description: college.shortName,
      });
    } catch {
      addToast({ type: 'error', title: 'Action failed', description: 'Could not update wishlist.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleCompare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Sign in required', description: 'Please log in to compare colleges.' });
      navigate('/login');
      return;
    }
    setIsBusy(true);
    try {
      const current = await compareService.getCompare();
      const ids = current.map((c) => c.id);
      if (!ids.includes(college.id)) {
        if (ids.length >= 3) {
          addToast({ type: 'warning', title: 'Compare limit', description: 'You can compare up to 3 colleges.' });
          return;
        }
        ids.push(college.id);
      }
      await compareService.saveCompare(ids);
      addToast({
        type: 'info',
        title: 'Added to compare',
        description: `${college.shortName} added to your comparison list.`,
      });
      navigate('/compare');
    } catch {
      addToast({ type: 'error', title: 'Action failed', description: 'Could not update compare list.' });
    } finally {
      setIsBusy(false);
    }
  };

  if (variant === 'featured') {
    return (
      <Link
        to={collegePath(college)}
        className={cn(
          'group block bg-surface rounded-3xl overflow-hidden shadow-soft border border-border',
          'transition-all duration-500 hover:shadow-large hover:-translate-y-1',
          className
        )}
      >
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={college.coverImage}
            alt={`${college.name} campus`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleBookmark}
              disabled={isBusy}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                saved ? 'bg-error text-white' : 'bg-surface/90 text-muted hover:text-error'
              )}
              aria-label={saved ? 'Remove from saved' : 'Save college'}
            >
              <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
            </button>
            <button
              onClick={handleCompare}
              disabled={isBusy}
              className="w-9 h-9 rounded-full bg-surface/90 text-muted hover:text-accent flex items-center justify-center transition-colors"
              aria-label="Add to compare"
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
          {showMatchScore && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-success/90 text-white rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-body-xs font-medium">95% Match</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4 mb-4">
            <ImageWithFallback
              src={college.logo}
              alt={`${college.shortName} logo`}
              className="w-12 h-12 rounded-xl object-cover shrink-0 -mt-10 border-2 border-surface shadow-soft"
            />
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors truncate">
                {college.shortName}
              </h3>
              <p className="text-body-xs text-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {college.location.city}, {college.location.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="accent" size="sm">#{college.ranking.national} NIRF</Badge>
            <Badge variant={college.type === 'public' ? 'success' : 'warning'} size="sm">
              {college.type}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div>
              <p className="text-body-xs text-muted">Rating</p>
              <p className="text-body-sm font-semibold text-primary flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                {college.rating}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-muted">Fees</p>
              <p className="text-body-sm font-semibold text-primary flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />
                {formatFees(college.fees)}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-muted">Placement</p>
              <p className="text-body-sm font-semibold text-success">{college.placementRate}%</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={collegePath(college)}
      className={cn(
        'group flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border',
        'transition-all duration-300 hover:border-accent/30 hover:shadow-soft',
        className
      )}
    >
      <ImageWithFallback
        src={college.logo}
        alt={`${college.shortName} logo`}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-heading-sm font-semibold text-primary group-hover:text-accent transition-colors truncate">
          {college.shortName}
        </h3>
        <p className="text-body-xs text-muted flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />
          {college.location.city}
        </p>
        <div className="flex items-center gap-3 mt-2 text-body-xs text-muted">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-warning text-warning" />
            {college.rating}
          </span>
          <span>#{college.ranking.national}</span>
          <span>{college.placementRate}%</span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" />
    </Link>
  );
}
