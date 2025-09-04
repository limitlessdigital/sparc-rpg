import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  MessageCircle, 
  Lightbulb, 
  BookOpen, 
  Clock, 
  Send,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap
} from 'lucide-react'

interface AISeerAdvice {
  id: string
  type: 'suggestion' | 'rule_clarification' | 'scene_guidance' | 'player_help'
  title: string
  content: string
  context: string
  confidence: number
  response_time_ms: number
  timestamp: string
  relevant_rules?: string[]
  follow_up_suggestions?: string[]
}

interface GameContext {
  session_id?: string
  current_scene?: string
  active_characters?: any[]
  recent_actions?: string[]
  difficulty_level?: string
  gm_notes?: string
}

interface AISeerAssistantProps {
  gameContext: GameContext
  className?: string
}

const AISeerAssistant: React.FC<AISeerAssistantProps> = ({ gameContext, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recentAdvice, setRecentAdvice] = useState<AISeerAdvice[]>([])
  const [contextualSuggestions, setContextualSuggestions] = useState<AISeerAdvice[]>([])
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-generate contextual suggestions when game context changes
  useEffect(() => {
    if (gameContext.session_id) {
      generateContextualSuggestions()
    }
  }, [gameContext.session_id, gameContext.current_scene])

  const generateContextualSuggestions = async () => {
    try {
      const response = await fetch('/api/sparc/ai/contextual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: gameContext,
          suggestion_types: ['scene_guidance', 'player_help', 'rule_clarification']
        })
      })

      const data = await response.json()
      if (data.success) {
        setContextualSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Failed to generate contextual suggestions:', error)
    }
  }

  const submitAdviceRequest = async (query?: string, requestType: string = 'general') => {
    const queryText = query || currentQuery.trim()
    if (!queryText && requestType === 'general') return

    setIsLoading(true)
    setError(null)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/sparc/ai/seer-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          context: gameContext,
          request_type: requestType,
          max_response_time_ms: 3000 // <3s requirement
        })
      })

      const data = await response.json()
      const endTime = Date.now()
      const totalTime = endTime - startTime

      setResponseTime(totalTime)

      if (data.success) {
        const advice: AISeerAdvice = {
          id: `advice_${Date.now()}`,
          type: data.advice.type,
          title: data.advice.title,
          content: data.advice.content,
          context: data.advice.context || 'General advice',
          confidence: data.advice.confidence || 0.8,
          response_time_ms: totalTime,
          timestamp: new Date().toISOString(),
          relevant_rules: data.advice.relevant_rules || [],
          follow_up_suggestions: data.advice.follow_up_suggestions || []
        }

        setRecentAdvice(prev => [advice, ...prev.slice(0, 9)]) // Keep last 10
        setCurrentQuery('')
        
        // Auto-scroll to new advice
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0
          }
        }, 100)
      } else {
        throw new Error(data.error || 'Failed to get AI advice')
      }
    } catch (error) {
      console.error('AI Seer request failed:', error)
      setError(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getAdviceTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="w-4 h-4" />
      case 'rule_clarification': return <BookOpen className="w-4 h-4" />
      case 'scene_guidance': return <Brain className="w-4 h-4" />
      case 'player_help': return <HelpCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getAdviceTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rule_clarification': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scene_guidance': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'player_help': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const quickActionButtons = [
    { 
      label: "Scene Ideas", 
      action: () => submitAdviceRequest("Give me creative ideas for the current scene", "scene_guidance"),
      icon: <Sparkles className="w-4 h-4" />
    },
    { 
      label: "Rule Check", 
      action: () => submitAdviceRequest("Clarify relevant rules for this situation", "rule_clarification"),
      icon: <BookOpen className="w-4 h-4" />
    },
    { 
      label: "Player Help", 
      action: () => submitAdviceRequest("How can I help players who seem stuck?", "player_help"),
      icon: <HelpCircle className="w-4 h-4" />
    },
    { 
      label: "NPC Ideas", 
      action: () => submitAdviceRequest("Suggest interesting NPCs for this scene", "suggestion"),
      icon: <MessageCircle className="w-4 h-4" />
    }
  ]

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          <Brain className="w-6 h-6" />
        </Button>
        {contextualSuggestions.length > 0 && (
          <Badge className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
            {contextualSuggestions.length}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 ${className}`}>
      <Card className="shadow-xl border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">AI Seer Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {responseTime && (
                <Badge variant="outline" className={responseTime < 3000 ? "text-green-600" : "text-orange-600"}>
                  <Clock className="w-3 h-3 mr-1" />
                  {formatResponseTime(responseTime)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActionButtons.map((button, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={button.action}
                disabled={isLoading}
                className="justify-start text-xs"
              >
                {button.icon}
                <span className="ml-1">{button.label}</span>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Custom Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ask the AI Seer:</label>
            <div className="flex space-x-2">
              <Textarea
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="What GM guidance do you need?"
                rows={2}
                className="resize-none text-sm"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submitAdviceRequest()
                  }
                }}
              />
              <Button
                onClick={() => submitAdviceRequest()}
                disabled={isLoading || !currentQuery.trim()}
                size="sm"
                className="px-3"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Contextual Suggestions */}
          {contextualSuggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                Contextual Suggestions
              </label>
              <div className="space-y-2">
                {contextualSuggestions.slice(0, 2).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => submitAdviceRequest(suggestion.content, suggestion.type)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-800">{suggestion.title}</span>
                      {getAdviceTypeIcon(suggestion.type)}
                    </div>
                    <p className="text-xs text-yellow-700">{suggestion.content.substring(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Advice */}
          {recentAdvice.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recent Advice</label>
              <ScrollArea ref={scrollAreaRef} className="h-60 pr-2">
                <div className="space-y-3">
                  {recentAdvice.map((advice) => (
                    <Card key={advice.id} className="border border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getAdviceTypeIcon(advice.type)}
                            <span className="font-medium text-sm">{advice.title}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge className={`text-xs ${getAdviceTypeColor(advice.type)}`}>
                              {advice.type.replace('_', ' ')}
                            </Badge>
                            {advice.response_time_ms < 3000 && (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{advice.content}</p>
                        
                        {advice.relevant_rules && advice.relevant_rules.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600">Relevant Rules:</span>
                            <ul className="text-xs text-gray-600 ml-2 mt-1">
                              {advice.relevant_rules.map((rule, idx) => (
                                <li key={idx}>• {rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {advice.follow_up_suggestions && advice.follow_up_suggestions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-600">Follow-up Ideas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {advice.follow_up_suggestions.slice(0, 3).map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={() => submitAdviceRequest(suggestion, 'suggestion')}
                                >
                                  {suggestion.length > 20 ? `${suggestion.substring(0, 20)}...` : suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(advice.confidence * 100)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatResponseTime(advice.response_time_ms)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
              <span className="text-sm text-gray-600">Getting AI advice...</span>
            </div>
          )}

          {/* Performance Indicator */}
          <div className="text-center">
            <span className="text-xs text-gray-500">
              Target response time: &lt;3 seconds
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AISeerAssistant