"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="atmospheric-backdrop" aria-hidden="true" />
      {/* Top Navigation Back Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 mb-4 relative z-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-[#c9ab70] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Register Form */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-1">
        <RegisterForm
          onSuccess={() => {
            window.location.href = "/portal";
          }}
          onSignInClick={() => {
            window.location.href = "/login";
          }}
        />

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          SubManSys Enterprise Subscription Management &copy; 2026.
        </p>
      </div>
    </div>
  );
}
