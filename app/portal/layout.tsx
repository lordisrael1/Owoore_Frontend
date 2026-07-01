'use client';
import React, { useEffect } from 'react';
import type { Metadata } from 'next';
import { MemberNav }     from '@/components/layout/MemberNav';
import { InstallBanner } from '@/components/member/InstallBanner';
import { useMemberPortal } from '@/hooks/useMemberPortal';
import { useRequireMember } from '@/hooks/useAuth';
import { PageLoader }    from '@/components/ui/Spinner';

/**
 * app/portal/layout.tsx — Member portal shell.
 *
 * Three responsibilities:
 *   1. Auth guard — redirect to / if no valid member JWT
 *   2. Service worker registration — enables PWA/offline support
 *   3. Install banner — shown after first OTP verify on mobile
 *
 * This is 'use client' because:
 *   - useEffect needed for SW registration (browser API)
 *   - useRequireMember needs localStorage access
 *   - InstallBanner needs beforeinstallprompt (browser event)
 *
 * The MemberNav receives org context from useMemberPortal
 * so the church name + logo appear in the nav without a prop-drill.
 */

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/portal',
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW available — could show "Update available" toast here
              console.log('[SW] Update available');
            }
          });
        });

        console.log('[SW] Registered for /portal scope');
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    // Register after load so it doesn't slow initial render
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { isMember, initialized } = useRequireMember();
  const { org, isLoading }        = useMemberPortal();

  // Show loader while checking auth on first render
  if (!initialized) {
    return <PageLoader message="Loading your account…" />;
  }

  // Auth failed — redirect is handled by useRequireMember
  if (!isMember) return null;

  return (
    <>
      {/* Register service worker — fires once after mount */}
      <ServiceWorkerRegistrar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* Top navigation */}
        <MemberNav
          orgName={org?.name}
          logoUrl={org?.logo_url}
        />

        {/* Page content */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-5">
          {children}
        </main>

        {/* PWA install prompt — shown on mobile after join */}
        <InstallBanner />
      </div>
    </>
  );
}