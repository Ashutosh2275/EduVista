import { useEffect, useState } from 'react';
import { Modal, Input, Button, Dropdown, useToast } from '../ui';
import { COLLEGE_CATEGORIES } from '../../constants/admin';
import { adminService } from '../../services/adminService';
import type { ApiCollege } from '../../api/mappers/collegeMapper';
import { ApiClientError } from '../../api/types';

interface CollegeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId?: string | null;
  onSaved: () => void;
}

const defaultForm = {
  name: '',
  category: 'engineering',
  collegeType: 'public',
  ownership: 'Government',
  description: '',
  city: '',
  state: '',
  startingFees: '',
  accreditation: '',
  naacGrade: '',
  nirfRanking: '',
  placementPercentage: '',
  averagePackage: '',
  highestPackage: '',
  logo: '',
  banner: '',
  gallery: '',
  status: 'published',
};

export function CollegeFormModal({ isOpen, onClose, collegeId, onSaved }: CollegeFormModalProps) {
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(collegeId);

  useEffect(() => {
    if (!isOpen) return;

    if (!collegeId) {
      setForm(defaultForm);
      return;
    }

    setIsLoading(true);
    adminService
      .getCollegeById(collegeId)
      .then((college: ApiCollege) => {
        setForm({
          name: college.name ?? '',
          category: college.category ?? 'engineering',
          collegeType: college.collegeType ?? 'public',
          ownership: college.ownership ?? 'Government',
          description: college.description ?? college.shortDescription ?? '',
          city: college.location?.city ?? '',
          state: college.location?.state ?? '',
          startingFees: String(college.fees?.startingFees ?? ''),
          accreditation: (college.accreditation ?? []).join(', '),
          naacGrade: college.naacGrade ?? '',
          nirfRanking: String(college.nirfRanking ?? ''),
          placementPercentage: String(college.placements?.placementPercentage ?? ''),
          averagePackage: String(college.placements?.averagePackage ?? ''),
          highestPackage: String(college.placements?.highestPackage ?? ''),
          logo: college.logo ?? '',
          banner: college.banner ?? '',
          gallery: (college.galleryImages ?? []).join('\n'),
          status: college.status ?? 'published',
        });
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load college' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, collegeId, addToast]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      collegeType: form.collegeType,
      ownership: form.ownership,
      description: form.description.trim(),
      shortDescription: form.description.trim(),
      status: form.status,
      location: { city: form.city.trim(), state: form.state.trim(), country: 'India' },
      fees: { startingFees: Number(form.startingFees) || 0 },
      accreditation: form.accreditation
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      naacGrade: form.naacGrade.trim() || undefined,
      nirfRanking: form.nirfRanking ? Number(form.nirfRanking) : undefined,
      placements: {
        placementPercentage: Number(form.placementPercentage) || 0,
        averagePackage: Number(form.averagePackage) || 0,
        highestPackage: Number(form.highestPackage) || 0,
      },
      logo: form.logo.trim() || undefined,
      banner: form.banner.trim() || undefined,
      galleryImages: form.gallery
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit && collegeId) {
        await adminService.updateCollege(collegeId, payload);
        addToast({ type: 'success', title: 'College updated' });
      } else {
        await adminService.createCollege(payload);
        addToast({ type: 'success', title: 'College created' });
      }
      onSaved();
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Failed to save college.';
      addToast({ type: 'error', title: 'Save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit College' : 'Add College'}
      description="College details are saved directly to MongoDB."
      size="xl"
    >
      {isLoading ? (
        <p className="text-body-sm text-muted py-8 text-center">Loading college...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="College Name *" value={form.name} onChange={(e) => update('name', e.target.value)} required fullWidth />
            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-primary">Category *</label>
              <Dropdown
                options={COLLEGE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                value={form.category}
                onChange={(v) => update('category', v)}
                placeholder="Select category"
              />
            </div>
            <Input label="City *" value={form.city} onChange={(e) => update('city', e.target.value)} required fullWidth />
            <Input label="State *" value={form.state} onChange={(e) => update('state', e.target.value)} required fullWidth />
            <Input label="Starting Fees (INR)" type="number" value={form.startingFees} onChange={(e) => update('startingFees', e.target.value)} fullWidth />
            <Input label="Accreditation" value={form.accreditation} onChange={(e) => update('accreditation', e.target.value)} placeholder="NAAC, NBA" fullWidth />
            <Input label="NAAC Grade" value={form.naacGrade} onChange={(e) => update('naacGrade', e.target.value)} fullWidth />
            <Input label="NIRF Ranking" type="number" value={form.nirfRanking} onChange={(e) => update('nirfRanking', e.target.value)} fullWidth />
            <Input label="Placement %" type="number" value={form.placementPercentage} onChange={(e) => update('placementPercentage', e.target.value)} fullWidth />
            <Input label="Avg Package (LPA)" type="number" value={form.averagePackage} onChange={(e) => update('averagePackage', e.target.value)} fullWidth />
            <Input label="Highest Package (LPA)" type="number" value={form.highestPackage} onChange={(e) => update('highestPackage', e.target.value)} fullWidth />
            <Input label="Logo URL" value={form.logo} onChange={(e) => update('logo', e.target.value)} fullWidth />
            <Input label="Banner URL" value={form.banner} onChange={(e) => update('banner', e.target.value)} fullWidth />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Description</label>
            <textarea
              className="w-full min-h-24 px-4 py-3 bg-surface border border-border rounded-xl text-body-sm text-primary outline-none focus:border-accent/50"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-primary">Gallery Image URLs (one per line)</label>
            <textarea
              className="w-full min-h-20 px-4 py-3 bg-surface border border-border rounded-xl text-body-sm text-primary outline-none focus:border-accent/50"
              value={form.gallery}
              onChange={(e) => update('gallery', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : isEdit ? 'Update College' : 'Create College'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
