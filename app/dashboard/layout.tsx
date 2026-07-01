'use client';
import React, { useEffect } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { AdminSidebar }    from '@/components/layout/AdminSideBar';
import { AdminTopbar }     from '@/components/layout/AdminTopBar';
import { PageLoader }      from '@/components/ui/Spinner';
import { usePayouts }      from '@/hooks/usePayouts';
import { useOrgStore }     from '@/store/orgStore';
import { useUiStore }      from '@/store/uiStore';
import { orgsApi }         from '@/lib/api/orgs.api';
import { cn }              from '@/lib/cn';

/**
 * app/dashboard/layout.tsx — Admin dashboard shell.
 *
 * Provides:
 *   1. Auth guard  — redirect to /login if no valid admin JWT
 *   2. Sidebar     — nav links, org name, pending payout badge
 *   3. Topbar      — period picker, notification bell, new payout CTA
 *   4. Mobile sidebar toggle
 *
 * The pending payout count is fetched here (not in each page)
 * so the sidebar badge stays live across all dashboard pages.
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAdmin, initialized }   = useRequireAdmin();
  const org                        = useOrgStore();
  const { activePeriod, setActivePeriod, sidebarOpen, closeSidebar } = useUiStore();
  const { pendingCount }           = usePayouts();

  useEffect(() => {
    if (org.orgId && !org.slug) {
      orgsApi.getById(org.orgId).then((data) => {
        org.setOrg({
          orgId:   data.id,
          name:    data.name,
          slug:    data.slug,
          logoUrl: data.logo_url,
        });
      }).catch(() => {});
    }
  }, [org.orgId, org.slug]);

  if (!initialized) return <PageLoader message="Loading dashboard…" />;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 lg:static lg:z-auto',
        'transform transition-transform duration-200 ease-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <AdminSidebar
          orgName={org.name ?? undefined}
          pendingPayouts={pendingCount}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar
          period={activePeriod}
          onPeriodChange={setActivePeriod}
          subtitle={org.name ?? undefined}
        />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-5 space-y-4 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}