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
} from 'lucide-react';

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
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users, badge: '1.2k' },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'plans', label: 'Plans', icon: Layers },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, badge: '8.9k' },
  { id: 'invoices', label: 'Invoices', icon: FileText, badge: '18', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'New', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  currentTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
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
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 tracking-wider">360</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Subscription Hub</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Quick Selector */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                BL
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-slate-800 truncate">Brightloop Corp</div>
                <div className="text-[10px] text-slate-400">Production • v2.4</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Menu
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
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
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        item.badgeColor || (isActive ? 'bg-indigo-200/70 text-indigo-800' : 'bg-slate-100 text-slate-600')
                      }`}
                    >
                      {item.badge}
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
              <span className="font-medium text-slate-600">Billing Engine</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Active</span>
          </div>

          <a
            href="#support"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>Support & Documentation</span>
          </a>
        </div>
      </aside>
    </>
  );
}
