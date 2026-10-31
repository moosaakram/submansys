'use client';

import React, { useState } from 'react';
import {
  Plus,
  FilePlus,
  ArrowDownToLine,
  ChevronRight,
  Zap,
} from 'lucide-react';

import Sidebar, { ALL_NAV_ITEMS } from '@/components/dashboard/Sidebar';
import TopNavbar from '@/components/dashboard/TopNavbar';
import MetricCards from '@/components/dashboard/MetricCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PlanDistributionCard from '@/components/dashboard/PlanDistributionCard';
import GuidedWalkthrough from '@/components/dashboard/GuidedWalkthrough';

// Modular Feature Views
import ProductCatalogView from '@/components/products/ProductCatalogView';
import PlanManagementView from '@/components/plans/PlanManagementView';
import SubscriptionListView from '@/components/subscriptions/SubscriptionListView';
import InvoiceListView from '@/components/invoices/InvoiceListView';
import PaymentsView from '@/components/payments/PaymentsView';
import DiscountRulesView from '@/components/discounts/DiscountRulesView';
import FinanceAnalyticsView from '@/components/analytics/FinanceAnalyticsView';
import SettingsView from '@/components/settings/SettingsView';
import CustomersView from '@/components/customers/CustomersView';
import { useSubscription } from '@/context/SubscriptionContext';

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { currentUser, runBillingDay } = useSubscription();

  // Restore active tab across browser refreshes
  React.useEffect(() => {
    try {
      const savedTab = localStorage.getItem('brightloop_active_tab');
      if (savedTab) {
        setCurrentTab(savedTab);
      }
    } catch {}
  }, []);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    try {
      localStorage.setItem('brightloop_active_tab', tabId);
    } catch {}
  };

  const activeNav = ALL_NAV_ITEMS.find((item) => item.id === currentTab);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#1F2937]">
      {/* Sidebar: Deep Obsidian with Radial Depth Gradient */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 relative">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 relative">
          {/* Mandatory Atmospheric Fog Transition from UI_DESIGN_SYSTEM.md Sec 3 */}
          <div className="atmospheric-backdrop" aria-hidden="true" />

          <div className="relative z-1 mx-auto max-w-7xl space-y-6">
            {/* Quick Action Bar for Overview Dashboard */}
            {currentTab === 'dashboard' && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
                    <span className="text-[#c9ab70]">SubMan</span>
                    <ChevronRight className="h-3 w-3 text-white/40" />
                    <span className="text-white/80 capitalize">{currentUser.role} Console</span>
                  </div>
                  <h1 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {currentUser.role === 'customer'
                      ? 'Subscriber Portal & Overview'
                      : 'Subscription Overview'}
                  </h1>
                  <div className="title-accent-rule" />
                  <p className="mt-0.5 text-xs text-white/70 sm:text-sm">
                    {currentUser.role === 'customer'
                      ? `Welcome, ${currentUser.name}. Manage your recurring licenses and invoice receipts.`
                      : 'Monitor customer growth, MRR trends, and recurring billing operations in real-time.'}
                  </p>
                </div>

                {/* Action Buttons with Gold / Dark Styling */}
                {currentUser.role !== 'customer' && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => runBillingDay()}
                      className="btn-gold cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                      <span>⚡ Run Billing Day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentTab('invoices')}
                      className="btn-light-secondary cursor-pointer"
                    >
                      <FilePlus className="h-4 w-4 text-slate-500" />
                      <span>Invoices</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentTab('subscriptions')}
                      className="btn-dark cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-[#c9ab70]" />
                      <span>New Quote / Sub</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW ROUTER */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 1-Click Interactive Scenario Shortcuts */}
                {currentUser.role !== 'customer' && (
                  <GuidedWalkthrough
                    onNavigateTab={(tabId) => setCurrentTab(tabId)}
                    onOpenNewQuote={() => setCurrentTab('subscriptions')}
                  />
                )}

                {/* Requirement 4: Metrics Cards */}
                <section aria-label="Key Performance Indicators">
                  <MetricCards />
                </section>

                {/* Requirement 5: Revenue Overview Chart & Plan Distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <RevenueChart />
                  </div>
                  <div className="lg:col-span-4">
                    <PlanDistributionCard />
                  </div>
                </div>

                {/* Requirement 6 & 7: Recent Transactions Table & Recent Activity Feed */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <RecentTransactionsTable externalFilter={searchQuery} />
                  </div>
                  <div className="lg:col-span-4">
                    <RecentActivity />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'customers' && (
              <CustomersView
                onSelectCustomerForQuote={(custId) => {
                  setCurrentTab('subscriptions');
                }}
              />
            )}

            {currentTab === 'products' && <ProductCatalogView />}

            {currentTab === 'plans' && <PlanManagementView />}

            {currentTab === 'subscriptions' && <SubscriptionListView />}

            {currentTab === 'invoices' && <InvoiceListView />}

            {currentTab === 'payments' && <PaymentsView />}

            {currentTab === 'discounts' && <DiscountRulesView />}

            {currentTab === 'analytics' && <FinanceAnalyticsView />}

            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}
