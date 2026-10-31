"use client";

import React, { useState, useId } from "react";
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

export interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void> | void;
  onBackToSignIn?: () => void;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToSignIn,
  className = "",
}) => {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setError("Please enter your registered business email address.");
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid business email address format.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(trimmed);
      } else {
        // Simulated password reset link dispatch
        await new Promise((res) => setTimeout(res, 1000));
      }
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to dispatch reset link. Please check your network and try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 sm:p-8 card-surface ${className}`}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#171f28] to-[#212c37] border border-[#c9ab70]/30 text-[#c9ab70] shadow-md shadow-slate-900/10 mb-3">
          <KeyRound className="w-6 h-6 text-[#c9ab70]" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-[family-name:var(--font-cinzel)] text-xl font-bold tracking-tight text-slate-900">
            SUBMANSYS
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1c2530] text-[#c9ab70] tracking-wider uppercase border border-[#c9ab70]/20">
            RECOVERY
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-[family-name:var(--font-cinzel)] mt-1">
          Reset Your Password
        </h1>
        <div className="title-accent-rule mt-2 mb-2" />
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered email address and we will dispatch a secure password reset link
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-cinzel)]">
              Reset Link Dispatched
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We have dispatched a confidential password reset link to{" "}
              <span className="font-semibold text-slate-800">
                {email}
              </span>
              . The link will remain active for 30 minutes.
            </p>
          </div>

          <div className="pt-2">
            {onBackToSignIn ? (
              <button
                type="button"
                onClick={onBackToSignIn}
                className="btn-light-secondary w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            ) : (
              <a
                href="/login"
                className="btn-light-secondary w-full inline-flex py-2.5 px-4 text-xs font-semibold items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl text-xs badge-danger text-rose-800 flex items-center gap-2 font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor={emailId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Registered Business Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id={emailId}
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@company.com"
                className="input-standard pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            {onBackToSignIn ? (
              <button
                type="button"
                onClick={onBackToSignIn}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your credentials? Sign In</span>
              </button>
            ) : (
              <a
                href="/login"
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your credentials? Sign In</span>
              </a>
            )}
          </div>
        </form>
      )}

      {/* Security Seal */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#c9ab70]" />
        <span>Cryptographically Signed One-Time Reset Tokens</span>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
