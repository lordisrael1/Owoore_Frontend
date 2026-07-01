import type { Metadata } from 'next';
import { LogoUpload } from '@/components/onboarding/LogoUpload';

export const metadata: Metadata = {
  title: 'Add your church logo — Owoore',
  description: 'Upload your church logo so members recognise your Owoore page.',
};

export default function LogoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50 dark:bg-gray-950 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Add your church logo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This will appear on your giving page and member receipts.
          </p>
        </div>

        {/* Upload card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <LogoUpload />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-green-700" />
          <div className="w-2 h-2 rounded-full bg-green-700" />
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
          Step 2 of 3
        </p>
      </div>
    </div>
  );
}
