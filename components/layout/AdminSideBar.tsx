'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { getCurrentAdmin } from '@/lib/auth/guards';

interface NavItem {
  label:      string;
  href:       string;
  icon:       React.ReactNode;
  badge?:     string;
  exact?:     boolean;
  adminOnly?: boolean; // hidden from TREASURER — backend rejects these routes anyway
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const DashIcon     = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>;
const MembersIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.21 2.239-4 5-4M10 13c0-2.21 1.79-4 4-4" strokeLinecap="round"/><circle cx="13" cy="5" r="2" strokeWidth="1.5"/></svg>;
const FundsIcon    = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" strokeLinecap="round"/><path d="M6 9h4" strokeLinecap="round"/></svg>;
const PayoutsIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 8h10M9 5l4 3-4 3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SignIcon     = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 11l3-3 2.5 2.5L11 6.5 14 10" strokeLinecap="round" strokeLinejoin="round"/><circle cx="13" cy="4" r="2" fill="currentColor" stroke="none"/></svg>;
const ReportsIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M5 6h6M5 9h4" strokeLinecap="round"/></svg>;
const SettingsIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="8" r="2.5"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.757 3.757l1.06 1.06M11.182 11.182l1.06 1.06M3.757 12.243l1.06-1.06M11.182 4.818l1.06-1.06"/></svg>;
const LinkIcon     = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6.5 9.5a3 3 0 004.243 0l2-2a3 3 0 00-4.243-4.243L7.25 4.5" strokeLinecap="round"/><path d="M9.5 6.5a3 3 0 00-4.243 0l-2 2a3 3 0 004.243 4.243L8.75 11.5" strokeLinecap="round"/></svg>;
const ChurchIcon   = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/></svg>;
const LogoutIcon   = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M11 10l3-2-3-2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 8h8M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3" strokeLinecap="round"/></svg>;

const TxIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 5h9M9.5 2.5L12 5l-2.5 2.5M13 11H4M6.5 8.5L4 11l2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TeamIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="4.5" r="2.25"/><path d="M3.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" strokeLinecap="round"/><path d="M13 6.5l.75.75L15.5 5.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard',        icon: <DashIcon />,    exact: true },
      { label: 'Members',   href: '/dashboard/members', icon: <MembersIcon /> },
    ],
  },
  {
    label: 'Giving',
    items: [
      { label: 'Fund types', href: '/dashboard/funds',    icon: <FundsIcon /> },
      { label: 'Join link',  href: '/dashboard/join-link', icon: <LinkIcon /> },
    ],
  },
  {
    label: 'Treasury',
    items: [
      { label: 'Transactions', href: '/dashboard/transactions', icon: <TxIcon /> },
      { label: 'Payouts',      href: '/dashboard/payouts',      icon: <PayoutsIcon /> },
      { label: 'Signatories',  href: '/dashboard/signatories',  icon: <SignIcon /> },
      { label: 'Reports',      href: '/dashboard/reports',      icon: <ReportsIcon /> },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { label: 'Team members', href: '/dashboard/settings/team', icon: <TeamIcon />, adminOnly: true },
      { label: 'Settings',     href: '/dashboard/settings',      icon: <SettingsIcon />, exact: true },
    ],
  },
];

interface AdminSidebarProps {
  orgName?: string;
  pendingPayouts?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  orgName = 'Your Church',
  pendingPayouts = 0,
}) => {
  const pathname = usePathname();
  const admin    = getCurrentAdmin();
  const isTreasurer = admin?.role === 'TREASURER';

  const visibleSections = NAV_SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.adminOnly || !isTreasurer) }))
    .filter((s) => s.items.length > 0);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('owoore_admin_token');
    window.location.href = '/login';
  };

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 w-56 shrink-0">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center shrink-0">
            <ChurchIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Owoore</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{orgName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5" aria-label="Dashboard navigation">
        {visibleSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-1.5">
              {section.label}
            </p>
            {section.items.map((item) => {
              const badge = item.label === 'Payouts' && pendingPayouts > 0
                ? String(pendingPayouts)
                : item.badge;
              const active = isActive(item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-full text-xs mb-0.5',
                    'transition-colors duration-100',
                    active
                      ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={cn('shrink-0', active ? 'text-green-700 dark:text-green-400' : '')}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {badge && (
                    <span className="ml-auto bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <Avatar name={admin?.email ?? 'Admin'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {admin?.role ?? 'Admin'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              {admin?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};