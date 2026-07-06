import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CollegeCard } from './CollegeCard';
import { Button, CardSkeleton } from '../ui';
import { collegeService } from '../../services/collegeService';
import type { CollegeWithSlug } from '../../services/collegeService';

export function FeaturedColleges() {
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    collegeService
      .getFeatured(3)
      .then(setColleges)
      .catch(() => setColleges([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-body-sm font-medium text-accent mb-2">Featured Institutions</p>
            <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary">
              Top-Ranked Colleges
            </h2>
          </div>
          <Link to="/colleges">
            <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              View All Colleges
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} className="h-80" />
            ))}
          {!isLoading &&
            colleges.map((college, index) => (
              <div
                key={college.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CollegeCard college={college} variant="featured" showMatchScore={index === 0} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
