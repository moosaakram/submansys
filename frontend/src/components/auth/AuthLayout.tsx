'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Repeat,
  FileCheck,
  Layers,
  TrendingUp,
  CreditCard,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import getTimeBasedGreeting from '@/utils/getGreeting';

export interface AuthLayoutProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  isLogin?: boolean;
  isTransitioningOut?: boolean;
  transitionUserName?: string;
  onPostLoginComplete?: () => void;
}

const ENTERPRISE_FEATURES = [
  {
    icon: Repeat,
    label: 'Recurring Billing & Proration Engine',
    desc: 'Automated recurring cycles with precision proration calculation',
  },
  {
    icon: FileCheck,
    label: 'Quote-to-Cash Automation',
    desc: 'Streamlined quotation approvals to instant active subscriptions',
  },
  {
    icon: Layers,
    label: 'Tiered Plans & Product Variants',
    desc: 'Flexible pricing models, trial intervals and add-on components',
  },
  {
    icon: TrendingUp,
    label: 'Real-time MRR & ARR Intelligence',
    desc: 'Instant financial metrics, churn alerts and cohort analytics',
  },
  {
    icon: CreditCard,
    label: 'Dunning & Payment Gateways',
    desc: 'Automated failed payment retries, card receipts and manual recording',
  },
  {
    icon: Users,
    label: 'Multi-Tenant Role Governance',
    desc: 'Strict isolation between Admin, Staff operations and Customer Portal',
  },
  {
    icon: ShieldCheck,
    label: 'Enterprise Security & Audit Vault',
    desc: 'TLS 1.3 encryption, cryptographic tokens and granular audit trails',
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  backHref = '/',
  backLabel = 'Back to Overview',
  isLogin = false,
  isTransitioningOut = false,
  transitionUserName = 'Administrator',
  onPostLoginComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Dynamic Greeting computed on client mount
  const [greeting, setGreeting] = useState<string>('Welcome');
  useEffect(() => {
    const timer = setTimeout(() => {
      setGreeting(getTimeBasedGreeting());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Departure Transition Sequence Phases: 'idle' -> 'sliding' -> 'greeting' -> 'text-fadeout' -> 'dashboard-loader' -> 'done'
  const [departurePhase, setDeparturePhase] = useState<
    'idle' | 'sliding' | 'greeting' | 'text-fadeout' | 'dashboard-loader' | 'done'
  >('idle');

  // Trigger post-login departure transition only upon successful authentication
  useEffect(() => {
    if (!isTransitioningOut) {
      setDeparturePhase('idle');
      return;
    }

    if (shouldReduceMotion) {
      if (onPostLoginComplete) onPostLoginComplete();
      return;
    }

    const d0 = setTimeout(() => {
      setDeparturePhase('sliding');
    }, 0);

    // Greeting pop at 0.28s
    const d1 = setTimeout(() => {
      setDeparturePhase('greeting');
    }, 280);

    // Headline fade out at 1.55s
    const d2 = setTimeout(() => {
      setDeparturePhase('text-fadeout');
    }, 1550);

    // Dashboard loader starts at 1.85s
    const d3 = setTimeout(() => {
      setDeparturePhase('dashboard-loader');
    }, 1850);

    // Complete transition and navigate at 3.0s
    const d4 = setTimeout(() => {
      setDeparturePhase('done');
      if (onPostLoginComplete) onPostLoginComplete();
    }, 3000);

    return () => {
      clearTimeout(d0);
      clearTimeout(d1);
      clearTimeout(d2);
      clearTimeout(d3);
      clearTimeout(d4);
      setDeparturePhase('idle');
    };
  }, [isTransitioningOut, shouldReduceMotion, onPostLoginComplete]);

  return (
    <div className="flex min-h-screen w-full bg-[#171f28] relative overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans">
      {/* =========================================================================
          1. POST-LOGIN DEPARTURE TRANSITION OVERLAY (Only when successfully logging in)
          ========================================================================= */}
      <AnimatePresence>
        {departurePhase !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#3a4958_0%,#212c37_60%,#171f28_100%)] pointer-events-auto"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 w-full h-full mix-blend-screen opacity-30 pointer-events-none">
              <Image
                src="/blueprint-desktop.svg"
                alt="Schematic"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Greeting Pop-up (Cinzel font with spring bounce) */}
            <AnimatePresence>
              {(departurePhase === 'greeting' || departurePhase === 'sliding') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 22 }}
                  animate={{ opacity: 1, scale: 1.0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
                    mass: 0.8,
                  }}
                  className="relative z-20 flex flex-col items-center text-center px-6"
                >
                  {/* Standalone SM Logo - No box, no golden outline */}
                  <div className="w-24 h-24 relative flex items-center justify-center mb-6">
                    <Image
                      src="/logo.png"
                      alt="SubMan Logo"
                      width={88}
                      height={88}
                      className="w-full h-full object-contain filter drop-shadow-2xl"
                    />
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-[family-name:var(--font-cinzel)] tracking-tight">
                    {greeting}, {transitionUserName}
                  </h2>

                  <div className="w-64 h-[1px] my-4 bg-gradient-to-r from-transparent via-[#c9ab70] to-transparent" />

                  <p className="text-sm font-medium tracking-wide text-[#dce3eb]">
                    Preparing your enterprise subscription console...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard Loader Phase: Breathing Glow & Shimmer Bar */}
            {departurePhase === 'dashboard-loader' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-20 flex flex-col items-center"
              >
                {/* Standalone SM Logo - Breathing pulse without box */}
                <div className="w-28 h-28 relative flex items-center justify-center mb-8 animate-breathing-glow">
                  <Image
                    src="/logo.png"
                    alt="SubMan"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                </div>

                <div className="w-64 h-1.5 rounded-full bg-white/10 overflow-hidden relative border border-white/15">
                  <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#c9ab70] to-transparent animate-shimmer-track" />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9ab70]">
                  Loading SubMan Console
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          2. MOBILE FULL-BLEED BLUEPRINT TEXTURE OVERLAY (< 1024px)
          ========================================================================= */}
      <div className="lg:hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
        <Image
          src="/blueprint-mobile.svg"
          alt="Architectural Blueprint"
          fill
          className="object-cover object-top opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171f28]/40 via-transparent to-[#171f28]/90 pointer-events-none" />
      </div>

      {/* =========================================================================
          3. DESKTOP RIGHT 55% WORKSPACE CANVAS FILL (>= 1024px)
          ========================================================================= */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[55%] bg-[#F7F8FA]" />

      {/* =========================================================================
          4. MAIN SPLIT-VIEW VIEWPORT CONTAINER
          ========================================================================= */}
      <motion.div
        animate={{
          x: departurePhase !== 'idle' ? '-100%' : '0%',
        }}
        transition={{
          duration: 0.72,
          ease: [0.32, 0.72, 0, 1],
        }}
        className="flex flex-col lg:flex-row w-full h-full relative z-10"
      >
        {/* =====================================================================
            LEFT 45% BRANDING PANEL (Atmospheric Obsidian & Enterprise Highlights)
            ===================================================================== */}
        <div className="hidden lg:flex w-[45%] min-h-screen relative flex-col justify-between bg-[radial-gradient(120%_90%_at_50%_0%,#3a4958_0%,#212c37_60%,#171f28_100%)] border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.25)] select-none overflow-hidden">
          {/* Blueprint Texture with mix-blend-screen */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <Image
              src="/blueprint-desktop.svg"
              alt="Schematic"
              fill
              className="object-cover mix-blend-screen opacity-40"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#171f28]/30 via-transparent to-[#171f28]/80 pointer-events-none" />

          {/* Left Panel Inner Content */}
          <div className="relative z-20 p-10 xl:p-16 flex-1 flex flex-col justify-center">
            {/* Brand Lockup with Standalone SM Logo (NO golden outline, NO box) */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 mb-4"
            >
              {/* Only the SM Monogram, transparent background */}
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="SubMan Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain filter drop-shadow-xl"
                  priority
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="font-[family-name:var(--font-cinzel)] font-bold text-4xl text-white tracking-tight">
                    SubMan
                  </span>
                  <span className="rounded-full bg-[#1c2530] text-[#c9ab70] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-[#c9ab70]/30 shadow-2xs">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-[#a9b5c3] mt-0.5">
                  Unified Recurring Billing & Lifecycle Operations
                </p>
              </div>
            </motion.div>

            {/* Decorative Gold-Feathered Rule */}
            <motion.div
              initial={shouldReduceMotion ? {} : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.8 }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="origin-left h-[1px] w-72 bg-gradient-to-r from-[#c9ab70] via-white/80 to-transparent my-4"
            />

            {/* Tagline */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#dce3eb] mb-6"
            >
              Subscription Management & Revenue Intelligence
            </motion.p>

            {/* 7 Staggered Feature Items */}
            <div className="space-y-3.5 my-2">
              {ENTERPRISE_FEATURES.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.label}
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.28 + index * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group flex items-start gap-3 transition-transform duration-200 hover:translate-x-[3px] cursor-default"
                  >
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#c9ab70] transition-colors group-hover:border-[#c9ab70]/40 group-hover:bg-[#c9ab70]/10 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors">
                        {feat.label}
                      </div>
                      <div className="text-[11px] text-[#a9b5c3] leading-tight">
                        {feat.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Left Column Compliance & Version Footer */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-10 xl:p-16 pt-0 relative z-20 border-t border-white/[0.06]"
          >
            <div className="flex items-center justify-between text-[11px] text-white/70 mb-2">
              <span>SubMan Platform v2.4.0</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SOC-2 & PCI-DSS Level 1</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40">
              &copy; 2026 SubMan Technologies Inc. All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* =====================================================================
            RIGHT 55% CONTENT CANVAS (Immediately displays the Floating Card)
            ===================================================================== */}
        <div className="flex-1 relative flex flex-col items-center justify-between lg:justify-center min-h-screen lg:min-h-0 w-full px-4 sm:px-6 lg:px-12 xl:px-24 py-8 lg:py-10">
          {/* Top Return Navigation */}
          <div className="w-full max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] mx-auto mb-4 flex items-center justify-between">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 lg:text-slate-600 hover:text-[#c9ab70] lg:hover:text-[#171f28] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{backLabel}</span>
            </Link>

            <span className="text-[11px] font-medium text-slate-400 lg:text-slate-500">
              SubMan Cloud v2.4
            </span>
          </div>

          {/* Mobile Hero Header (Visible only on < 1024px) - Standalone SM Logo */}
          <div className="lg:hidden flex flex-col items-center text-center my-6 relative z-10">
            <div className="w-20 h-20 relative flex items-center justify-center mb-3">
              <Image
                src="/logo.png"
                alt="SubMan Logo"
                width={72}
                height={72}
                className="w-full h-full object-contain filter drop-shadow-xl"
                priority
              />
            </div>
            <h1 className="font-[family-name:var(--font-cinzel)] font-bold text-3xl text-white tracking-tight">
              SubMan
            </h1>
            <div className="w-40 h-[1px] my-2 bg-gradient-to-r from-transparent via-[#c9ab70] to-transparent" />
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#dce3eb]">
              Subscription Management & Revenue Intelligence
            </p>
          </div>

          {/* Floating Card Container with Smooth Entrance Fade/Slide */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] mx-auto relative z-10"
          >
            {children}
          </motion.div>

          {/* Mobile Features Summary Pills (< 1024px) */}
          <div className="lg:hidden w-full max-w-[420px] mx-auto mt-8 relative z-10">
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-2.5 text-[11px] text-[#dce3eb]/90">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c9ab70] rotate-45 shrink-0" />
                <span>Proration Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c9ab70] rotate-45 shrink-0" />
                <span>Quote-to-Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c9ab70] rotate-45 shrink-0" />
                <span>MRR Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c9ab70] rotate-45 shrink-0" />
                <span>Automated Dunning</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-white/50">
              SubMan &copy; 2026. Enterprise Subscription Platform.
            </div>
          </div>

          {/* Desktop Right Column Small Footer Note */}
          <div className="hidden lg:block w-full max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] mx-auto mt-6 text-center text-xs text-slate-400">
            Protected by SubMan Cloud Security &bull; TLS 1.3 Certified
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
