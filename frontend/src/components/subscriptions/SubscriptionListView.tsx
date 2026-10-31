'use client';

import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  FileText,
  DollarSign,
  X,
  FilePlus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionLine,
  BillingCycle,
} from '@/types/subscription';

export default function SubscriptionListView() {
  const {
    subscriptions,
    createSubscription,
    updateSubscriptionStatus,
    togglePauseSubscription,
    renewSubscription,
    customers,
    products,
    plans,
    quotationTemplates,
    currentUser,
    taxRules,
  } = useSubscription();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedSubDetail, setSelectedSubDetail] = useState<Subscription | null>(null);

  // New Subscription / Quote Builder Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customerId, setCustomerId] = useState(customers[0]?.id || 'cust-1');
  const [planId, setPlanId] = useState(plans[0]?.id || 'plan-monthly');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [initialStatus, setInitialStatus] = useState<SubscriptionStatus>('draft');
  const [startDate, setStartDate] = useState('2026-10-31');
  const [expiryDate, setExpiryDate] = useState('2027-10-31');
  const [lines, setLines] = useState<Omit<SubscriptionLine, 'id'>[]>([
    {
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'Base Software',
      variantId: products[0]?.variants[0]?.id,
      variantName: products[0]?.variants[0]?.name,
      quantity: 1,
      unitPrice:
        (products[0]?.salesPrice || 299) + (products[0]?.variants[0]?.priceDelta || 0),
      taxRate: 10,
      discountAmount: 0,
      lineTotal:
        (products[0]?.salesPrice || 299) + (products[0]?.variants[0]?.priceDelta || 0),
    },
  ]);
  const [notes, setNotes] = useState('');

  // Handle Quotation Template Selection (Scene 3 requirement)
  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (!tplId) return;

    const tpl = quotationTemplates.find((t) => t.id === tplId);
    if (!tpl) return;

    setPlanId(tpl.defaultPlanId);
    setInitialStatus('quotation'); // Set as quotation when started from template

    // Set expiry based on validity days
    const exp = new Date(Date.now() + tpl.validityDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setExpiryDate(exp);

    // Build lines from template
    const templateLines: Omit<SubscriptionLine, 'id'>[] = tpl.defaultLines.map((tl) => {
      const prod = products.find((p) => p.id === tl.productId) || products[0];
      const variant = prod.variants.find((v) => v.id === tl.variantId);
      const unitPrice = prod.salesPrice + (variant?.priceDelta || 0);
      const gross = unitPrice * tl.quantity;
      const discount = tl.discountPercent ? (gross * tl.discountPercent) / 100 : 0;
      const net = gross - discount;

      return {
        productId: prod.id,
        productName: prod.name,
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: tl.quantity,
        unitPrice,
        taxRate: 10,
        discountAmount: discount,
        lineTotal: net,
      };
    });

    setLines(templateLines);
    setNotes(`Created from quotation template: ${tpl.name} (Valid for ${tpl.validityDays} days).`);
  };

  const handleAddLine = () => {
    const prod = products[0];
    const unitPrice = prod.salesPrice;
    setLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unitPrice,
        taxRate: 10,
        discountAmount: 0,
        lineTotal: unitPrice,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProductChangeInLine = (idx: number, newProdId: string) => {
    const prod = products.find((p) => p.id === newProdId) || products[0];
    const unitPrice = prod.salesPrice;
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const lineTotal = unitPrice * l.quantity - l.discountAmount;
        return {
          ...l,
          productId: prod.id,
          productName: prod.name,
          variantId: undefined,
          variantName: undefined,
          unitPrice,
          lineTotal: Math.max(0, lineTotal),
        };
      })
    );
  };

  const handleVariantChangeInLine = (idx: number, variantId: string) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const prod = products.find((p) => p.id === l.productId);
        const variant = prod?.variants.find((v) => v.id === variantId);
        const unitPrice = (prod?.salesPrice || 0) + (variant?.priceDelta || 0);
        const lineTotal = unitPrice * l.quantity - l.discountAmount;
        return {
          ...l,
          variantId: variant?.id,
          variantName: variant?.name,
          unitPrice,
          lineTotal: Math.max(0, lineTotal),
        };
      })
    );
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    const validQty = Math.max(1, qty);
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const lineTotal = l.unitPrice * validQty - l.discountAmount;
        return {
          ...l,
          quantity: validQty,
          lineTotal: Math.max(0, lineTotal),
        };
      })
    );
  };

  // Calculations
  const calculatedSubtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const calculatedDiscount = lines.reduce((acc, l) => acc + l.discountAmount, 0);
  const calculatedTax = (calculatedSubtotal - calculatedDiscount) * 0.1; // 10%
  const calculatedTotal = calculatedSubtotal - calculatedDiscount + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    const pln = plans.find((p) => p.id === planId) || plans[0];

    const formattedLines: SubscriptionLine[] = lines.map((l, idx) => ({
      id: `line-${Date.now()}-${idx}`,
      ...l,
    }));

    createSubscription({
      customerId: cust.id,
      customerName: cust.fullName,
      customerEmail: cust.email,
      planId: pln.id,
      planName: pln.name,
      billingCycle: pln.billingCycle,
      status: initialStatus,
      startDate,
      expiryDate,
      paymentTerms,
      lines: formattedLines,
      subtotal: calculatedSubtotal,
      discountAmount: calculatedDiscount,
      taxAmount: calculatedTax,
      totalAmount: calculatedTotal,
      notes,
      autoClose: pln.autoCloseOnExpiry,
    });

    setIsBuilderOpen(false);
  };

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((s) => {
    // If customer role, only show customer's own subscriptions!
    if (currentUser.role === 'customer' && s.customerEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      return false;
    }

    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SubscriptionStatus, isPaused?: boolean) => {
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
          <Pause className="h-3 w-3" /> Paused
        </span>
      );
    }
    switch (status) {
      case 'draft':
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">Draft</span>;
      case 'quotation':
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">Quotation</span>;
      case 'confirmed':
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">Confirmed</span>;
      case 'active':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>;
      case 'closed':
        return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Closed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Repeat className="h-3.5 w-3.5" />
            <span>Scene 3: Quotation to Subscription Lifecycle</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {currentUser.role === 'customer' ? 'My Active Subscriptions' : 'Subscriptions & Quotes'}
          </h2>
          <p className="text-xs text-slate-500">
            Track full progression: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        {currentUser.role !== 'customer' && (
          <button
            type="button"
            onClick={() => {
              setSelectedTemplateId('');
              setIsBuilderOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Quote / Subscription</span>
          </button>
        )}
      </div>

      {/* Lifecycle Stage Visual Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Lifecycle State Progression (Scene 3)
        </span>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700 font-semibold border border-slate-200">
            1. Draft
          </div>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-700 font-semibold border border-blue-200">
            2. Quotation
          </div>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-700 font-semibold border border-purple-200">
            3. Confirmed
          </div>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 font-semibold border border-emerald-200">
            4. Active
          </div>
          <div className="rounded-xl bg-rose-50 p-2 text-rose-700 font-semibold border border-rose-200">
            5. Closed
          </div>
        </div>
      </div>

      {/* Filter and Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'draft', 'quotation', 'confirmed', 'active', 'closed'].map((st) => (
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
            placeholder="Search number, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Subscription #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan & Frequency</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Valid Until</th>
                <th className="px-5 py-3.5 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No subscriptions or quotations found for this filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <button
                        onClick={() => setSelectedSubDetail(sub)}
                        className="text-indigo-600 hover:underline cursor-pointer"
                      >
                        {sub.subscriptionNumber}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{sub.billingCycle}</div>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(sub.status, sub.isPaused)}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ${sub.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{sub.expiryDate}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* State Machine Transition Buttons */}
                        {sub.status === 'draft' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'quotation')}
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                            title="Turn Draft into Quotation offer"
                          >
                            To Quotation &rarr;
                          </button>
                        )}

                        {sub.status === 'quotation' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'confirmed')}
                            className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 cursor-pointer"
                            title="Confirm Customer Order"
                          >
                            Confirm Order &rarr;
                          </button>
                        )}

                        {sub.status === 'confirmed' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            title="Activate Subscription"
                          >
                            Activate &rarr;
                          </button>
                        )}

                        {sub.status === 'active' && (
                          <>
                            <button
                              onClick={() => togglePauseSubscription(sub.id)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                              title={sub.isPaused ? 'Resume billing' : 'Pause billing'}
                            >
                              {sub.isPaused ? <Play className="h-3.5 w-3.5 text-emerald-600" /> : <Pause className="h-3.5 w-3.5 text-amber-600" />}
                            </button>
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'closed')}
                              className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                              title="Close / Cancel early"
                            >
                              Close
                            </button>
                          </>
                        )}

                        {sub.status === 'closed' && (
                          <button
                            onClick={() => renewSubscription(sub.id, 12)}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3 inline mr-1" /> Renew
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

      {/* Modal: New Quote / Subscription Builder */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 my-8">
            <button
              onClick={() => setIsBuilderOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Scene 3: Turn Quote into Subscription
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Quote & Subscription Builder
              </h3>
              <p className="text-xs text-slate-500">
                Start from a quotation template or assemble custom product lines with variants and taxes.
              </p>
            </div>

            {/* Template Selector Banner (Scene 3 requirement) */}
            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <label className="block text-xs font-bold text-indigo-950 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Start from Quotation Template (Scene 3):</span>
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="">-- Start from Blank Quote --</option>
                {quotationTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Valid for {t.validityDays} days)
                  </option>
                ))}
              </select>

              <div className="mt-2 flex flex-wrap gap-2">
                {quotationTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                      selectedTemplateId === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    ⚡ {t.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.companyName || 'Individual'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.basePrice}/{p.billingCycle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial State
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as SubscriptionStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden capitalize"
                  >
                    <option value="draft">Draft</option>
                    <option value="quotation">Quotation</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Product Lines & Variants (Scene 3)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Product Line
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => {
                    const currentProd = products.find((p) => p.id === line.productId);
                    return (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 border border-slate-200 text-xs"
                      >
                        {/* Product Selector */}
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChangeInLine(idx, e.target.value)}
                          className="flex-1 min-w-40 rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-hidden"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice})
                            </option>
                          ))}
                        </select>

                        {/* Variant Selector if available */}
                        {currentProd && currentProd.variants.length > 0 && (
                          <select
                            value={line.variantId || ''}
                            onChange={(e) => handleVariantChangeInLine(idx, e.target.value)}
                            className="w-44 rounded-lg border border-indigo-200 bg-indigo-50/50 px-2 py-1.5 text-indigo-950 focus:outline-hidden font-medium"
                          >
                            <option value="">No Variant / Base</option>
                            {currentProd.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (+${v.priceDelta})
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Quantity */}
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-[10px] text-slate-400">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-center focus:outline-hidden"
                          />
                        </div>

                        {/* Unit price display */}
                        <div className="text-right w-20">
                          <span className="text-[10px] text-slate-400 block">Unit</span>
                          <span className="font-semibold text-slate-800">
                            ${line.unitPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Line total */}
                        <div className="text-right w-24">
                          <span className="text-[10px] text-slate-400 block">Total</span>
                          <span className="font-bold text-slate-900">
                            ${line.lineTotal.toFixed(2)}
                          </span>
                        </div>

                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal & Taxes Summary */}
                <div className="mt-3 flex justify-end">
                  <div className="w-56 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-900">
                        ${calculatedSubtotal.toFixed(2)}
                      </span>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>-${calculatedDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span className="font-semibold text-slate-900">
                        ${calculatedTax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-indigo-600">${calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quotation validity notes or customer terms..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Create {initialStatus === 'quotation' ? 'Quotation' : 'Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Subscription Detail View */}
      {selectedSubDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <button
              onClick={() => setSelectedSubDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {selectedSubDetail.subscriptionNumber}
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {selectedSubDetail.planName}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: <strong>{selectedSubDetail.customerName}</strong> ({selectedSubDetail.customerEmail})
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Lifecycle Status:</span>
                <div>{getStatusBadge(selectedSubDetail.status, selectedSubDetail.isPaused)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="font-semibold capitalize text-slate-800">
                  {selectedSubDetail.billingCycle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-semibold text-slate-800">{selectedSubDetail.paymentTerms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-800">{selectedSubDetail.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiry Date:</span>
                <span className="font-semibold text-slate-800">{selectedSubDetail.expiryDate}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-800 block mb-2">Itemized Lines</span>
              <div className="space-y-1.5 text-xs">
                {selectedSubDetail.lines.map((l) => (
                  <div key={l.id} className="flex justify-between text-slate-700">
                    <span>
                      {l.productName} {l.variantName ? `(${l.variantName})` : ''} x {l.quantity}
                    </span>
                    <span className="font-semibold">${l.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-indigo-600">${selectedSubDetail.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubDetail(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
