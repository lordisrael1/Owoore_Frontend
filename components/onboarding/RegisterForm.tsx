'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { orgsApi } from '@/lib/api/orgs.api';
import { authApi } from '@/lib/api/auth.api';
import { useOrgStore } from '@/store/orgStore';
import { useAuthStore } from '@/store/authStore';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { error } = useToast();
  const setOrg = useOrgStore((s) => s.setOrg);
  const authStore = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    church_name:    '',
    admin_name:     '',
    admin_email:    '',
    admin_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = React.useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.church_name.trim())    errs.church_name    = 'Church name is required';
    if (!form.admin_name.trim())     errs.admin_name     = 'Your name is required';
    if (!form.admin_email.includes('@')) errs.admin_email = 'Valid email required';
    if (form.admin_password.length < 8) errs.admin_password = 'Password must be at least 8 characters';
    if (form.admin_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const regResult = await orgsApi.register({
        name:           form.church_name.trim(),
        admin_name:     form.admin_name.trim(),
        admin_email:    form.admin_email.trim().toLowerCase(),
        admin_password: form.admin_password,
      });

      const loginResult = await authApi.adminLogin({
        email:    form.admin_email.trim().toLowerCase(),
        password: form.admin_password,
      });

      document.cookie = `owoore_admin_token=${localStorage.getItem('owoore_admin_token')}; path=/; SameSite=Lax; max-age=${8 * 3600}`;

      authStore.setAdmin(localStorage.getItem('owoore_admin_token') ?? '', {
        id:    loginResult.admin.id,
        email: loginResult.admin.email,
        role:  loginResult.admin.role,
        orgId: loginResult.admin.orgId,
      });

      setOrg({
        orgId:   regResult.org.id,
        name:    regResult.org.name,
        slug:    regResult.org.slug,
        logoUrl: null,
      });

      router.push('/register/logo');
    } catch (err: any) {
      error('Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Church name"
        value={form.church_name}
        onChange={set('church_name')}
        placeholder="Grace Bible Church"
        error={errors.church_name}
        required
        autoFocus
      />
      <Input
        label="Your name"
        value={form.admin_name}
        onChange={set('admin_name')}
        placeholder="Ngozi Okonkwo"
        error={errors.admin_name}
        required
      />
      <Input
        label="Your email"
        type="email"
        value={form.admin_email}
        onChange={set('admin_email')}
        placeholder="treasurer@yourchurch.org"
        error={errors.admin_email}
        required
      />
      <Input
        label="Password"
        type="password"
        value={form.admin_password}
        onChange={set('admin_password')}
        placeholder="At least 8 characters"
        error={errors.admin_password}
        required
      />
      <Input
        label="Confirm password"
        type="password"
        value={form.confirm_password}
        onChange={set('confirm_password')}
        placeholder="Re-enter password"
        error={errors.confirm_password}
        required
      />

      <Button type="submit" fullWidth loading={loading} size="lg">
        Register your church
      </Button>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        By registering you agree to our{' '}
        <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </form>
  );
};