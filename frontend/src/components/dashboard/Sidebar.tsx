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
  section: 'main' | 'catalog' | 'admin';
}

export const ALL_NAV_ITEMS: NavItem[] = [
  // Core Operations
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, section: 'main' },
  { id: 'subscriptions', label: 'Subscriptions & Quotes', icon: Repeat, roles: ['admin', 'staff', 'customer'], section: 'main' },
  { id: 'invoices', label: 'Invoices & Billing', icon: FileText, roles: ['admin', 'staff', 'customer'], section: 'main' },
  { id: 'payments', label: 'Payment Ledger', icon: CreditCard, roles: ['admin', 'staff', 'customer'], section: 'main' },

  // Catalog & Clients
  { id: 'products', label: 'Products & Variants', icon: Package, roles: ['admin', 'staff'], section: 'catalog' },
  { id: 'plans', label: 'Plans & Cycles', icon: Layers, roles: ['admin', 'staff'], section: 'catalog' },
  { id: 'customers', label: 'Customer Accounts', icon: Users, roles: ['admin', 'staff'], section: 'catalog' },

  // Finance & Admin
  { id: 'analytics', label: 'Finance Reports', icon: BarChart3, roles: ['admin', 'staff'], section: 'admin' },
  { id: 'discounts', label: 'Discount Rules', icon: Tag, roles: ['admin'], section: 'admin' },
  { id: 'settings', label: 'Settings & Staff', icon: Settings, roles: ['admin'], section: 'admin' },
];

export const NAV_ITEMS = ALL_NAV_ITEMS;

export default function Sidebar({
  currentTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { currentUser, subscriptions, invoices } = useSubscription();

  const isCustomer = currentUser.role === 'customer';

  // Filter items by role
  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const unpaidInvsCount = invoices.filter((i) => i.status === 'confirmed').length;

  const renderNavGroup = (section: 'main' | 'catalog' | 'admin', title: string) => {
    const items = visibleItems.filter((i) => i.section === section);
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {title}
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

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
                className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>
                    {isCustomer && item.id === 'subscriptions'
                      ? 'My Subscriptions'
                      : isCustomer && item.id === 'invoices'
                      ? 'My Invoices'
                      : isCustomer && item.id === 'payments'
                      ? 'My Receipts'
                      : item.label}
                  </span>
                </div>

                {badgeText && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : badgeStyle || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md shadow-indigo-200 text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base tracking-tight text-slate-900">Brightloop</span>
                <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-bold text-indigo-600">
                  360
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Subscription System</p>
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

        {/* Current Active Persona Card */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {currentUser.avatar || 'BL'}
              </div>
              <div className="truncate text-left">
                <div className="font-semibold text-slate-800 text-xs truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {isCustomer ? 'Customer Portal' : `${currentUser.role} View`}
                </div>
              </div>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold capitalize ${
                currentUser.role === 'admin'
                  ? 'bg-rose-100 text-rose-700'
                  : currentUser.role === 'staff'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {renderNavGroup('main', isCustomer ? 'My Account' : 'Core Billing')}
          {!isCustomer && renderNavGroup('catalog', 'Catalog & Clients')}
          {!isCustomer && renderNavGroup('admin', 'Administration')}
        </div>

        {/* Bottom System Status */}
        <div className="border-t border-slate-100 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-600">Billing Engine</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
