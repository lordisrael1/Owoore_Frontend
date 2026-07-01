'use client';
import * as React from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

interface JoinLinkShareProps {
  joinLink: string;
  orgName?: string;
}

const SharePlatform: React.FC<{
  label:   string;
  icon:    React.ReactNode;
  color:   string;
  onClick: () => void;
}> = ({ label, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800',
      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      'text-xs text-gray-600 dark:text-gray-400',
    )}
  >
    <span className={cn('text-2xl', color)}>{icon}</span>
    {label}
  </button>
);

export const JoinLinkShare: React.FC<JoinLinkShareProps> = ({
  joinLink,
  orgName = 'our church',
}) => {
  const { success } = useToast();

  const whatsAppMsg = encodeURIComponent(
    `Join ${orgName} on Owoore to give tithes and offerings digitally.\n\nGet your personal account number here:\n${joinLink}`,
  );

  const whatsAppUrl = `https://wa.me/?text=${whatsAppMsg}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    success('Link copied!', 'Share it on WhatsApp, bulletin, or projector.');
  };

  return (
    <div className="space-y-5">
      {/* Link display */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
          Your church join link
        </p>
        <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all mb-3">
          {joinLink}
        </p>
        <CopyButton
          text={joinLink}
          label="Copy link"
          successLabel="Copied!"
          size="sm"
          variant="both"
        />
      </div>

      {/* Share options */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Share via</p>
        <div className="grid grid-cols-3 gap-2">
          <SharePlatform
            label="WhatsApp"
            icon="📱"
            color="text-green-500"
            onClick={() => window.open(whatsAppUrl, '_blank')}
          />
          <SharePlatform
            label="Copy link"
            icon="🔗"
            color="text-blue-500"
            onClick={handleCopyLink}
          />
          <SharePlatform
            label="Print QR"
            icon="🖨️"
            color="text-gray-500"
            onClick={() => window.print()}
          />
        </div>
      </div>

      {/* Usage tips */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Where to share it</p>
        {[
          { icon: '📺', text: 'Project on screen during Sunday service' },
          { icon: '💬', text: 'Share in your church WhatsApp group' },
          { icon: '📋', text: 'Print in the weekly bulletin' },
          { icon: '📧', text: 'Include in congregation emails' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-base shrink-0">{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};