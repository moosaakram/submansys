'use client';

import React from 'react';
import {
  Users,
  Repeat,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

export default function MetricCards() {
  const { analytics, customers, subscriptions, invoices } = useSubscription();

  const metrics = [
    {
      id: 'active_subscriptions',
      title: 'Active Subscriptions',
      value: analytics.activeSubscriptionsCount.toLocaleString(),
      change: '+100%',
      isPositive: true,
      comparisonText: `${subscriptions.length} total across all lifecycles`,
      icon: Repeat,
    },
    {
      id: 'mrr',
      title: 'Monthly Recurring Rev (MRR)',
      value: `$${analytics.mrr.toLocaleString()}`,
      change: '+18.5%',
      isPositive: true,
      comparisonText: `ARR Run-rate: $${analytics.arr.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      id: 'total_collected',
      title: 'Revenue Collected',
      value: `$${analytics.totalRevenueCollected.toLocaleString()}`,
      change: '+14.2%',
      isPositive: true,
      comparisonText: 'Settled bank receipts',
      icon: DollarSign,
    },
    {
      id: 'pending_payments',
      title: 'Pending / Overdue Invoices',
      value: `$${(analytics.pendingAmount + analytics.overdueAmount).toLocaleString()}`,
      change: analytics.overdueInvoicesCount > 0 ? `-${analytics.overdueInvoicesCount} overdue` : '0 overdue',
      isPositive: analytics.overdueInvoicesCount === 0,
      comparisonText: `${analytics.overdueInvoicesCount} awaiting immediate settlement`,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;

        return (
          <div
            key={metric.id}
            className="card-surface group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-md hover:border-[#c9ab70]/40"
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {metric.title}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#1c2530] border border-slate-200/80 transition-colors group-hover:bg-[#1c2530] group-hover:text-[#c9ab70]">
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            {/* Middle Row: Large Value */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-serif)] text-3xl font-bold tracking-tight text-slate-900">
                {metric.value}
              </span>
            </div>

            {/* Bottom Row: Percentage Change + Comparison Text */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  metric.isPositive
                    ? 'badge-success'
                    : 'badge-danger'
                }`}
              >
                {metric.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {metric.change}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {metric.comparisonText}
              </span>
            </div>

            {/* Subtle bottom decorative line */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#c9ab70]/0 to-transparent transition-opacity group-hover:via-[#c9ab70]/50" />
          </div>
        );
      })}
    </div>
  );
}
