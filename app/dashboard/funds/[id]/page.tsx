'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFundDetail, useFunds } from '@/hooks/useFunds';
import { Input }    from '@/components/ui/Input';
import { Select }   from '@/components/ui/Select';
import { Button }   from '@/components/ui/Button';
import { Badge }    from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/format';

/**
 * app/dashboard/funds/[id]/page.tsx — Edit a fund type.
 * GET/PATCH/DELETE /funds/:id
 */
export default function EditFundPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const { fund, isLoading } = useFundDetail(id as string);
  const { updateFund, deactivateFund } = useFunds();
  const [loading,  setLoading]  = useState(false);

  const [form, setForm] = useState({
    name:         '',
    description:  '',
    expected_amt: '',
    expires_at:   '',
    sort_order:   '0',
    is_active:    true,
    is_shared_va: false,
  });

  useEffect(() => {
    if (fund) {
      setForm({
        name:         fund.name,
        description:  fund.description ?? '',
        expected_amt: fund.expected_amt_kobo ? String(Number(fund.expected_amt_kobo) / 100) : '',
        expires_at:   fund.expires_at ? fund.expires_at.slice(0, 10) : '',
        sort_order:   String(fund.sort_order),
        is_active:    fund.is_active,
        is_shared_va: fund.is_shared_va,
      });
    }
  }, [fund]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { error('Fund name is required'); return; }
    setLoading(true);
    try {
      await updateFund(id as string, {
        name:         form.name.trim(),
        description:  form.description || undefined,
        expected_amt: (!form.is_shared_va && form.expected_amt) ? Number(form.expected_amt) : undefined,
        expires_at:   form.expires_at   ? new Date(form.expires_at).toISOString() : undefined,
        sort_order:   Number(form.sort_order) || 0,
        is_shared_va: form.is_shared_va,
      });
      success('Fund updated');
      router.push('/dashboard/funds');
    } catch (err: any) {
      error('Update failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      if (fund?.is_active) {
        await deactivateFund(id as string);
        success('Fund deactivated');
      } else {
        await updateFund(id as string, { is_active: true });
        success('Fund reactivated');
      }
      router.push('/dashboard/funds');
    } catch (err: any) {
      error('Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <PageLoader message="Loading fund…" />;
  if (!fund) return null;

  return (
    <div className="max-w-lg animate-fade-in">
      <Link href="/dashboard/funds" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fund types
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">{fund.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={fund.kind === 'CAMPAIGN' ? 'new' : 'default'} size="xs">{fund.kind}</Badge>
              <Badge status={fund.is_active ? 'PAID' : 'CANCELLED'} size="xs">
                {fund.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {fund.is_shared_va && (
                <Badge variant="default" size="xs">Shared account</Badge>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Input label="Fund name" value={form.name} onChange={set('name')} required />

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
                One account number for the whole church instead of one per member.
                Money is still tracked at the fund level, but not attributed to individual givers.
              </span>
            </span>
          </label>

          {!form.is_shared_va && (
            <Input label="Monthly pledge (₦) — optional" type="number" value={form.expected_amt} onChange={set('expected_amt')} prefix="₦" />
          )}
          <Input label="Description" value={form.description} onChange={set('description')} />
          {fund.kind === 'CAMPAIGN' && (
            <Input label="End date" type="date" value={form.expires_at} onChange={set('expires_at')} />
          )}
          <Input label="Sort order" type="number" value={form.sort_order} onChange={set('sort_order')} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Save changes</Button>
            <Button
              type="button"
              variant={fund.is_active ? 'danger' : 'success'}
              onClick={handleToggleActive}
              loading={loading}
            >
              {fund.is_active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}