import { useEffect, useState } from 'react';
import { Input, Button, useToast } from '../ui';
import { adminService } from '../../services/adminService';
import type { SystemSettingsData } from '../../types/admin';
import { ApiClientError } from '../../api/types';

export function SettingsForm() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    setIsLoading(true);
    adminService
      .getSettings()
      .then((data) => {
        setSettings(data);
        setKeywords((data.seo?.keywords ?? []).join(', '));
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load settings' }))
      .finally(() => setIsLoading(false));
  }, [addToast]);

  const updateGeneral = (key: keyof SystemSettingsData['general'], value: string | boolean) => {
    setSettings((prev) =>
      prev ? { ...prev, general: { ...prev.general, [key]: value } } : prev
    );
  };

  const updateSeo = (key: keyof SystemSettingsData['seo'], value: string) => {
    setSettings((prev) =>
      prev ? { ...prev, seo: { ...prev.seo, [key]: value } } : prev
    );
  };

  const updateContact = (key: keyof SystemSettingsData['contact'], value: string) => {
    setSettings((prev) =>
      prev ? { ...prev, contact: { ...prev.contact, [key]: value } } : prev
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    const payload = {
      general: settings.general,
      seo: {
        ...settings.seo,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      },
      contact: settings.contact,
    };
    try {
      await adminService.updateSettings(payload);
      addToast({ type: 'success', title: 'Settings saved to MongoDB' });
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Save failed.';
      addToast({ type: 'error', title: 'Save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <p className="text-body-sm text-muted">Loading settings...</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="p-6 bg-surface rounded-2xl border border-border space-y-4">
        <h3 className="text-heading-md font-semibold text-primary">General</h3>
        <Input
          label="Platform Name"
          value={settings.general.platformName}
          onChange={(e) => updateGeneral('platformName', e.target.value)}
          fullWidth
        />
        <label className="flex items-center gap-2 text-body-sm text-primary">
          <input
            type="checkbox"
            checked={settings.general.maintenanceMode}
            onChange={(e) => updateGeneral('maintenanceMode', e.target.checked)}
          />
          Maintenance Mode
        </label>
        <label className="flex items-center gap-2 text-body-sm text-primary">
          <input
            type="checkbox"
            checked={settings.general.allowRegistrations}
            onChange={(e) => updateGeneral('allowRegistrations', e.target.checked)}
          />
          Allow New Registrations
        </label>
      </section>

      <section className="p-6 bg-surface rounded-2xl border border-border space-y-4">
        <h3 className="text-heading-md font-semibold text-primary">Contact</h3>
        <Input label="Support Email" value={settings.contact.supportEmail} onChange={(e) => updateContact('supportEmail', e.target.value)} fullWidth />
        <Input label="Support Phone" value={settings.contact.supportPhone} onChange={(e) => updateContact('supportPhone', e.target.value)} fullWidth />
        <Input label="Address" value={settings.contact.address ?? ''} onChange={(e) => updateContact('address', e.target.value)} fullWidth />
      </section>

      <section className="p-6 bg-surface rounded-2xl border border-border space-y-4">
        <h3 className="text-heading-md font-semibold text-primary">SEO</h3>
        <Input label="Meta Title" value={settings.seo.metaTitle} onChange={(e) => updateSeo('metaTitle', e.target.value)} fullWidth />
        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm font-medium text-primary">Meta Description</label>
          <textarea
            className="w-full min-h-20 px-4 py-3 bg-surface border border-border rounded-xl text-body-sm"
            value={settings.seo.metaDescription}
            onChange={(e) => updateSeo('metaDescription', e.target.value)}
          />
        </div>
        <Input label="Keywords (comma-separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} fullWidth />
      </section>

      <section className="p-6 bg-surface rounded-2xl border border-border space-y-2">
        <h3 className="text-heading-md font-semibold text-primary">Security & Email</h3>
        <p className="text-body-sm text-muted">
          JWT secrets, SMTP credentials, and rate limits are configured via backend environment variables (.env) for security.
        </p>
      </section>

      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
    </form>
  );
}
