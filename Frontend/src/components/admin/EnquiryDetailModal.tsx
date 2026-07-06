import { useEffect, useState } from 'react';
import { Modal, Button, Dropdown, useToast } from '../ui';
import { ENQUIRY_STATUSES } from '../../constants/admin';
import { adminService } from '../../services/adminService';
import type { AdminEnquiry } from '../../types/admin';
import { ApiClientError } from '../../api/types';

interface EnquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId?: string | null;
  onUpdated: () => void;
}

export function EnquiryDetailModal({ isOpen, onClose, enquiryId, onUpdated }: EnquiryDetailModalProps) {
  const { addToast } = useToast();
  const [enquiry, setEnquiry] = useState<AdminEnquiry | null>(null);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !enquiryId) return;
    setIsLoading(true);
    adminService
      .getEnquiryById(enquiryId)
      .then((data) => {
        setEnquiry(data);
        setStatus(data.status);
        setNotes(data.notes ?? '');
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load enquiry' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, enquiryId, addToast]);

  const handleSave = async () => {
    if (!enquiryId) return;
    setIsSaving(true);
    try {
      if (enquiry && status !== enquiry.status) {
        await adminService.updateEnquiryStatus(enquiryId, status);
      }
      if (notes.trim()) {
        await adminService.updateEnquiryNotes(enquiryId, notes.trim());
      }
      addToast({ type: 'success', title: 'Enquiry updated' });
      onUpdated();
      onClose();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Update failed.';
      addToast({ type: 'error', title: 'Save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!enquiryId || !window.confirm('Delete this enquiry permanently?')) return;
    try {
      await adminService.deleteEnquiry(enquiryId);
      addToast({ type: 'success', title: 'Enquiry deleted' });
      onUpdated();
      onClose();
    } catch {
      addToast({ type: 'error', title: 'Delete failed' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enquiry Details" size="lg">
      {isLoading ? (
        <p className="text-body-sm text-muted py-6 text-center">Loading...</p>
      ) : enquiry ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3 text-body-sm">
            <p><span className="text-muted">Name:</span> <span className="text-primary font-medium">{enquiry.name}</span></p>
            <p><span className="text-muted">Email:</span> {enquiry.email}</p>
            <p><span className="text-muted">Phone:</span> {enquiry.phone ?? '—'}</p>
            <p><span className="text-muted">Course:</span> {enquiry.interestedCourse ?? '—'}</p>
            <p><span className="text-muted">College:</span> {enquiry.college ?? '—'}</p>
            <p><span className="text-muted">Date:</span> {new Date(enquiry.createdAt).toLocaleString()}</p>
          </div>
          {enquiry.message && (
            <div className="p-4 bg-background rounded-xl text-body-sm text-primary">{enquiry.message}</div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Status</label>
            <Dropdown
              options={ENQUIRY_STATUSES.filter((s) => s.value).map((s) => ({ value: s.value, label: s.label }))}
              value={status}
              onChange={setStatus}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Reply / Notes</label>
            <textarea
              className="w-full min-h-24 px-4 py-3 bg-surface border border-border rounded-xl text-body-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add resolution notes or reply summary..."
            />
          </div>
          <div className="flex justify-between gap-3">
            <Button variant="outline" className="text-error border-error/30" onClick={handleDelete}>Delete</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
