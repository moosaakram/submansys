'use client';

import React, { useState, useEffect } from 'react';
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
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
          <AlertTriangle className="h-3 w-3" /> Overdue
        </span>
      );
    }

    switch (inv.status) {
      case 'draft':
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">Draft</span>;
      case 'confirmed':
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">Confirmed (Unpaid)</span>;
      case 'paid':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">Paid</span>;
      case 'cancelled':
        return <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with 1-Click Billing Day Run */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <FileText className="h-3.5 w-3.5" />
            <span>Scene 4: Billing Day & Automated Recurring Invoicing</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {currentUser.role === 'customer' ? 'My Invoices & Receipts' : 'Invoices & Billing Automation'}
          </h2>
          <p className="text-xs text-slate-500">
            Automated recurring invoice generation, automatic tax calculation, and payment reconciliation.
          </p>
        </div>

        {currentUser.role !== 'customer' && (
          <button
            type="button"
            onClick={() => runBillingDay()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4 text-amber-300" />
            <span>⚡ Run Billing Day</span>
          </button>
        )}
      </div>

      {/* Filter and Status Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'draft', 'confirmed', 'paid', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
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
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Issue / Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Total & Paid</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No invoices match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                      {inv.subscriptionNumber && (
                        <span className="text-[10px] text-indigo-600 font-medium">
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
                      <div className="font-bold text-slate-900">${inv.totalAmount.toFixed(2)}</div>
                      {inv.amountPaid > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Paid: ${inv.amountPaid.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print / View Preview */}
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          title="Print or View Invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        {/* Send Email simulation */}
                        {inv.status !== 'cancelled' && (
                          <button
                            onClick={() => sendInvoice(inv.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Send Invoice to Customer Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Confirm action for Draft */}
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'confirmed')}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}

                        {/* Record Payment action for Confirmed/Unpaid */}
                        {inv.status === 'confirmed' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                          >
                            {currentUser.role === 'customer' ? 'Pay Now' : 'Record Payment'}
                          </button>
                        )}

                        {/* Cancel Invoice */}
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'cancelled')}
                            className="rounded-lg text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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

      {/* Modal: Printable / Branded Invoice View (Scene 4 requirement) */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200 my-8">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Print Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    BL
                  </div>
                  <span className="text-lg font-bold text-slate-900">Brightloop Software</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100 Innovation Way, Suite 400<br />San Francisco, CA 94105
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900 block">INVOICE</span>
                <span className="text-xs font-bold text-indigo-600">{selectedInvoiceForPrint.invoiceNumber}</span>
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
                  <div className="text-indigo-600 font-medium mt-1">
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
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
                  <span>Total Due:</span>
                  <span className="text-indigo-600">
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Payment (Scene 6 requirement) */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <button
              onClick={() => setSelectedInvoiceForPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Scene 6: The Money Comes In
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Record Payment</h3>
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Settlement notes..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
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
