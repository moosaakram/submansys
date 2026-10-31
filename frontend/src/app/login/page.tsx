'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="atmospheric-backdrop" aria-hidden="true" />
      {/* Top Navigation Back Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 relative z-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-[#c9ab70] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-1">
        <LoginForm
          onSuccess={() => {
            router.push('/');
          }}
          onSignUpClick={() => {
            router.push('/register');
          }}
          onForgotPasswordClick={() => {
            router.push('/forgot-password');
          }}
        />

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Brightloop 360 &copy; 2026. Enterprise Subscription Platform.
        </p>
      </div>
    </div>
  );
}
