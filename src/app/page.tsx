'use client';

import React, { useState } from 'react';
import {
  Plus,
  FilePlus,
  ArrowDownToLine,
  ChevronRight,
} from 'lucide-react';

import Sidebar, { NAV_ITEMS } from '@/components/dashboard/Sidebar';
import TopNavbar from '@/components/dashboard/TopNavbar';
import MetricCards from '@/components/dashboard/MetricCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PlanDistributionCard from '@/components/dashboard/PlanDistributionCard';

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeNav = NAV_ITEMS.find((item) => item.id === currentTab);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar (Desktop fixed + Mobile drawer) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tabId) => setCurrentTab(tabId)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Page Header with Welcome & Quick Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  <span>Brightloop 360</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-500">{activeNav?.label || 'Dashboard'}</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {currentTab === 'dashboard'
                    ? 'Subscription Overview'
                    : `${activeNav?.label} Management`}
                </h1>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {currentTab === 'dashboard'
                    ? 'Monitor customer growth, MRR trends, and recurring billing operations in real-time.'
                    : `Manage and configure your ${activeNav?.label.toLowerCase()} in Brightloop 360.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <ArrowDownToLine className="h-4 w-4 text-slate-500" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <FilePlus className="h-4 w-4 text-slate-500" />
                  <span>Create Invoice</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Subscription</span>
                </button>
              </div>
            </div>

            {/* If tab is not dashboard, show context tab banner */}
            {currentTab !== 'dashboard' && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                    i
                  </span>
                  <div>
                    <span className="font-semibold">Viewing {activeNav?.label} Section:</span>
                    <span className="ml-1 text-indigo-700">
                      You are in the {activeNav?.label} workspace view. The core billing metrics and live feed below remain synchronized.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="rounded-lg bg-white px-3 py-1 font-semibold text-indigo-600 shadow-2xs hover:bg-indigo-50"
                >
                  Return to Main Dashboard
                </button>
              </div>
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
        </main>
      </div>
    </div>
  );
}
