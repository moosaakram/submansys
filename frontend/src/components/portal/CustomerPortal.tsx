'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  FileText,
  Repeat,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Building,
} from 'lucide-react';

export interface CustomerSubscriptionItem {
  id: string;
  subscriptionNumber: string;
  productName: string;
  variant?: string;
  planName: string;
  billingFrequency: 'Monthly' | 'Yearly' | 'Weekly';
  unitPrice: number;
  seats: number;
  startDate: string;
  nextRenewalDate: string;
  status: 'Active' | 'Paused' | 'Closed';
  autoRenew: boolean;
}

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Confirmed' | 'Draft';
  itemsCount: number;
}

export const CustomerPortal: React.FC = () => {
  const { currentUser } = useSubscription();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'billing'>('subscriptions');

  // Customer Data representing the currently authenticated business account
  const customerInfo = {
    name: currentUser?.name || 'Alex Rivera',
    email: currentUser?.email || 'alex@riveradesign.io',
    company: currentUser?.companyName || 'Rivera Design Studio',
    memberSince: currentUser?.createdAt || 'Jan 15, 2026',
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expiry: '08/28',
    },
  };

  const [subscriptions, setSubscriptions] = useState<CustomerSubscriptionItem[]>([
    {
      id: 'sub-001',
      subscriptionNumber: 'SUB-2026-0891',
      productName: 'SubMan Business Suite',
      variant: 'Odoo Enterprise Integration (+560)',
      planName: 'Growth Tier (Annual)',
      billingFrequency: 'Yearly',
      unitPrice: 2450.0,
      seats: 12,
      startDate: '2026-01-15',
      nextRenewalDate: '2027-01-15',
      status: 'Active',
      autoRenew: true,
    },
    {
      id: 'sub-002',
      subscriptionNumber: 'SUB-2026-1104',
      productName: 'Automated Dunning & Analytics',
      planName: 'Add-on Module (Monthly)',
      billingFrequency: 'Monthly',
      unitPrice: 199.0,
      seats: 1,
      startDate: '2026-03-01',
      nextRenewalDate: '2026-11-01',
      status: 'Active',
      autoRenew: true,
    },
  ]);

  const [invoices] = useState<CustomerInvoiceItem[]>([
    {
      id: 'inv-101',
      invoiceNumber: 'INV-2026-0412',
      date: '2026-10-01',
      dueDate: '2026-10-15',
      amount: 199.0,
      status: 'Paid',
      itemsCount: 1,
    },
    {
      id: 'inv-102',
      invoiceNumber: 'INV-2026-0389',
      date: '2026-09-01',
      dueDate: '2026-09-15',
      amount: 199.0,
      status: 'Paid',
      itemsCount: 1,
    },
    {
      id: 'inv-103',
      invoiceNumber: 'INV-2026-0015',
      date: '2026-01-15',
      dueDate: '2026-01-30',
      amount: 2450.0,
      status: 'Paid',
      itemsCount: 12,
    },
  ]);

  const handleToggleAutoRenew = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === subId ? { ...sub, autoRenew: !sub.autoRenew } : sub
      )
    );
  };

  const handleTogglePause = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subId) {
          const nextStatus = sub.status === 'Active' ? 'Paused' : 'Active';
          return { ...sub, status: nextStatus };
        }
        return sub;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      {/* Header Bar: Solid Dark Navy / Topbar Surface */}
      <header className="topbar-surface sticky top-0 z-30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" theme="light" subtext={`${customerInfo.company} • ${customerInfo.email}`} />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-[#c9ab70] hover:text-[#dcc28a] flex items-center gap-1 transition-colors"
            >
              <span>Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/login';
              }}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Welcome Banner: Deep Obsidian Navy with Gold Accent */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171f28] via-[#1c2530] to-[#212c37] border border-[#c9ab70]/30 text-white shadow-xl shadow-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#c9ab70]">
              Welcome to your account
            </span>
            <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight mt-1 text-white">
              {customerInfo.company}
            </h1>
            <div className="title-accent-rule" />
            <p className="text-xs text-white/70 mt-1">
              View your active subscriptions, manage recurring renewals, and download tax invoices without emailing support.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium border border-[#c9ab70]/40 text-[#c9ab70]">
              Account Status: Verified
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'border-[#c9ab70] text-[#1c2530] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>My Subscriptions ({subscriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-[#c9ab70] text-[#1c2530] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Billing & Invoices ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'border-[#c9ab70] text-[#1c2530] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Method</span>
          </button>
        </div>

        {/* Tab 1: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Active Subscription Plans
                </h2>
                <p className="text-xs text-slate-500">
                  Self-service control over your active software entitlements and add-ons
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="card-surface p-5 space-y-4 hover:border-[#c9ab70]/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono text-[#1c2530] font-semibold">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {sub.productName}
                      </h3>
                      {sub.variant && (
                        <p className="text-xs text-[#c9ab70] font-medium">
                          {sub.variant}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">{sub.planName}</p>
                    </div>
                    <span
                      className={sub.status === 'Active' ? 'badge-success' : 'badge-warning'}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Rate & Billing</span>
                      <span className="font-[family-name:var(--font-serif)] font-bold text-slate-900 text-sm">
                        ₹{sub.unitPrice.toLocaleString('en-IN')} / {sub.billingFrequency.toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Allocated Seats</span>
                      <span className="font-bold text-slate-800">
                        {sub.seats} Users
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Start Date</span>
                      <span className="font-medium text-slate-700">
                        {sub.startDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Next Renewal</span>
                      <span className="font-medium text-slate-700">
                        {sub.nextRenewalDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleTogglePause(sub.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      {sub.status === 'Active' ? (
                        <>
                          <PauseCircle className="w-4 h-4 text-amber-500" />
                          <span>Pause Subscription</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 text-emerald-500" />
                          <span>Resume Subscription</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAutoRenew(sub.id)}
                      className="text-xs font-medium text-[#1c2530] hover:text-[#c9ab70] hover:underline cursor-pointer transition-colors"
                    >
                      {sub.autoRenew ? 'Auto-renew Enabled' : 'Manual Renewal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Invoice & Receipt History
              </h2>
              <p className="text-xs text-slate-500">
                Generated automatically from your active subscriptions. Taxes and product lines calculated automatically.
              </p>
            </div>

            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                      Billing Date
                    </th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-right">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="table-row"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-[#1c2530]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {inv.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-4 font-[family-name:var(--font-serif)] font-bold text-slate-900 text-sm">
                        ₹{inv.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="badge-success">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{inv.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber}`)}
                          className="btn-light-secondary cursor-pointer py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Method */}
        {activeTab === 'billing' && (
          <div className="max-w-lg space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payment Method on File
              </h2>
              <p className="text-xs text-slate-500">
                Used for automated recurring billing on your scheduled renewal dates
              </p>
            </div>

            <div className="card-surface p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-8 rounded-lg bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 flex items-center justify-center font-bold text-xs shadow-xs">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Visa ending in {customerInfo.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-slate-400">
                    Expires {customerInfo.paymentMethod.expiry} • Default method
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Payment update modal')}
                className="text-xs font-semibold text-[#1c2530] hover:text-[#c9ab70] hover:underline cursor-pointer transition-colors"
              >
                Update Card
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Payments processed securely via encrypted tokenization.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;
