'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Repeat,
  Package,
  CreditCard,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

interface GuidedWalkthroughProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewQuote?: () => void;
}

export default function GuidedWalkthrough({
  onNavigateTab,
  onOpenNewQuote,
}: GuidedWalkthroughProps) {
  const { runBillingDay, loginAs, currentUser } = useSubscription();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border border-[#c9ab70]/25 bg-gradient-to-r from-[#171f28] via-[#1c2530] to-[#212c37] p-4 text-white shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c9ab70] text-[#171f28] shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="tracking-wide">Interactive Scenario Walkthrough</span>
              <span className="rounded-full bg-[#c9ab70]/20 border border-[#c9ab70]/40 px-2 py-0.5 text-[9px] font-bold text-[#c9ab70]">
                1-Click Preset Actions
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Directly verify SubMan subscription workflows with pre-configured parameters:
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-medium text-slate-400 hover:text-[#c9ab70] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isCollapsed ? 'Show Presets' : 'Hide'}</span>
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {/* Action 1: Run Billing Day */}
          <button
            onClick={() => runBillingDay()}
            className="flex flex-col items-start rounded-xl border border-white/10 bg-[#212c37]/90 p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#283543] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#c9ab70]">
              <Zap className="h-3.5 w-3.5 text-[#c9ab70]" />
              <span>1. Billing Day</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              Auto-generate invoices
            </span>
          </button>

          {/* Action 2: Quotation Builder */}
          <button
            onClick={() => {
              onNavigateTab('subscriptions');
              if (onOpenNewQuote) onOpenNewQuote();
            }}
            className="flex flex-col items-start rounded-xl border border-white/10 bg-[#212c37]/90 p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#283543] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#c9ab70]">
              <Repeat className="h-3.5 w-3.5 text-[#c9ab70]" />
              <span>2. New Quote</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              Start from Odoo template
            </span>
          </button>

          {/* Action 3: Products with Variants */}
          <button
            onClick={() => onNavigateTab('products')}
            className="flex flex-col items-start rounded-xl border border-white/10 bg-[#212c37]/90 p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#283543] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#c9ab70]">
              <Package className="h-3.5 w-3.5 text-[#c9ab70]" />
              <span>3. Odoo Variant</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              Inspect +$560 surcharge
            </span>
          </button>

          {/* Action 4: Invoices & Quick Pay */}
          <button
            onClick={() => onNavigateTab('invoices')}
            className="flex flex-col items-start rounded-xl border border-white/10 bg-[#212c37]/90 p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#283543] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#c9ab70]">
              <CreditCard className="h-3.5 w-3.5 text-[#c9ab70]" />
              <span>4. Collect Money</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              Settle open balances
            </span>
          </button>

          {/* Action 5: Toggle Customer Persona */}
          <button
            onClick={() => loginAs(currentUser.role === 'customer' ? 'user-admin-1' : 'user-cust-1')}
            className="flex flex-col items-start rounded-xl border border-white/10 bg-[#212c37]/90 p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#283543] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#c9ab70]">
              <UserCheck className="h-3.5 w-3.5 text-[#c9ab70]" />
              <span>5. Portal View</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              {currentUser.role === 'customer' ? 'Return to Admin' : 'Customer View'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

