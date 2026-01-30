import type { ReactNode } from "react";
"use client";

/**
 * Onboarding Layout
 * 
 * Layout for the onboarding tutorial flow.
 * Provides the TutorialProvider context and a clean, focused UI.
 */

import { TutorialProvider } from "@sparc/ui";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  return (
    <TutorialProvider showPromptForNewUsers={false}>
      <div className="min-h-screen bg-surface-base">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-bronze/5 via-transparent to-gold/5 pointer-events-none" />
        
        {/* Content */}
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </div>
    </TutorialProvider>
  );
}
