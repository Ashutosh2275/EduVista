import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { CollegeCard } from '../components/features/CollegeCard';
import { Badge, Button, EmptyState, CardSkeleton } from '../components/ui';
import { useWishlist } from '../contexts/WishlistContext';

export function SavedCollegesPage() {
  const navigate = useNavigate();
  const { colleges, isLoading } = useWishlist();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Badge variant="accent" size="lg" className="mb-4">Wishlist</Badge>
          <h1 className="text-display-md font-heading font-semibold text-primary mb-4">My Wishlist</h1>
          <p className="text-body text-muted">Colleges you've bookmarked for later review.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} className="h-80" />
            ))}
          </div>
        )}

        {!isLoading && colleges.length === 0 && (
          <EmptyState
            icon={<Heart className="w-8 h-8" />}
            title="No saved colleges yet"
            description="Browse colleges and tap the bookmark icon to save them here."
            action={{ label: 'Explore Colleges', onClick: () => navigate('/colleges') }}
          />
        )}

        {!isLoading && colleges.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} variant="featured" />
            ))}
          </div>
        )}

        {!isLoading && colleges.length > 0 && (
          <div className="flex justify-center mt-12">
            <Link to="/compare">
              <Button>Compare Saved Colleges</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
