'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { resetPassword } = useSubscription();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const res = await resetPassword(email);
    if (res.success) {
      setStatus({
        type: 'success',
        message: `Password reset link dispatched to ${email}. Check your inbox!`,
      });
      setTimeout(() => {
        onClose();
        setStatus({ type: 'idle', message: '' });
      }, 2500);
    } else {
      setStatus({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Scene 1: Password Recovery</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered account email to receive a secure one-time reset link.
          </p>
        </div>

        {status.type === 'error' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        {status.type === 'success' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.j@acmetech.io"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

