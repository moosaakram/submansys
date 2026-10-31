'use client';

import React, { useState, useId } from 'react';
import {
  X,
  UserPlus,
  Mail,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded?: (staff: { name: string; email: string; role: string }) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const nameId = useId();
  const emailId = useId();
  const roleId = useId();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sales Representative');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill out both staff name and email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid business email address for the staff member.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate inviting new staff member
      await new Promise((res) => setTimeout(res, 900));

      if (onStaffAdded) {
        onStaffAdded({ name: fullName.trim(), email: email.trim(), role });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFullName('');
        setEmail('');
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to add staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c2530] border border-[#c9ab70]/30 text-[#c9ab70] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-cinzel)] text-base font-bold text-slate-900">
                Add New Staff Member
              </h2>
              <p className="text-[11px] text-slate-500">
                Admin Exclusive: Provision limited-access internal accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="badge-danger p-3 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="badge-success p-3 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Invitation dispatched to {email}! Account provisioned.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={nameId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id={nameId}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={emailId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Staff Corporate Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.vance@brightloop.io"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={roleId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Staff Assigned Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
              <select
                id={roleId}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] outline-none"
              >
                <option value="Sales Representative">Sales Representative (Quotes & Deals)</option>
                <option value="Billing Specialist">Billing Specialist (Invoices & Chasing)</option>
                <option value="Customer Support">Customer Support (Subscription Status)</option>
                <option value="Finance Lead">Finance Lead (Quarterly Reports & MRR)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-[#c9ab70] flex-shrink-0 mt-0.5" />
            <span>
              Internal staff accounts have restricted operational access and cannot modify tax rules, discount formulas, or create additional staff accounts.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-light-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <span>Send Staff Invite</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
