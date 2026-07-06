import { useCallback, useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import {
  Badge, Button, SearchBar, Dropdown, Pagination, CardSkeleton, EmptyState, useToast,
} from '../ui';
import { adminService } from '../../services/adminService';
import { ENQUIRY_STATUSES } from '../../constants/admin';
import type { AdminEnquiry } from '../../types/admin';
import type { PaginationMeta } from '../../api/types';
import { EnquiryDetailModal } from './EnquiryDetailModal';
import { formatStatusLabel, getStatusBadgeVariant } from './adminUtils';

export function AdminEnquiriesSection() {
  const { addToast } = useToast();
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getEnquiriesPaginated({
        page,
        limit: 10,
        q: search || undefined,
        status: statusFilter || undefined,
      });
      setEnquiries(result.data);
      setPagination(result.pagination);
    } catch {
      setEnquiries([]);
      addToast({ type: 'error', title: 'Failed to load enquiries' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => { load(); }, [load]);

  const quickStatus = async (id: string, status: string) => {
    try {
      await adminService.updateEnquiryStatus(id, status);
      addToast({ type: 'success', title: 'Status updated' });
      load();
    } catch {
      addToast({ type: 'error', title: 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="max-w-md flex-1">
          <SearchBar placeholder="Search enquiries..." showButton={false} value={search} onChange={setSearch} onSearch={() => { setPage(1); load(); }} />
        </div>
        <Dropdown options={ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
      </div>

      {isLoading ? (
        <CardSkeleton className="h-64" />
      ) : enquiries.length === 0 ? (
        <EmptyState title="No enquiries" description="Student enquiries will appear here." />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Name</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Email</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Course</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Status</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Date</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((enquiry) => (
                <tr key={enquiry._id} className="hover:bg-background/50">
                  <td className="px-6 py-4 text-body-sm font-medium text-primary">{enquiry.name}</td>
                  <td className="px-6 py-4 text-body-sm text-muted">{enquiry.email}</td>
                  <td className="px-6 py-4 text-body-sm">{enquiry.interestedCourse ?? '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(enquiry.status)} size="sm">{formatStatusLabel(enquiry.status)}</Badge>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-muted">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => setDetailId(enquiry._id)}><Eye className="w-4 h-4" /></Button>
                      {enquiry.status === 'new' && (
                        <Button variant="outline" size="sm" onClick={() => quickStatus(enquiry._id, 'contacted')}>Mark Read</Button>
                      )}
                      {enquiry.status !== 'closed' && (
                        <Button variant="outline" size="sm" onClick={() => quickStatus(enquiry._id, 'closed')}>Close</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {pagination && (
            <div className="p-4 border-t border-border flex justify-center">
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <EnquiryDetailModal isOpen={Boolean(detailId)} onClose={() => setDetailId(null)} enquiryId={detailId} onUpdated={load} />
    </div>
  );
}
