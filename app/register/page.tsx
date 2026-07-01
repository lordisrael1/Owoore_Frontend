import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/onboarding/RegisterForm';

export const metadata: Metadata = {
  title: 'Register your church — Owoore',
  description: 'Set up Owoore for your church in under 5 minutes. Free to start.',
};

/**
 * app/register/page.tsx — Church registration (step 1 of onboarding).
 *
 * POST /orgs → creates org + admin user + default funds + Nomba sub-account
 *
 * Server Component wrapper around the client RegisterForm.
 * Metadata set here for SEO.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50 dark:bg-gray-950 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Register your church</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Free to start · Setup in 5 minutes</p>
        </div>

        {/* Registration form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <RegisterForm />
        </div>

        <p className="text-center mt-5 text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 dark:text-green-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}