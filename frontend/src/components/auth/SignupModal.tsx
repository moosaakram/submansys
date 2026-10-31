'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  UserPlus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      const res = registerUser({
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 text-left relative z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 rounded-lg p-1 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#171f28] text-white flex items-center justify-center shrink-0 border border-white/10 shadow-md">
            <UserPlus className="w-6 h-6 text-[#c9ab70]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#131c2e] font-[family-name:var(--font-cinzel)]">
              Create SubMan Account
            </h3>
            <p className="text-xs text-[#33507f] mt-0.5">
              Register an enterprise profile with strict password standards
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/80 p-3 text-xs text-red-600 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#3a4658] mb-1">
              Full Name
            </label>
            <div className="flex items-center h-11 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
              <span className="pl-3 text-slate-400">
                <UserIcon className="w-4 h-4 text-[#64738a]" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Cooper"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3a4658] mb-1">
              Work Email Address
            </label>
            <div className="flex items-center h-11 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
              <span className="pl-3 text-slate-400">
                <Mail className="w-4 h-4 text-[#64738a]" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#3a4658] mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-11 px-2.5 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl text-xs text-[#131c2e] font-sans focus:outline-none focus:border-[#2e3b49] focus:ring-2 focus:ring-[#c9ab70]/25 focus:bg-white"
              >
                <option value="customer">Customer (Portal)</option>
                <option value="staff">Internal Staff</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3a4658] mb-1">
                Company Name
              </label>
              <div className="flex items-center h-11 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
                <span className="pl-3 text-slate-400">
                  <Building className="w-4 h-4 text-[#64738a]" />
                </span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="flex-1 h-full px-2.5 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3a4658] mb-1">
              Password
            </label>
            <div className="flex items-center h-11 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
              <span className="pl-3 text-slate-400">
                <Lock className="w-4 h-4 text-[#64738a]" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>

            {/* Password Validation Checklist */}
            <div className="mt-2 rounded-xl border border-[#d9e0ec] bg-[#f3f6fb] p-2.5 space-y-1 text-[11px]">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase">Criteria:</span>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>&gt; 8 chars ({password.length}/9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Special char (!@#$)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isPasswordStrong}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#3c4a5a] to-[#212c37] hover:from-[#47576a] hover:to-[#273441] text-white text-xs font-semibold shadow-md active:scale-[0.985] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Register Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
