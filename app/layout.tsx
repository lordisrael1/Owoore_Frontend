import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

/**
 * layout.tsx — Root layout.
 *
 * Wraps every page in Owoore with:
 *   - Geist Sans + Geist Mono fonts (same as Linear, Vercel, etc.)
 *   - ToastProvider — global toast context (success/error notifications)
 *   - Open Graph metadata for social sharing
 *   - Viewport: mobile-first, no scale (churches use tablets on projectors)
 *
 * Note: SWR's SWRConfig and Zustand stores are client-side only.
 * They're initialized inside page-level 'use client' components,
 * NOT here in the root server layout.
 */

export const metadata: Metadata = {
  title: {
    template: '%s — Owoore',
    default:  'Owoore — Church treasury built different',
  },
  description:
    'Every member gets a dedicated bank account number. ' +
    'Every naira reconciles automatically. ' +
    'Multi-signatory governance. Built for Nigerian churches.',
  keywords: [
    'church treasury', 'tithe', 'offering', 'Nigerian church',
    'virtual account', 'Nomba', 'reconciliation', 'giving management',
  ],
  authors:   [{ name: 'Owoore' }],
  creator:   'Owoore',
  publisher: 'Owoore',
  openGraph: {
    type:        'website',
    locale:      'en_NG',
    url:         'https://owoore.ng',
    siteName:    'Owoore',
    title:       'Owoore — Church treasury built different',
    description: 'Every member gets a dedicated bank account number. Every naira reconciles automatically.',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'Owoore church treasury platform',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Owoore — Church treasury built different',
    description: 'Every member gets a dedicated bank account number. Every naira reconciles automatically.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon:   '/favicon.ico',
    apple:  '/apple-touch-icon.png',
    other: [{ rel: 'icon', type: 'image/png', url: '/favicon-32x32.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#111827' },
  ],
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5, // allow zoom for accessibility
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning // prevents mismatch from dark-mode class
    >
      <head>
        {/* Preconnect to backend for faster API calls */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'} />
        {/* DNS prefetch for Nomba API */}
        <link rel="dns-prefetch" href="https://api.nomba.com" />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen" suppressHydrationWarning>
        {/*
          ToastProvider — must be client-side.
          Wraps all pages so any component can call useToast().
          The ToastStack renders fixed-position notifications in the bottom-right.
        */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}