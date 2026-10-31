'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { DiscountRule, DiscountType, DiscountScope } from '@/types/subscription';

export default function DiscountRulesView() {
  const { discountRules, addDiscountRule, currentUser, products } = useSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState('15');
  const [scope, setScope] = useState<DiscountScope>('entire_subscription');
  const [minQuantity, setMinQuantity] = useState('3');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('500');
  const [maxUsageCount, setMaxUsageCount] = useState('50');
  const [startDate, setStartDate] = useState('2026-10-31');
  const [endDate, setEndDate] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    addDiscountRule({
      code: code.trim().toUpperCase(),
      name,
      type,
      value: parseFloat(value) || 0,
      scope,
      minQuantity: parseInt(minQuantity) || 1,
      minPurchaseAmount: parseFloat(minPurchaseAmount) || 0,
      maxUsageCount: parseInt(maxUsageCount) || 10,
      startDate,
      endDate: endDate || undefined,
      isActive: true,
    });

    setCode('');
    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Tag className="h-3.5 w-3.5" />
            <span>Scene 5: Admin Discount Rules Engine</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Discount Rules & Volume Incentives
          </h2>
          <p className="text-xs text-slate-500">
            Admin-only rule builder for fixed amounts, percentages, seat thresholds, and redemption caps.
          </p>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Discount Rule</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <span>Admin-only privilege (Scene 5)</span>
          </div>
        )}
      </div>

      {/* Discount Rules Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {discountRules.map((rule) => {
          const isExhausted = rule.timesUsed >= rule.maxUsageCount;
          const usagePercent = Math.min(100, Math.round((rule.timesUsed / rule.maxUsageCount) * 100));

          return (
            <div
              key={rule.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-100 font-mono font-bold text-xs text-indigo-800 px-2.5 py-1">
                    {rule.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isExhausted
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isExhausted ? 'Exhausted / Inactive' : 'Active'}
                  </span>
                </div>

                <h3 className="mt-3 font-bold text-slate-900 text-base">{rule.name}</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value.toFixed(2)}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    off ({rule.scope === 'entire_subscription' ? 'Entire Subscription' : 'Specific Product'})
                  </span>
                </div>

                {/* Constraints */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Seats / Qty:</span>
                    <span className="font-semibold text-slate-800">{rule.minQuantity || 1} units</span>
                  </div>
                  {rule.minPurchaseAmount ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Purchase:</span>
                      <span className="font-semibold text-slate-800">${rule.minPurchaseAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity:</span>
                    <span className="font-medium text-slate-700">
                      {rule.startDate} &rarr; {rule.endDate || 'Ongoing'}
                    </span>
                  </div>
                </div>

                {/* Usage meter */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Usage Limit:</span>
                    <span className="font-bold text-slate-800">
                      {rule.timesUsed} / {rule.maxUsageCount} redemptions
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExhausted ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Discount Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Scene 5: Admin Rule Setup
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Add Discount Rule</h3>
              <p className="text-xs text-slate-500">
                Set minimum purchase requirements, validity dates, and auto-expiration limits.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SEATS20"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Seat Volume Discount"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as DiscountScope)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="entire_subscription">Whole Subscription</option>
                    <option value="specific_product">Specific Products</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Seats / Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Redemptions Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxUsageCount}
                    onChange={(e) => setMaxUsageCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Save Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
