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
import { useSubscription } from '@/context/SubscriptionContext';
import { TransactionStatus } from '@/types/dashboard';

interface RecentTransactionsTableProps {
  externalFilter?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: {
    label: 'Paid',
    badgeClass: 'badge-success',
    icon: CheckCircle,
  },
  confirmed: {
    label: 'Unpaid / Due',
    badgeClass: 'badge-warning',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    badgeClass: 'badge-neutral',
    icon: RefreshCw,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'badge-danger',
    icon: XCircle,
  },
};

export default function RecentTransactionsTable({ externalFilter }: RecentTransactionsTableProps) {
  const { invoices } = useSubscription();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'pending'
        ? inv.status === 'confirmed'
        : inv.status === selectedStatus;

    const matchesExternal = externalFilter
      ? inv.customerName.toLowerCase().includes(externalFilter.toLowerCase()) ||
        inv.customerEmail.toLowerCase().includes(externalFilter.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(externalFilter.toLowerCase())
      : true;

    return matchesStatus && matchesExternal;
  });

  return (
    <div className="table-container">
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
          {(['all', 'paid', 'confirmed', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-slate-200/50'
              }`}
            >
              {status === 'confirmed' ? 'Pending' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="table-header">
              <th className="py-3.5 pl-6 pr-3">Customer</th>
              <th className="px-3 py-3.5">Invoice #</th>
              <th className="px-3 py-3.5">Ref / Subscription</th>
              <th className="px-3 py-3.5">Amount</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Method</th>
              <th className="px-3 py-3.5">Issue Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.slice(0, 7).map((inv) => {
                const statusMeta = STATUS_CONFIG[inv.status] || STATUS_CONFIG.confirmed;
                const StatusIcon = statusMeta.icon;

                return (
                  <tr key={inv.id} className="table-row">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="font-medium text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-xs font-semibold text-[#1c2530]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">
                      {inv.subscriptionNumber || 'On-demand invoice'}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-900">
                      ₹{inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.badgeClass}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500">
                      {inv.paymentMethod || 'Awaiting Method'}
                    </td>
                    <td className="px-3 py-3.5 text-slate-500">{inv.issueDate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
