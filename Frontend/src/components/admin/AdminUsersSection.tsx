import { useCallback, useEffect, useState } from 'react';
import { Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import {
  Badge, Button, SearchBar, Dropdown, Pagination, CardSkeleton, EmptyState, useToast,
} from '../ui';
import { adminService } from '../../services/adminService';
import { USER_ROLES } from '../../constants/admin';
import type { AdminUser } from '../../types/admin';
import type { PaginationMeta } from '../../api/types';
import { UserFormModal } from './UserFormModal';

export function AdminUsersSection() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getUsersPaginated({
        page,
        limit: 10,
        q: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch {
      setUsers([]);
      addToast({ type: 'error', title: 'Failed to load users' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, addToast]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user: AdminUser) => {
    try {
      await adminService.setUserStatus(user._id, !user.isActive);
      addToast({ type: 'success', title: user.isActive ? 'User deactivated' : 'User activated' });
      load();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await adminService.deleteUser(id);
      addToast({ type: 'success', title: 'User deactivated' });
      load();
    } catch {
      addToast({ type: 'error', title: 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="max-w-md flex-1">
          <SearchBar placeholder="Search users..." showButton={false} value={search} onChange={setSearch} onSearch={() => { setPage(1); load(); }} />
        </div>
        <Dropdown options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))} value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }} />
      </div>

      {isLoading ? (
        <CardSkeleton className="h-64" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Name</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Email</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Role</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Status</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Joined</th>
                <th className="px-6 py-3 text-body-xs text-muted text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-background/50">
                  <td className="px-6 py-4 text-body-sm font-medium text-primary">{user.name}</td>
                  <td className="px-6 py-4 text-body-sm text-muted">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'ADMIN' ? 'accent' : 'outline'} size="sm">{user.role === 'ADMIN' ? 'Admin' : 'Student'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? 'success' : 'warning'} size="sm">{user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => setEditId(user._id)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => toggleActive(user)}>
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 text-error" onClick={() => deleteUser(user._id)}><Trash2 className="w-4 h-4" /></Button>
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

      <UserFormModal isOpen={Boolean(editId)} onClose={() => setEditId(null)} userId={editId} onSaved={load} />
    </div>
  );
}
