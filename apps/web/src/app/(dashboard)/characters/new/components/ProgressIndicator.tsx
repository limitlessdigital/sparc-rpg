"use client";

import * as React from "react";
import { cn } from "@sparc/ui";

interface ProgressIndicatorProps {
  steps: { key: string; label: string }[];
  currentStep: string;
  className?: string;
}

/**
 * ProgressIndicator - Visual step progress for wizard
 * PRD 13: Step 1/2/3 progress indicator
 */
export function ProgressIndicator({
  steps,
  currentStep,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={step.key}>
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center",
                  "text-sm md:text-base font-medium transition-all duration-300",
                  "border-2",
                  isCompleted && "bg-success border-success text-white",
                  isCurrent && "bg-bronze border-bronze text-white scale-110 shadow-glow-gold",
                  isUpcoming && "bg-surface-elevated border-surface-divider text-muted-foreground"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <span className="text-lg">✓</span>
                ) : (
                  index + 1
                )}
              </div>
              {/* Step label - visible on desktop */}
              <span
                className={cn(
                  "mt-2 text-xs md:text-sm font-medium text-center hidden md:block",
                  isCurrent && "text-bronze",
                  isCompleted && "text-success",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 md:w-16 lg:w-24 h-0.5 mx-2 md:mx-4 transition-colors duration-300",
                  "md:mb-6", // Offset for label
                  index < currentIndex ? "bg-success" : "bg-surface-divider"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressIndicator;
