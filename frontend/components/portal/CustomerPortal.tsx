"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export interface CustomerSubscriptionItem {
  id: string;
  subscriptionNumber: string;
  productName: string;
  variant?: string;
  planName: string;
  billingFrequency: "Monthly" | "Yearly" | "Weekly";
  unitPrice: number;
  seats: number;
  startDate: string;
  nextRenewalDate: string;
  status: "Active" | "Paused" | "Closed";
  autoRenew: boolean;
}

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Confirmed" | "Draft";
  itemsCount: number;
}

export const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "billing">("subscriptions");

  const customerInfo = {
    name: "Alex Rivera",
    email: "alex@riveradesign.io",
    company: "Rivera Design Studio",
    memberSince: "Jan 15, 2026",
    paymentMethod: {
      brand: "Visa",
      last4: "4242",
      expiry: "08/28",
    },
  };

  const [subscriptions, setSubscriptions] = useState<CustomerSubscriptionItem[]>([
    {
      id: "sub-001",
      subscriptionNumber: "SUB-2026-0891",
      productName: "Brightloop Business Cloud",
      variant: "Odoo Enterprise Integration (+560)",
      planName: "Growth Tier (Annual)",
      billingFrequency: "Yearly",
      unitPrice: 2450.0,
      seats: 12,
      startDate: "2026-01-15",
      nextRenewalDate: "2027-01-15",
      status: "Active",
      autoRenew: true,
    },
    {
      id: "sub-002",
      subscriptionNumber: "SUB-2026-1104",
      productName: "Automated Dunning & Analytics",
      planName: "Add-on Module (Monthly)",
      billingFrequency: "Monthly",
      unitPrice: 199.0,
      seats: 1,
      startDate: "2026-03-01",
      nextRenewalDate: "2026-11-01",
      status: "Active",
      autoRenew: true,
    },
  ]);

  const [invoices] = useState<CustomerInvoiceItem[]>([
    {
      id: "inv-101",
      invoiceNumber: "INV-2026-0412",
      date: "2026-10-01",
      dueDate: "2026-10-15",
      amount: 199.0,
      status: "Paid",
      itemsCount: 1,
    },
    {
      id: "inv-102",
      invoiceNumber: "INV-2026-0389",
      date: "2026-09-01",
      dueDate: "2026-09-15",
      amount: 199.0,
      status: "Paid",
      itemsCount: 1,
    },
    {
      id: "inv-103",
      invoiceNumber: "INV-2026-0015",
      date: "2026-01-15",
      dueDate: "2026-01-30",
      amount: 2450.0,
      status: "Paid",
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
          const nextStatus = sub.status === "Active" ? "Paused" : "Active";
          return { ...sub, status: nextStatus };
        }
        return sub;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              360
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Brightloop
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                  Customer Self-Service Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {customerInfo.company} • {customerInfo.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <span>Admin Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/login"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
              Welcome to your account
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              {customerInfo.company}
            </h1>
            <p className="text-xs text-indigo-100/90 mt-1">
              View your active subscriptions, manage recurring renewals, and download tax invoices without emailing support.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/20">
              Account Status: Verified
            </span>
          </div>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "subscriptions"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>My Subscriptions ({subscriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "invoices"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Billing & Invoices ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "billing"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Method</span>
          </button>
        </div>

        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
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
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {sub.productName}
                      </h3>
                      {sub.variant && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {sub.variant}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">{sub.planName}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sub.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="text-slate-400 block">Rate & Billing</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ${sub.unitPrice.toLocaleString()} / {sub.billingFrequency.toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Allocated Seats</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {sub.seats} Users
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Start Date</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {sub.startDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Next Renewal</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {sub.nextRenewalDate}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleTogglePause(sub.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1.5"
                    >
                      {sub.status === "Active" ? (
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
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {sub.autoRenew ? "Auto-renew Enabled" : "Manual Renewal"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Invoice & Receipt History
              </h2>
              <p className="text-xs text-slate-500">
                Generated automatically from your active subscriptions. Taxes and product lines calculated automatically.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {inv.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{inv.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

        {activeTab === "billing" && (
          <div className="max-w-lg space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Payment Method on File
              </h2>
              <p className="text-xs text-slate-500">
                Used for automated recurring billing on your scheduled renewal dates
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-8 rounded-lg bg-slate-900 dark:bg-indigo-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Visa ending in {customerInfo.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-slate-400">
                    Expires {customerInfo.paymentMethod.expiry} • Default method
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Payment update modal")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Update Card
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
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
