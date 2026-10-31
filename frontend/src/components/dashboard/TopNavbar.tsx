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
  const { currentUser, loginAs, users, notification, isBackendConnected, backendStatus, checkBackendHealth } = useSubscription();

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
        return <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">Admin</span>;
      case 'staff':
        return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Internal Staff</span>;
      case 'customer':
        return <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Customer Portal</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Toast Notification Notification Banner */}
      {notification && (
        <div className="absolute top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-900/90 text-white px-4 py-2.5 shadow-xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Left: Mobile Drawer Trigger + Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile-only logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Brightloop 360</span>
        </div>

        {/* Search Field */}
        <div className="relative hidden w-72 md:block lg:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search subscriptions, invoices, plans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs font-normal text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
          />
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
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="Switch User Role Persona"
          >
            <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="capitalize font-bold text-indigo-700">{currentUser.role}</span>
            <ChevronDown className="h-3 w-3 text-indigo-500" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role Persona (Scene 1)
              </div>
              <div className="py-1 space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                    {getRoleBadge(u.role)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-semibold text-xs text-slate-900">Notifications</span>
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-2.5 text-xs transition-colors ${
                      n.unread ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-xs">{n.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{n.description}</div>
                    <div className="text-slate-400 text-[10px] mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-slate-100/80 cursor-pointer"
            aria-expanded={showProfileMenu}
          >
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 font-semibold text-white shadow-xs text-xs">
                {currentUser.avatar || 'BL'}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <span className="capitalize">{currentUser.role}</span>
                <ShieldCheck className="h-3 w-3 text-indigo-500 inline" />
              </div>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-0.5">
                  {currentUser.companyName || 'Brightloop 360'}
                </p>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
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
