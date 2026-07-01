'use client';
import React from 'react';
import { cn } from '@/lib/cn';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * InstallBanner.tsx — PWA install prompt.
 *
 * Shown after the member completes OTP verify for the first time.
 * Two variants:
 *   Chrome/Android → trigger native prompt with one tap
 *   Safari/iOS     → show manual "Share → Add to Home Screen" steps
 */

export const InstallBanner: React.FC = () => {
  const { canInstall, showBanner, isIOS, install, dismiss } = usePWAInstall();

  if (!showBanner || !canInstall) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 p-4',
        'animate-slide-in-up',
      )}
      role="banner"
      aria-label="Install Owoore app"
    >
      <div className={cn(
        'max-w-md mx-auto rounded-2xl',
        'bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800',
        'shadow-lg p-4',
      )}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H10.75V10.5h3.75a.75.75 0 01.75.75V18a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-6.75a.75.75 0 01.75-.75h3.75V7.5H6.75a.75.75 0 010-1.5H9V3a.75.75 0 01.75-.75H10z"/>
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
              Add Owoore to your home screen
            </p>
            {isIOS ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Tap <strong>Share</strong> <span aria-hidden="true">⎦↑</span> then{' '}
                <strong>Add to Home Screen</strong> to open Owoore like an app — no download needed.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                One tap install — opens directly from your home screen, no browser.
              </p>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors p-1"
            aria-label="Dismiss install prompt"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Install button — only for Android/Chrome */}
        {!isIOS && (
          <button
            onClick={install}
            className="mt-3 w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Install app
          </button>
        )}
      </div>
    </div>
  );
};