'use client';
import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { authApi } from '@/lib/api/auth.api';
import { orgsApi } from '@/lib/api/orgs.api';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';
import { AdminOtpForm } from '@/components/onboarding/AdminOtpForm';
import type { AdminLoginResponse } from '@/lib/api/auth.api';

/**
 * app/verify-email/page.tsx — Admin email verification.
 *
 * Reached from two places:
 *   1. RegisterForm, right after church registration (OTP already sent
 *      by the backend as part of org creation — pass sent=1).
 *   2. app/login/page.tsx, when a login attempt comes back with
 *      EMAIL_NOT_VERIFIED — no OTP has been sent yet for this session.
 *
 * POST /auth/admin/verify-email → JWT + admin profile, same as login.
 */

function VerifyEmailContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { error }   = useToast();
  const authStore   = useAuthStore();
  const setOrg      = useOrgStore((s) => s.setOrg);

  const email   = searchParams.get('email') ?? '';
  const orgSlug = searchParams.get('org_slug') ?? '';
  const next    = searchParams.get('next') ?? '/dashboard';
  const alreadySent = searchParams.get('sent') === '1';

  const [ready, setReady] = React.useState(alreadySent);

  React.useEffect(() => {
    if (alreadySent || !email || !orgSlug) return;
    authApi.sendOtp({ email, org_slug: orgSlug })
      .then(() => setReady(true))
      .catch((err: any) => {
        error('Could not send verification code', err.message);
        setReady(true); // still let them use "Resend code"
      });
  }, [alreadySent, email, orgSlug]);

  const handleSuccess = async (result: AdminLoginResponse) => {
    document.cookie = `owoore_admin_token=${result.token}; path=/; SameSite=Lax; max-age=${8 * 3600}`;

    authStore.setAdmin(result.token, {
      id:    result.admin.id,
      email: result.admin.email,
      role:  result.admin.role,
      orgId: result.admin.orgId,
    });

    try {
      const org = await orgsApi.getBySlug(result.admin.orgSlug);
      setOrg({ orgId: org.id, name: org.name, slug: org.slug, logoUrl: org.logo_url });
    } catch {
      setOrg({ orgId: result.admin.orgId, name: result.admin.name, slug: result.admin.orgSlug, logoUrl: null });
    }

    router.push(next);
  };

  if (!email || !orgSlug) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Missing verification details. Please log in again to request a new code.
        </p>
        <a href="/login" className="text-sm text-green-700 dark:text-green-400 font-medium hover:underline">
          Back to sign in
        </a>
      </div>
    );
  }

  if (!ready) {
    return <p className="text-sm text-gray-400 text-center">Sending verification code…</p>;
  }

  return <AdminOtpForm email={email} orgSlug={orgSlug} onSuccess={handleSuccess} />;
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Verify your email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">One more step before you can sign in</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <Suspense fallback={<p className="text-sm text-gray-400 text-center">Loading…</p>}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
