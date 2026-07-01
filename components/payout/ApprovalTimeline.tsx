import * as React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface ApprovalStep {
  id:          string;
  signatoryName: string;
  role:        string;
  status:      'APPROVED' | 'DECLINED' | 'PENDING';
  actedAt?:    string;
  email?:      string;
}

interface ApprovalTimelineProps {
  steps:       ApprovalStep[];
  minApprovers: number;
  className?:  string;
}

const statusIcon: Record<ApprovalStep['status'], React.ReactNode> = {
  APPROVED: (
    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  DECLINED: (
    <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round"/>
    </svg>
  ),
  PENDING: (
    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 4v2.5l1.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const dotBg: Record<ApprovalStep['status'], string> = {
  APPROVED: 'bg-white dark:bg-gray-900 border-2 border-green-500',
  DECLINED: 'bg-white dark:bg-gray-900 border-2 border-red-500',
  PENDING:  'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700',
};

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  steps,
  minApprovers,
  className,
}) => {
  const approved = steps.filter((s) => s.status === 'APPROVED').length;

  return (
    <div className={cn('space-y-0', className)} role="list" aria-label="Approval timeline">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{approved} of {minApprovers} required approvals</span>
          <span>{Math.round((approved / minApprovers) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-[width] duration-700"
            style={{ width: `${Math.min(100, (approved / minApprovers) * 100)}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3" role="listitem">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10', dotBg[step.status])}>
                {statusIcon[step.status]}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 my-1" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar name={step.signatoryName} size="xs" />
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{step.signatoryName}</p>
                    <p className="text-[10px] text-gray-400">{step.role}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Badge status={step.status} size="xs" />
                  {step.actedAt && (
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{formatDateTime(step.actedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};