import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

export interface ChecklistItem {
  id:       string;
  label:    string;
  done:     boolean;
  href?:    string;
  actionLabel?: string;
}

interface SetupChecklistProps {
  items:     ChecklistItem[];
  orgName?:  string;
  joinLink?: string;
}

export const SetupChecklist: React.FC<SetupChecklistProps> = ({
  items,
  orgName  = 'your church',
  joinLink,
}) => {
  const doneCount  = items.filter((i) => i.done).length;
  const allDone    = doneCount === items.length;
  const pct        = Math.round((doneCount / items.length) * 100);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
          {allDone ? `${orgName} is ready! 🎉` : `Set up ${orgName}`}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {allDone
            ? 'Your treasury is fully configured. Share your join link and you\'re live.'
            : `${doneCount} of ${items.length} steps complete`}
        </p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3.5 p-4 rounded-xl border transition-colors',
              item.done
                ? 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800',
            )}
          >
            {/* Checkbox */}
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2',
              item.done
                ? 'bg-green-600 border-green-600'
                : 'border-gray-200 dark:border-gray-700',
            )}>
              {item.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm',
                item.done
                  ? 'text-green-700 dark:text-green-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300',
              )}>
                {item.label}
              </p>
            </div>

            {/* Action */}
            {!item.done && item.href && (
              <Link href={item.href}>
                <Button size="xs" variant={i === items.findIndex((x) => !x.done) ? 'primary' : 'outline'}>
                  {item.actionLabel ?? 'Set up →'}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Join link when done */}
      {allDone && joinLink && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Your church join link</p>
          <p className="text-sm font-mono text-green-800 dark:text-green-200 break-all mb-3">{joinLink}</p>
          <Button size="sm" onClick={() => navigator.clipboard.writeText(joinLink)}>
            Copy join link
          </Button>
        </div>
      )}
    </div>
  );
};