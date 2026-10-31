'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { NOTIFICATIONS_DATA } from '@/data/mockData';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Drawer Trigger + Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
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
        <div className="relative hidden w-72 sm:block md:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subscriptions, invoices, customers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live sync pill badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Sync</span>
        </div>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 py-3 transition-colors ${
                      item.unread ? 'bg-indigo-50/40 -mx-4 px-4' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      {item.id.includes('1') ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : item.id.includes('2') ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      ) : (
                        <FileCheck className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Admin Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-100/80"
            aria-expanded={showProfileMenu}
          >
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 font-semibold text-white shadow-xs text-xs">
                AM
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">Alex Mercer</div>
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <span>Super Admin</span>
                <ShieldCheck className="h-3 w-3 text-indigo-500 inline" />
              </div>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Alex Mercer</p>
                <p className="text-[11px] text-slate-400 truncate">alex.mercer@brightloop360.com</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Admin Profile</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Sliders className="h-4 w-4 text-slate-400" />
                  <span>Billing Settings</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    <span>API Keys</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">v1</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
