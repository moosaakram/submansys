'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Mail,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

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
        return <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">Credit Card</span>;
      case 'bank_transfer':
        return <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Bank Wire (ACH)</span>;
      case 'ach':
        return <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Direct Debit</span>;
      default:
        return <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">Cash / Direct</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Scene 6: The Money Comes In & Dunning Chaser</span>
        </div>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {currentUser.role === 'customer' ? 'My Payment History' : 'Payment Reconciliation Ledger'}
        </h2>
        <p className="text-xs text-slate-500">
          Match incoming payments against invoices, track unsettled balances, and chase overdue revenue.
        </p>
      </div>

      {/* Revenue & Outstanding KPI Summary Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue Collected
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">
              ${analytics.totalRevenueCollected.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">settled in bank</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending Collections
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              ${analytics.pendingAmount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">across open invoices</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Overdue at Risk
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-700">
              ${analytics.overdueAmount.toFixed(2)}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              ({analytics.overdueInvoicesCount} overdue)
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Invoices Alert Section (Scene 6 requirement: "chased before they turn into lost revenue") */}
      {currentUser.role !== 'customer' && overdueInvoices.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-2xs space-y-3">
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
                  <span className="font-bold text-slate-900 mr-2">{inv.invoiceNumber}</span>
                  <span className="font-medium text-slate-700">{inv.customerName}</span>
                  <span className="text-slate-400 ml-2">({inv.customerEmail})</span>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Due since {inv.dueDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-rose-700 block text-sm">
                      ${(inv.totalAmount - inv.amountPaid).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">Balance due</span>
                  </div>
                  <button
                    onClick={() => sendInvoice(inv.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="h-3 w-3" />
                    <span>Chase / Send Reminder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900">Recorded Payment Ledger</h3>
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, customer, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
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
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600">{p.paymentDate}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      {p.transactionRef}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-indigo-600">{p.invoiceNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="px-5 py-3.5">{getMethodBadge(p.paymentMethod)}</td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">
                      +${p.amount.toFixed(2)}
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
