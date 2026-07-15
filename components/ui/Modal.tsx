'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title:      string;
  subtitle?:  string;
  size?:      'sm' | 'md' | 'lg';
  children:   React.ReactNode;
  footer?:    React.ReactNode;
  /** Prevent close on backdrop click — for destructive/multi-step flows */
  persistent?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  persistent = false,
}) => {
  // useId, not a hardcoded id — two mounted modals must not produce
  // duplicate aria-labelledby targets
  const titleId    = React.useId();
  const subtitleId = React.useId();
  const panelRef   = React.useRef<HTMLDivElement>(null);

  // Real focus management: move focus IN on open, trap Tab inside the
  // panel, restore focus to the opener on close. Without this, keyboard
  // and screen-reader users can Tab into (and act on) the obscured page
  // behind every confirm/destructive dialog.
  React.useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const focusables = (): HTMLElement[] =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    // Move focus into the dialog (first focusable, else the panel itself)
    (focusables()[0] ?? panel)?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const els = focusables();
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first  = els[0];
      const last   = els[els.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, persistent]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl bg-white dark:bg-gray-900',
          'border border-gray-100 dark:border-gray-800',
          'shadow-xl animate-scale-in focus:outline-none',
          // Body scroll is locked while open, so the panel itself must never
          // exceed the viewport — long content scrolls inside the body region
          'flex flex-col max-h-[calc(100dvh-2rem)]',
          sizeClasses[size],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2
              id={titleId}
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {!persistent && (
            <button
              onClick={onClose}
              className={cn(
                'ml-3 shrink-0 p-1.5 rounded-md -mr-1 -mt-1',
                'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                'dark:hover:text-gray-200 dark:hover:bg-gray-800',
                'transition-colors',
              )}
              aria-label="Close dialog"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4.47 4.47a.75.75 0 011.06 0L8 6.94l2.47-2.47a.75.75 0 111.06 1.06L9.06 8l2.47 2.47a.75.75 0 11-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 01-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto min-h-0 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 pb-5 pt-1 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Confirm Modal — common pattern for destructive actions ────────────────────

interface ConfirmModalProps {
  open:         boolean;
  onClose:      () => void;
  onConfirm:    () => void | Promise<void>;
  title:        string;
  description:  string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?:     boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel  = 'Confirm',
  confirmVariant = 'danger',
  loading       = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {description}
    </p>
  </Modal>
);