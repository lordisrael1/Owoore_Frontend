'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input }    from '@/components/ui/Input';
import { Button }   from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authApi }  from '@/lib/api/auth.api';

/**
 * app/forgot-password/page.tsx — Admin/treasurer password reset.
 *
 * Two steps on one page:
 *   1. Enter email → POST /auth/admin/forgot-password → 6-digit code emailed
 *   2. Enter code + new password → POST /auth/admin/reset-password → /login
 *
 * The backend never reveals whether the email has an account, so step 2 is
 * always shown after a send — same UX either way.
 */

function ForgotPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { success, error } = useToast();

  const [step,     setStep]     = useState<'email' | 'reset'>('email');
  const [email,    setEmail]    = useState(params.get('email') ?? '');
  const [code,     setCode]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; code?: string; password?: string; confirm?: string }>({});

  const handleSendCode = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrors({ email: 'Enter a valid email' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim().toLowerCase());
      success('Check your inbox', result.message);
      setStep('reset');
    } catch (err: any) {
      error('Could not send code', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const e: typeof errors = {};
    if (!/^\d{6}$/.test(code.trim()))  e.code     = 'Enter the 6-digit code from your email';
    if (password.length < 8)           e.password = 'At least 8 characters';
    if (confirm !== password)          e.confirm  = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const result = await authApi.resetPassword({
        email:        email.trim().toLowerCase(),
        code:         code.trim(),
        new_password: password,
      });
      success('Password updated', result.message);
      router.push('/login');
    } catch (err: any) {
      error('Reset failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Reset your password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {step === 'email'
              ? "We'll email you a 6-digit reset code"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="treasurer@yourchurch.org"
                error={errors.email}
                autoComplete="email"
                autoFocus
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
                Send reset code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <Input
                label="Reset code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                error={errors.code}
                autoComplete="one-time-code"
                autoFocus
                required
              />
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                error={errors.password}
                autoComplete="new-password"
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the new password"
                error={errors.confirm}
                autoComplete="new-password"
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
                Set new password
              </Button>
              <button
                type="button"
                className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1"
                onClick={() => { setCode(''); setStep('email'); }}
              >
                Didn't get a code? Send again
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered it?{' '}
          <Link href="/login" className="text-green-700 dark:text-green-400 font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  // useSearchParams requires a Suspense boundary during prerender
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
