import React from 'react';
import {
  Sparkles,
  ArrowUpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ACTIVITY_DATA } from '@/data/mockData';
import { ActivityItem, ActivityType } from '@/types/dashboard';

const ACTIVITY_ICON_MAP: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }
> = {
  new_subscription: {
    icon: Sparkles,
    bg: 'bg-[#1c2530]',
    color: 'text-[#c9ab70]',
  },
  upgrade: {
    icon: ArrowUpCircle,
    bg: 'bg-emerald-50 border border-emerald-200/80',
    color: 'text-emerald-700',
  },
  downgrade: {
    icon: Clock,
    bg: 'bg-amber-50 border border-amber-200/80',
    color: 'text-amber-700',
  },
  payment_failed: {
    icon: AlertTriangle,
    bg: 'bg-rose-50 border border-rose-200/80',
    color: 'text-rose-700',
  },
  cancellation: {
    icon: XCircle,
    bg: 'bg-slate-100 border border-slate-200/80',
    color: 'text-slate-700',
  },
  invoice_paid: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border border-emerald-200/80',
    color: 'text-emerald-700',
  },
};

export default function RecentActivity() {
  return (
    <div className="card-surface p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live subscription lifecycle events
            </p>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
        </div>

        {/* Timeline list */}
        <div className="mt-4 space-y-4">
          {ACTIVITY_DATA.map((item: ActivityItem, idx: number) => {
            const meta = ACTIVITY_ICON_MAP[item.type];
            const Icon = meta.icon;

            return (
              <div key={item.id} className="relative flex items-start gap-3 group">
                {/* Connecting timeline vertical line */}
                {idx !== ACTIVITY_DATA.length - 1 && (
                  <span
                    className="absolute left-4 top-8 bottom-0 w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                {/* Icon avatar */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color} shadow-2xs`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-[#1c2530] transition-colors">
                      {item.title}
                    </p>
                    {item.amount && (
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        {item.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-600">{item.user.name}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button className="flex items-center justify-center gap-1.5 w-full py-1 text-xs font-semibold text-[#1c2530] hover:text-[#c9ab70] transition-colors cursor-pointer">
          <span>View all activity audit logs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

