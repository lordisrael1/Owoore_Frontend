'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const CTA: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const ref = useScrollReveal<HTMLDivElement>(0.1);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    }, 900);
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 cta-gradient" aria-hidden="true" />

      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #86efac, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }}
        aria-hidden="true"
      />

      <div ref={ref} className="reveal relative z-10 max-w-2xl mx-auto px-5 sm:px-8 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse shrink-0" aria-hidden="true" />
          Free to start · No credit card required
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-1.5px] text-white mb-4 leading-tight">
          The treasury your church{' '}
          <span className="text-green-300">has always needed</span>
        </h2>
        <p className="text-base text-green-100/80 leading-relaxed mb-10 max-w-md mx-auto">
          Set up in minutes. Share your join link Sunday. Watch reconciliation happen on its own.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2.5 text-sm text-white font-semibold">
            <span className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center animate-tick">
              <svg className="w-3.5 h-3.5 text-green-200" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M2 7l3.5 3.5 7-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Taking you to registration…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 justify-center mb-6">
            <label htmlFor="cta-email" className="sr-only">Your email address</label>
            <input
              id="cta-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="treasurer@yourchurch.org"
              required
              className={cn(
                'w-full sm:w-72 px-4 py-3.5 rounded-xl text-sm',
                'bg-white/10 border border-white/20 text-white placeholder:text-white/50',
                'focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/15',
                'backdrop-blur-sm transition-colors',
              )}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-green-800 text-sm font-semibold rounded-xl hover:bg-green-50 active:bg-green-100 transition-colors shadow-lg shadow-black/20"
            >
              Get started free
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        )}

        {/* Trust markers */}
        <div className="flex items-center justify-center gap-5 flex-wrap text-xs text-white/50">
          {[
            { icon: '🔒', label: 'Secured by Nomba' },
            { icon: '⚡', label: 'Setup in 5 minutes' },
            { icon: '🇳🇬', label: 'Built for Nigeria' },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
