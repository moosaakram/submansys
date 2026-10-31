import React from 'react';
import {
  Users,
  Repeat,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { METRICS_DATA } from '@/data/mockData';
import { MetricItem } from '@/types/dashboard';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Repeat,
  TrendingUp,
  AlertCircle,
};

export default function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS_DATA.map((metric: MetricItem) => {
        const IconComponent = ICON_MAP[metric.iconName] || TrendingUp;

        return (
          <div
            key={metric.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300"
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {metric.title}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <IconComponent className="h-5 w-5" />
              </div>
            </div>

            {/* Middle Row: Large Value */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {metric.value}
              </span>
            </div>

            {/* Bottom Row: Percentage Change + Comparison Text */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  metric.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {metric.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {metric.change}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {metric.comparisonText}
              </span>
            </div>

            {/* Subtle bottom decorative line */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent transition-opacity group-hover:via-indigo-500/40" />
          </div>
        );
      })}
    </div>
  );
}
