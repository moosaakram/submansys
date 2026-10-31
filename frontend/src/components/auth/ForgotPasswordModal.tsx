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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const res = resetPassword(email);
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
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password Recovery</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900 font-[family-name:var(--font-cinzel)]">
            Reset Your Password
          </h2>
          <div className="title-accent-rule mt-2 mb-2" />
          <p className="text-xs text-slate-500">
            Enter your registered account email to receive a secure one-time reset link.
          </p>
        </div>

        {status.type === 'error' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl badge-danger p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{status.message}</span>
          </div>
        )}

        {status.type === 'success' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl badge-success p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
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
                className="input-standard pl-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-light-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold text-xs"
            >
              Dispatch Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
