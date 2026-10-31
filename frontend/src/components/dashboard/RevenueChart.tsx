'use client';

import React, { useState } from 'react';
import {
  Download,
  Sparkles,
} from 'lucide-react';
import { REVENUE_CHART_DATA } from '@/data/mockData';

export default function RevenueChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'12m' | '6m' | '30d'>('12m');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayData =
    selectedTimeframe === '6m'
      ? REVENUE_CHART_DATA.slice(-6)
      : selectedTimeframe === '30d'
      ? REVENUE_CHART_DATA.slice(-4)
      : REVENUE_CHART_DATA;

  // Chart dimensions
  const maxRevenue = 140000;

  const activePoint = hoveredIndex !== null ? displayData[hoveredIndex] : displayData[displayData.length - 1];

  return (
    <div className="card-surface p-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
            <span className="flex items-center gap-1 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
              <Sparkles className="h-3 w-3" />
              MRR Acceleration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly gross subscription revenue and recurring performance
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600 border border-slate-200/60">
            <button
              onClick={() => setSelectedTimeframe('12m')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                selectedTimeframe === '12m'
                  ? 'bg-[#1c2530] font-semibold text-[#c9ab70] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setSelectedTimeframe('6m')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                selectedTimeframe === '6m'
                  ? 'bg-[#1c2530] font-semibold text-[#c9ab70] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                selectedTimeframe === '30d'
                  ? 'bg-[#1c2530] font-semibold text-[#c9ab70] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Recent
            </button>
          </div>

          <button
            title="Download CSV"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-3 sm:grid-cols-4">
        <div>
          <span className="text-[11px] font-medium text-slate-400">Total ARR Run-rate</span>
          <p className="font-[family-name:var(--font-serif)] text-lg font-bold text-slate-900">₹1,541,400</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400">Avg. Revenue Per User</span>
          <p className="font-[family-name:var(--font-serif)] text-lg font-bold text-slate-900">₹64.20<span className="text-xs font-normal text-slate-400 font-sans">/mo</span></p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400">Net Revenue Retention</span>
          <p className="font-[family-name:var(--font-serif)] text-lg font-bold text-emerald-600">114.2%</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400">Gross Logo Churn</span>
          <p className="font-[family-name:var(--font-serif)] text-lg font-bold text-slate-700">1.38%</p>
        </div>
      </div>

      {/* Hover preview tooltip badge */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#1c2530]" />
            <span className="text-slate-600 font-medium text-[11px]">Billed Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#c9ab70]" />
            <span className="text-slate-600 font-medium text-[11px]">Monthly MRR Base</span>
          </div>
        </div>

        {activePoint && (
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">
            <span className="font-semibold text-slate-800">{activePoint.month}:</span>
            <span className="font-bold text-[#1c2530]">₹{activePoint.revenue.toLocaleString('en-IN')}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">{activePoint.newCustomers} new subs</span>
          </div>
        )}
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative mt-4 h-64 w-full">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] text-slate-300">
          <div className="flex items-center w-full">
            <span className="w-10 text-right pr-2 text-slate-400">₹140k</span>
            <div className="h-px w-full bg-slate-100" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-10 text-right pr-2 text-slate-400">₹105k</span>
            <div className="h-px w-full bg-slate-100" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-10 text-right pr-2 text-slate-400">₹70k</span>
            <div className="h-px w-full bg-slate-100" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-10 text-right pr-2 text-slate-400">₹35k</span>
            <div className="h-px w-full bg-slate-100" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-10 text-right pr-2 text-slate-400">₹0</span>
            <div className="h-px w-full bg-slate-200" />
          </div>
        </div>

        {/* Interactive Bars Container */}
        <div className="absolute inset-0 pl-10 pb-8 flex items-end justify-between gap-1 sm:gap-2">
          {displayData.map((d, index) => {
            const heightPercent = Math.min(100, Math.round((d.revenue / maxRevenue) * 100));
            const mrrHeightPercent = Math.min(100, Math.round((d.mrr / maxRevenue) * 100));
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={d.month}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex-1 h-full flex flex-col items-center justify-end cursor-pointer"
              >
                {/* Bar Stack */}
                <div className="relative w-full max-w-[42px] flex items-end justify-center transition-all">
                  {/* Outer Billed Revenue Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#1c2530] shadow-md shadow-[#1c2530]/20 ring-2 ring-[#c9ab70]'
                        : 'bg-[#1c2530]/85 hover:bg-[#1c2530]'
                    }`}
                  >
                    {/* Inner MRR indicator line/fill */}
                    <div
                      style={{ height: `${(mrrHeightPercent / heightPercent) * 100}%` }}
                      className="w-full rounded-t-md bg-[#c9ab70]/80 border-t border-white/40"
                    />
                  </div>
                </div>

                {/* X-Axis Month Label */}
                <span
                  className={`absolute -bottom-6 text-xs font-medium transition-colors ${
                    isHovered ? 'font-bold text-[#1c2530]' : 'text-slate-500'
                  }`}
                >
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
