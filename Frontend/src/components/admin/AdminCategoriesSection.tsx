import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import { Badge, CardSkeleton, ErrorState } from '../ui';
import { adminService } from '../../services/adminService';
import type { CategoryStat } from '../../types/admin';

export function AdminCategoriesSection() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    adminService
      .getCategories()
      .then(setCategories)
      .catch(() => { setCategories([]); setHasError(true); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <CardSkeleton className="h-64" />;
  if (hasError) return <ErrorState action={{ label: 'Retry', onClick: () => window.location.reload() }} />;

  const totalColleges = categories.reduce((s, c) => s + c.collegeCount, 0);
  const totalCourses = categories.reduce((s, c) => s + c.courseCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-6 bg-surface rounded-2xl border border-border">
          <p className="text-body-sm text-muted">Total Categories</p>
          <p className="text-display-sm font-semibold text-primary">{categories.length}</p>
        </div>
        <div className="p-6 bg-surface rounded-2xl border border-border">
          <p className="text-body-sm text-muted">Colleges Assigned</p>
          <p className="text-display-sm font-semibold text-primary">{totalColleges}</p>
        </div>
        <div className="p-6 bg-surface rounded-2xl border border-border">
          <p className="text-body-sm text-muted">Courses Assigned</p>
          <p className="text-display-sm font-semibold text-primary">{totalCourses}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-6 bg-surface rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-md font-semibold text-primary">{cat.name}</h3>
              <Badge variant="accent" size="sm">{cat.id}</Badge>
            </div>
            <div className="flex items-center gap-6 text-body-sm text-muted">
              <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {cat.collegeCount} colleges</span>
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {cat.courseCount} courses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
