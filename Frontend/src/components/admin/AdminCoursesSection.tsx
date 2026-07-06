import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import {
  Badge, Button, SearchBar, Dropdown, Pagination, CardSkeleton, EmptyState, useToast,
} from '../ui';
import { adminService } from '../../services/adminService';
import { COLLEGE_STATUSES } from '../../constants/admin';
import type { ApiCourse } from '../../api/mappers/courseMapper';
import type { PaginationMeta } from '../../api/types';
import { CourseFormModal } from './CourseFormModal';
import { formatStatusLabel, getStatusBadgeVariant } from './adminUtils';

export function AdminCoursesSection() {
  const { addToast } = useToast();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getCoursesPaginated({
        page,
        limit: 10,
        q: search || undefined,
        status: statusFilter || undefined,
      });
      setCourses(result.data);
      setPagination(result.pagination);
    } catch {
      setCourses([]);
      addToast({ type: 'error', title: 'Failed to load courses' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (id: string, action: 'publish' | 'archive' | 'delete') => {
    try {
      if (action === 'publish') await adminService.publishCourse(id);
      else if (action === 'archive') await adminService.archiveCourse(id);
      else await adminService.deleteCourse(id);
      addToast({ type: 'success', title: `Course ${action === 'delete' ? 'deleted' : action + 'ed'}` });
      load();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-md flex-1">
          <SearchBar placeholder="Search courses..." showButton={false} value={search} onChange={setSearch} onSearch={() => { setPage(1); load(); }} />
        </div>
        <div className="flex items-center gap-3">
          <Dropdown options={COLLEGE_STATUSES.map((s) => ({ value: s.value, label: s.label }))} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditId(null); setModalOpen(true); }}>Add Course</Button>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton className="h-64" />
      ) : courses.length === 0 ? (
        <EmptyState title="No courses found" action={{ label: 'Add Course', onClick: () => setModalOpen(true) }} />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Course</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Stream</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Level</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Duration</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Status</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-background/50">
                  <td className="px-6 py-4 text-body-sm font-medium text-primary">{course.name}</td>
                  <td className="px-6 py-4 text-body-sm capitalize">{course.stream}</td>
                  <td className="px-6 py-4 text-body-sm">{course.degreeLevel}</td>
                  <td className="px-6 py-4 text-body-sm">{course.duration}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(course.status)} size="sm">{formatStatusLabel(course.status)}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => { setEditId(course._id); setModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      {course.status !== 'published' && (
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => runAction(course._id, 'publish')}><RotateCcw className="w-4 h-4" /></Button>
                      )}
                      {course.status !== 'archived' && (
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => runAction(course._id, 'archive')}><Archive className="w-4 h-4" /></Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => { if (window.confirm('Delete?')) runAction(course._id, 'delete'); }}><Trash2 className="w-4 h-4" /></Button>
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

      <CourseFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} courseId={editId} onSaved={load} />
    </div>
  );
}
