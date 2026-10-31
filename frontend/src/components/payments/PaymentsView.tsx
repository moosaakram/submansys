'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Mail,
  ArrowUpRight,
  Send,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import PageHeader from '@/components/common/PageHeader';
import KPICard from '@/components/common/KPICard';

export default function PaymentsView() {
  const { payments, invoices, sendInvoice, currentUser, analytics } = useSubscription();
  const [search, setSearch] = useState('');

  const [today, setToday] = useState('2026-10-31');

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  // Overdue and outstanding invoices
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'confirmed' && inv.amountPaid < inv.totalAmount && inv.dueDate < today
  );

  const filteredPayments = payments.filter((p) => {
    if (currentUser.role === 'customer' && p.customerId !== currentUser.id) {
      // Check customer match
      const matchingCustomer = invoices.find(
        (i) => i.id === p.invoiceId && i.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (!matchingCustomer) return false;
    }

    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <span className="badge-info">Credit Card</span>;
      case 'bank_transfer':
        return <span className="badge-success">Bank Wire (ACH)</span>;
      case 'ach':
        return <span className="badge-info">Direct Debit</span>;
      default:
        return <span className="badge-neutral">Cash / Direct</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Global Page Header */}
      <PageHeader
        title={currentUser.role === 'customer' ? 'My Payment History' : 'Payment Reconciliation Ledger'}
        subtitle="Match incoming payments against invoices, track unsettled balances, and chase overdue revenue."
        category="Core Billing"
        badge={{
          icon: CreditCard,
          text: 'Scene 6: The Money Comes In & Dunning Chaser',
        }}
      />

      {/* Revenue & Outstanding KPI Summary Banner */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <KPICard
          title="Total Revenue Collected"
          value={`₹${analytics.totalRevenueCollected.toFixed(2)}`}
          change="+14.2%"
          isPositive={true}
          comparisonText="settled in bank"
          icon={TrendingUp}
          valueClassName="text-emerald-700"
        />

        <KPICard
          title="Pending Collections"
          value={`₹${analytics.pendingAmount.toFixed(2)}`}
          change={`${invoices.filter((i) => i.status === 'confirmed').length} open`}
          isPositive={true}
          comparisonText="across open invoices"
          icon={Clock}
          valueClassName="text-slate-900"
        />

        <KPICard
          title="Overdue at Risk"
          value={`₹${analytics.overdueAmount.toFixed(2)}`}
          change={overdueInvoices.length > 0 ? `-${overdueInvoices.length} overdue` : '0 overdue'}
          isPositive={overdueInvoices.length === 0}
          comparisonText={overdueInvoices.length > 0 ? `${overdueInvoices.length} awaiting settlement` : 'All accounts in good standing'}
          icon={AlertTriangle}
          valueClassName={overdueInvoices.length > 0 ? 'text-rose-600' : 'text-slate-900'}
        />
      </div>

      {/* Overdue Invoices Alert Section (Scene 6 requirement: "chased before they turn into lost revenue") */}
      {currentUser.role !== 'customer' && overdueInvoices.length > 0 && (
        <div className="card-surface p-4 border-rose-200/90 bg-rose-50/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">
                !
              </span>
              <span className="font-bold text-xs text-slate-900">
                Action Required: Invoices Awaiting Settlement (Scene 6)
              </span>
            </div>
            <span className="text-xs text-rose-600 font-semibold">
              Chase overdue balances immediately
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {overdueInvoices.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 mr-2">{inv.invoiceNumber}</span>
                  <span className="font-medium text-slate-700">{inv.customerName}</span>
                  <span className="text-slate-400 ml-2">({inv.customerEmail})</span>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Due since {inv.dueDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-[family-name:var(--font-serif)] font-bold text-rose-700 block text-sm">
                      ₹{(inv.totalAmount - inv.amountPaid).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">Balance due</span>
                  </div>
                  <button
                    onClick={() => sendInvoice(inv.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="h-3 w-3" />
                    <span>Chase / Reminder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recorded Payment Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time settled receipts, payment transaction references, and reconciled invoice mappings
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, customer, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#c9ab70] focus:ring-2 focus:ring-[#c9ab70]/20 focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="table-header">
                <th className="px-5 py-3.5">Payment Date</th>
                <th className="px-5 py-3.5">Transaction Ref</th>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-5 py-3.5 text-slate-600">{p.paymentDate}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      {p.transactionRef}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#1c2530]">{p.invoiceNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="px-5 py-3.5">{getMethodBadge(p.paymentMethod)}</td>
                    <td className="px-5 py-3.5 text-right font-[family-name:var(--font-serif)] font-bold text-emerald-700 text-sm">
                      +₹{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
