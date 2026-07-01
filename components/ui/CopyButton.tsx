'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

interface CopyButtonProps {
  text:        string;           // the value to copy
  label?:      string;           // button text
  successLabel?: string;         // text after copy
  size?:       'sm' | 'md';
  variant?:    'icon' | 'text' | 'both';
  className?:  string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label        = 'Copy',
  successLabel = 'Copied!',
  size         = 'sm',
  variant      = 'both',
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left     = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CopyIcon = () => (
    <svg
      className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      {copied ? (
        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
      ) : (
        <path d="M3.5 2A1.5 1.5 0 002 3.5v8A1.5 1.5 0 003.5 13h3v-1.5h-3a.5.5 0 01-.5-.5v-8a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4H10V3.5A1.5 1.5 0 008.5 2h-5zm4 3A1.5 1.5 0 006 6.5v6A1.5 1.5 0 007.5 14h5a1.5 1.5 0 001.5-1.5v-6A1.5 1.5 0 0012.5 5h-5zm-.5 1.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v6a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-6z"/>
      )}
    </svg>
  );

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        'transition-colors duration-150 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-green-700',
        size === 'sm' ? 'text-xs px-2 py-1.5' : 'text-sm px-2.5 py-2',
        copied
          ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950'
          : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        className,
      )}
      aria-label={copied ? successLabel : `Copy ${text}`}
    >
      {(variant === 'icon' || variant === 'both') && <CopyIcon />}
      {(variant === 'text' || variant === 'both') && (
        <span>{copied ? successLabel : label}</span>
      )}
    </button>
  );
};

// ── Account Number Display — NUBAN with copy button ───────────────────────────

interface AccountDisplayProps {
  accountNumber: string;
  bankName:      string;
  label?:        string;
  className?:    string;
}

export const AccountDisplay: React.FC<AccountDisplayProps> = ({
  accountNumber,
  bankName,
  label     = 'Your account number',
  className,
}) => {
  // Format: 0123 456 789
  const formatted = accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

  return (
    <div
      className={cn(
        'rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900/50',
        'p-4',
        className,
      )}
    >
      <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-medium tracking-[0.15em] text-green-800 dark:text-green-300 mb-1 font-mono">
        {formatted}
      </p>
      <p className="text-xs text-green-600 dark:text-green-500 mb-3">
        {bankName} · Transfer from any Nigerian bank
      </p>
      <CopyButton
        text={accountNumber}
        label="Copy account number"
        successLabel="Copied!"
        size="sm"
        variant="both"
      />
    </div>
  );
};