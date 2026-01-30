"use client";

import { useState } from "react";
import { Button, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Textarea } from "@sparc/ui";
import type { HistoryEntry } from "../types";

interface QuickActionBarProps {
  onRollClick: () => void;
  onCombatClick: () => void;
  onAnnounce: (message: string, type: "info" | "warning" | "story") => void;
  history: HistoryEntry[];
}

function HistoryPanel({ history }: { history: HistoryEntry[] }) {
  const getIcon = (type: HistoryEntry["type"]) => {
    switch (type) {
      case "navigation": return "🗺️";
      case "roll": return "🎲";
      case "combat": return "⚔️";
      case "announcement": return "📢";
      default: return "📝";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {history.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">
          No history yet
        </div>
      ) : (
        history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-2 p-2 rounded bg-surface-elevated text-sm"
          >
            <span>{getIcon(entry.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="truncate">{entry.description}</div>
              <div className="text-xs text-muted-foreground">
                {formatTime(entry.timestamp)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function QuickActionBar({ 
  onRollClick, 
  onCombatClick, 
  onAnnounce,
  history,
}: QuickActionBarProps) {
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "story">("info");

  const handleAnnounce = () => {
    if (announcement.trim()) {
      onAnnounce(announcement, announcementType);
      setAnnouncement("");
      setShowAnnounceModal(false);
    }
  };

  const actions = [
    { id: "roll", icon: "🎲", label: "Roll", onClick: onRollClick },
    { id: "combat", icon: "⚔️", label: "Combat", onClick: onCombatClick },
    { id: "items", icon: "📦", label: "Items", onClick: () => {} },
    { id: "announce", icon: "📢", label: "Announce", onClick: () => setShowAnnounceModal(true) },
    { id: "history", icon: "📜", label: "History", onClick: () => setShowHistoryModal(true) },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-64 right-0 bg-surface border-t border-surface-divider">
        <div className="flex items-center justify-center gap-2 p-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              size="lg"
              className="gap-2"
              onClick={action.onClick}
            >
              <span className="text-xl">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Announcement Modal */}
      <Modal open={showAnnounceModal} onClose={() => setShowAnnounceModal(false)}>
        <ModalHeader>
          <ModalTitle>📢 Send Announcement</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2 mt-2">
              {(["info", "warning", "story"] as const).map((type) => (
                <Button
                  key={type}
                  variant={announcementType === type ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setAnnouncementType(type)}
                  className="capitalize"
                >
                  {type === "info" && "ℹ️"} 
                  {type === "warning" && "⚠️"} 
                  {type === "story" && "📖"} {type}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Enter your announcement..."
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAnnounceModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAnnounce} disabled={!announcement.trim()}>
            Send to Players
          </Button>
        </ModalFooter>
      </Modal>

      {/* History Modal */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)}>
        <ModalHeader>
          <ModalTitle>📜 Session History</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <HistoryPanel history={history} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
