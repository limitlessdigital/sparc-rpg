"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Session {
  id: string;
  name: string;
  description?: string;
  status: "waiting" | "active" | "paused" | "ended";
  playerCount: number;
  maxPlayers: number;
  seerName: string;
  adventureTitle?: string;
  createdAt: string;
  isPublic: boolean;
}

interface SessionBrowserProps {
  onJoinSession?: (sessionId: string) => void;
  userId?: string;
}

export function SessionBrowser({ onJoinSession, userId }: SessionBrowserProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "waiting" | "active">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  async function fetchSessions() {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        status,
        player_count,
        max_players,
        seer_name,
        adventure_title,
        created_at,
        is_public
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    } else {
      setSessions(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          status: s.status,
          playerCount: s.player_count || 0,
          maxPlayers: s.max_players || 4,
          seerName: s.seer_name || "Unknown Seer",
          adventureTitle: s.adventure_title,
          createdAt: s.created_at,
          isPublic: s.is_public,
        }))
      );
    }
    setLoading(false);
  }

  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.seerName.toLowerCase().includes(search.toLowerCase()) ||
      s.adventureTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-orange-500";
      case "ended":
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: Session["status"]) => {
    switch (status) {
      case "waiting":
        return "Waiting for players";
      case "active":
        return "In progress";
      case "paused":
        return "Paused";
      case "ended":
        return "Ended";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Find a Session</h2>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {(["all", "waiting", "active"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sessions found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{session.name}</h3>
                  {session.adventureTitle && (
                    <p className="text-sm text-gray-600">
                      Playing: {session.adventureTitle}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                    session.status
                  )}`}
                >
                  {getStatusLabel(session.status)}
                </span>
              </div>

              {session.description && (
                <p className="text-gray-600 text-sm mb-3">{session.description}</p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Seer: {session.seerName}</span>
                  <span>
                    Players: {session.playerCount}/{session.maxPlayers}
                  </span>
                </div>

                {session.status === "waiting" &&
                  session.playerCount < session.maxPlayers && (
                    <button
                      onClick={() => onJoinSession?.(session.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Session
                    </button>
                  )}

                {session.status === "active" && (
                  <button
                    onClick={() => onJoinSession?.(session.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Spectate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchSessions}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ↻ Refresh Sessions
        </button>
      </div>
    </div>
  );
}

export default SessionBrowser;
