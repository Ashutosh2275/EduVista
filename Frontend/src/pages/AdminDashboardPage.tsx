import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, Mail, FolderTree,
  ArrowUpRight, Plus, Edit, Trash2, Eye, Download, Shield, UserPlus,
} from 'lucide-react';
import { mapApiColleges } from '../api/mappers/collegeMapper';
import { adminService } from '../services/adminService';
import { EXPORT_TYPES } from '../constants/admin';
import {
  Button, Badge, SearchBar, Dropdown, Avatar, Tabs, CardSkeleton, useToast, ErrorState, Pagination,
} from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { CollegeFormModal } from '../components/admin/CollegeFormModal';
import { TrendChart } from '../components/admin/TrendChart';
import { formatStatusLabel, getStatusBadgeVariant } from '../components/admin/adminUtils';
import type { ApiCollege } from '../api/mappers/collegeMapper';
import type { AdminAnalytics, AdminEnquiry, AdminUser, DashboardStats } from '../types/admin';
import type { CollegeWithSlug } from '../services/collegeService';

export function AdminDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeStatusFilter, setCollegeStatusFilter] = useState('');
  const [collegePage, setCollegePage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [recentColleges, setRecentColleges] = useState<CollegeWithSlug[]>([]);
  const [allColleges, setAllColleges] = useState<ApiCollege[]>([]);
  const [collegePagination, setCollegePagination] = useState<{ totalPages: number } | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<AdminEnquiry[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [exportType, setExportType] = useState('dashboard');
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [editCollegeId, setEditCollegeId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await adminService.getDashboard();
      setStats(data.stats);
      setRecentColleges(mapApiColleges(data.recents.colleges ?? []));
      setRecentEnquiries(data.recents.enquiries ?? []);
      setRecentUsers(data.recents.users ?? []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCollegesTab = useCallback(async () => {
    try {
      const result = await adminService.getCollegesPaginated({
        page: collegePage,
        limit: 10,
        q: collegeSearch || undefined,
        status: collegeStatusFilter || undefined,
      });
      setAllColleges(result.data);
      setCollegePagination(result.pagination);
    } catch {
      setAllColleges([]);
    }
  }, [collegePage, collegeSearch, collegeStatusFilter]);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadAnalytics();
  }, [loadDashboard, loadAnalytics]);

  useEffect(() => {
    if (activeTab === 'colleges') loadCollegesTab();
  }, [activeTab, loadCollegesTab]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await adminService.exportReport(exportType as typeof EXPORT_TYPES[number]['value']);
      addToast({ type: 'success', title: 'Report exported', description: 'CSV downloaded successfully.' });
    } catch {
      addToast({ type: 'error', title: 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const runCollegeAction = async (id: string, action: 'publish' | 'archive' | 'delete') => {
    try {
      if (action === 'publish') await adminService.publishCollege(id);
      else if (action === 'archive') await adminService.archiveCollege(id);
      else await adminService.deleteCollege(id);
      addToast({ type: 'success', title: `College ${action === 'delete' ? 'deleted' : action + 'ed'}` });
      loadDashboard();
      if (activeTab === 'colleges') loadCollegesTab();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'colleges', label: 'Colleges' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users },
        { label: 'Total Colleges', value: stats.totalColleges, icon: GraduationCap },
        { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen },
        { label: 'Total Categories', value: stats.totalCategories, icon: FolderTree },
        { label: 'Total Enquiries', value: stats.totalEnquiries, icon: Mail },
        { label: 'Active Users', value: stats.activeUsers, icon: UserPlus },
        { label: 'Admin Count', value: stats.adminCount, icon: Shield },
        { label: 'Student Count', value: stats.studentCount, icon: Users },
        { label: 'New Registrations', value: stats.newRegistrations, icon: ArrowUpRight, highlight: true },
      ]
    : [];

  const newEnquiries = recentEnquiries.filter((e) => e.status === 'new').length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CardSkeleton className="h-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} className="h-32" />
          ))}
        </div>
        <CardSkeleton className="h-64" />
      </div>
    );
  }

  if (hasError || !stats) {
    return <ErrorState title="Failed to load dashboard" action={{ label: 'Retry', onClick: loadDashboard }} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-heading font-semibold text-primary">Admin Dashboard</h1>
          <p className="text-body text-muted">Live data from MongoDB</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Dropdown
            options={EXPORT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={exportType}
            onChange={setExportType}
            placeholder="Export type"
          />
          <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditCollegeId(null); setCollegeModalOpen(true); }}>
            Add College
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-2xl p-6 border border-border shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-accent" />
              </div>
              {'highlight' in stat && stat.highlight && (
                <div className="flex items-center gap-1 text-body-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                  <ArrowUpRight className="w-3 h-3" /> 30 days
                </div>
              )}
            </div>
            <p className="text-display-sm font-heading font-semibold text-primary">{stat.value.toLocaleString()}</p>
            <p className="text-body-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-lg font-semibold text-primary">Recent Colleges</h2>
              <Link to="/admin/colleges"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-body-xs text-muted text-left">College</th>
                    <th className="px-6 py-3 text-body-xs text-muted text-left">Category</th>
                    <th className="px-6 py-3 text-body-xs text-muted text-left">Status</th>
                    <th className="px-6 py-3 text-body-xs text-muted text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentColleges.slice(0, 5).map((college) => (
                    <tr key={college.id} className="hover:bg-background/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback src={college.logo} alt={college.shortName} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-body-sm font-medium text-primary">{college.shortName}</p>
                            <p className="text-body-xs text-muted">{college.location.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-sm capitalize">{college.category}</td>
                      <td className="px-6 py-4"><Badge variant="success" size="sm">published</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link to={`/colleges/${college.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => { setEditCollegeId(college.id); setCollegeModalOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => { if (window.confirm('Delete?')) runCollegeAction(college.id, 'delete'); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-2xl border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-heading-md font-semibold text-primary">Recent Enquiries</h2>
                {newEnquiries > 0 && <Badge variant="warning" size="sm">{newEnquiries} New</Badge>}
              </div>
              <div className="p-6 space-y-4">
                {recentEnquiries.length === 0 ? (
                  <p className="text-body-sm text-muted">No recent enquiries.</p>
                ) : (
                  recentEnquiries.map((enquiry) => (
                    <div key={enquiry._id} className="flex items-start gap-3">
                      <Avatar fallback={enquiry.name.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-body-sm font-medium text-primary truncate">{enquiry.name}</p>
                          <Badge variant={getStatusBadgeVariant(enquiry.status)} size="sm">{formatStatusLabel(enquiry.status)}</Badge>
                        </div>
                        <p className="text-body-xs text-muted truncate">{enquiry.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-heading-md font-semibold text-primary">Recent Users</h2>
              </div>
              <div className="p-6 space-y-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3">
                    <Avatar fallback={user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-primary truncate">{user.name}</p>
                      <p className="text-body-xs text-muted">{user.role} · {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'colleges' && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md flex-1">
                <SearchBar placeholder="Search colleges..." showButton={false} value={collegeSearch} onChange={setCollegeSearch} onSearch={() => { setCollegePage(1); loadCollegesTab(); }} />
              </div>
              <Dropdown
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={collegeStatusFilter}
                onChange={(v) => { setCollegeStatusFilter(v); setCollegePage(1); }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-body-xs text-muted text-left">College</th>
                  <th className="px-6 py-3 text-body-xs text-muted text-left">Location</th>
                  <th className="px-6 py-3 text-body-xs text-muted text-left">Rating</th>
                  <th className="px-6 py-3 text-body-xs text-muted text-left">Status</th>
                  <th className="px-6 py-3 text-body-xs text-muted text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allColleges.map((college) => (
                  <tr key={college._id} className="hover:bg-background/50">
                    <td className="px-6 py-4 text-body-sm font-medium text-primary">{college.name}</td>
                    <td className="px-6 py-4 text-body-sm text-muted">{college.location.city}, {college.location.state}</td>
                    <td className="px-6 py-4 text-body-sm">{college.rating ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(college.status)} size="sm">{formatStatusLabel(college.status)}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => { setEditCollegeId(college._id); setCollegeModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => { if (window.confirm('Delete?')) runCollegeAction(college._id, 'delete'); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {collegePagination && collegePagination.totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-center">
              <Pagination currentPage={collegePage} totalPages={collegePagination.totalPages} onPageChange={setCollegePage} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TrendChart title="Monthly Registrations" data={analytics.trends.monthlyRegistrations} />
            <TrendChart title="Monthly Enquiries" data={analytics.trends.monthlyEnquiries} />
            <TrendChart title="Colleges Added" data={analytics.trends.monthlyColleges} />
          </div>
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <h3 className="text-heading-md font-semibold text-primary mb-4">Course Distribution</h3>
            <div className="space-y-3">
              {analytics.courseDistribution.map((item) => {
                const max = Math.max(...analytics.courseDistribution.map((d) => d.count), 1);
                return (
                  <div key={item.stream} className="flex items-center gap-4">
                    <span className="text-body-sm capitalize w-28 text-muted">{item.stream}</span>
                    <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
                    </div>
                    <span className="text-body-sm font-medium text-primary w-8">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <CollegeFormModal
        isOpen={collegeModalOpen}
        onClose={() => setCollegeModalOpen(false)}
        collegeId={editCollegeId}
        onSaved={() => { loadDashboard(); loadCollegesTab(); }}
      />
    </div>
  );
}
