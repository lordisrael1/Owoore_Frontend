'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth.api';
import { useToast } from '@/components/ui/Toast';

interface OtpFormProps {
  orgSlug:  string;
  onSuccess: (memberName: string, isNew: boolean) => void;
}

type Step = 'email' | 'otp' | 'name';

export const OtpForm: React.FC<OtpFormProps> = ({ orgSlug, onSuccess }) => {
  const { error } = useToast();
  const [step,      setStep]      = React.useState<Step>('email');
  const [email,     setEmail]     = React.useState('');
  const [otp,       setOtp]       = React.useState(['', '', '', '', '', '']);
  const [name,      setName]      = React.useState('');
  const [loading,   setLoading]   = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [isNew,     setIsNew]     = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = async () => {
    const clean = email.trim();
    if (!clean) { error('Enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { error('Enter a valid email address'); return; }

    setLoading(true);
    try {
      await authApi.sendOtp({ email: clean, org_slug: orgSlug });
      setStep('otp');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      error('Could not send OTP', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
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
      const result = await authApi.verifyOtp({
        email:    email.trim(),
        code:     finalCode,
        org_slug: orgSlug,
        name:     name || undefined,
      });

      if (result.member.isNew && !name) {
        setIsNew(true);
        setStep('name');
      } else {
        onSuccess(result.member.name, result.member.isNew);
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('name')) {
        setIsNew(true);
        setStep('name');
      } else {
        error('Incorrect code', err.message);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) { error('Enter your display name'); return; }
    setLoading(true);
    try {
      const result = await authApi.verifyOtp({
        email:    email.trim(),
        code:     otp.join(''),
        org_slug: orgSlug,
        name:     name.trim(),
      });
      onSuccess(result.member.name, true);
    } catch (err: any) {
      error('Could not complete registration', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Email */}
      {step === 'email' && (
        <>
          <Input
            label="Your email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            hint="We'll send a 6-digit verification code"
            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            autoFocus
          />
          <Button fullWidth loading={loading} onClick={handleSendOtp}>
            Send verification code
          </Button>
        </>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <>
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
                onClick={handleSendOtp}
                className="text-xs text-green-700 dark:text-green-400 hover:underline"
              >
                Resend code
              </button>
            )}
            <button
              onClick={() => { setStep('email'); setOtp(['','','','','','']); }}
              className="text-xs text-gray-400 hover:text-gray-600 ml-4"
            >
              Change email
            </button>
          </div>
        </>
      )}

      {/* Step 3: Name (first-time only) */}
      {step === 'name' && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome! This is your first time joining. What should we call you?
          </p>
          <Input
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bro. Emmanuel / Sis. Ngozi"
            hint="This is how you'll appear in the church giving records"
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            autoFocus
          />
          <Button fullWidth loading={loading} onClick={handleNameSubmit}>
            Complete registration
          </Button>
        </>
      )}
    </div>
  );
};