'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronRight,
  X,
  Tag,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  roles?: ('admin' | 'staff' | 'customer')[];
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'staff'] },
  { id: 'products', label: 'Products & Variants', icon: Package, roles: ['admin', 'staff'] },
  { id: 'plans', label: 'Plans & Billing', icon: Layers, roles: ['admin', 'staff'] },
  { id: 'subscriptions', label: 'Subscriptions & Quotes', icon: Repeat, roles: ['admin', 'staff', 'customer'] },
  { id: 'invoices', label: 'Invoices & Billing Day', icon: FileText, roles: ['admin', 'staff', 'customer'] },
  { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'staff', 'customer'] },
  { id: 'discounts', label: 'Discount Rules', icon: Tag, roles: ['admin'] },
  { id: 'analytics', label: 'Finance Analytics', icon: BarChart3, roles: ['admin', 'staff'] },
  { id: 'settings', label: 'Settings & Staff', icon: Settings, roles: ['admin'] },
];

export const NAV_ITEMS = ALL_NAV_ITEMS;

export default function Sidebar({
  currentTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { currentUser, subscriptions, invoices } = useSubscription();

  // Filter nav items based on current user role
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const unpaidInvsCount = invoices.filter((i) => i.status === 'confirmed').length;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-md shadow-indigo-200 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900">Brightloop</span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 tracking-wider">
                  360
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Subscription Hub</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Workspace / Persona Card */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {currentUser.avatar || 'BL'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser.role === 'customer'
                    ? currentUser.companyName || currentUser.name
                    : 'Brightloop Software'}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role === 'customer' ? 'Customer Portal' : `${currentUser.role} Workspace`}
                </div>
              </div>
            </div>
            {currentUser.role === 'admin' ? (
              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                Admin
              </span>
            ) : currentUser.role === 'staff' ? (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                Staff
              </span>
            ) : (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                Portal
              </span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {currentUser.role === 'customer' ? 'My Account' : 'Platform Menu'}
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              // Dynamic badge calculations
              let badgeText = item.badge;
              let badgeStyle = item.badgeColor;

              if (item.id === 'subscriptions') {
                badgeText = String(activeSubsCount);
              } else if (item.id === 'invoices' && unpaidInvsCount > 0) {
                badgeText = String(unpaidInvsCount);
                badgeStyle = 'bg-amber-100 text-amber-700';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4.5 w-4.5 transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>
                      {currentUser.role === 'customer' && item.id === 'subscriptions'
                        ? 'My Subscriptions'
                        : currentUser.role === 'customer' && item.id === 'invoices'
                        ? 'My Invoices'
                        : currentUser.role === 'customer' && item.id === 'payments'
                        ? 'My Payments'
                        : item.label}
                    </span>
                  </div>

                  {badgeText && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        badgeStyle ||
                        (isActive
                          ? 'bg-indigo-200/70 text-indigo-800'
                          : 'bg-slate-100 text-slate-600')
                      }`}
                    >
                      {badgeText}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Support & System status */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-600">Automated Billing</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Ready</span>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Brightloop 360 &copy; 2026
          </div>
        </div>
      </aside>
    </>
  );
}
