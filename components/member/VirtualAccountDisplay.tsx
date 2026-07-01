'use client';
import * as React from 'react';
import { AccountDisplay, CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { VirtualAccount } from '@/lib/api/va.api';

interface VirtualAccountDisplayProps {
  va?:       VirtualAccount;
  fundName?: string;
  isShared?: boolean;
  loading?:  boolean;
  error?:    string;
  onRetry?:  () => void;
}

export const VirtualAccountDisplay: React.FC<VirtualAccountDisplayProps> = ({
  va,
  fundName,
  isShared = false,
  loading = false,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 p-5 flex items-center gap-3">
        <Spinner size="sm" color="green" />
        <p className="text-sm text-green-700 dark:text-green-400">
          Generating your account number…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs text-red-600 dark:text-red-400 underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!va) return null;

  return (
    <div className="space-y-3">
      <AccountDisplay
        accountNumber={va.va_number}
        bankName={va.bank_name}
        label={isShared ? `${fundName ?? ''} account (shared)` : `Your ${fundName ?? ''} account`}
      />

      {/* Shared account notice */}
      {isShared && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 text-xs text-blue-700 dark:text-blue-300">
          This account number is shared by everyone in the church — every member sees the same one.
          Your contribution still counts toward the fund total, but it isn't tracked under your name individually.
        </div>
      )}

      {/* How to use */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">How to pay</p>
        {[
          'Open your banking app (GTBank, OPay, Kuda, etc.)',
          'Transfer to the account number above',
          'You\'ll receive an email confirmation instantly',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{step}</p>
          </div>
        ))}
      </div>

      {/* Always same account note */}
      <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500">
        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M2 7l3 3 7-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        This account number is permanent — save it as a bank beneficiary to pay faster next time.
      </div>
    </div>
  );
};