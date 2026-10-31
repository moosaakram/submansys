'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  PauseCircle,
  RefreshCw,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Plan, BillingCycle } from '@/types/subscription';

export default function PlanManagementView() {
  const { plans, addPlan, currentUser } = useSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('299.00');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [minQuantity, setMinQuantity] = useState('1');
  const [startDate, setStartDate] = useState('2026-10-31');
  const [endDate, setEndDate] = useState('');
  const [autoCloseOnExpiry, setAutoCloseOnExpiry] = useState(false);
  const [allowEarlyClosure, setAllowEarlyClosure] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPlan({
      name,
      description,
      basePrice: parseFloat(basePrice) || 0,
      billingCycle,
      minQuantity: parseInt(minQuantity) || 1,
      startDate,
      endDate: endDate || undefined,
      autoCloseOnExpiry,
      allowEarlyClosure,
      allowPause,
      allowRenewal,
      isActive: true,
    });

    // Reset & close
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
            <Layers className="h-3 w-3" />
            <span>Scene 2: Plan Lifecycle & Billing Cycles</span>
          </div>
          <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
            Recurring Plans & Closure Policies
          </h2>
          <div className="title-accent-rule" />
          <p className="mt-0.5 text-xs text-slate-500">
            Configure billing frequency (daily, weekly, monthly, yearly), minimum quantities, and auto-close / pause / renewal rules.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-gold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className="card-surface p-5 flex flex-col justify-between hover:border-[#c9ab70]/40 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1c2530]">
                  {p.billingCycle}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Min {p.minQuantity} {p.minQuantity > 1 ? 'seats' : 'seat'}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {p.description || 'Subscription billing tier.'}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-serif)] text-2xl font-bold text-slate-900">${p.basePrice.toFixed(2)}</span>
                <span className="text-xs text-slate-400">/{p.billingCycle}</span>
              </div>

              {/* Validity Dates */}
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-[#c9ab70]" />
                  <span>Available from: <strong>{p.startDate}</strong></span>
                </div>
                {p.endDate && (
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>Closes on: <strong>{p.endDate}</strong></span>
                  </div>
                )}
              </div>

              {/* Closure & Lifecycle Policies (Scene 2 explicit requirements) */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Plan Lifecycle Rules (Scene 2)
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auto-close on end</span>
                    {p.autoCloseOnExpiry ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Auto-close
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <XCircle className="h-3.5 w-3.5" /> Perpetual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Early closure</span>
                    {p.allowEarlyClosure ? (
                      <span className="badge-success">Allowed</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Locked</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pause billing</span>
                    {p.allowPause ? (
                      <span className="badge-success">Supported</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">No</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auto-renewal</span>
                    {p.allowRenewal ? (
                      <span className="badge-success">Enabled</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Disabled</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Plan */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-lg my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Scene 2: Admin Plan Config
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Create Subscription Plan</h3>
              <p className="text-xs text-slate-500">
                Set billing interval, seat constraints, and lifecycle termination rules.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Annual"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available From
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target audience and plan benefits..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              {/* Closure Policies Toggles */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Closure & Pause Behaviors
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoCloseOnExpiry}
                    onChange={(e) => setAutoCloseOnExpiry(e.target.checked)}
                    className="rounded border-slate-300 text-[#1c2530] focus:ring-[#c9ab70]"
                  />
                  <span><strong>Auto-close:</strong> Plan closes automatically when end date is reached</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowEarlyClosure}
                    onChange={(e) => setAllowEarlyClosure(e.target.checked)}
                    className="rounded border-slate-300 text-[#1c2530] focus:ring-[#c9ab70]"
                  />
                  <span><strong>Early closure:</strong> Customer or staff can terminate before term</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowPause}
                    onChange={(e) => setAllowPause(e.target.checked)}
                    className="rounded border-slate-300 text-[#1c2530] focus:ring-[#c9ab70]"
                  />
                  <span><strong>Pause billing:</strong> Allow temporarily pausing subscription intervals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowRenewal}
                    onChange={(e) => setAllowRenewal(e.target.checked)}
                    className="rounded border-slate-300 text-[#1c2530] focus:ring-[#c9ab70]"
                  />
                  <span><strong>Renewal:</strong> Can be extended / renewed at end of period</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Launch Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
