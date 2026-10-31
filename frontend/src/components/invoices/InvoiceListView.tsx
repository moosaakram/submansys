'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/common/Logo';
import {
  FileText,
  Zap,
  CheckCircle2,
  XCircle,
  Mail,
  Printer,
  CreditCard,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  X,
  FileCheck,
  Building,
  Check,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '@/types/subscription';

export default function InvoiceListView() {
  const {
    invoices,
    runBillingDay,
    updateInvoiceStatus,
    sendInvoice,
    recordPayment,
    currentUser,
    analytics,
  } = useSubscription();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Payment Modal state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('credit_card');
  const [payNotes, setPayNotes] = useState('');
  const [payRef, setPayRef] = useState('');

  const [today, setToday] = useState('2026-10-31');

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
    const remaining = inv.totalAmount - (inv.amountPaid || 0);
    setPayAmount(remaining.toFixed(2));
    setPayRef(`WIRE-${Date.now().toString().slice(-6)}`);
    setPayNotes(`Payment for ${inv.invoiceNumber}`);
  };

  const handleQuickSettle = (inv: Invoice) => {
    const remaining = inv.totalAmount - (inv.amountPaid || 0);
    recordPayment({
      invoiceId: inv.id,
      amount: remaining,
      paymentMethod: 'credit_card',
      transactionRef: `QUICK-${Date.now().toString().slice(-4)}`,
      notes: '1-Click Settlement',
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    recordPayment({
      invoiceId: selectedInvoiceForPayment.id,
      amount: parseFloat(payAmount) || 0,
      paymentMethod: payMethod,
      transactionRef: payRef,
      notes: payNotes,
    });

    setSelectedInvoiceForPayment(null);
  };

  const filteredInvoices = invoices.filter((inv) => {
    // If customer role, only show own invoices!
    if (
      currentUser.role === 'customer' &&
      inv.customerEmail.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      return false;
    }

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.subscriptionNumber &&
        inv.subscriptionNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (inv: Invoice) => {
    const isOverdue =
      inv.status === 'confirmed' && inv.amountPaid < inv.totalAmount && inv.dueDate < today;

    if (isOverdue) {
      return (
        <span className="badge-danger font-bold">
          <AlertTriangle className="h-3 w-3" /> Overdue
        </span>
      );
    }

    switch (inv.status) {
      case 'draft':
        return <span className="badge-neutral">Draft</span>;
      case 'confirmed':
        return <span className="badge-warning">Unpaid</span>;
      case 'paid':
        return <span className="badge-success">Paid in Full</span>;
      case 'cancelled':
        return <span className="badge-neutral">Cancelled</span>;
    }
  };

  const totalInvoicedSum = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaidSum = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const totalOpenSum = Math.max(0, totalInvoicedSum - totalPaidSum);

  return (
    <div className="space-y-6">
      {/* Header Bar with 1-Click Billing Day Run */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
            <FileText className="h-3 w-3" />
            <span>Scene 4: Billing Day & Automated Recurring Invoicing</span>
          </div>
          <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
            {currentUser.role === 'customer' ? 'My Invoices & Receipts' : 'Invoices & Recurring Billing'}
          </h2>
          <div className="title-accent-rule" />
          <p className="mt-0.5 text-xs text-slate-500">
            Automated recurring invoice generation, automatic tax calculation, and payment reconciliation.
          </p>
        </div>

        {currentUser.role !== 'customer' && (
          <button
            type="button"
            onClick={() => runBillingDay()}
            className="btn-gold cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>⚡ Run Billing Day (Auto-Bill)</span>
          </button>
        )}
      </div>

      {/* Simplified Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          <div className="font-[family-name:var(--font-serif)] text-2xl font-bold text-slate-900 mt-1">${totalInvoicedSum.toFixed(2)}</div>
        </div>
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paid & Settled</span>
          <div className="font-[family-name:var(--font-serif)] text-2xl font-bold text-emerald-700 mt-1">${totalPaidSum.toFixed(2)}</div>
        </div>
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Awaiting Settlement</span>
          <div className="font-[family-name:var(--font-serif)] text-2xl font-bold text-slate-900 mt-1">${totalOpenSum.toFixed(2)}</div>
        </div>
        <div className="card-surface p-4 border-rose-200/90 bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Overdue Count</span>
          <div className="font-[family-name:var(--font-serif)] text-2xl font-bold text-rose-700 mt-1">{analytics.overdueInvoicesCount} invoices</div>
        </div>
      </div>

      {/* Filter and Status Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'draft', 'confirmed', 'paid', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'confirmed' ? 'Unpaid' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs bg-white text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="table-header">
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Issue / Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Total & Paid</th>
                <th className="px-5 py-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-semibold text-[#1c2530]">{inv.invoiceNumber}</div>
                      {inv.subscriptionNumber && (
                        <span className="text-[10px] text-[#c9ab70] font-medium">
                          {inv.subscriptionNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-700">{inv.issueDate}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(inv)}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-[family-name:var(--font-serif)] font-bold text-slate-900 text-sm">${inv.totalAmount.toFixed(2)}</div>
                      {inv.amountPaid > 0 && (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Paid: ${inv.amountPaid.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Quick Settle Button for Unpaid Invoices */}
                        {inv.status === 'confirmed' && (
                          <button
                            onClick={() => handleQuickSettle(inv)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800 shadow-2xs transition-colors cursor-pointer"
                            title="Instant 1-Click Payment Settlement"
                          >
                            <Check className="h-3 w-3" />
                            <span>Quick Pay</span>
                          </button>
                        )}

                        {/* Print / View Preview */}
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Print or View Invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        {/* Send Email simulation */}
                        {inv.status !== 'cancelled' && (
                          <button
                            onClick={() => sendInvoice(inv.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Send Invoice to Customer Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Confirm action for Draft */}
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'confirmed')}
                            className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-[#1c2530] hover:bg-slate-200 cursor-pointer transition-colors"
                          >
                            Confirm
                          </button>
                        )}

                        {/* Full Payment Modal option */}
                        {inv.status === 'confirmed' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                            title="Record Custom Payment with Reference"
                          >
                            Details
                          </button>
                        )}

                        {/* Cancel Invoice */}
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'cancelled')}
                            className="rounded-lg text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                            title="Cancel / Void Invoice"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Printable / Branded Invoice View */}
      {selectedInvoiceForPrint && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl my-8">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Print Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div>
                <Logo size="md" theme="dark" subtext="Subscription Management" />
                <p className="text-xs text-slate-500 mt-2">
                  100 Innovation Way, Suite 400<br />San Francisco, CA 94105
                </p>
              </div>

              <div className="text-right">
                <span className="font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900 block">INVOICE</span>
                <span className="font-mono text-xs font-semibold text-[#1c2530]">{selectedInvoiceForPrint.invoiceNumber}</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Issue Date: {selectedInvoiceForPrint.issueDate}<br />
                  Due Date: {selectedInvoiceForPrint.dueDate}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="my-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Billed To
                </span>
                <div className="font-bold text-slate-900">{selectedInvoiceForPrint.customerName}</div>
                <div className="text-slate-500">{selectedInvoiceForPrint.customerEmail}</div>
                {selectedInvoiceForPrint.subscriptionNumber && (
                  <div className="text-[#c9ab70] font-medium mt-1">
                    Ref: {selectedInvoiceForPrint.subscriptionNumber}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Invoice Status
                </span>
                <div>{getStatusBadge(selectedInvoiceForPrint)}</div>
                {selectedInvoiceForPrint.paymentMethod && (
                  <div className="text-emerald-700 font-semibold mt-1">
                    Paid via: {selectedInvoiceForPrint.paymentMethod}
                  </div>
                )}
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-xs mb-6">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoiceForPrint.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{l.description}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{l.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">${l.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {l.taxRate}% (${l.taxAmount.toFixed(2)})
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${l.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total summary */}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <div className="w-64 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ${selectedInvoiceForPrint.subtotal.toFixed(2)}
                  </span>
                </div>
                {selectedInvoiceForPrint.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied:</span>
                    <span>-${selectedInvoiceForPrint.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Calculated Tax (10%):</span>
                  <span className="font-semibold text-slate-900">
                    ${selectedInvoiceForPrint.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total Due:</span>
                  <span className="font-[family-name:var(--font-serif)] font-bold text-lg text-[#1c2530]">
                    ${selectedInvoiceForPrint.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="btn-light-secondary cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-gold cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {selectedInvoiceForPayment && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <button
              onClick={() => setSelectedInvoiceForPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Scene 6: The Money Comes In
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs text-slate-500">
                Invoice: <strong>{selectedInvoiceForPayment.invoiceNumber}</strong> (
                {selectedInvoiceForPayment.customerName})
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:outline-hidden"
                >
                  <option value="credit_card">Credit Card (Visa / Mastercard)</option>
                  <option value="bank_transfer">Bank Wire Transfer (ACH)</option>
                  <option value="cash">Direct Deposit / Cash</option>
                  <option value="ach">SEPA / Direct Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. WIRE-892102"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Settlement notes..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
