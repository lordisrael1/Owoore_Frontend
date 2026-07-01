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

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_MB = 2;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { error } = useToast();
  const setOrg = useOrgStore((s) => s.setOrg);
  const authStore = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState({
    church_name:      '',
    admin_name:       '',
    admin_email:      '',
    admin_password:   '',
    confirm_password: '',
  });
  const [errors, setErrors] = React.useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogoFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      error('Invalid file', 'Please upload a PNG, JPG, WebP, or SVG image.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      error('File too large', `Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.church_name.trim())         errs.church_name    = 'Church name is required';
    if (!form.admin_name.trim())          errs.admin_name     = 'Your name is required';
    if (!form.admin_email.includes('@'))  errs.admin_email    = 'Valid email required';
    if (form.admin_password.length < 8)  errs.admin_password = 'Password must be at least 8 characters';
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
        logo:           logoFile ?? undefined,
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
        logoUrl: regResult.org.logo_url,
      });

      // Logo is uploaded with POST /orgs (req.file) — no separate upload step needed
      router.push('/setup');
    } catch (err: any) {
      error('Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Optional logo picker */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Church logo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div
          onClick={() => logoInputRef.current?.click()}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-green-400 dark:group-hover:border-green-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              {logoFile ? logoFile.name : 'Click to upload logo'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG, WebP or SVG · max 2 MB</p>
            {logoFile && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }}
                className="text-xs text-red-500 hover:text-red-600 mt-0.5"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
        />
      </div>

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
