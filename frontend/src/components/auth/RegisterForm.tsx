"use client";

import React, { useState, useId, useMemo } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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
  className = "",
}) => {
  const nameId = useId();
  const businessId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const termsId = useId();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Strict Password Rules as per Problem Statement:
  // "The password must be more than eight characters, with an uppercase letter,
  // a lowercase letter and a special character."
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
      errors.fullName = "Full name is required.";
    }

    if (!formData.businessName.trim()) {
      errors.businessName = "Business / Company name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Work email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid business email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (!isPasswordValid) {
      errors.password = "Password does not meet all security criteria below.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service.";
    }

    return errors;
  };

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
        type: "error",
        text: "Please resolve the highlighted requirements before creating your account.",
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "idle", text: "" });

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulated client registration delay
        await new Promise((res) => setTimeout(res, 1200));
      }

      setStatusMessage({
        type: "success",
        text: `Account created successfully for ${formData.businessName}! Welcome to SubManSys.`,
      });

      if (onSuccess) {
        onSuccess({
          email: formData.email.trim(),
          businessName: formData.businessName.trim(),
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed. An account with this email may already exist.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const errors = validate();

  return (
    <div className={`w-full max-w-lg mx-auto p-6 sm:p-8 card-surface ${className}`}>
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#171f28] to-[#212c37] border border-[#c9ab70]/30 text-[#c9ab70] shadow-md shadow-slate-900/10 mb-3">
          <Sparkles className="w-6 h-6 text-[#c9ab70]" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-[family-name:var(--font-cinzel)] text-xl font-bold tracking-tight text-slate-900">
            SUBMANSYS
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1c2530] text-[#c9ab70] tracking-wider uppercase border border-[#c9ab70]/20">
            ENTERPRISE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-[family-name:var(--font-cinzel)] mt-1">
          Create Business Account
        </h1>
        <div className="title-accent-rule mt-2 mb-2" />
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Unified recurring subscriptions, quote-to-cash workflows, and automated billing.
        </p>
      </div>

      {/* Status Banner */}
      {statusMessage.type !== "idle" && (
        <div
          role="alert"
          className={`mb-6 p-3.5 rounded-xl text-sm flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "badge-success text-emerald-800"
              : "badge-danger text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name and Business Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={nameId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id={nameId}
                type="text"
                disabled={isLoading}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                placeholder="Sarah Connor"
                className="input-standard pl-9"
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={businessId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Business Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id={businessId}
                type="text"
                disabled={isLoading}
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, businessName: e.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, businessName: true }))}
                placeholder="Cyberdyne Systems"
                className="input-standard pl-9"
              />
            </div>
            {touched.businessName && errors.businessName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.businessName}
              </p>
            )}
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label
            htmlFor={emailId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Work Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id={emailId}
              type="email"
              disabled={isLoading}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="s.connor@cyberdyne.com"
              className="input-standard pl-10"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Each business email can belong to only one SubManSys account.
          </p>
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor={passwordId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="Create strong password"
              className="input-standard pl-10 pr-11"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time Password Requirements Checklist */}
          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">
              Required Security Criteria:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.length
                    ? "text-emerald-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {passwordCriteria.length ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                )}
                <span>More than 8 characters</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.uppercase
                    ? "text-emerald-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {passwordCriteria.uppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                )}
                <span>One uppercase (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.lowercase
                    ? "text-emerald-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {passwordCriteria.lowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                )}
                <span>One lowercase (a-z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordCriteria.special
                    ? "text-emerald-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {passwordCriteria.special ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                )}
                <span>One special (!@#$)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor={confirmPasswordId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id={confirmPasswordId}
              type={showConfirmPassword ? "text" : "password"}
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              placeholder="Re-enter password"
              className="input-standard pl-10 pr-11"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label
            htmlFor={termsId}
            className="flex items-start gap-2.5 cursor-pointer select-none"
          >
            <input
              id={termsId}
              type="checkbox"
              checked={formData.agreeTerms}
              disabled={isLoading}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))
              }
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#171f28] focus:ring-[#c9ab70]/20 focus:ring-2 cursor-pointer"
            />
            <span className="text-xs text-slate-600">
              I agree to the{" "}
              <a href="#terms" className="text-slate-900 font-semibold hover:underline">
                Subscription Master Terms
              </a>{" "}
              and acknowledge the Privacy Policy.
            </span>
          </label>
          {touched.agreeTerms && errors.agreeTerms && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.agreeTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold w-full py-3 mt-2 text-sm justify-center flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Registering Organization...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Navigation */}
      <div className="mt-6 pt-5 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Already have a SubManSys account?{" "}
          {onSignInClick ? (
            <button
              type="button"
              onClick={onSignInClick}
              className="font-semibold text-slate-900 hover:text-[#c9ab70] transition-colors hover:underline"
            >
              Sign In
            </button>
          ) : (
            <a
              href="/login"
              className="font-semibold text-slate-900 hover:text-[#c9ab70] transition-colors hover:underline"
            >
              Sign In
            </a>
          )}
        </p>
      </div>

      {/* Trust Seal */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#c9ab70]" />
        <span>Strict Password Protection • TLS 1.3 Certified</span>
      </div>
    </div>
  );
};

export default RegisterForm;
