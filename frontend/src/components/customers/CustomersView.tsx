'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Calendar,
  X,
  Repeat,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

export default function CustomersView({ onSelectCustomerForQuote }: { onSelectCustomerForQuote?: (customerId: string) => void }) {
  const { customers, addCustomer, subscriptions, invoices } = useSubscription();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    addCustomer({
      fullName,
      email,
      companyName,
      phone,
      address,
    });

    setFullName('');
    setEmail('');
    setCompanyName('');
    setPhone('');
    setAddress('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
            <Users className="h-3 w-3" />
            <span>Customer Accounts Directory</span>
          </div>
          <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
            Client Accounts & Organizations
          </h2>
          <div className="title-accent-rule" />
          <p className="mt-0.5 text-xs text-slate-500">
            Manage subscribed organizations, contacts, and historical contract values.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-gold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer Account</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, organization, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs bg-white text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredCustomers.length} registered accounts</span>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((cust) => {
          const custSubs = subscriptions.filter((s) => s.customerId === cust.id);
          const activeCount = custSubs.filter((s) => s.status === 'active').length;
          const custInvoices = invoices.filter((i) => i.customerId === cust.id && i.status === 'paid');
          const totalPaid = custInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);

          return (
            <div
              key={cust.id}
              className="card-surface p-5 flex flex-col justify-between hover:border-[#c9ab70]/40 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-[#1c2530] border border-[#c9ab70]/30 text-[#c9ab70] font-bold flex items-center justify-center text-xs shadow-xs">
                      {cust.fullName
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cust.fullName}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building className="h-3 w-3 inline" />
                        <span>{cust.companyName || 'Independent'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2 py-0.5 text-[10px] font-semibold text-[#c9ab70]">
                    {activeCount} Active Sub{activeCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  {cust.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Member since {cust.createdAt}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Lifetime Value</span>
                    <span className="font-[family-name:var(--font-serif)] font-bold text-slate-900 text-sm">
                      ${totalPaid.toFixed(2)}
                    </span>
                  </div>
                  {onSelectCustomerForQuote && (
                    <button
                      onClick={() => onSelectCustomerForQuote(cust.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c2530] hover:text-[#c9ab70] cursor-pointer transition-colors"
                    >
                      <span>New Quote</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Customer */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                New Client Account
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Add Customer Organization</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Contact Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thomas Wayne"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thomas@wayne-enterprises.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Wayne Enterprises"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="New York, NY"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

