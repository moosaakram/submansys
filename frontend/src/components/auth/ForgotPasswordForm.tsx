'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

export interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void> | void;
  onBackToSignIn?: () => void;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToSignIn,
  className = '',
}) => {
  const { resetPassword } = useSubscription();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormReady = email.trim().length > 3 && email.includes('@');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setError('Please enter your registered business email address.');
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid work email address format.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(trimmed);
      } else {
        const res = resetPassword(trimmed);
        if (!res.success) {
          throw new Error(res.message);
        }
      }
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to dispatch reset link. Please verify your email and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-[#fbfcfe] rounded-[26px] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_4px_rgba(10,16,24,0.12),0_28px_50px_-18px_rgba(5,9,14,0.65)] border border-slate-100/90 text-left ${className}`}
    >
      {/* Brand Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-serif)] text-[28px] sm:text-[29px] font-medium text-[#131c2e] tracking-tight leading-tight">
          Reset Your Password
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#33507f] font-sans mt-1">
          Enter your registered email and we will dispatch a secure one-time password reset link
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#131c2e] font-[family-name:var(--font-cinzel)]">
              Reset Link Dispatched
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We have dispatched a confidential password reset link to{' '}
              <span className="font-semibold text-slate-800">{email}</span>.
              The link will remain active for 30 minutes.
            </p>
          </div>

          <div className="pt-3">
            {onBackToSignIn ? (
              <button
                type="button"
                onClick={onBackToSignIn}
                className="w-full h-12 rounded-[14px] border border-[#d9e0ec] bg-white hover:bg-[#f3f6fb] text-[#131c2e] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full h-12 rounded-[14px] border border-[#d9e0ec] bg-white hover:bg-[#f3f6fb] text-[#131c2e] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-600 font-medium text-center flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#3a4658] mb-2">
              Registered Work Email
            </label>
            <div className="flex items-center h-14 bg-[#f3f6fb] border border-[#d9e0ec] rounded-[14px] overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-4 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all">
              <span className="flex items-center px-3.5 h-full text-[#64738a] select-none shrink-0 border-r border-[#d9e0ec]">
                <Mail className="w-5 h-5 text-[#64738a]" />
              </span>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="alex.mercer@subman.io"
                className="flex-1 h-full px-3.5 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-[15px] font-sans"
              />
            </div>
          </div>

          {/* Submit Button (56px LoomOne gradient styling) */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full h-14 mt-4 rounded-[14px] text-white text-[15px] font-medium flex items-center justify-center gap-2.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_22px_-10px_rgba(23,31,40,0.7)] active:scale-[0.985] cursor-pointer bg-gradient-to-b from-[#3c4a5a] to-[#212c37] hover:from-[#47576a] hover:to-[#273441] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending Reset Link...</span>
              </span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send
                  className={`w-[18px] h-[18px] transition-all duration-200 ${
                    isFormReady ? 'text-[#c9ab70] translate-x-0.5' : 'text-[#a9b5c3]'
                  }`}
                />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            {onBackToSignIn ? (
              <button
                type="button"
                onClick={onBackToSignIn}
                className="text-xs font-medium text-[#33507f] hover:underline transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your credentials? Sign In</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-[#33507f] hover:underline transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your credentials? Sign In</span>
              </Link>
            )}
          </div>
        </form>
      )}

      {/* Security Seal */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#c9ab70]" />
        <span>Cryptographically Signed One-Time Reset Tokens</span>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
