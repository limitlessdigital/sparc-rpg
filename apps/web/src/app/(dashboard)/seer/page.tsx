"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button } from "@sparc/ui";
import { useSeerDashboard } from "./hooks";
import {
  SessionHeader,
  NodeView,
  PlayerSidebar,
  AISeerPanel,
  QuickActionBar,
  DicePanel,
} from "./components";
import type { Attribute } from "./types";

export default function SeerDashboardPage(): JSX.Element | null {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "demo-session";

  const {
    session,
    currentNode,
    nodeConnections,
    players,
    history,
    rollResults,
    isLoading,
    error,
    elapsedTime,
    navigateToNode,
    requestRoll,
    handlePlayerAction,
    startCombat,
    pauseSession,
    resumeSession,
    endSession,
    sendAnnouncement,
    getAIAdvice,
  } = useSeerDashboard(sessionId);

  // Modal states
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Handle roll request from various sources
  const handleRollRequest = useCallback(
    async (characterId: string, attribute: Attribute, difficulty: number, description?: string) => {
      await requestRoll({
        characterId,
        attribute,
        difficulty,
        rollType: "check",
        description,
      });
    },
    [requestRoll]
  );

  // Handle navigation with confirmation
  const handleNavigate = useCallback(
    async (nodeId: string) => {
      // Could add preview/confirmation modal here
      await navigateToNode(nodeId);
    },
    [navigateToNode]
  );

  // Handle end session with confirmation
  const handleEndSession = useCallback(
    async (outcome: "completed" | "cancelled") => {
      await endSession(outcome);
      setShowEndConfirm(false);
      // Could redirect to session summary page
    },
    [endSession]
  );

  // Loading state
  if (isLoading && !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold">Failed to Load Session</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No session found
  if (!session || !currentNode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <p className="text-muted-foreground">
            The session you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-surface-base" style={{ left: 256 }}>
      {/* Session Header */}
      <SessionHeader
        session={session}
        elapsedTime={elapsedTime}
        onPause={pauseSession}
        onResume={resumeSession}
        onEnd={() => setShowEndConfirm(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Panel */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
          {/* Current Node */}
          <NodeView
            node={currentNode}
            connections={nodeConnections}
            onNavigate={handleNavigate}
            onRequestRoll={(attr, diff) => handleRollRequest("", attr, diff)}
            onStartCombat={startCombat}
          />

          {/* Dice Panel */}
          <DicePanel
            players={players}
            recentRolls={rollResults}
            onRequestRoll={handleRollRequest}
          />

          {/* AI Seer Panel */}
          <AISeerPanel
            onGetAdvice={getAIAdvice}
            onUseRoll={(attr, diff) => handleRollRequest("", attr, diff)}
          />
        </div>

        {/* Player Sidebar */}
        <PlayerSidebar
          players={players}
          onPlayerAction={handlePlayerAction}
        />
      </div>

      {/* Quick Action Bar */}
      <QuickActionBar
        onRollClick={() => {}}
        onCombatClick={startCombat}
        onAnnounce={sendAnnouncement}
        history={history}
      />

      {/* End Session Confirmation Modal */}
      <Modal open={showEndConfirm} onClose={() => setShowEndConfirm(false)}>
        <ModalHeader>
          <ModalTitle>End Session?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-muted-foreground">
            Are you sure you want to end this session? All players will be
            disconnected.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEndConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleEndSession("cancelled")}
          >
            End (Cancelled)
          </Button>
          <Button onClick={() => handleEndSession("completed")}>
            End (Completed)
          </Button>
        </ModalFooter>
      </Modal>

      {/* Settings Modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)}>
        <ModalHeader>
          <ModalTitle>⚙️ Session Settings</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-elevated">
              <h4 className="font-medium mb-2">Session Code</h4>
              <div className="font-mono text-2xl tracking-widest text-bronze">
                {session.code}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with players to join
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface-elevated">
              <h4 className="font-medium mb-2">Adventure</h4>
              <div>{session.adventureName}</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-elevated">
              <h4 className="font-medium mb-2">Players</h4>
              <div>
                {players.filter((p) => p.isConnected).length} / {players.length}{" "}
                connected
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
