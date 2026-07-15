'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useFundDetail, useFunds } from '@/hooks/useFunds';
import { useAuth }      from '@/hooks/useAuth';
import { useUiStore }   from '@/store/uiStore';
import { useOrgStore }  from '@/store/orgStore';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { reportsApi }   from '@/lib/api/reports.api';
import { Input }    from '@/components/ui/Input';
import { Button }   from '@/components/ui/Button';
import { Badge }    from '@/components/ui/Badge';
import { Avatar }   from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { PageLoader, CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNairaCompact, formatPeriod } from '@/lib/format';

/**
 * app/dashboard/funds/[id]/page.tsx — Fund overview.
 *
 * The treasury view of one offering: how much came in this period,
 * what is available to disburse, and exactly who gave.
 *
 *   GET /funds/:id                    → fund meta
 *   GET /dashboard/fund-breakdown     → period totals for this fund
 *   GET /dashboard/member-status      → giver list for this fund
 *   GET .../reports/giving?format=csv → fund-filtered export
 *
 * Editing the fund configuration is ADMIN-only (the backend enforces
 * this on PATCH/DELETE /funds/:id) — treasurers get a read-only view.
 */
export default function FundDetailPage() {
  const { id }   = useParams();
  const fundId   = id as string;
  const router   = useRouter();
  const { success, error } = useToast();
  const { isTreasurer } = useAuth();
  const org      = useOrgStore();
  const { activePeriod } = useUiStore();

  const { fund, isLoading } = useFundDetail(fundId);
  const { updateFund, deactivateFund } = useFunds();
  const [loading, setLoading] = useState(false);

  // Period totals for this fund — same source as the dashboard panel
  const { data: breakdown, isLoading: breakdownLoading } = useSWR(
    ['dashboard/fund-breakdown', activePeriod],
    () => dashboardApi.fundBreakdown(activePeriod),
    { revalidateOnFocus: true },
  );
  const stats = breakdown?.find((f) => f.fund_type_id === fundId);

  const memberTracked = !!fund && !fund.is_shared_va && !(stats?.is_anonymous_only ?? false);

  // Giver list — only fetched for member-tracked funds (expensive query)
  const { data: memberStatus, isLoading: giversLoading } = useSWR(
    memberTracked ? ['dashboard/member-status', activePeriod] : null,
    () => dashboardApi.memberStatus(activePeriod),
    { revalidateOnFocus: false },
  );

  const givers = useMemo(
    () => (memberStatus ?? [])
      .filter((m) => m.fund_type_id === fundId && m.transaction_count > 0)
      .sort((a, b) => Number(b.total_paid_kobo) - Number(a.total_paid_kobo)),
    [memberStatus, fundId],
  );
  const showExpected = givers.some((m) => m.expected_kobo != null);
  const giversTotal  = givers.reduce((s, m) => s + Number(m.total_paid_kobo), 0);

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
      await updateFund(fundId, {
        name:         form.name.trim(),
        description:  form.description || undefined,
        expected_amt: (!form.is_shared_va && form.expected_amt) ? Number(form.expected_amt) : undefined,
        expires_at:   form.expires_at   ? new Date(form.expires_at).toISOString() : undefined,
        sort_order:   Number(form.sort_order) || 0,
        is_shared_va: form.is_shared_va,
      });
      success('Fund updated');
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
        await deactivateFund(fundId);
        success('Fund deactivated');
      } else {
        await updateFund(fundId, { is_active: true });
        success('Fund reactivated');
      }
      router.push('/dashboard/funds');
    } catch (err: any) {
      error('Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!org.orgId) return;
    try {
      await reportsApi.downloadGiving(org.orgId, activePeriod, fundId);
    } catch (err: any) {
      error('Export failed', err.message);
    }
  };

  const DownloadIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 2v7M4 6l3 3 3-3M2 11h10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (isLoading) return <PageLoader message="Loading fund…" />;
  if (!fund) return null;

  const statCards = [
    {
      label: 'Collected',
      value: stats?.collected_display ?? formatNairaCompact(Number(stats?.total_collected_kobo ?? 0)),
      sub:   `${stats?.total_transactions ?? 0} payment${(stats?.total_transactions ?? 0) === 1 ? '' : 's'}`,
      color: 'text-green-700 dark:text-green-400',
    },
    {
      label: 'Available to disburse',
      value: stats?.available_display ?? formatNairaCompact(Number(stats?.available_kobo ?? 0)),
      sub:   Number(stats?.soft_lock_kobo ?? 0) > 0
        ? `${formatNairaCompact(Number(stats?.soft_lock_kobo))} held by pending payouts`
        : 'Nothing held',
      color: 'text-gray-900 dark:text-gray-100',
    },
    {
      label: 'Paid out',
      value: formatNairaCompact(Number(stats?.total_paid_out_kobo ?? 0)),
      sub:   'This period',
      color: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: 'Givers',
      value: memberTracked
        ? String(stats?.member_count_paid ?? 0)
        : `${stats?.total_transactions ?? 0} tx`,
      sub:   memberTracked
        ? `Fees ${stats?.fees_display ?? formatNairaCompact(Number(stats?.total_fees_kobo ?? 0))}`
        : fund.is_shared_va ? 'Collective — not tracked per member' : 'Anonymous — names never recorded',
      color: 'text-gray-900 dark:text-gray-100',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <Link href="/dashboard/funds" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fund types
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">{fund.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={fund.kind === 'CAMPAIGN' ? 'new' : 'default'} size="xs">{fund.kind}</Badge>
            <Badge status={fund.is_active ? 'PAID' : 'CANCELLED'} size="xs">
              {fund.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {fund.is_shared_va && <Badge variant="default" size="xs">Shared account</Badge>}
            <span className="text-xs text-gray-400 dark:text-gray-500">· {formatPeriod(activePeriod)}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" icon={<DownloadIcon />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Period stats */}
      {breakdownLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-soft">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{c.label}</p>
              <p className={`text-xl font-medium tracking-tight tabular-nums ${c.color}`}>{c.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

        {/* Giver list — who gave to this offering this period */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Who gave</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {formatPeriod(activePeriod)}
                {givers.length > 0 && ` · ${givers.length} member${givers.length === 1 ? '' : 's'} · ${formatNairaCompact(giversTotal)} total`}
              </p>
            </div>
          </div>

          {!memberTracked ? (
            <EmptyState
              compact
              className="py-10"
              title={fund.is_shared_va ? 'Collective giving' : 'Anonymous giving'}
              message={fund.is_shared_va
                ? 'This fund uses one shared account number for the whole church, so payments are tracked at the fund level — not per member.'
                : 'Names are deliberately never recorded for this fund.'}
            />
          ) : giversLoading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : givers.length === 0 ? (
            <EmptyState
              compact
              className="py-10"
              title="No giving yet"
              message={`No member payments recorded for ${fund.name} in ${formatPeriod(activePeriod)}.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Member', 'Payments', 'Given', ...(showExpected ? ['Expected', 'Status'] : [])].map((h) => (
                      <th key={h} className="text-left text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2.5 px-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {givers.map((m) => (
                    <tr key={m.member_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 px-4">
                        <Link href={`/dashboard/members/${m.member_id}`} className="flex items-center gap-2.5 group">
                          <Avatar name={m.member_name} size="sm" />
                          <span className="min-w-0">
                            <span className="block text-xs font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-green-700 dark:group-hover:text-green-400">
                              {m.member_name}
                            </span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-mono">{m.member_code}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{m.transaction_count}</td>
                      <td className="py-2.5 px-4 text-xs font-mono font-medium text-green-700 dark:text-green-400">
                        {m.total_paid_display ?? formatNairaCompact(Number(m.total_paid_kobo))}
                      </td>
                      {showExpected && (
                        <>
                          <td className="py-2.5 px-4 text-xs font-mono text-gray-500">
                            {m.expected_display ?? (m.expected_kobo != null ? formatNairaCompact(Number(m.expected_kobo)) : '—')}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge status={m.payment_status} size="xs" />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration — ADMIN edits, TREASURER reads */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Configuration</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            {isTreasurer
              ? 'Only an admin can change fund settings.'
              : 'Changes apply to new payments immediately.'}
          </p>

          {isTreasurer ? (
            <dl className="space-y-3 text-xs">
              {[
                ['Name',        fund.name],
                ['Description', fund.description || '—'],
                ['Monthly pledge', fund.expected_amt_kobo ? formatNairaCompact(Number(fund.expected_amt_kobo)) : 'None'],
                ['Account mode',   fund.is_shared_va ? 'Shared — one number for everyone' : 'Per-member accounts'],
                ['Ends',           fund.expires_at ? fund.expires_at.slice(0, 10) : 'No expiry'],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-3">
                  <dt className="text-gray-400 dark:text-gray-500">{k}</dt>
                  <dd className="text-gray-800 dark:text-gray-200 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
