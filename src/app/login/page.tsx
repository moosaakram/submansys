"use client";

import React from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm
          onSuccess={(data) => {
            console.log("Logged in:", data);
            window.location.href = "/";
          }}
          onSignUpClick={() => {
            window.location.href = "/register";
          }}
          onForgotPasswordClick={() => {
            window.location.href = "/forgot-password";
          }}
        />
      </div>
    </div>
  );
}

