'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * usePWAInstall — captures the beforeinstallprompt event.
 *
 * Chrome/Android fires beforeinstallprompt when the PWA install
 * criteria are met (served over HTTPS, has manifest, SW registered).
 * We capture and defer it so we can show our own install UI.
 *
 * Flow:
 *   1. Browser fires beforeinstallprompt
 *   2. We call e.preventDefault() to suppress the default mini-bar
 *   3. We store the deferred event
 *   4. We show InstallBanner.tsx with "Add to home screen" CTA
 *   5. Member taps → we call deferredEvent.prompt()
 *   6. Browser shows native install dialog
 *   7. Member accepts → app installed ✓
 *
 * Safari (iOS) doesn't support this API — we detect it and show
 * manual instructions ("Tap Share → Add to Home Screen").
 */

interface BeforeInstallPromptEvent extends Event {
  prompt:           () => Promise<void>;
  userChoice:       Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  canInstall:     boolean;
  isInstalled:    boolean;
  isIOS:          boolean;
  isSafari:       boolean;
  isStandalone:   boolean;
  install:        () => Promise<boolean>;
  dismiss:        () => void;
  showBanner:     boolean;
}

const DISMISSED_KEY = 'owoore_pwa_dismissed';

export function usePWAInstall(): PWAInstallState {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,   setIsInstalled]   = useState(false);
  const [showBanner,    setShowBanner]    = useState(false);

  // Detect browser environment
  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isSafari = typeof navigator !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Detect standalone mode (already installed)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed by the user
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Listen for the install prompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      // Show our banner after a short delay (don't interrupt onboarding)
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredEvent(null);
    });

    // iOS: show manual instructions since no beforeinstallprompt
    if (isIOS && isSafari && !isStandalone) {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isIOS, isSafari, isStandalone]);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredEvent) return false;

    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;

    setDeferredEvent(null);
    setShowBanner(false);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredEvent]);

  const dismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  }, []);

  return {
    canInstall:   !!deferredEvent || (isIOS && isSafari && !isStandalone),
    isInstalled:  isInstalled || isStandalone,
    isIOS,
    isSafari,
    isStandalone,
    install,
    dismiss,
    showBanner:   showBanner && !isStandalone,
  };
}