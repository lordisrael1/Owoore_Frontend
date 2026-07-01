import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found — Owoore',
};

/**
 * not-found.tsx — 404 page.
 *
 * Shown when:
 *   - A route doesn't exist (e.g. /dashboard/unknown-route)
 *   - notFound() is called from a page (e.g. org slug not found)
 *   - A join link (/join/bad-slug) returns 404 from the backend
 *
 * Keeps the Owoore brand but is intentionally minimal —
 * the user just needs a way back.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-white dark:bg-gray-950">
      {/* Green church mark */}
      <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center mb-6">
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z" />
        </svg>
      </div>

      {/* 404 */}
      <p className="text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
        404
      </p>
      <h1 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-3">
        Page not found
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8">
        The page you're looking for doesn't exist or may have moved.
        If you were looking for a church join link, check the URL and try again.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <Link
          href="/"
          className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Open dashboard
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-gray-300 dark:text-gray-700">
        Owoore · Church treasury infrastructure
      </p>
    </div>
  );
}