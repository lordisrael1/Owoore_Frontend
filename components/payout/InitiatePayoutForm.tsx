'use client';
import * as React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BankLookupStep } from './BankLookupStep';
import { useToast } from '@/components/ui/Toast';
import { payoutsApi } from '@/lib/api/payouts.api';
import { formatNaira } from '@/lib/format';
import { inputValueToKobo, fromKobo } from '@/lib/kobo';
import type { FundType } from '@/lib/api/funds.api';
import type { BankLookupResult, BankOption } from '@/lib/api/payouts.api';
import { cn } from '@/lib/cn';

interface InitiatePayoutFormProps {
  funds:     FundType[];
  banks:     BankOption[];
  onSuccess: (payoutId: string) => void;
}

type FormStep = 'fund' | 'bank' | 'amount' | 'confirm';

export const InitiatePayoutForm: React.FC<InitiatePayoutFormProps> = ({
  funds,
  banks,
  onSuccess,
}) => {
  const { error, success } = useToast();

  const [step,     setStep]    = React.useState<FormStep>('fund');
  const [fundId,   setFundId]  = React.useState('');
  const [verified, setVerified] = React.useState<BankLookupResult | null>(null);
  const [amount,   setAmount]  = React.useState('');
  const [purpose,  setPurpose] = React.useState('');
  const [loading,  setLoading] = React.useState(false);

  const fundOptions = funds.map((f) => ({ label: f.name, value: f.id }));
  const selectedFund = funds.find((f) => f.id === fundId);
  const amountKobo = inputValueToKobo(amount);

  const steps: FormStep[] = ['fund', 'bank', 'amount', 'confirm'];
  const stepIdx = steps.indexOf(step);

  const handleBankVerified = (result: BankLookupResult) => {
    setVerified(result);
    setStep('amount');
  };

  const handleSubmit = async () => {
    if (!fundId || !verified || !amountKobo || !purpose.trim()) {
      error('Complete all fields');
      return;
    }

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
      onSuccess(result.payoutRequestId);
    } catch (err: any) {
      error('Payout failed', err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Step 1: Fund */}
      {step === 'fund' && (
        <div className="space-y-4">
          <Select
            label="Which fund?"
            options={fundOptions}
            value={fundId}
            onChange={setFundId}
            placeholder="Select a fund…"
          />
          <Button fullWidth disabled={!fundId} onClick={() => setStep('bank')}>
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
          <Input
            label="Amount (₦)"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="e.g. 500000"
            prefix="₦"
            hint={amountKobo > 0 ? `= ${formatNaira(amountKobo)}` : undefined}
          />
          <Input
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Roof contractor payment — phase 2"
            hint="Shown to signatories in the approval email"
          />
          <Button
            fullWidth
            disabled={!amountKobo || !purpose.trim()}
            onClick={() => setStep('confirm')}
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
              ['Fund',        selectedFund?.name ?? fundId],
              ['Amount',      formatNaira(amountKobo)],
              ['To',          `${verified?.accountName} · ${verified?.bankName}`],
              ['Account',     verified?.accountNumber ?? ''],
              ['Purpose',     purpose],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-xs">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">{k}</span>
                <span className="text-gray-900 dark:text-gray-100 text-right">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
            ⚠️ This will send approval emails to your signatories. The transfer only happens after the required number approve.
          </div>
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Submit payout request
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep('amount')}>← Edit</Button>
        </div>
      )}
    </div>
  );
};