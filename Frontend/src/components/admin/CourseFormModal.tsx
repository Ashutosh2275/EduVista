import { useEffect, useState } from 'react';
import { Modal, Input, Button, Dropdown, useToast } from '../ui';
import { COURSE_STREAMS } from '../../constants/admin';
import { adminService } from '../../services/adminService';
import type { ApiCourse } from '../../api/mappers/courseMapper';
import { ApiClientError } from '../../api/types';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string | null;
  onSaved: () => void;
}

const degreeOptions = [
  { value: 'UG', label: 'UG' },
  { value: 'PG', label: 'PG' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'PhD', label: 'PhD' },
];

const modeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'online', label: 'Online' },
];

const defaultForm = {
  name: '',
  stream: 'engineering',
  degreeLevel: 'UG',
  duration: '4 years',
  mode: 'full-time',
  tuitionFees: '',
  shortDescription: '',
  status: 'published',
};

export function CourseFormModal({ isOpen, onClose, courseId, onSaved }: CourseFormModalProps) {
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(courseId);

  useEffect(() => {
    if (!isOpen) return;
    if (!courseId) {
      setForm(defaultForm);
      return;
    }

    setIsLoading(true);
    adminService
      .getCourseById(courseId)
      .then((course: ApiCourse) => {
        setForm({
          name: course.name ?? '',
          stream: course.stream ?? 'engineering',
          degreeLevel: course.degreeLevel ?? 'UG',
          duration: course.duration ?? '4 years',
          mode: course.mode ?? 'full-time',
          tuitionFees: String(course.fees?.tuitionFees ?? ''),
          shortDescription: course.shortDescription ?? '',
          status: course.status ?? 'published',
        });
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load course' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, courseId, addToast]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      stream: form.stream,
      degreeLevel: form.degreeLevel,
      duration: form.duration.trim(),
      mode: form.mode,
      shortDescription: form.shortDescription.trim(),
      status: form.status,
      fees: { tuitionFees: Number(form.tuitionFees) || 0 },
    };

    try {
      if (isEdit && courseId) {
        await adminService.updateCourse(courseId, payload);
        addToast({ type: 'success', title: 'Course updated' });
      } else {
        await adminService.createCourse(payload);
        addToast({ type: 'success', title: 'Course created' });
      }
      onSaved();
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Failed to save course.';
      addToast({ type: 'error', title: 'Save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Course' : 'Add Course'}
      size="lg"
    >
      {isLoading ? (
        <p className="text-body-sm text-muted py-8 text-center">Loading course...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course Name *" value={form.name} onChange={(e) => update('name', e.target.value)} required fullWidth />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-primary">Stream *</label>
              <Dropdown options={COURSE_STREAMS.map((s) => ({ value: s.value, label: s.label }))} value={form.stream} onChange={(v) => update('stream', v)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-primary">Degree Level *</label>
              <Dropdown options={degreeOptions} value={form.degreeLevel} onChange={(v) => update('degreeLevel', v)} />
            </div>
            <Input label="Duration *" value={form.duration} onChange={(e) => update('duration', e.target.value)} fullWidth />
            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-primary">Mode *</label>
              <Dropdown options={modeOptions} value={form.mode} onChange={(v) => update('mode', v)} />
            </div>
            <Input label="Tuition Fees (INR)" type="number" value={form.tuitionFees} onChange={(e) => update('tuitionFees', e.target.value)} fullWidth />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Description</label>
            <textarea
              className="w-full min-h-20 px-4 py-3 bg-surface border border-border rounded-xl text-body-sm"
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
