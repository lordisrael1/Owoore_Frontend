'use client';
import * as React from 'react';
import { useStaggerReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    num:   '01',
    color: 'green',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Admin shares a join link',
    desc:  'Your church gets a unique URL — owoore.ng/join/grace-bible. Share on WhatsApp, project it Sunday morning, or print it on the bulletin.',
    detail: 'Takes 5 minutes to set up',
  },
  {
    num:   '02',
    color: 'blue',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Members get dedicated NUBANs',
    desc:  'Email + OTP = done. Each member instantly gets a unique account number per fund. They transfer from GTBank, OPay, Kuda — anywhere.',
    detail: 'No app download required',
  },
  {
    num:   '03',
    color: 'emerald',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Everything reconciles itself',
    desc:  'When money lands, Owoore knows who paid, which fund, and whether there\'s a deficit — all in real time. The dashboard updates instantly.',
    detail: 'Zero manual matching',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  green:   { bg: 'bg-green-50 dark:bg-green-950/40',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-100 dark:border-green-900/50', badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-100 dark:border-blue-900/50',   badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/50', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' },
};

export const HowItWorks: React.FC = () => {
  const containerRef = useStaggerReveal<HTMLDivElement>(0.1);

  return (
    <section id="how" className="border-t border-gray-100 dark:border-gray-800 py-20 sm:py-28" ref={containerRef as React.Ref<HTMLDivElement>}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* Section header — centered */}
        <div className="reveal mb-14 max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            From join link to{' '}
            <span className="text-gradient-green">reconciled ledger</span>
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Three steps. Works from any Nigerian bank. No app download. No manual matching.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-linear-to-r from-green-200 via-blue-200 to-emerald-200 dark:from-green-800 dark:via-blue-800 dark:to-emerald-800"
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const c = colorMap[step.color];
            return (
              <div
                key={step.num}
                className={`reveal stagger-${i + 1} group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-green-200 dark:hover:border-green-800/60 hover:shadow-xl hover:shadow-green-900/8 transition-all duration-300`}
              >
                {/* Step badge */}
                <div className="flex items-center gap-3 mb-5">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${c.badge}`}>
                    {step.num}
                  </span>
                  {/* Connector dot */}
                  {i < 2 && (
                    <div className="hidden md:flex flex-1 items-center justify-end -mr-6 pr-3">
                      <div className={`w-2 h-2 rounded-full ${step.color === 'green' ? 'bg-green-300 dark:bg-green-700' : 'bg-blue-300 dark:bg-blue-700'}`} />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  {step.desc}
                </p>

                {/* Detail badge */}
                <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M2 6l2.5 2.5 5.5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
