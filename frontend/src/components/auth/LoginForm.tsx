'use client';

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import SignupModal from './SignupModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void> | void;
  onSuccess?: (data: { email: string; rememberMe: boolean; userName?: string }) => void;
  onError?: (errorMessage: string) => void;
  onForgotPasswordClick?: () => void;
  onSignUpClick?: () => void;
  defaultEmail?: string;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  onForgotPasswordClick,
  onSignUpClick,
  defaultEmail = '',
  className = '',
}) => {
  const { loginAs, users } = useSubscription();

  const [formData, setFormData] = useState<LoginFormData>({
    email: defaultEmail,
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'idle' | 'success' | 'error';
    text: string;
  }>({
    type: 'idle',
    text: '',
  });

  // Dynamic Form Readiness check for arrow micro-interaction (LoomOne spec)
  const isFormReady =
    formData.email.trim().length > 3 &&
    formData.email.includes('@') &&
    formData.password.length >= 4;

  const handleDemoLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    loginAs(userId);
    setStatusMessage({ type: 'success', text: `Authenticated as ${user?.name || 'Persona'}!` });
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          email: user?.email || formData.email,
          rememberMe: true,
          userName: user?.name?.split(' ')[0] || 'User',
        });
      }
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: 'idle', text: '' });
    setFieldErrors({});

    // Validate email
    const trimmedEmail = formData.email.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!matchedUser) {
      setIsLoading(false);
      const err = 'No account found with this email. Please sign up or choose a Demo Persona above.';
      setStatusMessage({
        type: 'error',
        text: err,
      });
      if (onError) onError(err);
      return;
    }

    if (formData.password.length < 4) {
      setIsLoading(false);
      setFieldErrors({ password: 'Enter your account password (minimum 4 characters).' });
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Authenticate context user
        loginAs(matchedUser.id);
      }

      setStatusMessage({ type: 'success', text: `Welcome back, ${matchedUser.name}!` });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: matchedUser.email,
            rememberMe: formData.rememberMe,
            userName: matchedUser.name.split(' ')[0],
          });
        }
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your details.';
      setStatusMessage({ type: 'error', text: msg });
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-[#fbfcfe] rounded-[26px] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_4px_rgba(10,16,24,0.12),0_28px_50px_-18px_rgba(5,9,14,0.65)] border border-slate-100/90 text-left ${className}`}
    >
      {/* Card Header (Playfair Display & LoomOne Typography) */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-serif)] text-[28px] sm:text-[29px] font-medium text-[#131c2e] tracking-tight leading-tight">
          Welcome Back
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#33507f] font-sans mt-1">
          Sign in to continue to SubMan Enterprise Console
        </p>
      </div>

      {/* Demo Persona Quick-Switch Panel */}
      <div className="mb-5 rounded-2xl border border-[#d9e0ec] bg-[#f3f6fb] p-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold flex items-center gap-1.5 text-[#131c2e]">
            <UserCheck className="h-3.5 w-3.5 text-[#c9ab70]" />
            <span>Instant Role Switcher</span>
          </span>
          <span className="text-[10px] bg-[#1c2530] text-[#c9ab70] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#c9ab70]/30">
            One-Click
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoLogin('user-admin-1')}
            className="flex flex-col items-start rounded-xl border border-white bg-white p-2 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-[#131c2e] text-[11px] truncate w-full group-hover:text-[#c9ab70]">
              Alex Mercer
            </span>
            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded mt-0.5">
              Admin
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-staff-1')}
            className="flex flex-col items-start rounded-xl border border-white bg-white p-2 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-[#131c2e] text-[11px] truncate w-full group-hover:text-[#c9ab70]">
              Marcus Vance
            </span>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded mt-0.5">
              Staff
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-cust-1')}
            className="flex flex-col items-start rounded-xl border border-white bg-white p-2 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-[#131c2e] text-[11px] truncate w-full group-hover:text-[#c9ab70]">
              Sarah Jenkins
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded mt-0.5">
              Customer
            </span>
          </button>
        </div>
      </div>

      {/* Error / Success Status Banner (LoomOne Spec) */}
      {statusMessage.type !== 'idle' && (
        <div
          role="alert"
          className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-600 border-red-200/80'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field (56px LoomOne container with gold halo) */}
        <div>
          <label className="block text-[13px] font-medium text-[#3a4658] mb-2">
            Work Email Address
          </label>
          <div
            className={`flex items-center h-14 bg-[#f3f6fb] border ${
              fieldErrors.email ? 'border-red-400' : 'border-[#d9e0ec]'
            } rounded-[14px] overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-4 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
          >
            <span className="flex items-center px-3.5 h-full text-[#64738a] select-none shrink-0 border-r border-[#d9e0ec]">
              <Mail className="w-5 h-5 text-[#64738a]" />
            </span>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="alex.mercer@subman.io"
              className="flex-1 h-full px-3.5 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-[15px] font-sans"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field (56px container with visibility toggle) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-[#3a4658]">Password</label>
            <button
              type="button"
              onClick={() => {
                if (onForgotPasswordClick) onForgotPasswordClick();
                else setIsForgotOpen(true);
              }}
              className="text-[13px] font-medium text-[#33507f] hover:underline cursor-pointer font-sans"
            >
              Forgot Password?
            </button>
          </div>
          <div
            className={`flex items-center h-14 bg-[#f3f6fb] border ${
              fieldErrors.password ? 'border-red-400' : 'border-[#d9e0ec]'
            } rounded-[14px] overflow-hidden focus-within:border-[#2e3b49] focus-within:ring-4 focus-within:ring-[#c9ab70]/25 focus-within:bg-white transition-all`}
          >
            <span className="flex items-center px-3.5 h-full text-[#64738a] select-none shrink-0 border-r border-[#d9e0ec]">
              <Lock className="w-5 h-5 text-[#64738a]" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••••••"
              className="flex-1 h-full px-3.5 bg-transparent border-0 outline-none text-[#131c2e] placeholder:text-[#9aa6b8] text-[15px] font-sans"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="w-12 h-full flex items-center justify-center text-[#64738a] hover:text-[#131c2e] transition-colors cursor-pointer shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
              className="w-4 h-4 rounded border-[#d9e0ec] text-[#212c37] focus:ring-[#c9ab70]/25 cursor-pointer"
            />
            <span>Remember for 30 days</span>
          </label>
        </div>

        {/* Primary Action Button (Sign In - LoomOne Spec) */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full h-14 mt-3 rounded-[14px] text-white text-[15px] font-medium flex items-center justify-center gap-2.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_22px_-10px_rgba(23,31,40,0.7)] active:scale-[0.985] cursor-pointer bg-gradient-to-b from-[#3c4a5a] to-[#212c37] hover:from-[#47576a] hover:to-[#273441] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Signing in...</span>
            </span>
          ) : (
            <>
              <span>Sign In</span>
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

      {/* Sign Up Navigation Link */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-[#64738a]">
        New to SubMan?{' '}
        <button
          type="button"
          onClick={() => {
            if (onSignUpClick) onSignUpClick();
            else setIsSignupOpen(true);
          }}
          className="font-semibold text-[#131c2e] hover:text-[#c9ab70] hover:underline transition-colors cursor-pointer"
        >
          Create an enterprise account
        </button>
      </div>

      {/* Recovery and Registration Modals */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={() => {
          if (onSuccess) onSuccess({ email: formData.email, rememberMe: true });
        }}
      />
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
};

export default LoginForm;
