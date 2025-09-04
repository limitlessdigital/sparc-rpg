import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Brain, 
  Users, 
  Dice1, 
  BookOpen,
  ChevronRight,
  RefreshCw,
  Zap,
  MessageCircle
} from 'lucide-react'

interface ContextualSuggestion {
  id: string
  type: 'scene_enhancement' | 'player_guidance' | 'narrative_hook' | 'challenge_idea' | 'npc_motivation'
  title: string
  content: string
  urgency: 'low' | 'medium' | 'high'
  context_relevance: number
  estimated_impact: string
  implementation_hint: string
}

interface GameState {
  session_id?: string
  current_scene?: string
  active_characters?: any[]
  recent_actions?: string[]
  player_engagement?: number
  scene_energy?: string
  difficulty_level?: string
}

interface ContextualSuggestionsProps {
  gameState: GameState
  onSuggestionSelected?: (suggestion: ContextualSuggestion) => void
  maxSuggestions?: number
  className?: string
}

const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({
  gameState,
  onSuggestionSelected,
  maxSuggestions = 4,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Auto-refresh suggestions when game state changes significantly
  useEffect(() => {
    if (gameState.session_id) {
      refreshSuggestions()
    }
  }, [gameState.current_scene, gameState.player_engagement])

  // Periodic refresh of suggestions
  useEffect(() => {
    if (!gameState.session_id) return

    const interval = setInterval(() => {
      if (lastUpdate && (Date.now() - lastUpdate.getTime()) > 30000) { // 30 seconds
        refreshSuggestions()
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [lastUpdate, gameState.session_id])

  const refreshSuggestions = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/contextual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_state: gameState,
          max_suggestions: maxSuggestions,
          include_types: ['scene_enhancement', 'player_guidance', 'narrative_hook', 'challenge_idea', 'npc_motivation']
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuggestions(data.suggestions)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to refresh contextual suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'scene_enhancement': return <Brain className="w-4 h-4" />
      case 'player_guidance': return <Users className="w-4 h-4" />
      case 'narrative_hook': return <BookOpen className="w-4 h-4" />
      case 'challenge_idea': return <Dice1 className="w-4 h-4" />
      case 'npc_motivation': return <MessageCircle className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scene_enhancement': return 'bg-purple-100 text-purple-800'
      case 'player_guidance': return 'bg-blue-100 text-blue-800'
      case 'narrative_hook': return 'bg-indigo-100 text-indigo-800'
      case 'challenge_idea': return 'bg-yellow-100 text-yellow-800'
      case 'npc_motivation': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSuggestionClick = (suggestion: ContextualSuggestion) => {
    if (onSuggestionSelected) {
      onSuggestionSelected(suggestion)
    }
  }

  if (!gameState.session_id || suggestions.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Contextual Suggestions</h3>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated {Math.round((Date.now() - lastUpdate.getTime()) / 1000)}s ago
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSuggestions}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-3">
        {suggestions.slice(0, maxSuggestions).map((suggestion) => (
          <Card
            key={suggestion.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 hover:border-l-purple-500"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getSuggestionIcon(suggestion.type)}
                  <h4 className="font-medium text-sm text-gray-900">{suggestion.title}</h4>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                    {suggestion.type.replace('_', ' ')}
                  </Badge>
                  <Badge className={`text-xs ${getUrgencyColor(suggestion.urgency)}`}>
                    {suggestion.urgency}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {suggestion.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Impact: {suggestion.estimated_impact}</span>
                  <span>Relevance: {Math.round(suggestion.context_relevance * 100)}%</span>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              
              {suggestion.implementation_hint && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600 italic">
                    💡 {suggestion.implementation_hint}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Generating contextual suggestions...</p>
        </div>
      )}
    </div>
  )
}

export default ContextualSuggestions