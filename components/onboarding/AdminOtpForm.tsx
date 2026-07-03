'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth.api';
import { useToast } from '@/components/ui/Toast';
import type { AdminLoginResponse } from '@/lib/api/auth.api';

interface AdminOtpFormProps {
  email:    string;
  orgSlug:  string;
  onSuccess: (result: AdminLoginResponse) => void;
}

/**
 * AdminOtpForm — same 6-digit OTP box UI as components/member/OtpForm.tsx,
 * scoped to admin email verification (POST /auth/admin/verify-email).
 * Email is already known by the time this renders, so there's no
 * email-entry step.
 */
export const AdminOtpForm: React.FC<AdminOtpFormProps> = ({ email, orgSlug, onSuccess }) => {
  const { error } = useToast();
  const [otp,       setOtp]       = React.useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === 5 && next.every(Boolean)) {
      handleVerify(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      handleVerify(text);
    }
  };

  const handleVerify = async (code?: string) => {
    const finalCode = code ?? otp.join('');
    if (finalCode.length < 6) { error('Enter the full 6-digit code'); return; }

    setLoading(true);
    try {
      const result = await authApi.verifyAdminEmail({
        email,
        code: finalCode,
        org_slug: orgSlug,
      });
      onSuccess(result);
    } catch (err: any) {
      error('Incorrect code', err.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.sendOtp({ email, org_slug: orgSlug });
      setCountdown(60);
    } catch (err: any) {
      error('Could not resend code', err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter the 6-digit code sent to{' '}
        <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>
      </p>

      <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className={cn(
              'w-11 h-12 text-center text-lg font-medium rounded-xl border',
              'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent',
              digit
                ? 'border-green-400 dark:border-green-600'
                : 'border-gray-200 dark:border-gray-700',
              'transition-colors',
            )}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>

      <Button
        fullWidth
        loading={loading}
        onClick={() => handleVerify()}
        disabled={otp.some((d) => !d)}
      >
        Verify code
      </Button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-xs text-gray-400">Resend in {countdown}s</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs text-green-700 dark:text-green-400 hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>
    </div>
  );
};
