'use client';
import * as React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface ActivityItem {
  id:      string;
  type:    'payment' | 'payout' | 'member' | 'campaign' | 'system';
  title:   string;
  desc:    string;
  time:    string;
  unread?: boolean;
}

const icons: Record<ActivityItem['type'], React.ReactNode> = {
  payment:  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M2 7l3 3 7-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  payout:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  member:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="5" r="2.5"/><path d="M2 12c0-2.21 2.239-4 5-4" strokeLinecap="round"/><path d="M10 9.5v3M8.5 11h3" strokeLinecap="round"/></svg>,
  campaign: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M7 2l1.5 3H12l-2.75 2 1 3.5L7 9l-3.25 1.5 1-3.5L2 5h3.5L7 2z" strokeLinejoin="round"/></svg>,
  system:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l1.5 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const iconBg: Record<ActivityItem['type'], string> = {
  payment:  'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  payout:   'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  member:   'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  campaign: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  system:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

interface ActivityFeedProps {
  items?:    ActivityItem[];
  loading?:  boolean;
}

/** How many items the feed shows before folding the rest behind "Show more". */
const COLLAPSED_COUNT = 6;

// Dot colors for the type-preview inside the Show-more button — same hues
// as the item icons so the mapping reads instantly
const dotColor: Record<ActivityItem['type'], string> = {
  payment:  'bg-green-500',
  payout:   'bg-amber-500',
  member:   'bg-blue-500',
  campaign: 'bg-purple-500',
  system:   'bg-gray-400',
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  loading = false,
}) => {
  const data = items ?? [];

  const [expanded, setExpanded] = React.useState(false);
  const hiddenItems  = data.slice(COLLAPSED_COUNT);
  const visibleItems = expanded ? data : data.slice(0, COLLAPSED_COUNT);
  const hasMore      = hiddenItems.length > 0;
  // One dot per event type hidden below the fold, in feed order
  const hiddenTypes  = [...new Set(hiddenItems.map((i) => i.type))];

  return (
    <Card>
      <CardHeader
        title="Activity feed"
        action={
          <button className="text-xs text-green-700 dark:text-green-400 hover:underline">
            Mark all read
          </button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-2.5 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0"/>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4"/>
                <div className="h-2.5 bg-gray-50 dark:bg-gray-800/50 rounded w-full"/>
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">No activity yet</p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Payments and events will appear here</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {visibleItems.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-2.5 py-2.5',
                    // Newly revealed rows ease in so the jump in card height reads as intentional
                    expanded && i >= COLLAPSED_COUNT && 'animate-fade-in',
                  )}
                >
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconBg[item.type])} aria-hidden="true">
                    {icons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{item.desc}</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5 font-mono">{formatTimeAgo(item.time)}</p>
                  </div>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5 animate-pulse" aria-label="Unread notification" />
                  )}
                </div>
              ))}
            </div>

            {/* Folded hint — last visible row fades out toward the button */}
            {hasMore && !expanded && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-white dark:from-gray-900 to-transparent"
                aria-hidden="true"
              />
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              className={cn(
                'mt-1 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium',
                'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700',
              )}
            >
              {expanded ? (
                <>Show less</>
              ) : (
                <>
                  {/* Type-preview dots: what kinds of events are folded away */}
                  <span className="flex items-center gap-1" aria-hidden="true">
                    {hiddenTypes.map((t) => (
                      <span key={t} className={cn('w-1.5 h-1.5 rounded-full', dotColor[t])} />
                    ))}
                  </span>
                  Show {hiddenItems.length} more
                </>
              )}
              <svg
                className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')}
                viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
              >
                <path d="M3.22 4.72a.75.75 0 011.06 0L6 6.44l1.72-1.72a.75.75 0 111.06 1.06L6.53 8.03a.75.75 0 01-1.06 0L3.22 5.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          )}
        </>
      )}
    </Card>
  );
};