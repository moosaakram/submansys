'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  comparisonText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  valueClassName?: string;
}

export default function KPICard({
  title,
  value,
  change,
  isPositive = true,
  comparisonText,
  icon: IconComponent,
  valueClassName = 'text-slate-900',
}: KPICardProps) {
  return (
    <div className="card-surface group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-md hover:border-[#c9ab70]/40">
      {/* Top Row: Title + Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {IconComponent && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#1c2530] border border-slate-200/80 transition-colors group-hover:bg-[#1c2530] group-hover:text-[#c9ab70]">
            <IconComponent className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Middle Row: Large Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-[family-name:var(--font-serif)] text-3xl font-bold tracking-tight ${valueClassName}`}>
          {value}
        </span>
      </div>

      {/* Bottom Row: Percentage Change + Comparison Text */}
      {(change || comparisonText) && (
        <div className="mt-3 flex items-center gap-2">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isPositive ? 'badge-success' : 'badge-danger'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {change}
            </span>
          )}
          {comparisonText && (
            <span className="text-[11px] text-slate-400 truncate">
              {comparisonText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

