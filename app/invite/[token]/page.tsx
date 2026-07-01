'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input }    from '@/components/ui/Input';
import { Button }   from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api }      from '@/lib/api/client';
import { authApi }  from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore }  from '@/store/orgStore';
import { PageLoader }   from '@/components/ui/Spinner';

/**
 * app/invite/[token]/page.tsx — Treasurer/admin accept invite.
 *
 * GET  /admin-users/invite/:token → validate token, get invite details
 * POST /admin-users/invite/:token → set password, activate account
 *
 * This is the page treasurers land on from their invitation email.
 * They set a password and their account is activated. After submit
 * they're logged in and redirected to the dashboard.
 *
 * Token is single-use — expires after 7 days.
 */

interface InviteDetails {
  name:    string;
  email:   string;
  role:    string;
  orgName: string;
  expired: boolean;
}

export default function AcceptInvitePage() {
  const params  = useParams();
  const router  = useRouter();
  const token   = params.token as string;
  const { error, success } = useToast();
  const authStore = useAuthStore();
  const setOrg    = useOrgStore((s) => s.setOrg);

  const [details,   setDetails]   = useState<InviteDetails | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [done,      setDone]      = useState(false);

  const [form, setForm] = useState({
    password:        '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<typeof form>({ password: '', confirmPassword: '' });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await api.get<InviteDetails>(`/admin-users/invite/${token}`, { isPublic: true });
        setDetails(data);
        if ((data as any).expired) setTokenError(true);
      } catch {
        setTokenError(true);
      } finally {
        setLoading(false);
      }
    };
    if (token) validateToken();
  }, [token]);

  const validate = () => {
    const e = { password: '', confirmPassword: '' };
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !e.password && !e.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Accept invite — sets password and activates account
      const result = await api.post<{ token: string; admin: any; org: any }>(
        `/admin-users/invite/${token}`,
        { password: form.password },
        { isPublic: true },
      );

      // Store JWT
      const { token: jwt, admin, org } = result as any;
      localStorage.setItem('owoore_admin_token', jwt);
      document.cookie = `owoore_admin_token=${jwt}; path=/; SameSite=Lax; max-age=${8 * 3600}`;

      // Populate stores
      authStore.setAdmin(jwt, {
        id:    admin.id,
        email: admin.email,
        role:  admin.role,
        orgId: admin.orgId,
      });
      setOrg({ orgId: admin.orgId, name: org.name, slug: org.slug, logoUrl: org.logo_url });

      setDone(true);
      success('Account activated! Welcome to Owoore.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      error('Could not activate account', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader message="Validating invite…" />;

  // ── Token invalid / expired ───────────────────────────────────────────────
  if (tokenError || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Invite link expired
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This invite link has expired or already been used. Ask your church admin to send a new invite.
          </p>
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-green-700 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Account activated!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Taking you to the dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Accept invite form ────────────────────────────────────────────────────
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
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            You've been invited to Owoore
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {details.orgName} · {details.role}
          </p>
        </div>

        {/* Invite card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          {/* Invite details */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-xl p-3.5 mb-5">
            <p className="text-xs text-green-700 dark:text-green-400">
              <span className="font-medium">{details.name}</span> ({details.email}) ·{' '}
              <span className="font-medium">{details.role}</span> at{' '}
              <span className="font-medium">{details.orgName}</span>
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Set a password to activate your account and access the treasury dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Set a password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
              error={errors.password}
              autoComplete="new-password"
              autoFocus
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
            <Button type="submit" fullWidth loading={submitting} size="lg">
              Activate account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          By activating you agree to Owoore's{' '}
          <a href="/terms" className="underline">Terms</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}