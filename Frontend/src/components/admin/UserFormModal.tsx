import { useEffect, useState } from 'react';
import { Modal, Input, Button, Dropdown, useToast } from '../ui';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../types/admin';
import { ApiClientError } from '../../api/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  onSaved: () => void;
}

const roleOptions = [
  { value: 'USER', label: 'Student' },
  { value: 'ADMIN', label: 'Admin' },
];

export function UserFormModal({ isOpen, onClose, userId, onSaved }: UserFormModalProps) {
  const { addToast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setIsLoading(true);
    adminService
      .getUserById(userId)
      .then((data) => {
        setUser(data);
        setName(data.name);
        setPhone(data.phone ?? '');
        setRole(data.role);
        setIsActive(data.isActive);
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load user' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, userId, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSaving(true);
    try {
      await adminService.updateUser(userId, { name: name.trim(), phone: phone.trim(), role: role as AdminUser['role'] });
      if (user && user.isActive !== isActive) {
        await adminService.setUserStatus(userId, isActive);
      }
      addToast({ type: 'success', title: 'User updated' });
      onSaved();
      onClose();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Update failed.';
      addToast({ type: 'error', title: 'Save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      {isLoading ? (
        <p className="text-body-sm text-muted py-6 text-center">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {user && (
            <div className="p-3 bg-background rounded-xl text-body-sm text-muted">
              <p><span className="text-primary font-medium">Email:</span> {user.email}</p>
              <p><span className="text-primary font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Role</label>
            <Dropdown options={roleOptions} value={role} onChange={setRole} />
          </div>
          <label className="flex items-center gap-2 text-body-sm text-primary">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active account
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
