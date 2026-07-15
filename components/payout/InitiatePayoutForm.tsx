'use client';
import * as React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BankLookupStep } from './BankLookupStep';
import { useToast } from '@/components/ui/Toast';
import { payoutsApi } from '@/lib/api/payouts.api';
import { revalidatePayoutData } from '@/hooks/usePayouts';
import { formatNaira } from '@/lib/format';
import { inputValueToKobo, koboToInputValue, fromKobo } from '@/lib/kobo';
import type { BankLookupResult, BankOption, PayoutFundBalance } from '@/lib/api/payouts.api';
import { cn } from '@/lib/cn';

interface InitiatePayoutFormProps {
  fundBalances:    PayoutFundBalance[];
  transferFeeKobo: number;
  banks:           BankOption[];
  onSuccess:       (payoutId: string) => void;
}

type FormStep = 'fund' | 'bank' | 'amount' | 'confirm';

const PURPOSE_MIN = 5;
const PURPOSE_MAX = 500;
const AMOUNT_MAX_KOBO = 100_000_000; // ₦1,000,000 — mirrors payout.validator.ts

export const InitiatePayoutForm: React.FC<InitiatePayoutFormProps> = ({
  fundBalances,
  transferFeeKobo,
  banks,
  onSuccess,
}) => {
  const { success } = useToast();

  const [step,     setStep]    = React.useState<FormStep>('fund');
  const [fundId,   setFundId]  = React.useState('');
  const [verified, setVerified] = React.useState<BankLookupResult | null>(null);
  const [amount,   setAmount]  = React.useState('');
  const [purpose,  setPurpose] = React.useState('');
  const [purposeTouched, setPurposeTouched] = React.useState(false);
  const [amountTouched,  setAmountTouched]  = React.useState(false);
  const [loading,  setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const selectedFund = fundBalances.find((f) => f.fund_type_id === fundId);
  const amountKobo   = inputValueToKobo(amount);

  // A fund is payable only if it can cover at least ₦1 + the transfer fee
  const canPayFrom = (f: PayoutFundBalance) => f.available_kobo > transferFeeKobo;

  const availableKobo   = selectedFund?.available_kobo ?? 0;
  const maxSendableKobo = Math.max(0, availableKobo - transferFeeKobo);

  const purposeTooShort = purpose.trim().length > 0 && purpose.trim().length < PURPOSE_MIN;
  const purposeError = purposeTouched && purposeTooShort
    ? `Enter at least ${PURPOSE_MIN} characters (${purpose.trim().length}/${PURPOSE_MIN})`
    : undefined;

  const amountTooHigh = amountKobo > AMOUNT_MAX_KOBO;
  const insufficient  = amountKobo > 0 && amountKobo + transferFeeKobo > availableKobo;
  const amountError = amountTouched && amountTooHigh
    ? `Amount cannot exceed ${formatNaira(AMOUNT_MAX_KOBO)} per request`
    : amountTouched && insufficient
      ? `Insufficient balance. ${selectedFund?.fund_name ?? 'This fund'} has ${formatNaira(availableKobo)} — `
        + `the most you can send is ${formatNaira(maxSendableKobo)} after the ${formatNaira(transferFeeKobo)} transfer fee.`
      : undefined;

  const amountStepValid = amountKobo > 0 && !amountTooHigh && !insufficient
    && purpose.trim().length >= PURPOSE_MIN && purpose.trim().length <= PURPOSE_MAX;

  const steps: FormStep[] = ['fund', 'bank', 'amount', 'confirm'];
  const stepIdx = steps.indexOf(step);

  const handleBankVerified = (result: BankLookupResult) => {
    setVerified(result);
    setStep('amount');
  };

  const handleSubmit = async () => {
    if (!fundId || !verified || !amountStepValid) return;

    setLoading(true);
    try {
      const result = await payoutsApi.initiate({
        fund_type_id:   fundId,
        bank_code:      verified.bankCode,
        account_number: verified.accountNumber,
        account_name:   verified.accountName,
        amount:         fromKobo(amountKobo), // naira
        purpose:        purpose.trim(),
      });
      success('Payout initiated', 'Approval emails have been sent to your signatories.');
      // Refresh balances/badges NOW — the soft-lock just changed what's
      // available, and waiting for the 30s poll leaves other tabs stale
      void revalidatePayoutData();
      onSuccess(result.payoutRequestId);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Something went wrong while initiating the payout.');
    } finally {
      setLoading(false);
    }
  };

  // ── Failure screen — replaces the form when the backend rejects the payout ──
  if (submitError) {
    return (
      <div className="py-4 text-center space-y-4 animate-fade-in" role="alert">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Payout failed</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">No money has left your funds.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 text-xs text-red-700 dark:text-red-300 text-left">
          {submitError}
        </div>
        <div className="space-y-2">
          <Button fullWidth onClick={() => { setSubmitError(null); setStep('amount'); }}>
            Edit and try again
          </Button>
          <Link
            href="/dashboard/payouts"
            className="block text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1"
          >
            Back to payouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0',
              i <= stepIdx
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
            )}>
              {i < stepIdx ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px',
                i < stepIdx ? 'bg-green-700' : 'bg-gray-100 dark:bg-gray-800',
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Fund — cards with available balance, not a blind dropdown */}
      {step === 'fund' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Which fund is this payout coming from? Balances shown are available to disburse now.
          </p>
          <div className="space-y-2" role="radiogroup" aria-label="Fund">
            {fundBalances.map((f) => {
              const selected = f.fund_type_id === fundId;
              const payable  = canPayFrom(f);
              return (
                <button
                  key={f.fund_type_id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!payable}
                  onClick={() => setFundId(f.fund_type_id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors',
                    selected
                      ? 'border-green-700 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-700'
                      : 'border-gray-200 dark:border-gray-700',
                    payable
                      ? 'hover:border-green-600 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {f.fund_name}
                      </span>
                      {f.kind === 'CAMPAIGN' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          Campaign
                        </span>
                      )}
                    </div>
                    {!payable && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Not enough to cover the {formatNaira(transferFeeKobo)} transfer fee
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn(
                      'text-sm font-medium tabular-nums',
                      payable ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400',
                    )}>
                      {formatNaira(f.available_kobo)}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">available</div>
                  </div>
                </button>
              );
            })}
            {fundBalances.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                No active funds yet — create a fund type first.
              </p>
            )}
          </div>
          <Button fullWidth disabled={!fundId || !selectedFund || !canPayFrom(selectedFund)} onClick={() => setStep('bank')}>
            Next — destination bank →
          </Button>
        </div>
      )}

      {/* Step 2: Bank lookup */}
      {step === 'bank' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter the destination bank account. We'll verify the account name before proceeding.
          </p>
          <BankLookupStep banks={banks} onVerified={handleBankVerified} />
          <Button variant="ghost" size="sm" onClick={() => setStep('fund')}>← Back</Button>
        </div>
      )}

      {/* Step 3: Amount + purpose */}
      {step === 'amount' && (
        <div className="space-y-4">
          {verified && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl p-3.5 text-xs text-green-700 dark:text-green-300">
              Sending to: <strong>{verified.accountName}</strong> · {verified.bankName}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              {selectedFund?.fund_name}: <strong className="text-gray-900 dark:text-gray-100 tabular-nums">{formatNaira(availableKobo)}</strong> available
            </span>
            <button
              type="button"
              className="text-green-700 dark:text-green-400 font-medium hover:underline"
              onClick={() => { setAmount(koboToInputValue(maxSendableKobo)); setAmountTouched(true); }}
            >
              Send max ({formatNaira(maxSendableKobo)})
            </button>
          </div>
          <Input
            label="Amount (₦)"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            onBlur={() => setAmountTouched(true)}
            placeholder="e.g. 500000"
            prefix="₦"
            error={amountError}
            hint={!amountError && amountKobo > 0 ? `= ${formatNaira(amountKobo)}` : undefined}
          />
          <Input
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value.slice(0, PURPOSE_MAX))}
            onBlur={() => setPurposeTouched(true)}
            placeholder="e.g. Roof contractor payment — phase 2"
            error={purposeError}
            hint={purposeError ? undefined : 'Shown to signatories in the approval email'}
          />
          {amountKobo > 0 && !amountTooHigh && !insufficient && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-400 dark:text-gray-500">Transfer fee</span>
                <span className="text-gray-900 dark:text-gray-100 tabular-nums">{formatNaira(transferFeeKobo)}</span>
              </div>
              <div className="flex justify-between gap-3 font-medium">
                <span className="text-gray-500 dark:text-gray-400">Total deducted from {selectedFund?.fund_name ?? 'fund'}</span>
                <span className="text-gray-900 dark:text-gray-100 tabular-nums">{formatNaira(amountKobo + transferFeeKobo)}</span>
              </div>
            </div>
          )}
          <Button
            fullWidth
            disabled={!amountStepValid}
            onClick={() => { setAmountTouched(true); setPurposeTouched(true); setStep('confirm'); }}
          >
            Review payout →
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep('bank')}>← Back</Button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payout summary</p>
            {[
              ['Fund',                selectedFund?.fund_name ?? fundId],
              ['Amount',              formatNaira(amountKobo)],
              ['Transfer fee',        formatNaira(transferFeeKobo)],
              ['Total deducted',      formatNaira(amountKobo + transferFeeKobo)],
              ['Fund balance after',  formatNaira(Math.max(0, availableKobo - amountKobo - transferFeeKobo))],
              ['To',                  `${verified?.accountName} · ${verified?.bankName}`],
              ['Account',             verified?.accountNumber ?? ''],
              ['Purpose',             purpose],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-xs">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">{k}</span>
                <span className={cn(
                  'text-gray-900 dark:text-gray-100 text-right',
                  k === 'Total deducted' && 'font-medium',
                )}>{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
            ⚠️ This will send approval emails to your signatories. The transfer only happens after the required number approve.
          </div>
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Submit payout request
          </Button>
          <Button variant="ghost" size="sm" disabled={loading} onClick={() => setStep('amount')}>← Edit</Button>
        </div>
      )}
    </div>
  );
};
