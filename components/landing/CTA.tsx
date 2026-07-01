'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export const CTA: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // In production: capture email before redirect
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    }, 800);
  };

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 py-24">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-[-1px] text-gray-900 dark:text-gray-100 mb-4 leading-tight">
          The treasury your church has always needed
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-md mx-auto">
          Set up in minutes. Share your join link Sunday. Watch reconciliation happen on its own.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2.5 text-sm text-green-700 dark:text-green-400 font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Taking you to registration…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 justify-center mb-4">
            <label htmlFor="cta-email" className="sr-only">Your email address</label>
            <input
              id="cta-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="treasurer@yourchurch.org"
              required
              className={cn(
                'w-full sm:w-64 px-4 py-3 rounded-xl text-sm',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-green-700',
              )}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Get started free
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">
          No credit card required · Setup in under 5 minutes ·{' '}
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="1.5" y="5" width="9" height="6.5" rx="1"/>
              <path d="M4 5V3.5a2 2 0 014 0V5" strokeLinecap="round"/>
            </svg>
            Payments by Nomba
          </span>
        </p>
      </div>
    </section>
  );
};