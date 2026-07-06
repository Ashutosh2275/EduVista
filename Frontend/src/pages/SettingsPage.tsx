import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, MapPin, IndianRupee } from 'lucide-react';
import { Button, Input, Badge, CardSkeleton, useToast } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

export function SettingsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [interestedFields, setInterestedFields] = useState('');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    userService
      .getProfile()
      .then((profile) => {
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone ?? '');
        setPreferredLocations(profile.preferences?.preferredLocations?.join(', ') ?? '');
        setInterestedFields(profile.preferences?.interestedFields?.join(', ') ?? '');
        setNotifications(profile.preferences?.notifications ?? true);
      })
      .catch(() => {
        addToast({ type: 'error', title: 'Failed to load profile', description: 'Please try again later.' });
      })
      .finally(() => setIsLoading(false));
  }, [addToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateProfile({
        name,
        phone: phone || undefined,
        preferences: {
          preferredLocations: preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
          interestedFields: interestedFields.split(',').map((s) => s.trim()).filter(Boolean),
          notifications,
        },
      });
      addToast({ type: 'success', title: 'Settings saved', description: 'Your preferences have been updated.' });
    } catch {
      addToast({ type: 'error', title: 'Save failed', description: 'Could not update your profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CardSkeleton className="h-24 mb-8" />
        <CardSkeleton className="h-64 mb-6" />
        <CardSkeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Badge variant="accent" size="lg" className="mb-4">Settings</Badge>
          <h1 className="text-display-sm font-heading font-semibold text-primary">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSave} className="space-y-8">
          <section className="bg-surface rounded-2xl p-6 border border-border space-y-5">
            <h2 className="text-heading-md font-semibold text-primary flex items-center gap-2">
              <User className="w-5 h-5 text-accent" /> Profile
            </h2>
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth disabled />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          </section>

          <section className="bg-surface rounded-2xl p-6 border border-border space-y-5">
            <h2 className="text-heading-md font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" /> Preferences
            </h2>
            <Input
              label="Preferred Locations"
              placeholder="Delhi, Mumbai, Bangalore"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              fullWidth
            />
            <Input
              label="Interested Fields"
              placeholder="Engineering, MBA"
              value={interestedFields}
              onChange={(e) => setInterestedFields(e.target.value)}
              fullWidth
              icon={<IndianRupee className="w-4 h-4" />}
            />
          </section>

          <section className="bg-surface rounded-2xl p-6 border border-border">
            <h2 className="text-heading-md font-semibold text-primary flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-accent" /> Notifications
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent"
              />
              <span className="text-body-sm text-primary">Email me about new college matches and insights</span>
            </label>
          </section>

          <div className="flex items-center gap-4">
            <Button type="submit" loading={isSaving}>Save Changes</Button>
            <Link to="/dashboard">
              <Button variant="outline" type="button">Back to Dashboard</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
