'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  ExternalLink,
} from 'lucide-react';
import { TRANSACTIONS_DATA } from '@/data/mockData';
import { TransactionStatus } from '@/types/dashboard';

interface RecentTransactionsTableProps {
  externalFilter?: string;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-700',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-700',
    icon: Clock,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-50 border-rose-200/80',
    text: 'text-rose-700',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    icon: RefreshCw,
  },
};

export default function RecentTransactionsTable({ externalFilter }: RecentTransactionsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = TRANSACTIONS_DATA.filter((tx) => {
    const matchesStatus =
      selectedStatus === 'all' ? true : tx.status === selectedStatus;
    const matchesExternal = externalFilter
      ? tx.customer.name.toLowerCase().includes(externalFilter.toLowerCase()) ||
        tx.customer.email.toLowerCase().includes(externalFilter.toLowerCase()) ||
        tx.invoiceNumber.toLowerCase().includes(externalFilter.toLowerCase()) ||
        tx.plan.toLowerCase().includes(externalFilter.toLowerCase())
      : true;
    return matchesStatus && matchesExternal;
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time billing transactions, settlement status, and customer payments
          </p>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'paid', 'pending', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pl-6 pr-3">Customer</th>
              <th className="px-3 py-3.5">Invoice #</th>
              <th className="px-3 py-3.5">Plan / Product</th>
              <th className="px-3 py-3.5">Amount</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Payment Method</th>
              <th className="px-3 py-3.5">Date</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const statusMeta = STATUS_CONFIG[tx.status];
                const StatusIcon = statusMeta.icon;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Customer */}
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 font-semibold text-slate-700 text-xs shadow-2xs">
                          {tx.customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {tx.customer.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{tx.customer.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Invoice */}
                    <td className="px-3 py-3.5 font-medium text-slate-700">
                      {tx.invoiceNumber}
                    </td>

                    {/* Plan */}
                    <td className="px-3 py-3.5 font-medium text-slate-800">
                      {tx.plan}
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-3.5 font-bold text-slate-900">
                      ${tx.amount.toFixed(2)}
                    </td>

                    {/* Status Pill */}
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.bg} ${statusMeta.text}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="px-3 py-3.5 text-slate-500">
                      {tx.paymentMethod}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Download Receipt"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination hint */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
        <span>Showing {filteredTransactions.length} of {TRANSACTIONS_DATA.length} transactions</span>
        <button className="font-semibold text-indigo-600 hover:text-indigo-800">
          View all transactions →
        </button>
      </div>
    </div>
  );
}
