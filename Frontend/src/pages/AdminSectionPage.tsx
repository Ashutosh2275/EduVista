import { Badge } from '../components/ui';
import { AdminCollegesSection } from '../components/admin/AdminCollegesSection';
import { AdminCoursesSection } from '../components/admin/AdminCoursesSection';
import { AdminCategoriesSection } from '../components/admin/AdminCategoriesSection';
import { AdminEnquiriesSection } from '../components/admin/AdminEnquiriesSection';
import { AdminUsersSection } from '../components/admin/AdminUsersSection';
import { SettingsForm } from '../components/admin/SettingsForm';

interface AdminSectionPageProps {
  title: string;
  description: string;
  type: 'colleges' | 'courses' | 'categories' | 'enquiries' | 'users' | 'settings';
}

export function AdminSectionPage({ title, description, type }: AdminSectionPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="accent" size="md" className="mb-3">Admin</Badge>
        <h2 className="text-display-sm font-heading font-semibold text-primary mb-2">{title}</h2>
        <p className="text-body text-muted">{description}</p>
      </div>

      {type === 'colleges' && <AdminCollegesSection />}
      {type === 'courses' && <AdminCoursesSection />}
      {type === 'categories' && <AdminCategoriesSection />}
      {type === 'enquiries' && <AdminEnquiriesSection />}
      {type === 'users' && <AdminUsersSection />}
      {type === 'settings' && <SettingsForm />}
    </div>
  );
}
