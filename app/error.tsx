'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';

/**
 * error.tsx — Global error boundary.
 *
 * Catches runtime errors in any page or layout component.
 * Must be 'use client' — Next.js requirement for error boundaries.
 *
 * Shows when:
 *   - An unexpected JS error is thrown during rendering
 *   - An API call throws an unhandled error in a Server Component
 *   - A third-party library throws
 *
 * Does NOT catch:
 *   - Errors inside Client Components with their own try/catch
 *   - 404s — those go to not-found.tsx
 *   - Middleware errors
 *
 * For handled API errors, components use useToast() to show toasts
 * and don't propagate to this boundary.
 */

interface ErrorPageProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, send to error tracking (e.g. Sentry)
    console.error('[Owoore] Unhandled error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-white dark:bg-gray-950">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-6">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <p className="text-xs font-medium uppercase tracking-widest text-red-600 dark:text-red-400 mb-3">
        Something went wrong
      </p>
      <h1 className="text-xl font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-3">
        An unexpected error occurred
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-2">
        This error has been recorded. You can try again or contact support if the problem persists.
      </p>

      {/* Show error message in dev only */}
      {isDev && error.message && (
        <div className="mb-6 max-w-lg w-full">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Error details (dev only)</p>
          <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap wrap-break-word">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Go home
        </a>
        <a
          href="mailto:hello@owoore.ng"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Contact support →
        </a>
      </div>

      <p className="mt-12 text-xs text-gray-300 dark:text-gray-700">
        Owoore · If this keeps happening, email hello@owoore.ng
      </p>
    </div>
  );
}