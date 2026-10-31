'use client';

import React, { useState } from 'react';
import { X, Check, AlertCircle, ShieldCheck, Mail, Lock, User as UserIcon, Building, Loader2 } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { UserRole } from '@/types/subscription';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const { registerUser } = useSubscription();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time password requirement checks (Problem Statement Scene 1)
  const isLengthValid = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordStrong = isLengthValid && hasUppercase && hasLowercase && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid email is required.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMsg('Please satisfy all password security criteria.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        name,
        email,
        password,
        role,
        companyName,
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch {
      setErrorMsg('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] text-[#c9ab70] px-2.5 py-1 text-xs font-semibold border border-[#c9ab70]/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Customer Registration</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900 font-[family-name:var(--font-cinzel)]">
            Create an Account
          </h2>
          <div className="title-accent-rule mt-2 mb-2" />
          <p className="text-xs text-slate-500">
            Register your profile with enterprise-grade password security standards.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl badge-danger p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl badge-success p-3 text-xs text-emerald-700">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Cooper"
                className="input-standard pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="input-standard pl-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Role Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input-standard text-xs py-2"
              >
                <option value="customer">Customer (Portal)</option>
                <option value="staff">Internal Staff</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Company
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="input-standard pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-standard pl-9 text-xs"
              />
            </div>

            {/* Password Validation Checklist */}
            <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-700 block mb-1">Security Criteria:</span>
              <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`h-3.5 w-3.5 ${isLengthValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>More than 8 characters ({password.length}/9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`h-3.5 w-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`h-3.5 w-3.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least one lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`h-3.5 w-3.5 ${hasSpecialChar ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least one special character (!@#$%...)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-light-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isPasswordStrong || isLoading}
              className="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
