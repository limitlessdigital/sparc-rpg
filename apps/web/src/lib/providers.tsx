"use client";

import * as React from "react";
import { ToastProvider } from "@sparc/ui";
import { AuthProvider } from "./auth-context";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * App-wide providers wrapper
 * Includes: Auth, Toast, Theme, tRPC (TODO)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
