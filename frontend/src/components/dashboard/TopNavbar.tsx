'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  LogOut,
  User,
  Sliders,
  ExternalLink,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { NOTIFICATIONS_DATA } from '@/data/mockData';
import { useSubscription } from '@/context/SubscriptionContext';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopNavbar({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}: TopNavbarProps) {
  const { currentUser, loginAs, users, notification, isBackendConnected, backendStatus, checkBackendHealth, resetToDemoData } = useSubscription();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setShowPersonaMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
            Admin
          </span>
        );
      case 'staff':
        return (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
            Internal Staff
          </span>
        );
      case 'customer':
        return (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
            Customer Portal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.07] bg-[#1c2530] px-4 sm:px-6">
      {/* Toast Notification Banner with Gold Border */}
      {notification && (
        <div className="absolute top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#c9ab70]/40 bg-[#212c37] text-[#f0f2f5] px-4 py-2.5 shadow-xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-[#c9ab70] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Left: Mobile Drawer Trigger + Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Mobile-only logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#c9ab70] to-[#dcc28a] text-[#171f28]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-[family-name:var(--font-cinzel)] font-bold text-white text-sm">
            Brightloop
          </span>
        </div>

        {/* Search Field: UI_DESIGN_SYSTEM.md Sec 5.2 */}
        <div className="relative hidden w-72 md:block lg:w-80">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Search subscriptions, invoices, plans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-9.5 pr-12 text-xs font-normal text-white transition-all placeholder:text-white/40 focus:border-[#c9ab70]/50 focus:bg-white/[0.08] focus:outline-hidden focus:ring-2 focus:ring-[#c9ab70]/20"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-white/40">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Real-time Backend & Database Connection Status Badge */}
        <button
          type="button"
          onClick={() => checkBackendHealth()}
          title="Click to re-verify Backend & Database connectivity"
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            isBackendConnected
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
              : 'border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isBackendConnected ? 'DB & API: Connected' : 'DB & API: Offline'}</span>
        </button>

        {/* Persona Switcher Dropdown (Scene 1 Role Requirement) */}
        <div className="relative" ref={personaRef}>
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#f0f2f5] hover:bg-white/[0.10] hover:border-white/20 transition-all cursor-pointer"
            title="Switch User Role Persona"
          >
            <UserCheck className="h-3.5 w-3.5 text-[#c9ab70]" />
            <span className="hidden sm:inline text-white/50">Role:</span>
            <span className="capitalize font-bold text-[#dcc28a]">{currentUser.role}</span>
            <ChevronDown className="h-3 w-3 text-white/40" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#1c2530] p-2 shadow-2xl ring-1 ring-black/40 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-1.5 border-b border-white/[0.08] text-[10px] font-bold text-white/40 uppercase tracking-[0.08em]">
                Switch Role Persona
              </div>
              <div className="py-1 space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-[#c9ab70]/15 text-white font-semibold border border-[#c9ab70]/30'
                        : 'text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-[10px] text-white/40">{u.email}</div>
                    </div>
                    {getRoleBadge(u.role)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown (34px x 34px icon button) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.10] hover:text-white cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[9px] font-bold text-white ring-2 ring-[#1c2530]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#1c2530] p-3 shadow-2xl ring-1 ring-black/40 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2">
                <span className="font-semibold text-xs text-white">Notifications</span>
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#c9ab70] hover:text-[#dcc28a] font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-2.5 text-xs transition-colors ${
                      n.unread
                        ? 'bg-[#c9ab70]/10 border border-[#c9ab70]/20'
                        : 'bg-white/[0.03]'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{n.title}</div>
                    <div className="text-white/60 text-[11px] mt-0.5">{n.description}</div>
                    <div className="text-white/40 text-[10px] mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* User Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-white/[0.06] cursor-pointer"
            aria-expanded={showProfileMenu}
          >
            <div className="relative">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-b from-[#3c4a5a] to-[#1b242e] border border-white/15 font-semibold text-white shadow-xs text-xs">
                {currentUser.avatar || 'BL'}
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#1c2530] bg-emerald-500" />
            </div>

            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-medium text-white/50 flex items-center gap-1">
                <span className="capitalize">{currentUser.role}</span>
                <ShieldCheck className="h-3 w-3 text-[#c9ab70] inline" />
              </div>
            </div>

            <ChevronDown className="hidden h-3.5 w-3.5 text-white/40 sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#1c2530] p-2 shadow-2xl ring-1 ring-black/40 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                <p className="text-[11px] text-white/50 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-[#c9ab70] font-medium mt-0.5">
                  {currentUser.companyName || 'Brightloop 360'}
                </p>
              </div>

              <div className="pt-1 border-t border-white/[0.08] space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (confirm('Reset all demo data back to initial factory state? Any newly added items will be refreshed.')) {
                      resetToDemoData();
                    }
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-amber-300" />
                  <span>Reset Demo Data</span>
                </button>
                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Switch Account / Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
