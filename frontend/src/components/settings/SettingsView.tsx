'use client';

import React, { useState } from 'react';
import {
  Settings,
  Users,
  ShieldCheck,
  Plus,
  Mail,
  UserCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

export default function SettingsView() {
  const {
    currentUser,
    users,
    addStaffMember,
    taxRules,
    addTaxRule,
  } = useSubscription();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMsg, setStaffMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState('10.0');
  const [taxDesc, setTaxDesc] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) return;

    const res = await addStaffMember({ name: staffName, email: staffEmail });
    if (res.success) {
      setStaffMsg({ type: 'success', text: res.message });
      setStaffName('');
      setStaffEmail('');
      setTimeout(() => {
        setIsStaffModalOpen(false);
        setStaffMsg({ type: 'idle', text: '' });
      }, 1500);
    } else {
      setStaffMsg({ type: 'error', text: res.message });
    }
  };

  const handleTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim()) return;

    addTaxRule({
      name: taxName,
      rate: parseFloat(taxRate) || 0,
      description: taxDesc,
      isDefault: false,
    });

    setTaxName('');
    setIsTaxModalOpen(false);
  };

  const staffMembers = users.filter((u) => u.role === 'staff' || u.role === 'admin');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
          <Settings className="h-3 w-3" />
          <span>Scene 1 & 4: Admin Controls & RBAC Governance</span>
        </div>
        <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
          System Administration & Settings
        </h2>
        <div className="title-accent-rule" />
        <p className="mt-0.5 text-xs text-slate-500">
          Staff member invitations, tax rule configurations, and role permission governance.
        </p>
      </div>

      {/* Staff Management Section (Scene 1 requirement: "Only the admin can add a new member of staff") */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#c9ab70]" />
              <span>Internal Team & Staff Members</span>
            </h3>
            <p className="text-xs text-slate-500">
              Internal staff manage subscriptions, invoices, and payments with limited access.
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="btn-gold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Admin-only privilege</span>
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-2.5">Staff Member</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Access Role</th>
                <th className="px-4 py-2.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map((member) => (
                <tr key={member.id} className="table-row">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 flex items-center justify-center font-bold text-xs">
                      {member.avatar || 'ST'}
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        member.role === 'admin'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {member.role === 'admin' ? 'Super Admin' : 'Internal Staff'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{member.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Rules Section (Scene 4 requirement: "Taxes are calculated automatically from rules the admin has set") */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Percent className="h-4 w-4 text-[#c9ab70]" />
              <span>Tax Rules Engine (Scene 4)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Automatic consumption and sales tax calculations applied during billing.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsTaxModalOpen(true)}
              className="btn-light-secondary cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tax Rule</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {taxRules.map((tr) => (
            <div
              key={tr.id}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs hover:border-[#c9ab70]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{tr.name}</span>
                {tr.isDefault && (
                  <span className="rounded bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 px-1.5 py-0.5 text-[10px] font-semibold">
                    Default
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-serif)] text-2xl font-bold text-[#1c2530]">{tr.rate}%</div>
              <p className="text-[11px] text-slate-400">{tr.description || 'Applicable tax rule.'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permission Matrix Breakdown */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#c9ab70]" />
          <span>Role-Based Access Control (RBAC) Matrix (Scene 1)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-2.5">Feature Area</th>
                <th className="px-4 py-2.5 text-center">Admin</th>
                <th className="px-4 py-2.5 text-center">Internal Staff</th>
                <th className="px-4 py-2.5 text-center">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium">Add Staff Members</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium">Create Products & Variants</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-slate-500">Read-only</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium">Launch Plans & Closures</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-slate-500">Read-only</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium">Create Discount Rules</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
                <td className="px-4 py-2 text-center text-slate-300">&times;</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium">Quotes, Invoices & Payments</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-emerald-600 font-bold">&check;</td>
                <td className="px-4 py-2 text-center text-slate-500">Own items only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Staff Member */}
      {isStaffModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Scene 1: Staff Authorization
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Invite New Staff Member</h3>
              <p className="text-xs text-slate-500">
                Only the admin can invite new team members to Brightloop 360.
              </p>
            </div>

            {staffMsg.type !== 'idle' && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-xs border ${
                  staffMsg.type === 'error'
                    ? 'badge-danger'
                    : 'badge-success'
                }`}
              >
                {staffMsg.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span>{staffMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Liam Sterling"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="liam.s@brightloop.io"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Tax Rule */}
      {isTaxModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <button
              onClick={() => setIsTaxModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Scene 4: Tax Configuration
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Add Tax Rule</h3>
              <p className="text-xs text-slate-500">
                Define the tax rate automatically added to recurring invoices.
              </p>
            </div>

            <form onSubmit={handleTaxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="e.g. EU Digital Goods VAT"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  placeholder="Jurisdiction notes..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

