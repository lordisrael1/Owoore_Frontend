import * as React from 'react';

const steps = [
  {
    num:   '01',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Admin shares a join link',
    desc:  'Your church gets a unique URL — owoore.ng/join/grace-bible. Share on WhatsApp, project on screen Sunday morning, or print on the bulletin.',
  },
  {
    num:   '02',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Members get dedicated NUBANs',
    desc:  'Email + OTP = done. Each member instantly gets a unique account number per fund. They transfer from GTBank, OPay, Kuda, anywhere.',
  },
  {
    num:   '03',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Everything reconciles itself',
    desc:  'When money lands, Owoore knows who paid, which fund, and whether there\'s a deficit — all in real time. The dashboard updates instantly.',
  },
];

export const HowItWorks: React.FC = () => (
  <section id="how" className="border-t border-gray-100 dark:border-gray-800 py-20">
    <div className="max-w-6xl mx-auto px-5 sm:px-8">
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
          How it works
        </p>
        <h2 className="text-3xl font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          From join link to reconciled ledger
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
          Three steps. Works from any Nigerian bank. No app download. No manual matching. No Sunday stress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        {steps.map((step) => (
          <div key={step.num} className="p-7 bg-white dark:bg-gray-900">
            <span className="inline-block text-[11px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-2.5 py-1 rounded-full mb-4">
              {step.num}
            </span>
            <div className="text-gray-400 dark:text-gray-500 mb-3">{step.icon}</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);