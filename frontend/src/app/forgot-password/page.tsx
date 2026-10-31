'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <AuthLayout
      backHref="/login"
      backLabel="Back to Sign In"
    >
      <ForgotPasswordForm
        onBackToSignIn={() => {
          router.push('/login');
        }}
      />
    </AuthLayout>
  );
}
