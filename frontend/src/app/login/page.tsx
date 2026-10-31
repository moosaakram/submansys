'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [transitionUser, setTransitionUser] = useState('Administrator');
  const [targetDestination, setTargetDestination] = useState('/');

  // Reset departure state whenever login page is mounted/rendered
  useEffect(() => {
    setIsTransitioningOut(false);
  }, []);

  const handleLoginSuccess = (data: { email: string; rememberMe: boolean; userName?: string }) => {
    if (data.userName) {
      setTransitionUser(data.userName);
    }
    // If Sarah Jenkins (customer), route to portal or overview
    const isCustomer = data.email.toLowerCase().includes('sarah') || data.email.toLowerCase().includes('cust');
    setTargetDestination(isCustomer ? '/portal' : '/');
    setIsTransitioningOut(true);
  };

  return (
    <AuthLayout
      isLogin={true}
      backHref="/"
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
