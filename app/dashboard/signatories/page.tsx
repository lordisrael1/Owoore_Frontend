'use client';
import React, { useState } from 'react';
import { useSignatories } from '@/hooks/useSignatories';
import { Avatar }       from '@/components/ui/Avatar';
import { Badge }        from '@/components/ui/Badge';
import { Button }       from '@/components/ui/Button';
import { Input }        from '@/components/ui/Input';
import { Select }       from '@/components/ui/Select';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast }     from '@/components/ui/Toast';
import { PageLoader, CardSkeleton } from '@/components/ui/Spinner';
import { formatNairaCompact } from '@/lib/format';
import type { CreateSignatoryInput, UpdatePolicyInput } from '@/lib/api/signatories.api';

/**
 * app/dashboard/signatories/page.tsx — Payout signatories + approval policy.
 * GET /signatories, GET/PATCH /signatories/policy
 */

const ROLE_OPTIONS = [
  { value: 'PASTOR',   label: 'Pastor'   },
  { value: 'DEACON',   label: 'Deacon'   },
  { value: 'ELDER',    label: 'Elder'    },
  { value: 'TRUSTEE',  label: 'Trustee'  },
  { value: 'OTHER',    label: 'Other'    },
];

export default function SignatoriesPage() {
  const { success, error } = useToast();
  const {
    signatories, policy, isLoading,
    createSignatory, removeSignatory, updatePolicy,
  } = useSignatories();

  const [addOpen,     setAddOpen]     = useState(false);
  const [removeId,    setRemoveId]    = useState<string | null>(null);
  const [removeName,  setRemoveName]  = useState('');
  const [saving,      setSaving]      = useState(false);

  const [newForm, setNewForm] = useState<CreateSignatoryInput>({
    name: '', email: '', phone: '', role: 'PASTOR',
    can_initiate: false, can_approve: true,
  });

  const [policyForm, setPolicyForm] = useState({
    min_approvers:      String(policy?.min_approvers      ?? 2),
    threshold_kobo:     String(policy?.threshold_kobo     ? Number(policy.threshold_kobo) / 100 : 100000),
    token_expiry_hours: String(policy?.token_expiry_hours ?? 48),
    auto_decline_hours: String(policy?.auto_decline_hours ?? 72),
  });

  React.useEffect(() => {
    if (policy) {
      setPolicyForm({
        min_approvers:      String(policy.min_approvers),
        threshold_kobo:     String(Number(policy.threshold_kobo) / 100),
        token_expiry_hours: String(policy.token_expiry_hours),
        auto_decline_hours: String(policy.auto_decline_hours),
      });
    }
  }, [policy]);

  const handleAddSignatory = async () => {
    if (!newForm.name || !newForm.email || !newForm.role) {
      error('Fill in name, email and role'); return;
    }
    setSaving(true);
    try {
      await createSignatory(newForm);
      success('Signatory added', `${newForm.name} will receive approval emails.`);
      setAddOpen(false);
      setNewForm({ name: '', email: '', phone: '', role: 'PASTOR', can_initiate: false, can_approve: true });
    } catch (err: any) {
      error('Could not add signatory', err.message);
    } finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (!removeId) return;
    setSaving(true);
    try {
      await removeSignatory(removeId);
      success('Signatory removed');
      setRemoveId(null);
    } catch (err: any) {
      error('Could not remove', err.message);
    } finally { setSaving(false); }
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    try {
      await updatePolicy({
        min_approvers:      Number(policyForm.min_approvers),
        threshold_kobo:     Number(policyForm.threshold_kobo) * 100,
        token_expiry_hours: Number(policyForm.token_expiry_hours),
        auto_decline_hours: Number(policyForm.auto_decline_hours),
      });
      success('Policy updated');
    } catch (err: any) {
      error('Could not update policy', err.message);
    } finally { setSaving(false); }
  };

  if (isLoading) return <PageLoader message="Loading signatories…" />;

  const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Signatories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Who approves payouts above ₦{formatNairaCompact(Number(policy?.threshold_kobo ?? 0))}
          </p>
        </div>
        <Button size="sm" icon={<PlusIcon />} onClick={() => setAddOpen(true)}>
          Add signatory
        </Button>
      </div>

      {/* Signatory list */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {signatories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No signatories yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your Pastor, Deacon, and Elders to enable payout governance.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {signatories.map((sig) => (
              <div key={sig.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={sig.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sig.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{sig.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" size="xs">{sig.role}</Badge>
                    {sig.can_approve  && <Badge variant="paid"    size="xs">Can approve</Badge>}
                    {sig.can_initiate && <Badge variant="new"     size="xs">Can initiate</Badge>}
                    {!sig.is_active   && <Badge variant="cancelled" size="xs">Inactive</Badge>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                  onClick={() => { setRemoveId(sig.id); setRemoveName(sig.name); }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval policy */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Payout approval policy</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Transfers above the threshold require multi-signatory approval.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Input
            label="Minimum approvers"
            type="number"
            value={policyForm.min_approvers}
            onChange={(e) => setPolicyForm((f) => ({ ...f, min_approvers: e.target.value }))}
            hint={`Out of ${signatories.filter(s => s.can_approve && s.is_active).length} active approvers`}
          />
          <Input
            label="Auto-approve threshold (₦)"
            type="number"
            value={policyForm.threshold_kobo}
            onChange={(e) => setPolicyForm((f) => ({ ...f, threshold_kobo: e.target.value }))}
            prefix="₦"
            hint="Below this → auto transfer. Above → needs approvals."
          />
          <Input
            label="Token expiry (hours)"
            type="number"
            value={policyForm.token_expiry_hours}
            onChange={(e) => setPolicyForm((f) => ({ ...f, token_expiry_hours: e.target.value }))}
            hint="How long approval links are valid"
          />
          <Input
            label="Auto-decline (hours)"
            type="number"
            value={policyForm.auto_decline_hours}
            onChange={(e) => setPolicyForm((f) => ({ ...f, auto_decline_hours: e.target.value }))}
            hint="Cancel request after this if no quorum"
          />
        </div>
        <Button size="sm" loading={saving} onClick={handleSavePolicy}>Save policy</Button>
      </div>

      {/* Add signatory modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add signatory"
        subtitle="They'll receive email approval links for payouts above threshold"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleAddSignatory}>Add signatory</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Full name" value={newForm.name} onChange={(e) => setNewForm(f => ({...f, name: e.target.value}))} placeholder="Pastor Emmanuel" required />
          <Input label="Email" type="email" value={newForm.email} onChange={(e) => setNewForm(f => ({...f, email: e.target.value}))} placeholder="pastor@church.org" required />
          <Input label="Phone (optional)" type="tel" value={newForm.phone ?? ''} onChange={(e) => setNewForm(f => ({...f, phone: e.target.value}))} placeholder="080..." />
          <Select label="Role" options={ROLE_OPTIONS} value={newForm.role} onChange={(v) => setNewForm(f => ({...f, role: v}))} />
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={newForm.can_approve} onChange={(e) => setNewForm(f => ({...f, can_approve: e.target.checked}))} className="rounded" />
              Can approve payouts
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={newForm.can_initiate} onChange={(e) => setNewForm(f => ({...f, can_initiate: e.target.checked}))} className="rounded" />
              Can initiate payouts
            </label>
          </div>
        </div>
      </Modal>

      {/* Confirm remove */}
      <ConfirmModal
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleRemove}
        loading={saving}
        title="Remove signatory"
        description={`Remove ${removeName} as a signatory? They'll no longer receive approval emails. Any pending payouts they haven't acted on will be unaffected.`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  );
}