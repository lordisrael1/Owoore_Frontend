import * as React from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant =
  | 'paid'       // green — payment complete
  | 'partial'    // amber — underpayment
  | 'unpaid'     // red — no payment
  | 'pending'    // amber — awaiting action
  | 'approved'   // green — payout approved
  | 'transferred'// blue — money moved
  | 'failed'     // red — transfer failed
  | 'cancelled'  // gray — manually cancelled
  | 'expired'    // gray — timed out
  | 'declined'   // red — signatory declined
  | 'new'        // blue — new item
  | 'default';   // gray — neutral

export type BadgeSize = 'xs' | 'sm';

const variantStyles: Record<BadgeVariant, string> = {
  paid:        'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  partial:     'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  unpaid:      'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  pending:     'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  approved:    'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  transferred: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  failed:      'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  cancelled:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  expired:     'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  declined:    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  new:         'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  default:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const dotStyles: Record<BadgeVariant, string> = {
  paid:        'bg-green-500',
  partial:     'bg-amber-500',
  unpaid:      'bg-red-500',
  pending:     'bg-amber-400',
  approved:    'bg-green-500',
  transferred: 'bg-blue-500',
  failed:      'bg-red-500',
  cancelled:   'bg-gray-400',
  expired:     'bg-gray-400',
  declined:    'bg-red-500',
  new:         'bg-blue-500',
  default:     'bg-gray-400',
};

// Maps PayoutStatus and payment_status strings to badge variants
const STATUS_MAP: Record<string, BadgeVariant> = {
  PAID:         'paid',
  PARTIAL:      'partial',
  UNPAID:       'unpaid',
  EXACT:        'paid',
  UNDERPAYMENT: 'partial',
  OVERPAYMENT:  'new',
  PENDING:      'pending',
  APPROVED:     'approved',
  TRANSFERRING: 'pending',
  TRANSFERRED:  'transferred',
  DECLINED:     'declined',
  EXPIRED:      'expired',
  FAILED:       'failed',
  CANCELLED:    'cancelled',
};

const LABELS: Partial<Record<string, string>> = {
  PAID:         'Paid ✓',
  PARTIAL:      'Partial',
  UNPAID:       'Unpaid',
  EXACT:        'Confirmed',
  UNDERPAYMENT: 'Short',
  OVERPAYMENT:  'Overpaid',
  PENDING:      'Pending',
  APPROVED:     'Approved',
  TRANSFERRING: 'Transferring',
  TRANSFERRED:  'Transferred',
  DECLINED:     'Declined',
  EXPIRED:      'Expired',
  FAILED:       'Failed',
  CANCELLED:    'Cancelled',
};

interface BadgeProps {
  variant?: BadgeVariant;
  /** Automatically resolve variant + label from a status string */
  status?: string;
  size?: BadgeSize;
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  size = 'sm',
  dot = false,
  children,
  className,
}) => {
  const resolvedVariant = variant ?? (status ? (STATUS_MAP[status] ?? 'default') : 'default');
  const label           = children ?? (status ? (LABELS[status] ?? status) : '');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border-0',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        variantStyles[resolvedVariant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[resolvedVariant])}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
};