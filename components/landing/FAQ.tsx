'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { useStaggerReveal } from '@/hooks/useScrollReveal';

/**
 * FAQ — animated accordion. Height animates via the CSS grid-template-rows
 * trick (.faq-answer in globals.css), the plus icon rotates into a ×,
 * and items stagger-reveal on scroll.
 */

const faqs = [
  {
    q: 'How much does it cost to use Owoore?',
    a: 'Getting started is free — no setup fee, no monthly subscription, no card required. Your church registers, creates funds, and shares its join link at ₦0. Standard payment processing applies to transfers, handled by Nomba.',
  },
  {
    q: 'Where does the money actually sit? Is it safe?',
    a: 'Funds land in dedicated virtual accounts issued by Nomba, a CBN-licensed payment provider, and sweep to your church’s own bank account. Owoore never holds your money — we’re the ledger, reconciliation, and governance layer on top.',
  },
  {
    q: 'Do members need to download an app?',
    a: 'No. Members tap your church’s join link (WhatsApp, bulletin, projector), verify their email with a one-time code, and get their permanent account number in the browser. It works on any phone that can open a web page.',
  },
  {
    q: 'Which banks can members transfer from?',
    a: 'All of them. A dedicated NUBAN is a real Nigerian account number — members transfer from GTBank, Access, Zenith, UBA, Kuda, OPay, Moniepoint, PalmPay, or any other bank or wallet, exactly like sending money to a friend.',
  },
  {
    q: 'How does the payout approval actually work?',
    a: 'You appoint signatories — for example your Pastor, a Deacon, and an Elder — and set a quorum like 2-of-3. Any payout above your threshold emails every signatory; the transfer only fires when the quorum approves, and a single decline kills it. Every action lands in an immutable audit trail.',
  },
  {
    q: 'Can members give anonymously?',
    a: 'Yes. Every fund can expose an anonymous giving account — no registration, no email, no name attached. The gift still reconciles to the right fund automatically.',
  },
  {
    q: 'How long does setup take?',
    a: 'About five minutes: register your church, add your funds (Tithe, Offering, Building…), appoint signatories, and share your join link on Sunday. Reconciliation starts with the first transfer.',
  },
];

const FAQItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = React.useState(false);
  const id = `faq-panel-${index}`;

  return (
    // The reveal classes live on this stable wrapper: React re-renders on
    // open/close rewrite the inner className, which would strip the
    // observer-added `in-view` class and hide the item again.
    <div className={`reveal stagger-${Math.min(index + 1, 5)}`}>
    <div
      data-open={open}
      className={cn(
        'faq-item rounded-2xl border transition-colors duration-300',
        open
          ? 'border-green-200 dark:border-green-800/60 bg-green-50/40 dark:bg-green-950/20 shadow-soft'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700',
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={cn(
          'text-sm sm:text-[15px] font-semibold transition-colors duration-200',
          open ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-gray-100',
        )}>
          {q}
        </span>
        <span
          className={cn(
            'faq-icon shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300',
            open
              ? 'bg-green-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
          )}
          aria-hidden="true"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
            <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <div className="faq-answer" data-open={open} id={id} role="region">
        <div>
          <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
            {a}
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const ref = useStaggerReveal<HTMLDivElement>(0.05);

  return (
    <section
      id="faq"
      className="relative border-t border-gray-100 dark:border-gray-800 py-20 sm:py-28 overflow-hidden"
      ref={ref as React.Ref<HTMLDivElement>}
    >
      {/* Soft background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-60 pointer-events-none animate-ring-pulse"
        style={{ background: 'radial-gradient(ellipse, rgba(22,163,74,.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-8">
        {/* Header — centered */}
        <div className="reveal text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            Questions treasurers{' '}
            <span className="text-gradient-green">actually ask</span>
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Straight answers. No fine print surprises.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>

        {/* Still curious */}
        <p className="reveal stagger-5 text-center text-sm text-gray-400 dark:text-gray-500 mt-10">
          Something else on your mind?{' '}
          <a href="mailto:hello@owoore.ng" className="text-green-700 dark:text-green-400 font-medium hover:underline">
            hello@owoore.ng
          </a>
        </p>
      </div>
    </section>
  );
};
