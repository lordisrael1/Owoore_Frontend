import * as React from 'react';
import { AccountDisplay } from '@/components/ui/CopyButton';

const checks = [
  'Email OTP — no password to forget',
  'Same account number every visit — save as bank beneficiary',
  'Email confirmation on every payment received',
  'Anonymous giving option — no registration needed',
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FeatureMember: React.FC = () => (
  <section className="border-t border-gray-100 dark:border-gray-800 py-20">
    <div className="max-w-6xl mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left: copy */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
            Member experience
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
            Zero friction. Works on any ₦30k Android.
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Members tap a WhatsApp link, verify their email, and get a permanent
            NUBAN — same account every time. No app download. No password.
            Works from any bank in Nigeria.
          </p>
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <CheckIcon />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: browser mock with member portal */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true"/>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true"/>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" aria-hidden="true"/>
            <span className="flex-1 text-center text-xs text-gray-400 font-mono">
              owoore.ng/join/grace-bible-church
            </span>
          </div>

          {/* Member portal content */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Grace Bible Church</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Select a fund to get your account number</p>

            {/* Fund cards */}
            <div className="space-y-2.5 mb-4">
              {[
                { name: 'Tithe',    icon: '♥', sub: 'Monthly · No fixed amount' },
                { name: 'Offering', icon: '🎁', sub: 'Open giving' },
              ].map((fund) => (
                <button
                  key={fund.name}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-colors bg-white dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/50 flex items-center justify-center text-base">
                      {fund.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{fund.name}</p>
                      <p className="text-[10px] text-gray-400">{fund.sub}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>

            {/* NUBAN reveal */}
            <AccountDisplay
              accountNumber="0123456789"
              bankName="Providus Bank"
              label="Your tithe account"
            />
          </div>
        </div>

      </div>
    </div>
  </section>
);