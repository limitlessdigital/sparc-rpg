"use client";

/**
 * @sparc/ui ProgressIndicator
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Shows tutorial progress in various visual formats.
 */

import * as React from "react";
import { cn } from "../lib/utils";
import type { ProgressIndicatorProps } from "./types";

// =============================================================================
// Progress Bar Variant
// =============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
          <span>Step {current} of {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            "bg-gradient-to-r from-bronze to-gold"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Tutorial progress: ${current} of ${total} steps`}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Progress Dots Variant
// =============================================================================

interface ProgressDotsProps {
  current: number;
  total: number;
  completedSteps: string[];
  stepLabels?: string[];
}

function ProgressDots({ current, total, stepLabels }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const stepNumber = i + 1;
        const isComplete = stepNumber < current;
        const isCurrent = stepNumber === current;

        return (
          <div
            key={i}
            className="flex flex-col items-center"
            title={stepLabels?.[i]}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isComplete && "bg-success scale-100",
                isCurrent && "bg-bronze scale-125 ring-2 ring-bronze/30",
                !isComplete && !isCurrent && "bg-muted"
              )}
              aria-label={
                isComplete
                  ? `Step ${stepNumber} complete`
                  : isCurrent
                  ? `Current step: ${stepNumber}`
                  : `Step ${stepNumber}`
              }
            >
              {isComplete && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Progress Steps Variant (Numbered)
// =============================================================================

interface ProgressStepsProps {
  current: number;
  total: number;
  completedSteps: string[];
  stepLabels?: string[];
}

function ProgressSteps({ current, total, stepLabels }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const stepNumber = i + 1;
        const isComplete = stepNumber < current;
        const isCurrent = stepNumber === current;
        const isLast = i === total - 1;

        return (
          <React.Fragment key={i}>
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "font-semibold text-sm transition-all duration-300",
                  isComplete && "bg-success text-white",
                  isCurrent && "bg-bronze text-white ring-4 ring-bronze/20",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              {stepLabels?.[i] && (
                <span
                  className={cn(
                    "mt-1 text-xs whitespace-nowrap",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {stepLabels[i]}
                </span>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors duration-300",
                  isComplete ? "bg-success" : "bg-muted"
                )}
                style={{ minWidth: "2rem" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProgressIndicator({
  currentStep,
  totalSteps,
  completedSteps,
  stepLabels,
  variant = "bar",
  showStepNumber = true,
}: ProgressIndicatorProps) {
  switch (variant) {
    case "bar":
      return <ProgressBar current={currentStep} total={totalSteps} showLabel={showStepNumber} />;
    
    case "dots":
      return (
        <ProgressDots
          current={currentStep}
          total={totalSteps}
          completedSteps={completedSteps}
          stepLabels={stepLabels}
        />
      );
    
    case "steps":
      return (
        <ProgressSteps
          current={currentStep}
          total={totalSteps}
          completedSteps={completedSteps}
          stepLabels={stepLabels}
        />
      );
    
    default:
      return <ProgressBar current={currentStep} total={totalSteps} showLabel={showStepNumber} />;
  }
}

// =============================================================================
// Compact Progress (for tutorial header)
// =============================================================================

export interface CompactProgressProps {
  current: number;
  total: number;
  label?: string;
}

export function CompactProgress({ current, total, label }: CompactProgressProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[80px]">
        <div
          className="h-full bg-bronze rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      
      {/* Label */}
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {label || `${current}/${total}`}
      </span>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { ProgressIndicatorProps } from "./types";
