import { useEffect, useState } from 'react';
import { collegeService } from '../../services/collegeService';
import type { CollegeWithSlug } from '../../services/collegeService';
import { ImageWithFallback } from '../ui/ImageWithFallback';

export function TrustedUniversities() {
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);

  useEffect(() => {
    collegeService.getFeatured(8).then(setColleges).catch(() => setColleges([]));
  }, []);

  if (colleges.length === 0) return null;

  return (
    <section className="py-16 border-y border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-body-sm text-muted mb-8">
          Trusted by students from top institutions
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-12 gap-y-6">
          {colleges.map((college) => (
            <div
              key={college.id}
              className="opacity-60 hover:opacity-100 transition-opacity duration-300"
              title={college.name}
            >
              <ImageWithFallback
                src={college.logo}
                alt={`${college.shortName} logo`}
                className="h-12 w-12 object-cover rounded-xl shadow-soft"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
