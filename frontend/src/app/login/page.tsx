'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { User } from '@/types/subscription';

export default function LoginPage() {
  const router = useRouter();
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [transitionUser, setTransitionUser] = useState('User');
  const [targetDestination, setTargetDestination] = useState('/dashboard');

  // Reset departure state whenever login page is mounted/rendered
  useEffect(() => {
    setIsTransitioningOut(false);
  }, []);

  const handleLoginSuccess = (data: { email: string; rememberMe: boolean; user?: User }) => {
    if (data.user?.name) {
      setTransitionUser(data.user.name);
    }
    const isCustomer = data.user?.role === 'customer';
    setTargetDestination(isCustomer ? '/portal' : '/dashboard');
    setIsTransitioningOut(true);
  };

  return (
    <AuthLayout
      isLogin={true}
      backHref="/dashboard"
      backLabel="Back to Overview"
      isTransitioningOut={isTransitioningOut}
      transitionUserName={transitionUser}
      onPostLoginComplete={() => {
        setIsTransitioningOut(false);
        router.push(targetDestination);
      }}
    >
      <LoginForm
        onSuccess={handleLoginSuccess}
        onSignUpClick={() => {
          router.push('/register');
        }}
        onForgotPasswordClick={() => {
          router.push('/forgot-password');
        }}
      />
    </AuthLayout>
  );
}
