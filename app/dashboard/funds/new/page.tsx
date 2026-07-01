'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFunds } from '@/hooks/useFunds';
import { Input }    from '@/components/ui/Input';
import { Select }   from '@/components/ui/Select';
import { Button }   from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn }       from '@/lib/cn';

/**
 * app/dashboard/funds/new/page.tsx — Create a new fund type.
 * POST /orgs/:orgId/funds
 */
export default function NewFundPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { createFund } = useFunds();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name:          '',
    kind:          'RECURRING' as 'RECURRING' | 'CAMPAIGN',
    description:   '',
    expected_amt:  '',
    expires_at:    '',
    sort_order:    '0',
    is_shared_va:  false,
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { error('Fund name is required'); return; }
    if (form.kind === 'CAMPAIGN' && !form.expires_at) {
      error('Campaign funds must have an end date'); return;
    }

    setLoading(true);
    try {
      await createFund({
        name:         form.name.trim(),
        kind:         form.kind,
        description:  form.description || undefined,
        expected_amt: (!form.is_shared_va && form.expected_amt) ? Number(form.expected_amt) : undefined,
        expires_at:   form.expires_at   ? new Date(form.expires_at).toISOString() : undefined,
        sort_order:   Number(form.sort_order) || 0,
        is_shared_va: form.is_shared_va,
      });
      success('Fund created', `"${form.name}" is now active.`);
      router.push('/dashboard/funds');
    } catch (err: any) {
      error('Could not create fund', err.message);
    } finally {
      setLoading(false);
    }
  };

  const kindOptions = [
    { value: 'RECURRING', label: 'Recurring — permanent (Tithe, Offering)' },
    { value: 'CAMPAIGN',  label: 'Campaign — time-limited (Building drive)' },
  ];

  return (
    <div className="max-w-lg animate-fade-in">
      <Link href="/dashboard/funds" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fund types
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">New fund type</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Each fund gets its own virtual account numbers for members.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Fund name" value={form.name} onChange={set('name')} placeholder="e.g. Tithe, Building Fund Drive 2026" required autoFocus />

          <Select
            label="Fund type"
            options={kindOptions}
            value={form.kind}
            onChange={(v) => setForm((f) => ({ ...f, kind: v as any }))}
          />

          {form.kind === 'CAMPAIGN' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
              Campaign funds expire on the end date — members can't pay to them after that.
            </div>
          )}

          <label className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_shared_va}
              onChange={(e) => setForm((f) => ({ ...f, is_shared_va: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700 shrink-0"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Shared account
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                One account number for the whole church (e.g. Offering) instead of one per member.
                Money is still tracked at the fund level, but not attributed to individual givers.
              </span>
            </span>
          </label>

          {!form.is_shared_va && (
            <Input
              label="Monthly pledge amount (₦) — optional"
              type="number"
              value={form.expected_amt}
              onChange={set('expected_amt')}
              placeholder="e.g. 50000"
              hint="If set, members see their progress toward this amount each month"
              prefix="₦"
            />
          )}

          <Input
            label="Description — optional"
            value={form.description}
            onChange={set('description')}
            placeholder="Brief description shown to members"
          />

          {form.kind === 'CAMPAIGN' && (
            <Input
              label="End date"
              type="date"
              value={form.expires_at}
              onChange={set('expires_at')}
              required={form.kind === 'CAMPAIGN'}
              hint="Fund deactivates automatically after this date"
            />
          )}

          <Input
            label="Sort order"
            type="number"
            value={form.sort_order}
            onChange={set('sort_order')}
            hint="Lower numbers appear first (0 = top)"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Create fund</Button>
            <Link href="/dashboard/funds">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}