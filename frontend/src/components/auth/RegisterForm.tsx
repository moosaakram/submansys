'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';

export interface RegisterFormData {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void> | void;
  onSuccess?: (data: { email: string; businessName: string }) => void;
  onSignInClick?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSuccess,
  onSignInClick,
  className = '',
}) => {
  const { registerUser, users } = useSubscription();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'idle' | 'success' | 'error';
    text: string;
  }>({ type: 'idle', text: '' });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Strict Password Rules per Problem Statement:
  // > 8 characters, uppercase letter, lowercase letter, special character
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      length: pwd.length > 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }, [formData.password]);

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.lowercase &&
    passwordCriteria.special;

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!formData.businessName.trim()) {
      errors.businessName = 'Business or Company name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Work email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid work email format.';
    } else if (users.some((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      errors.email = 'An account with this email address already exists.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      errors.password = 'Password does not meet all required security criteria.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must accept the Enterprise Subscription Master Terms.';
    }

    return errors;
  };

  const isFormReady =
    formData.fullName.trim().length > 1 &&
    formData.businessName.trim().length > 1 &&
    formData.email.includes('@') &&
    isPasswordValid &&
    formData.password === formData.confirmPassword &&
    formData.agreeTerms;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      businessName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setStatusMessage({
        type: 'error',
        text: 'Please satisfy all required fields and security criteria before proceeding.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'idle', text: '' });

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const res = registerUser({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'customer',
          companyName: formData.businessName.trim(),
        });

        if (!res.success) {
          throw new Error(res.message);
        }
      }

      setStatusMessage({
        type: 'success',
        text: `Organization account registered for ${formData.businessName}! Welcome to SubMan.`,
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: formData.email.trim(),
            businessName: formData.businessName.trim(),
          });
        }
      }, 700);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Registration failed. An account with this email may already exist.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const errors = validate();

  return (
    <div
      className={`bg-[#fbfcfe] rounded-[26px] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_4px_rgba(10,16,24,0.12),0_28px_50px_-18px_rgba(5,9,14,0.65)] border border-slate-100/90 text-left ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-serif)] text-[28px] sm:text-[29px] font-medium text-[#131c2e] tracking-tight leading-tight">
          Create Business Account
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#33507f] font-sans mt-1">
          Unified subscriptions, quote-to-cash workflows, and automated billing
        </p>
      </div>

      {/* Status Banner */}
      {statusMessage.type !== 'idle' && (
        <div
          role="alert"
          className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-600 border-red-200/80'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name & Business Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-[#3a4658] mb-1.5">
              Full Name
            </label>
            <div
              className={`flex items-center h-12 bg-[#f3f6fb] border ${
                touched.fullName && errors.fullName ? 'border-red-400' : 'border-[#d9e0ec]'
              } rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
            >
              <span className="pl-3.5 text-slate-400">
                <User className="w-4 h-4 text-[#64738a]" />
              </span>
              <input
                type="text"
                disabled={isLoading}
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                placeholder="Sarah Connor"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3a4658] mb-1.5">
              Business Name
            </label>
            <div
              className={`flex items-center h-12 bg-[#f3f6fb] border ${
                touched.businessName && errors.businessName ? 'border-red-400' : 'border-[#d9e0ec]'
              } rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
            >
              <span className="pl-3.5 text-slate-400">
                <Building2 className="w-4 h-4 text-[#64738a]" />
              </span>
              <input
                type="text"
                disabled={isLoading}
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                onBlur={() => setTouched((prev) => ({ ...prev, businessName: true }))}
                placeholder="Cyberdyne Systems"
                className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
              />
            </div>
            {touched.businessName && errors.businessName && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.businessName}</p>
            )}
          </div>
        </div>

        {/* Work Email Address */}
        <div>
          <label className="block text-xs font-medium text-[#3a4658] mb-1.5">
            Work Email Address
          </label>
          <div
            className={`flex items-center h-12 bg-[#f3f6fb] border ${
              touched.email && errors.email ? 'border-red-400' : 'border-[#d9e0ec]'
            } rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
          >
            <span className="pl-3.5 text-slate-400">
              <Mail className="w-4 h-4 text-[#64738a]" />
            </span>
            <input
              type="email"
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="s.connor@cyberdyne.com"
              className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
            />
          </div>
          {touched.email && errors.email ? (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
          ) : (
            <p className="mt-1 text-[10px] text-slate-400">
              Unique corporate identifier used for billing and license governance.
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-[#3a4658] mb-1.5">
            Password
          </label>
          <div
            className={`flex items-center h-12 bg-[#f3f6fb] border ${
              touched.password && errors.password ? 'border-red-400' : 'border-[#d9e0ec]'
            } rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
          >
            <span className="pl-3.5 text-slate-400">
              <Lock className="w-4 h-4 text-[#64738a]" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="Create strong password"
              className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="w-10 h-full flex items-center justify-center text-[#64738a] hover:text-[#131c2e] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-Time Password Criteria Checklist */}
          <div className="mt-2 p-2.5 rounded-xl bg-[#f3f6fb] border border-[#d9e0ec] space-y-1 text-[11px]">
            <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
              Required Security Criteria:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.length ? 'text-emerald-700 font-medium' : 'text-slate-400'
                }`}
              >
                {passwordCriteria.length ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                )}
                <span>More than 8 chars</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.uppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'
                }`}
              >
                {passwordCriteria.uppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                )}
                <span>One uppercase (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.lowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'
                }`}
              >
                {passwordCriteria.lowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                )}
                <span>One lowercase (a-z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.special ? 'text-emerald-700 font-medium' : 'text-slate-400'
                }`}
              >
                {passwordCriteria.special ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                )}
                <span>One special (!@#$)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-[#3a4658] mb-1.5">
            Confirm Password
          </label>
          <div
            className={`flex items-center h-12 bg-[#f3f6fb] border ${
              touched.confirmPassword && errors.confirmPassword ? 'border-red-400' : 'border-[#d9e0ec]'
            } rounded-xl overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-2 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
          >
            <span className="pl-3.5 text-slate-400">
              <Lock className="w-4 h-4 text-[#64738a]" />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              placeholder="Re-enter password"
              className="flex-1 h-full px-3 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-xs font-sans"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="w-10 h-full flex items-center justify-center text-[#64738a] hover:text-[#131c2e] cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              disabled={isLoading}
              onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
              className="w-4 h-4 mt-0.5 rounded border-[#d9e0ec] text-[#212c37] focus:ring-[#c9ab70]/25 cursor-pointer"
            />
            <span className="text-xs text-slate-600">
              I agree to the{' '}
              <span className="text-[#131c2e] font-semibold underline">
                Enterprise Subscription Master Terms
              </span>{' '}
              and Privacy Policy.
            </span>
          </label>
          {touched.agreeTerms && errors.agreeTerms && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.agreeTerms}</p>
          )}
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
              <span>Registering Organization...</span>
            </span>
          ) : (
            <>
              <span>Create Account</span>
              <svg
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isFormReady ? 'text-[#c9ab70] translate-x-0.5' : 'text-[#a9b5c3]'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Sign In Navigation */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-[#64738a]">
        Already have a SubMan account?{' '}
        {onSignInClick ? (
          <button
            type="button"
            onClick={onSignInClick}
            className="font-semibold text-[#131c2e] hover:text-[#c9ab70] hover:underline transition-colors cursor-pointer"
          >
            Sign In
          </button>
        ) : (
          <Link
            href="/login"
            className="font-semibold text-[#131c2e] hover:text-[#c9ab70] hover:underline transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Trust Seal */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#c9ab70]" />
        <span>Strict Password Protection &bull; TLS 1.3 Certified</span>
      </div>
    </div>
  );
};

export default RegisterForm;
