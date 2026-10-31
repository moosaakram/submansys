'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resetPassword, users } = useSubscription();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  // Find admin user for administrator contact card
  const adminUser = users.find((u) => u.role === 'admin') || {
    name: 'Alex Mercer',
    email: 'alex.mercer@subman.io',
  };

  const handleDispatchReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid registered business email.',
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = resetPassword(trimmed);
      if (res.success) {
        setStatus({
          type: 'success',
          message: `Secure one-time reset link dispatched to ${trimmed}. Check your inbox!`,
        });
        setTimeout(() => {
          onClose();
          setStatus({ type: 'idle', message: '' });
          setEmail('');
        }, 2800);
      } else {
        setStatus({ type: 'error', message: res.message });
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
        {/* Close Button */}
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
            <Key className="w-6 h-6 text-[#c9ab70]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#131c2e] font-[family-name:var(--font-cinzel)]">
              Account Recovery
            </h3>
            <p className="text-xs text-[#33507f] mt-0.5">
              Reset password via self-service email dispatch or contact your designated SubMan System Administrator.
            </p>
          </div>
        </div>

        {/* Status Notification */}
        {status.type !== 'idle' && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              status.type === 'error'
                ? 'bg-red-50 text-red-600 border-red-200/80'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Self-service Reset Link Dispatch Form */}
        <form onSubmit={handleDispatchReset} className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-[#3a4658] mb-1.5">
              Registered Work Email
            </label>
            <div className="flex items-center h-12 bg-[#f3f6fb] border border-[#d9e0ec] rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
              <span className="pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-b from-[#3c4a5a] to-[#212c37] hover:from-[#47576a] hover:to-[#273441] active:scale-[0.985] cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Dispatching Reset Token...</span>
              </>
            ) : (
              <>
                <span>Send One-Time Reset Link</span>
                <Send className="w-3.5 h-3.5 text-[#c9ab70]" />
              </>
            )}
          </button>
        </form>

        {/* System Administrator Profile Card (LoomOne Spec) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3A454B] to-[#2E373C] text-white shadow-md border border-[#273035]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              System Administrator
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Admin</span>
            </div>
          </div>

          <div className="font-semibold text-sm text-white">{adminUser.name}</div>
          <div className="text-xs text-slate-300 font-mono mt-0.5">{adminUser.email}</div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <a
              href={`mailto:${adminUser.email}?subject=SubMan%20Password%20Reset%20Assistance`}
              className="flex-1 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold py-2 px-3 text-center transition-colors"
            >
              Email Administrator
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;
