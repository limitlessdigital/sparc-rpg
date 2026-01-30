"use client";

import { cn, Button, Badge } from "@sparc/ui";
import type { Session } from "../types";

interface SessionHeaderProps {
  session: Session;
  elapsedTime: number;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onSettings: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function SessionHeader({
  session,
  elapsedTime,
  onPause,
  onResume,
  onEnd,
  onSettings,
}: SessionHeaderProps) {
  const isPaused = session.status === "paused";

  return (
    <header className="bg-surface border-b border-surface-divider px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Adventure info */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-bronze">SPARC</div>
          <div className="h-6 w-px bg-surface-divider" />
          <div>
            <h1 className="text-lg font-semibold">{session.adventureName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Session Code:</span>
              <Badge variant="outline" className="font-mono">
                {session.code}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "text-2xl font-mono font-bold tabular-nums",
              isPaused && "text-amber-500"
            )}
          >
            {formatTime(elapsedTime)}
          </div>
          {isPaused && (
            <Badge variant="warning">PAUSED</Badge>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {isPaused ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResume}
              className="gap-2"
            >
              <span>▶️</span>
              Resume
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPause}
              className="gap-2"
            >
              <span>⏸️</span>
              Pause
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={onEnd}
            className="gap-2"
          >
            <span>⏹️</span>
            End
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
          >
            ⚙️
          </Button>
        </div>
      </div>
    </header>
  );
}
