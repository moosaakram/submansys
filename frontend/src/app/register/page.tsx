'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthLayout
      backHref="/login"
      backLabel="Back to Sign In"
    >
      <RegisterForm
        onSuccess={() => {
          router.push('/portal');
        }}
        onSignInClick={() => {
          router.push('/login');
        }}
      />
    </AuthLayout>
  );
}
