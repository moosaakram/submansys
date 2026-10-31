 "use client";

import React, { useState, useCallback, useId } from "react";
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
  RefreshCw,
} from "lucide-react";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormProps {
  /** Optional custom submit handler. When provided, replaces the mock client-side submission. */
  onSubmit?: (data: LoginFormData) => Promise<void> | void;
  /** Callback fired upon successful form validation and simulated/actual login */
  onSuccess?: (data: { email: string; rememberMe: boolean }) => void;
  /** Callback fired when an error occurs during submission */
  onError?: (errorMessage: string) => void;
  /** Action handler when user clicks "Forgot password?" */
  onForgotPasswordClick?: () => void;
  /** Action handler when user clicks "Sign up / Request access" */
  onSignUpClick?: () => void;
  /** Default initial email address */
  defaultEmail?: string;
  /** Additional custom CSS class names for outer container */
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  onForgotPasswordClick,
  onSignUpClick,
  defaultEmail = "",
  className = "",
}) => {
  const emailInputId = useId();
  const passwordInputId = useId();
  const rememberMeId = useId();

  // Form State
  const [formData, setFormData] = useState<LoginFormData>({
    email: defaultEmail,
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({
    type: "idle",
    text: "",
  });

  // Client-side Validation Logic
  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Work email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid business email address (e.g. name@company.com).";
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return "Password is required.";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return undefined;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset general message when user types
    if (statusMessage.type !== "idle") {
      setStatusMessage({ type: "idle", text: "" });
    }

    // Dynamic validation if field was previously touched
    if (field === "email" && touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value as string) }));
    }
    if (field === "password" && touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(value as string) }));
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }));
    } else if (field === "password") {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(formData.password) }));
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const emailError = validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);

      setTouched({ email: true, password: true });
      setFieldErrors({ email: emailError, password: passwordError });

      if (emailError || passwordError) {
        setStatusMessage({
          type: "error",
          text: "Please correct the highlighted fields before submitting.",
        });
        return;
      }

      setIsLoading(true);
      setStatusMessage({ type: "idle", text: "" });

      try {
        if (onSubmit) {
          await onSubmit(formData);
        } else {
          // Simulated client-side submission delay for smooth UX demonstration
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setStatusMessage({
          type: "success",
          text: "Welcome back! Authentication successful. Redirecting to your dashboard...",
        });

        if (onSuccess) {
          onSuccess({
            email: formData.email.trim(),
            rememberMe: formData.rememberMe,
          });
        }
      } catch (err: unknown) {
        const errorText =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while signing in. Please check your network and try again.";

        setStatusMessage({
          type: "error",
          text: errorText,
        });

        if (onError) {
          onError(errorText);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSubmit, onSuccess, onError]
  );

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-indigo-950/20 border border-slate-200 dark:border-slate-800 transition-all ${className}`}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 mb-3 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
          <RefreshCw className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Brightloop
          </span>
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            360
          </span>
        </div>
        <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
          Subscription Management System
        </p>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your recurring billing, analytics, and lifecycle controls
        </p>
      </div>

      {/* Global Status Banner */}
      {statusMessage.type !== "idle" && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-6 p-3.5 rounded-xl text-sm flex items-start gap-3 transition-all duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Form Element */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email Input */}
        <div>
          <label
            htmlFor={emailInputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id={emailInputId}
              type="email"
              autoComplete="email"
              value={formData.email}
              disabled={isLoading}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="name@company.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                fieldErrors.email
                  ? "border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={passwordInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            {onForgotPasswordClick ? (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            ) : (
              <a
                href="#forgot-password"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset instructions will be sent to your verified email.");
                }}
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id={passwordInputId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              disabled={isLoading}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                fieldErrors.password
                  ? "border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label htmlFor={rememberMeId} className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id={rememberMeId}
              type="checkbox"
              checked={formData.rememberMe}
              disabled={isLoading}
              onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 focus:ring-2 focus:ring-offset-0 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              Remember me on this device
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-65 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing in to Brightloop 360...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Alternative Action / Sign Up */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need an organization account?{" "}
          {onSignUpClick ? (
            <button
              type="button"
              onClick={onSignUpClick}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
            >
              Contact Sales / Request Access
            </button>
          ) : (
            <a
              href="#signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert("Please contact your Brightloop 360 account administrator.");
              }}
            >
              Contact Sales / Request Access
            </a>
          )}
        </p>
      </div>

      {/* Security Compliance Badge */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
        <span>Enterprise 256-bit TLS Encryption • SOC 2 Type II</span>
      </div>
    </div>
  );
};

export default LoginForm;
