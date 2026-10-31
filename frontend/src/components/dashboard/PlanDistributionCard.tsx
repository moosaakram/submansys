import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { PLAN_DISTRIBUTION_DATA } from '@/data/mockData';

export default function PlanDistributionCard() {
  return (
    <div className="card-surface p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Subscription Plans</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer distribution across active tiers
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#1c2530] border border-slate-200/80">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
            {PLAN_DISTRIBUTION_DATA.map((plan) => (
              <div
                key={plan.name}
                style={{
                  width: `${plan.percentage}%`,
                  backgroundColor: plan.color,
                }}
                title={`${plan.name}: ${plan.percentage}%`}
                className="transition-all duration-500 hover:opacity-90"
              />
            ))}
          </div>
        </div>

        {/* Plan Breakdown List */}
        <div className="mt-5 space-y-3">
          {PLAN_DISTRIBUTION_DATA.map((plan) => (
            <div key={plan.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="font-semibold text-slate-800">{plan.name}</span>
                <span className="text-[11px] text-slate-400">
                  ({plan.subscriptionsCount.toLocaleString()} subs)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{plan.monthlyValue}/mo</span>
                <span className="w-10 text-right font-semibold text-slate-500">
                  {plan.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button className="flex items-center justify-center gap-1.5 w-full py-1 text-xs font-semibold text-[#1c2530] hover:text-[#c9ab70] transition-colors cursor-pointer">
          <span>Manage subscription tiers</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

