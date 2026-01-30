"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input } from "../Input";
import { Badge } from "../Badge";
import { Spinner } from "../Loading";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import type {
  AISeerResponse,
  Attribute,
  Shortcode,
  SuggestionChip,
  AIMessage,
  AIPanelMode,
} from "./types";

// Default shortcodes
const DEFAULT_SHORTCODES: Shortcode[] = [
  { code: "combat", description: "Combat rules", example: "/combat", requiresContext: false, category: "rules", icon: "⚔️" },
  { code: "order", description: "Turn order", example: "/order", requiresContext: true, category: "combat", icon: "📋" },
  { code: "abilities", description: "Player abilities", example: "/abilities", requiresContext: true, category: "utility", icon: "✨" },
  { code: "stats", description: "Party stats", example: "/stats", requiresContext: true, category: "utility", icon: "📊" },
  { code: "difficulty", description: "DC reference", example: "/difficulty", requiresContext: false, category: "rules", icon: "🎯" },
  { code: "classes", description: "Class reference", example: "/classes", requiresContext: false, category: "rules", icon: "🎭" },
];

// Context-aware suggestion chips
const SUGGESTION_CHIPS: SuggestionChip[] = [
  { id: "climb", label: "Climbing", action: "How should they handle climbing this?", category: "roll" },
  { id: "sneak", label: "Sneaking", action: "They want to sneak past guards", category: "roll" },
  { id: "persuade", label: "Persuasion", action: "How to persuade this NPC?", category: "roll" },
  { id: "investigate", label: "Search area", action: "They want to search the room", category: "roll" },
  { id: "describe", label: "Describe scene", action: "/describe the current scene", category: "narrative" },
  { id: "npc", label: "Quick NPC", action: "/npc", category: "narrative" },
];

export interface AISeerPanelProps {
  /** Function to get AI advice */
  onGetAdvice: (question: string) => Promise<AISeerResponse>;
  /** Optional callback when a roll is selected */
  onUseRoll?: (attribute: Attribute, difficulty: number) => void;
  /** Optional callback for copy to clipboard */
  onCopy?: (text: string) => void;
  /** Panel display mode */
  mode?: AIPanelMode;
  /** Custom shortcodes (overrides defaults) */
  shortcodes?: Shortcode[];
  /** Enable streaming responses (placeholder) */
  enableStreaming?: boolean;
  /** Enable voice output (placeholder) */
  enableVoice?: boolean;
  /** Custom class name */
  className?: string;
}

export function AISeerPanel({
  onGetAdvice,
  onUseRoll,
  onCopy,
  mode = "chat",
  shortcodes = DEFAULT_SHORTCODES,
  enableStreaming: _enableStreaming = false,
  enableVoice = false,
  className,
}: AISeerPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShortcodes, setShowShortcodes] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Ask a question
  const askQuestion = useCallback(
    async (text?: string) => {
      const query = text || question;
      if (!query.trim()) return;

      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setQuestion("");
      setIsLoading(true);
      setError(null);
      setStreamingText("");

      try {
        const response = await onGetAdvice(query);

        const assistantMessage: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.suggestion,
          timestamp: new Date(),
          response,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get advice");
      } finally {
        setIsLoading(false);
        setStreamingText("");
      }
    },
    [question, onGetAdvice]
  );

  // Handle shortcode click
  const handleShortcode = useCallback(
    (code: string) => {
      askQuestion(`/${code}`);
      setShowShortcodes(false);
    },
    [askQuestion]
  );

  // Handle suggestion chip click
  const handleSuggestion = useCallback(
    (chip: SuggestionChip) => {
      askQuestion(chip.action);
    },
    [askQuestion]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askQuestion();
      }
      // Show shortcode menu on /
      if (e.key === "/" && question === "") {
        setShowShortcodes(true);
      }
    },
    [askQuestion, question]
  );

  // Handle copy
  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      onCopy?.(text);
    },
    [onCopy]
  );

  // Clear conversation
  const handleClear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Render suggestion chips
  const renderSuggestionChips = () => (
    <div className="flex flex-wrap gap-1 mb-2">
      {SUGGESTION_CHIPS.slice(0, 4).map((chip) => (
        <button
          key={chip.id}
          onClick={() => handleSuggestion(chip)}
          disabled={isLoading}
          className={cn(
            "px-2 py-1 text-xs rounded-full transition-colors",
            "bg-surface-elevated hover:bg-surface-elevated/80",
            "border border-surface-divider hover:border-bronze/30",
            "text-muted-foreground hover:text-foreground",
            "disabled:opacity-50"
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );

  // Render shortcode menu
  const renderShortcodeMenu = () => (
    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-surface-elevated rounded-lg border border-surface-divider shadow-lg z-10">
      <div className="text-xs text-muted-foreground mb-2">Quick Commands</div>
      <div className="grid grid-cols-2 gap-1">
        {shortcodes.map((sc) => (
          <button
            key={sc.code}
            onClick={() => handleShortcode(sc.code)}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left",
              "hover:bg-surface-base transition-colors"
            )}
          >
            <span>{sc.icon}</span>
            <span className="flex-1">{sc.description}</span>
            <span className="text-xs text-muted-foreground">/{sc.code}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Render a single message
  const renderMessage = (msg: AIMessage) => {
    const isUser = msg.role === "user";
    const response = msg.response;

    return (
      <div
        key={msg.id}
        className={cn("flex gap-2 mb-3", isUser ? "justify-end" : "justify-start")}
      >
        {!isUser && <div className="w-6 h-6 rounded-full bg-bronze/20 flex items-center justify-center text-xs">🔮</div>}
        <div
          className={cn(
            "max-w-[85%] rounded-lg p-3",
            isUser
              ? "bg-bronze/20 text-foreground"
              : "bg-surface-elevated border border-surface-divider"
          )}
        >
          {/* Message content */}
          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

          {/* Suggested roll */}
          {response?.suggestedRoll && (
            <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-amber-600">🎲 Suggested Roll</div>
                  <div className="font-bold text-sm">
                    {response.suggestedRoll.attribute.toUpperCase()} vs DC{" "}
                    {response.suggestedRoll.difficulty}
                  </div>
                  <div className="text-xs text-muted-foreground">{response.suggestedRoll.reason}</div>
                </div>
                {onUseRoll && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onUseRoll(response.suggestedRoll!.attribute, response.suggestedRoll!.difficulty)
                    }
                  >
                    Use
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Narrative hook */}
          {response?.narrativeHook && (
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">✨ Narrative Hook</div>
              <div className="text-sm italic text-muted-foreground border-l-2 border-bronze/30 pl-2">
                {response.narrativeHook}
              </div>
              <button
                onClick={() => handleCopy(response.narrativeHook!)}
                className="text-xs text-bronze hover:underline mt-1"
              >
                Copy
              </button>
            </div>
          )}

          {/* Rule clarification */}
          {response?.ruleClarification && (
            <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs font-medium text-blue-600 mb-1">📖 Rule</div>
              <div className="text-sm">{response.ruleClarification}</div>
            </div>
          )}

          {/* Meta info */}
          {response && !isUser && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{response.responseTimeMs}ms</span>
              {response.cached && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  Cached
                </Badge>
              )}
              {enableVoice && (
                <button className="hover:text-foreground" title="Read aloud (coming soon)">
                  🔊
                </button>
              )}
            </div>
          )}
        </div>
        {isUser && <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center text-xs">👤</div>}
      </div>
    );
  };

  // Compact mode rendering
  if (mode === "compact") {
    const lastResponse = messages.filter((m) => m.role === "assistant").pop()?.response;

    return (
      <Card className={cn("bg-surface-elevated border-bronze/20", className)}>
        <CardContent className="p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask AI..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={() => askQuestion()} disabled={isLoading || !question.trim()}>
              {isLoading ? <Spinner size="sm" /> : "→"}
            </Button>
          </div>

          {lastResponse && (
            <div className="text-xs text-muted-foreground truncate">{lastResponse.suggestion}</div>
          )}

          {error && <div className="text-xs text-red-500">{error}</div>}
        </CardContent>
      </Card>
    );
  }

  // Full chat mode
  return (
    <Card className={cn("bg-surface-elevated border-bronze/20", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>🔮</span>
            AI Seer Assistant
          </CardTitle>
          <div className="flex items-center gap-1">
            {enableVoice && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Voice (coming soon)">
                🔊
              </Button>
            )}
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleClear} title="Clear">
                🗑️
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Messages area */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Ask me anything about rules, suggestions, or use <span className="text-bronze">/commands</span>
            </div>
          ) : (
            messages.map(renderMessage)
          )}

          {/* Streaming text */}
          {isLoading && streamingText && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-bronze/20 flex items-center justify-center text-xs">🔮</div>
              <div className="max-w-[85%] rounded-lg p-3 bg-surface-elevated border border-surface-divider">
                <div className="text-sm">{streamingText}</div>
                <span className="inline-block w-2 h-4 bg-bronze/50 animate-pulse" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingText && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-bronze/20 flex items-center justify-center text-xs">🔮</div>
              <div className="rounded-lg p-3 bg-surface-elevated border border-surface-divider">
                <Spinner size="sm" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Suggestion chips */}
        {messages.length === 0 && renderSuggestionChips()}

        {/* Input area */}
        <div className="relative">
          {showShortcodes && renderShortcodeMenu()}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Ask anything... (/ for commands)"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (e.target.value === "") setShowShortcodes(false);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (question === "") setShowShortcodes(false);
                }}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                onClick={() => setShowShortcodes(!showShortcodes)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Commands"
              >
                /
              </button>
            </div>
            <Button onClick={() => askQuestion()} disabled={isLoading || !question.trim()}>
              {isLoading ? <Spinner size="sm" /> : "Ask"}
            </Button>
          </div>
        </div>

        {/* Quick shortcode buttons */}
        <div className="flex flex-wrap gap-1">
          {shortcodes.slice(0, 4).map((sc) => (
            <Button
              key={sc.code}
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleShortcode(sc.code)}
              disabled={isLoading}
            >
              {sc.icon} {sc.description}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
