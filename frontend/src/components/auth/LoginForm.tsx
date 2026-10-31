'use client';

import React, { useState, useCallback, useId } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  KeyRound,
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
  onSuccess?: (data: { email: string; rememberMe: boolean }) => void;
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
  const { loginAs, loginWithCredentials, authenticateUser, isBackendConnected, backendStatus, users } = useSubscription();

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

  const handleDemoLogin = (userId: string) => {
    const matchedUser = users.find((u) => u.id === userId);
    if (matchedUser) {
      setFormData({
        email: matchedUser.email,
        password: matchedUser.password || 'Brightloop@360',
        rememberMe: true,
      });
      setFieldErrors({});
      setStatusMessage({
        type: 'idle',
        text: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: 'idle', text: '' });
    setFieldErrors({});

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      setIsLoading(false);
      setFieldErrors({ email: 'Please enter your account email address.' });
      return;
    }

    if (!formData.password) {
      setIsLoading(false);
      setFieldErrors({ password: 'Enter your account password.' });
      return;
    }

    // STRICT AUTHENTICATION VERIFICATION:
    // Checks against backend database and registered user credentials.
    // Rejects invalid email or wrong password strictly.
    const authFn = authenticateUser || loginWithCredentials;
    const authResult = await authFn(cleanEmail, formData.password);

    if (!authResult.success) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: authResult.message || 'Invalid email or password. Please verify your credentials and try again.',
      });
      setFieldErrors({
        password: 'Authentication failed. Please verify credentials.',
      });
      if (onError) onError(authResult.message);
      return; // STRICT: HALT HERE. Do NOT log in on wrong credentials!
    }

    if (onSubmit) {
      try {
        await onSubmit(formData);
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : 'Login failed.';
        setIsLoading(false);
        setStatusMessage({ type: 'error', text: errorText });
        return;
      }
    }

    setIsLoading(false);
    setStatusMessage({
      type: 'success',
      text: `Welcome back, ${authResult.user?.name || 'User'}! Authentication verified.`,
    });

    setTimeout(() => {
      if (onSuccess) {
        onSuccess({ email: cleanEmail, rememberMe: formData.rememberMe });
      }
    }, 450);
  };

  return (
    <div className={`w-full card-surface p-8 shadow-xl ${className}`}>
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/30 shadow-md">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Brightloop 360
        </h2>
        <div className="title-accent-rule mx-auto" />
        <p className="mt-1 text-xs text-slate-500">
          Enterprise Subscription & Lifecycle Management Hub
        </p>
      </div>

      {/* Demo Persona Quick-Switch Panel for Evaluators/Judges */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold flex items-center gap-1.5 text-slate-900">
            <UserCheck className="h-3.5 w-3.5 text-[#c9ab70]" />
            <span>Hackathon Quick-Login:</span>
          </span>
          <span className="text-[10px] bg-[#1c2530] text-[#c9ab70] px-1.5 py-0.5 rounded font-medium border border-[#c9ab70]/30">
            Scene 1 Personas
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-2.5">
          <KeyRound className="h-3 w-3 shrink-0 text-[#c9ab70]" />
          <span>Click to fill credentials (Default Password: <strong>Brightloop@360</strong>)</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('user-admin-1')}
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Alex Mercer</span>
              <span className="badge-danger text-[9px] px-1 py-0.2">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Full Control & Setup</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-staff-1')}
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Marcus Vance</span>
              <span className="badge-warning text-[9px] px-1 py-0.2">
                Staff
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Quotes & Operations</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-cust-1')}
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-2xs hover:border-[#c9ab70]/60 hover:bg-[#c9ab70]/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Sarah Jenkins</span>
              <span className="badge-success text-[9px] px-1 py-0.2">
                Customer
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Customer Portal</span>
          </button>
        </div>
      </div>

      {statusMessage.type !== 'idle' && (
        <div
          role="alert"
          className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-xs border ${
            statusMessage.type === 'error'
              ? 'badge-danger'
              : 'badge-success'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={formData.email}
              disabled={isLoading}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="alex.mercer@brightloop.io"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden disabled:opacity-60"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => {
                if (onForgotPasswordClick) onForgotPasswordClick();
                else setIsForgotOpen(true);
              }}
              className="text-xs font-medium text-[#1c2530] hover:text-[#c9ab70] cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              disabled={isLoading}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-10 py-2 text-xs text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              disabled={isLoading}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
              className="rounded border-slate-300 text-[#1c2530] focus:ring-[#c9ab70]"
            />
            <span>Remember for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold w-full cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-5 text-center text-xs text-slate-500">
        New customer?{' '}
        <button
          type="button"
          onClick={() => {
            if (onSignUpClick) onSignUpClick();
            else setIsSignupOpen(true);
          }}
          className="font-semibold text-[#1c2530] hover:text-[#c9ab70] underline cursor-pointer transition-colors"
        >
          Create an account with password rules
        </button>
      </div>

      {/* Modals */}
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
