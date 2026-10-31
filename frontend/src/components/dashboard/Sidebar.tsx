'use client';

import React from 'react';
import Logo from '@/components/common/Logo';
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
      <div className="mb-5">
        <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.08em] text-white/40 uppercase">
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
              badgeStyle = 'bg-[#c9ab70]/20 text-[#dcc28a] border border-[#c9ab70]/30';
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
                    ? 'bg-[#c9ab70]/12 text-white shadow-2xs'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {/* Active Indicator Left Pill (UI_DESIGN_SYSTEM.md Sec 5.1) */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c9ab70]"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#c9ab70]' : 'text-white/50 group-hover:text-white'
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
                        ? 'bg-[#c9ab70] text-[#171f28]'
                        : badgeStyle || 'bg-white/10 text-white/70'
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Deep Obsidian with Radial Depth Gradient */}
      <aside
        className={`sidebar-surface fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
          <Logo size="md" theme="light" subtext="Subscription Platform" />

          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Persona Card */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-xs backdrop-blur-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-b from-[#3c4a5a] to-[#1b242e] border border-white/15 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {currentUser.avatar || 'BL'}
              </div>
              <div className="truncate text-left">
                <div className="font-semibold text-white text-xs truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-white/40 capitalize">
                  {isCustomer ? 'Customer Portal' : `${currentUser.role} View`}
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold capitalize border ${
                currentUser.role === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : currentUser.role === 'staff'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {renderNavGroup('main', isCustomer ? 'My Account' : 'Core Billing')}
          {!isCustomer && renderNavGroup('catalog', 'Catalog & Clients')}
          {!isCustomer && renderNavGroup('admin', 'Administration')}
        </div>

        {/* Bottom System Status */}
        <div className="border-t border-white/[0.08] p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2 border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-white/70">Billing Engine</span>
            </div>
            <span className="text-[10px] font-bold text-[#dcc28a] bg-[#c9ab70]/15 px-1.5 py-0.5 rounded border border-[#c9ab70]/30">
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
