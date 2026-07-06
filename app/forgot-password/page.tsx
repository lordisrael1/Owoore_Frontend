'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input }    from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button }   from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authApi }  from '@/lib/api/auth.api';
import { cn }       from '@/lib/cn';

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

const PASSWORD_RULES: Array<{ label: string; test: (p: string) => boolean }> = [
  { label: 'At least 8 characters',      test: (p) => p.length >= 8 },
  { label: 'An uppercase letter (A–Z)',  test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter (a–z)',   test: (p) => /[a-z]/.test(p) },
  { label: 'A number (0–9)',             test: (p) => /\d/.test(p) },
];

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
    if (!PASSWORD_RULES.every((r) => r.test(password)))
                                       e.password = "Password doesn't meet all the requirements below";
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
              <PasswordInput
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                error={errors.password}
                autoComplete="new-password"
                required
              />
              {/* Live requirements checklist */}
              <ul className="space-y-1 -mt-1" aria-label="Password requirements">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        passed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500',
                      )}
                    >
                      {passed ? (
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                          <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm2.78 4.72a.75.75 0 00-1.06-1.06L5.25 6.13 4.28 5.16a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.06 0l3-3z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <circle cx="6" cy="6" r="5" />
                        </svg>
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
              <PasswordInput
                label="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the new password"
                error={errors.confirm ?? (confirm.length > 0 && confirm !== password
                  ? "Passwords don't match yet"
                  : undefined)}
                success={confirm.length > 0 && confirm === password ? 'Passwords match' : undefined}
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
