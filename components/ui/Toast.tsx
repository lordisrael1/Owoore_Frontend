'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  toast:  (t: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]); // max 5 toasts
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success = React.useCallback((title: string, message?: string) =>
    toast({ type: 'success', title, message }), [toast]);
  const error   = React.useCallback((title: string, message?: string) =>
    toast({ type: 'error', title, message }), [toast]);
  const info    = React.useCallback((title: string, message?: string) =>
    toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, dismiss }}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// ── Visual components ─────────────────────────────────────────────────────────

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4 text-green-600" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.78 5.78L7.28 10.28a.75.75 0 01-1.06 0L4.22 8.28a.75.75 0 011.06-1.06L6.75 8.69l4-4a.75.75 0 011.03 1.09z"/>
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-600" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM6.94 5.47L8 6.56l1.06-1.09a.75.75 0 111.08 1.04L9.06 7.6l1.08 1.09a.75.75 0 01-1.08 1.04L8 8.64l-1.06 1.09a.75.75 0 11-1.08-1.04L6.94 7.6 5.86 6.51a.75.75 0 011.08-1.04z"/>
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 4a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.75 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 7z"/>
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8.48 1.29a.55.55 0 00-.96 0L.56 13.13A.55.55 0 001.04 14h13.92a.55.55 0 00.48-.87L8.48 1.29zM8 5.75a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 5.75zm.75 5.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
    </svg>
  ),
};

const bgStyles: Record<ToastType, string> = {
  success: 'border-l-4 border-l-green-500',
  error:   'border-l-4 border-l-red-500',
  info:    'border-l-4 border-l-blue-500',
  warning: 'border-l-4 border-l-amber-500',
};

const ToastItem: React.FC<{ toast: Toast; dismiss: (id: string) => void }> = ({
  toast: t,
  dismiss,
}) => (
  <div
    className={cn(
      'flex items-start gap-3 w-80 rounded-lg',
      'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
      'shadow-lg p-3.5 animate-in slide-in-from-right-4 fade-in duration-300',
      bgStyles[t.type],
    )}
    role="alert"
  >
    <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.title}</p>
      {t.message && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.message}</p>
      )}
    </div>
    <button
      onClick={() => dismiss(t.id)}
      className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
      aria-label="Dismiss notification"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M4.47 4.47a.75.75 0 011.06 0L7 5.94l1.47-1.47a.75.75 0 111.06 1.06L8.06 7l1.47 1.47a.75.75 0 11-1.06 1.06L7 8.06l-1.47 1.47a.75.75 0 01-1.06-1.06L5.94 7 4.47 5.53a.75.75 0 010-1.06z"/>
      </svg>
    </button>
  </div>
);

const ToastStack: React.FC<{ toasts: Toast[]; dismiss: (id: string) => void }> = ({
  toasts,
  dismiss,
}) => (
  <div
    className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    aria-live="polite"
    aria-atomic="false"
  >
    {toasts.map((t) => (
      <ToastItem key={t.id} toast={t} dismiss={dismiss} />
    ))}
  </div>
);