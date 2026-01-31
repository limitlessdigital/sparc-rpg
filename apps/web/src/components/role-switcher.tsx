"use client";

import * as React from "react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { cn } from "@sparc/ui";

interface RoleSwitcherProps {
  className?: string;
  variant?: "default" | "compact";
}

export function RoleSwitcher({ className, variant = "default" }: RoleSwitcherProps) {
  const { user, setActiveRole } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  if (!user) return null;

  const handleRoleChange = async (role: UserRole) => {
    if (role === user.activeRole || isLoading) return;
    if (role === "seer" && !user.isSeerEnabled) return;

    setIsLoading(true);
    try {
      await setActiveRole(role);
    } catch (error) {
      console.error("Failed to switch role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <button
          onClick={() => handleRoleChange("player")}
          disabled={isLoading}
          className={cn(
            "px-2 py-1 text-xs rounded transition-colors",
            user.activeRole === "player"
              ? "bg-bronze text-midnight font-semibold"
              : "text-parchment/60 hover:text-parchment"
          )}
        >
          Player
        </button>
        <span className="text-parchment/30">|</span>
        <button
          onClick={() => handleRoleChange("seer")}
          disabled={isLoading || !user.isSeerEnabled}
          className={cn(
            "px-2 py-1 text-xs rounded transition-colors",
            user.activeRole === "seer"
              ? "bg-bronze text-midnight font-semibold"
              : "text-parchment/60 hover:text-parchment",
            !user.isSeerEnabled && "opacity-50 cursor-not-allowed"
          )}
        >
          Seer
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 p-1 bg-midnight/50 rounded-lg", className)}>
      <button
        onClick={() => handleRoleChange("player")}
        disabled={isLoading}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all",
          user.activeRole === "player"
            ? "bg-bronze text-midnight shadow-md"
            : "text-parchment/70 hover:text-parchment hover:bg-midnight/50"
        )}
      >
        <span className="flex items-center gap-2">
          <PlayerIcon className="w-4 h-4" />
          Player
        </span>
      </button>
      <button
        onClick={() => handleRoleChange("seer")}
        disabled={isLoading || !user.isSeerEnabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all",
          user.activeRole === "seer"
            ? "bg-bronze text-midnight shadow-md"
            : "text-parchment/70 hover:text-parchment hover:bg-midnight/50",
          !user.isSeerEnabled && "opacity-50 cursor-not-allowed"
        )}
        title={!user.isSeerEnabled ? "Complete Seer onboarding to unlock" : undefined}
      >
        <span className="flex items-center gap-2">
          <SeerIcon className="w-4 h-4" />
          Seer
        </span>
      </button>
      {isLoading && (
        <div className="ml-2">
          <div className="animate-spin h-4 w-4 border-2 border-bronze border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

// Simple icons
function PlayerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SeerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}
