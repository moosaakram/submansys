"use client";

import React from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ForgotPasswordForm
          onBackToSignIn={() => {
            window.location.href = "/login";
          }}
        />
      </div>
    </div>
  );
}
