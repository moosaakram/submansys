'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <ResetPasswordForm
      initialToken={token}
      onSuccess={() => {
        router.push('/login');
      }}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      backHref="/login"
      backLabel="Back to Sign In"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading recovery console...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}

