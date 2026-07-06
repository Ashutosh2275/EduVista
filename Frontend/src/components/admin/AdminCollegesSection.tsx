import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Archive, Upload, RotateCcw } from 'lucide-react';
import {
  Badge, Button, SearchBar, Dropdown, Pagination, CardSkeleton, EmptyState, useToast,
} from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { adminService } from '../../services/adminService';
import { COLLEGE_STATUSES } from '../../constants/admin';
import type { ApiCollege } from '../../api/mappers/collegeMapper';
import type { PaginationMeta } from '../../api/types';
import { CollegeFormModal } from './CollegeFormModal';
import { formatStatusLabel, getStatusBadgeVariant } from './adminUtils';

export function AdminCollegesSection() {
  const { addToast } = useToast();
  const [colleges, setColleges] = useState<ApiCollege[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getCollegesPaginated({
        page,
        limit: 10,
        q: search || undefined,
        status: statusFilter || undefined,
      });
      setColleges(result.data);
      setPagination(result.pagination);
    } catch {
      setColleges([]);
      setPagination(null);
      addToast({ type: 'error', title: 'Failed to load colleges' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === colleges.length) setSelected(new Set());
    else setSelected(new Set(colleges.map((c) => c._id)));
  };

  const runAction = async (id: string, action: 'publish' | 'archive' | 'delete') => {
    try {
      if (action === 'publish') await adminService.publishCollege(id);
      else if (action === 'archive') await adminService.archiveCollege(id);
      else await adminService.deleteCollege(id);
      addToast({ type: 'success', title: `College ${action === 'delete' ? 'deleted' : action + 'ed'}` });
      load();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    }
  };

  const runBulk = async (action: 'publish' | 'archive' | 'delete') => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => {
        if (action === 'publish') return adminService.publishCollege(id);
        if (action === 'archive') return adminService.archiveCollege(id);
        return adminService.deleteCollege(id);
      }));
      addToast({ type: 'success', title: `Bulk ${action} completed` });
      setSelected(new Set());
      load();
    } catch {
      addToast({ type: 'error', title: 'Bulk action failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-md flex-1">
          <SearchBar
            placeholder="Search colleges..."
            showButton={false}
            value={search}
            onChange={setSearch}
            onSearch={() => { setPage(1); load(); }}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Dropdown
            options={COLLEGE_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            placeholder="Filter status"
          />
          {selected.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => runBulk('publish')}>Publish ({selected.size})</Button>
              <Button variant="outline" size="sm" onClick={() => runBulk('archive')}>Archive ({selected.size})</Button>
              <Button variant="outline" size="sm" className="text-error" onClick={() => runBulk('delete')}>Delete ({selected.size})</Button>
            </>
          )}
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditId(null); setModalOpen(true); }}>
            Add College
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton className="h-64" />
      ) : colleges.length === 0 ? (
        <EmptyState title="No colleges found" description="Try adjusting search or filters." action={{ label: 'Add College', onClick: () => setModalOpen(true) }} />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selected.size === colleges.length && colleges.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">College</th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">Location</th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">Category</th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">Rating</th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">Status</th>
                  <th className="px-6 py-3 text-body-xs font-medium text-muted text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {colleges.map((college) => (
                  <tr key={college._id} className="hover:bg-background/50">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(college._id)} onChange={() => toggleSelect(college._id)} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={college.logo} alt={college.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-body-sm font-medium text-primary">{college.name}</p>
                          <p className="text-body-xs text-muted capitalize">{college.collegeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-muted">{college.location.city}, {college.location.state}</td>
                    <td className="px-6 py-4 text-body-sm capitalize">{college.category}</td>
                    <td className="px-6 py-4 text-body-sm">{college.rating ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(college.status)} size="sm">{formatStatusLabel(college.status)}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/colleges/${college.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => { setEditId(college._id); setModalOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {college.status !== 'published' && (
                          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => runAction(college._id, 'publish')} title="Publish / Restore">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        {college.status !== 'archived' && (
                          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => runAction(college._id, 'archive')}>
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        {college.status === 'published' && (
                          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => runAction(college._id, 'publish')} title="Publish">
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => { if (window.confirm('Delete permanently?')) runAction(college._id, 'delete'); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      <CollegeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        collegeId={editId}
        onSaved={load}
      />
    </div>
  );
}
