'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  badge?: {
    icon?: React.ComponentType<{ className?: string }>;
    text: string;
  };
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  category = 'Admin Console',
  badge,
  actions,
}: PageHeaderProps) {
  const BadgeIcon = badge?.icon;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
          <span className="text-[#c9ab70]">SubMan</span>
          <ChevronRight className="h-3 w-3 text-white/40 shrink-0" />
          <span className="text-white/80">{category}</span>
          {badge && (
            <>
              <ChevronRight className="h-3 w-3 text-white/40 shrink-0" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530]/90 border border-[#c9ab70]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#c9ab70] normal-case tracking-normal shadow-xs">
                {BadgeIcon && <BadgeIcon className="h-3 w-3 shrink-0" />}
                <span>{badge.text}</span>
              </span>
            </>
          )}
        </div>
        <h1 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <div className="title-accent-rule" />
        {subtitle && (
          <p className="mt-0.5 text-xs text-white/70 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
}

