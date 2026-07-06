'use client';
import * as React from 'react';
import { Input, InputProps } from './Input';

/**
 * PasswordInput — Input with a show/hide (eye / eye-off) toggle.
 *
 * Used on login, forgot-password, and anywhere else a password is typed.
 * The toggle is a real button (keyboard focusable, labelled for screen
 * readers) and never affects form submission.
 */

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.04 12.32a1.01 1.01 0 010-.64C3.42 7.51 7.36 4.5 12 4.5s8.58 3.01 9.96 7.18c.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5S3.42 16.49 2.04 12.32z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.98 8.22A10.48 10.48 0 002.04 11.68a1.01 1.01 0 000 .64c1.38 4.17 5.32 7.18 9.96 7.18 2.05 0 3.98-.59 5.6-1.61M6.23 6.23A10.45 10.45 0 0112 4.5c4.64 0 8.58 3.01 9.96 7.18.07.21.07.43 0 .64a10.5 10.5 0 01-4.19 5.45M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88" />
  </svg>
);

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type' | 'suffix'>
>((props, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="p-0.5 -mr-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 transition-colors"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
