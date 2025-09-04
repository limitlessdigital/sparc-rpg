import React, { useState, useEffect, useRef } from 'react'
import { 
  Brain, Send, Loader2, ThumbsUp, ThumbsDown, 
  Lightbulb, BookOpen, Users, Dice6, MessageSquare,
  ChevronUp, ChevronDown, Zap, AlertCircle
} from 'lucide-react'
import { aiSeerApi, type SeerAdvice } from '../../../services/sparcService'

interface SeerAssistantProps {
  sessionId: string
  currentSituation: string
  userRole: 'seer' | 'player'
  onActionSuggestion?: (action: string) => void
  className?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  advice?: SeerAdvice
}

export default function SeerAssistant({
  sessionId,
  currentSituation,
  userRole,
  onActionSuggestion,
  className = ""
}: SeerAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'AI Seer Assistant ready! Ask me about rules, get scene suggestions, or request tactical advice.',
      timestamp: new Date()
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastAdvice, setLastAdvice] = useState<SeerAdvice | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsLoading(true)

    try {
      const advice = await aiSeerApi.getSeerAdvice(sessionId, currentInput, currentSituation)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: advice.advice,
        timestamp: new Date(),
        advice
      }

      setMessages(prev => [...prev, assistantMessage])
      setLastAdvice(advice)
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I had trouble processing that request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const submitFeedback = async (helpful: boolean) => {
    if (!lastAdvice) return
    
    try {
      await aiSeerApi.submitFeedback(sessionId, helpful)
      // Show brief feedback confirmation
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const getQuickPrompts = () => [
    "What should happen next in this scene?",
    "Suggest some tactical options for the current situation",
    "What are the rules for this type of check?",
    "How can I make this more engaging?",
    "What would make this encounter more challenging?"
  ]

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return MessageSquare
      case 'assistant': return Brain
      default: return AlertCircle
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500/20 border-blue-500/30'
      case 'assistant': return 'bg-purple-500/20 border-purple-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  // Only show to Seers
  if (userRole !== 'seer') {
    return null
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-lg">AI Seer Assistant</h3>
            <p className="text-blue-200 text-sm">Get advice and rule clarifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {isExpanded ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-black/20">
            {messages.map((message) => {
              const MessageIcon = getMessageIcon(message.type)
              return (
                <div key={message.id} className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}>
                  <div className="flex items-start gap-2">
                    <MessageIcon size={14} className="mt-0.5 flex-shrink-0 text-white/80" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{message.content}</p>
                      <p className="text-xs text-white/60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      
                      {/* Show suggestions if available */}
                      {message.advice?.suggestions && message.advice.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-yellow-300 text-xs font-medium">Suggestions:</p>
                          {message.advice.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Lightbulb size={12} className="text-yellow-400" />
                              <span className="text-yellow-200 text-xs">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show quick actions if available */}
                      {message.advice?.quick_actions && message.advice.quick_actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.advice.quick_actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => onActionSuggestion?.(action)}
                              className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Feedback buttons for AI responses */}
                      {message.type === 'assistant' && message.advice && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-white/60">Helpful?</span>
                          <button
                            onClick={() => submitFeedback(true)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => submitFeedback(false)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <ThumbsDown size={12} />
                          </button>
                          <span className="text-xs text-white/40 ml-2">
                            {message.advice.response_time_ms}ms
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 size={20} className="text-purple-400 animate-spin" />
                <span className="text-purple-300 ml-2">AI is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-4 border-t border-white/10 bg-black/10">
            <p className="text-white/80 text-xs mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-1">
              {getQuickPrompts().map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInput(prompt)}
                  disabled={isLoading}
                  className="px-2 py-1 bg-blue-500/30 hover:bg-blue-500/50 disabled:bg-gray-500/30 text-blue-200 text-xs rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask for advice, rule clarifications, or suggestions..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-black/20 text-white rounded border border-white/20 focus:border-purple-400 focus:outline-none text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}