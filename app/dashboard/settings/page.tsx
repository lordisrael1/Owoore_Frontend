'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrgStore } from '@/store/orgStore';
import { orgsApi }     from '@/lib/api/orgs.api';
import { Input }       from '@/components/ui/Input';
import { Button }      from '@/components/ui/Button';
import { useToast }    from '@/components/ui/Toast';
import { CopyButton }  from '@/components/ui/CopyButton';

/**
 * app/dashboard/settings/page.tsx — Church settings.
 * PATCH /orgs/:id (name, logo_url)
 */
export default function SettingsPage() {
  const org      = useOrgStore();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name:    '',
    logoUrl: '',
  });

  useEffect(() => {
    if (org.name) {
      setForm({ name: org.name ?? '', logoUrl: org.logoUrl ?? '' });
    }
  }, [org.name, org.logoUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org.orgId) return;
    setLoading(true);
    try {
      await orgsApi.update(org.orgId, {
        name: form.name.trim() || undefined,
      });
      org.updateName(form.name.trim());
      success('Settings saved');
    } catch (err: any) {
      error('Could not save', err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinLink = org.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://owoore.com'}/join/${org.slug}`
    : '';

  const giveLink = org.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://owoore.com'}/give/${org.slug}`
    : '';

  return (
    <div className="space-y-5 animate-fade-in max-w-lg">
      <div>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Church profile and sharing links</p>
      </div>

      {/* Church profile */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Church profile</h2>
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Input
            label="Church name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Grace Bible Church"
            required
          />
          <Input
            label="Logo URL — optional"
            value={form.logoUrl}
            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
            placeholder="https://yourchurch.org/logo.png"
            hint="A square PNG or JPG, at least 128×128px"
          />
          {form.logoUrl && (
            <div className="flex items-center gap-3">
              <img
                src={form.logoUrl}
                alt="Logo preview"
                className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <p className="text-xs text-gray-400">Logo preview</p>
            </div>
          )}
          <Button type="submit" size="sm" loading={loading}>Save changes</Button>
        </form>
      </div>

      {/* Sharing links */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Your links</h2>
        <div className="space-y-4">
          {[
            { label: 'Member join link', url: joinLink, desc: 'Share with members to let them register and get NUBANs' },
            { label: 'Anonymous giving (projector)', url: giveLink, desc: 'Show on screen during service — no login needed' },
          ].map(({ label, url, desc }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 truncate bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  {url}
                </p>
                <CopyButton text={url} size="sm" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team link */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team members</p>
          <p className="text-xs text-gray-400 mt-0.5">Invite treasurer or additional admins</p>
        </div>
        <Link href="/dashboard/settings/team">
          <Button variant="outline" size="sm">Manage team →</Button>
        </Link>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50 p-4">
        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Organisation ID</p>
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 break-all">{org.orgId}</p>
        <p className="text-[10px] text-gray-400 mt-1">Needed when contacting Owoore support</p>
      </div>
    </div>
  );
}