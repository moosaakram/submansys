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

  const handleDemoLogin = (userId: string) => {
    loginAs(userId);
    setStatusMessage({ type: 'success', text: 'Persona authenticated successfully!' });
    setTimeout(() => {
      if (onSuccess) onSuccess({ email: formData.email, rememberMe: true });
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: 'idle', text: '' });

    // Validate email
    const matchedUser = users.find((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (!matchedUser) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: 'No account found with this email. Please sign up or choose a Demo Persona below.',
      });
      return;
    }

    if (formData.password.length < 4) {
      setIsLoading(false);
      setFieldErrors({ password: 'Enter your account password.' });
      return;
    }

    loginAs(matchedUser.id);
    setIsLoading(false);
    setStatusMessage({ type: 'success', text: `Welcome back, ${matchedUser.name}!` });

    setTimeout(() => {
      if (onSuccess) {
        onSuccess({ email: matchedUser.email, rememberMe: formData.rememberMe });
      }
    }, 500);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
          Sign In to Brightloop 360
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enterprise Subscription & Lifecycle Management Hub
        </p>
      </div>

      {/* Demo Persona Quick-Switch Panel for Evaluators/Judges */}
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold flex items-center gap-1.5 text-indigo-950">
            <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Hackathon Quick-Login:</span>
          </span>
          <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
            Scene 1 Personas
          </span>
        </div>
        <p className="text-[11px] text-indigo-700 mb-2.5">
          Select any persona to immediately experience their role-based view and permissions:
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('user-admin-1')}
            className="flex flex-col items-start rounded-xl border border-indigo-200 bg-white p-2.5 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Alex Mercer</span>
              <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-700">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Full Control & Setup</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-staff-1')}
            className="flex flex-col items-start rounded-xl border border-indigo-200 bg-white p-2.5 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Marcus Vance</span>
              <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-700">
                Staff
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Quotes & Operations</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('user-cust-1')}
            className="flex flex-col items-start rounded-xl border border-indigo-200 bg-white p-2.5 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs">Sarah Jenkins</span>
              <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                Customer
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate w-full">Customer Portal</span>
          </button>
        </div>
      </div>

      {statusMessage.type !== 'idle' && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs border ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="alex.mercer@brightloop.io"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
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
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
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
          className="font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
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
