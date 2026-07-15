import type { Metadata } from 'next';
import { LandingNav }              from '@/components/layout/LandingNav';
import { Footer }                  from '@/components/layout/Footer';
import { Hero }                    from '@/components/landing/Hero';
import { HowItWorks }              from '@/components/landing/HowItWorks';
import { FeatureReconciliation }   from '@/components/landing/FeatureReconciliation';
import { FeatureGovernance }       from '@/components/landing/FeatureGovernance';
import { FeatureMember }           from '@/components/landing/FeatureMember';
import { FAQ }                     from '@/components/landing/FAQ';
import { CTA }                     from '@/components/landing/CTA';

/**
 * app/page.tsx — Landing page (/)
 *
 * Server Component — no client JS needed for the page shell.
 * Individual sections use 'use client' where they need interactivity
 * (animated receipt card in Hero, email form in CTA).
 *
 * Section order intentional:
 *   1. Hero       — above fold, instant value prop + receipt visual
 *   2. How it works — 3-step explainer, debunks "is this complicated?"
 *   3. Reconciliation feature — the core product promise
 *   4. Governance feature     — the trust/fraud-prevention story
 *   5. Member experience      — addresses "will my members use this?"
 *   6. CTA                    — email capture + register
 */

export const metadata: Metadata = {
  title: 'Owoore — Church treasury built different',
  description:
    'Every member gets a dedicated NUBAN bank account number. ' +
    'Every naira reconciles automatically. Multi-signatory payout governance. ' +
    'Built for Nigerian churches on Nomba virtual accounts.',
};

export default function LandingPage() {
  return (
    <>
      <LandingNav />

      {/* overflow-x-clip: reveal-left/right sections sit ±28px off-axis until
          scrolled into view — without the clip they widen the page on mobile */}
      <main id="main-content" className="overflow-x-clip">
        {/* Hero — animated receipt card + stats */}
        <Hero />

        {/* 3-step explainer */}
        <HowItWorks />

        {/* Feature: auto-reconciliation + fund progress bars */}
        <FeatureReconciliation />

        {/* Feature: M-of-N payout governance + approval card */}
        <FeatureGovernance />

        {/* Feature: member portal + NUBAN reveal */}
        <FeatureMember />

        {/* FAQ accordion */}
        <FAQ />

        {/* Email capture + register CTA */}
        <CTA />
      </main>

      <Footer />
    </>
  );
}