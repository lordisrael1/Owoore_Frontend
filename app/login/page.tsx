'use client';
import React, { useState, useEffect } from 'react';
import { useRouter }  from 'next/navigation';
import { Input }      from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button }     from '@/components/ui/Button';
import { useToast }   from '@/components/ui/Toast';
import { authApi }    from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore }  from '@/store/orgStore';
import { decodeAdminToken } from '@/lib/auth/decode';
import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * app/login/page.tsx — Admin email + password login.
 *
 * POST /auth/admin/login → JWT token + admin profile
 *
 * After success:
 *   1. Token stored in localStorage (for API client)
 *   2. Token stored in cookie (for middleware route protection)
 *   3. User object stored in Zustand authStore
 *   4. OrgId stored in Zustand orgStore
 *   5. Redirect to /dashboard
 */

export default function LoginPage() {
  const router    = useRouter();
  const { toast } = useToast() as any;
  const { error } = useToast();
  const authStore = useAuthStore();
  const setOrg    = useOrgStore((s) => s.setOrg);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('owoore_admin_token');
    if (token) {
      const payload = decodeAdminToken(token);
      if (payload) router.replace('/dashboard');
    }
  }, [router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email';
    if (!password)                             e.password = 'Enter your password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authApi.adminLogin({ email: email.trim().toLowerCase(), password });

      // Store in cookie for middleware
      document.cookie = `owoore_admin_token=${localStorage.getItem('owoore_admin_token')}; path=/; SameSite=Lax; max-age=${8 * 3600}`;

      // Update Zustand stores
      authStore.setAdmin(localStorage.getItem('owoore_admin_token') ?? '', {
        id:    result.admin.id,
        email: result.admin.email,
        role:  result.admin.role,
        orgId: result.admin.orgId,
      });

      setOrg({
        orgId:   result.admin.orgId,
        name:    result.admin.name,
        slug:    result.admin.orgSlug,
        logoUrl: null,
      });

      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        const orgSlug = err.details?.orgSlug as string | undefined;
        if (orgSlug) {
          const params = new URLSearchParams({
            email:    email.trim().toLowerCase(),
            org_slug: orgSlug,
            next:     '/dashboard',
          });
          router.push(`/verify-email?${params.toString()}`);
          return;
        }
      }
      error('Login failed', err.message ?? 'Check your email and password');
      setPassword(''); // clear password on failure
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
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Sign in to Owoore</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Treasury admin + treasurer access</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              error={errors.password}
              autoComplete="current-password"
              required
            />
            <div className="flex justify-end -mt-1">
              <Link
                href={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : ''}`}
                className="text-xs text-green-700 dark:text-green-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Sign in
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-700 dark:text-green-400 font-medium hover:underline">
              Register your church
            </Link>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Church member?{' '}
            <span className="text-gray-500">Use your church join link, not this page.</span>
          </p>
        </div>
      </div>
    </div>
  );
}