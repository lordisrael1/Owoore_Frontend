'use client';
import * as React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { payoutsApi } from '@/lib/api/payouts.api';
import { cn } from '@/lib/cn';
import type { BankLookupResult, BankOption } from '@/lib/api/payouts.api';

interface BankLookupStepProps {
  banks:      BankOption[];
  onVerified: (result: BankLookupResult, bankAccountId: string) => void;
}

export const BankLookupStep: React.FC<BankLookupStepProps> = ({
  banks,
  onVerified,
}) => {
  const { error } = useToast();
  const [bankCode,  setBankCode]  = React.useState('');
  const [acctNum,   setAcctNum]   = React.useState('');
  const [looking,   setLooking]   = React.useState(false);
  const [verified,  setVerified]  = React.useState<BankLookupResult | null>(null);

  const canLookup = bankCode && acctNum.replace(/\s/g, '').length === 10 && !looking;

  const handleLookup = async () => {
    const clean = acctNum.replace(/\s/g, '');
    if (!bankCode || clean.length !== 10) return;

    setLooking(true);
    setVerified(null);
    try {
      const result = await payoutsApi.bankLookup(bankCode, clean);
      setVerified(result);
    } catch (err: any) {
      error('Account lookup failed', err.message ?? 'Check account number and try again');
    } finally {
      setLooking(false);
    }
  };

  const handleConfirm = () => {
    if (!verified) return;
    // bankAccountId would come from org's registered bank accounts
    // For payout flow, we use the verified result directly
    onVerified(verified, bankCode);
  };

  return (
    <div className="space-y-4">
      <Select
        label="Bank"
        options={banks}
        value={bankCode}
        onChange={setBankCode}
        placeholder="Select bank…"
        searchable
      />

      <div className="flex gap-2.5 items-end">
        <Input
          label="Account number"
          value={acctNum}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
            setAcctNum(v);
            if (verified) setVerified(null); // reset on change
          }}
          placeholder="10-digit NUBAN"
          hint="Enter the 10-digit bank account number"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="md"
          loading={looking}
          onClick={handleLookup}
          disabled={!canLookup}
          className="mb-0 shrink-0"
        >
          Verify
        </Button>
      </div>

      {/* Verified result */}
      {verified && (
        <div className={cn(
          'rounded-xl border p-4 space-y-3',
          'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
        )}>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 8l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-300">Account verified</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                {verified.accountName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {verified.bankName} · {verified.accountNumber}
              </p>
            </div>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-lg px-3 py-2">
            ⚠️ Confirm this is the correct recipient before proceeding. Transfers cannot be reversed.
          </p>
          <Button size="sm" fullWidth onClick={handleConfirm}>
            Confirm — this is correct
          </Button>
        </div>
      )}
    </div>
  );
};