import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Users, 
  Dice1, 
  BookOpen, 
  Settings,
  Play,
  Pause,
  Clock,
  Zap,
  MessageCircle
} from 'lucide-react'

// Import AI Seer components
import AISeerAssistant from '@/components/sparc/ai/AISeerAssistant'
import ContextualSuggestions from '@/components/sparc/ai/ContextualSuggestions'
import RuleClarification from '@/components/sparc/ai/RuleClarification'
import { useAISeerAdvice } from '@/hooks/useAISeerAdvice'
import { ResponseTimeIndicator } from '@/components/sparc/ai/AILoadingStates'

interface GameSession {
  id: string
  name: string
  players: number
  status: 'active' | 'paused' | 'completed'
  current_scene?: string
  difficulty_level?: string
  start_time: string
  player_engagement?: number
  scene_energy?: string
}

const GameMasterPage: React.FC = () => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null)
  const [gameContext, setGameContext] = useState({
    session_id: '',
    current_scene: '',
    active_characters: [],
    recent_actions: [],
    difficulty_level: 'newcomer',
    player_engagement: 7,
    scene_energy: 'medium'
  })

  const {
    requestAdvice,
    requestContextualSuggestions,
    requestRuleClarification,
    isLoading,
    error,
    performanceStatus,
    clearError
  } = useAISeerAdvice({ 
    gameContext,
    autoRefreshInterval: 30000
  })

  // Mock session for demonstration
  useEffect(() => {
    const mockSession: GameSession = {
      id: 'demo_session_1',
      name: 'The Dragon\'s Riddle',
      players: 3,
      status: 'active',
      current_scene: 'crossroads_encounter',
      difficulty_level: 'beginner',
      start_time: new Date().toISOString(),
      player_engagement: 8,
      scene_energy: 'high'
    }
    
    setActiveSession(mockSession)
    setGameContext(prev => ({
      ...prev,
      session_id: mockSession.id,
      current_scene: mockSession.current_scene || '',
      difficulty_level: mockSession.difficulty_level || 'newcomer',
      player_engagement: mockSession.player_engagement || 5,
      scene_energy: mockSession.scene_energy || 'medium'
    }))
  }, [])

  const handleQuickAdvice = async (type: string) => {
    try {
      const queries = {
        scene_help: "The scene seems to be losing energy. What can I do?",
        player_stuck: "A player seems confused about what to do. How can I help?",
        rule_question: "I need clarification on dice rolling mechanics.",
        general_tip: "Give me some general GM advice for this situation."
      }
      
      await requestAdvice(queries[type as keyof typeof queries] || queries.general_tip, type)
    } catch (error) {
      console.error('Failed to get quick advice:', error)
    }
  }

  const handleSuggestionSelected = async (suggestion: any) => {
    try {
      await requestAdvice(suggestion.content, suggestion.type, 'high')
    } catch (error) {
      console.error('Failed to process suggestion:', error)
    }
  }

  const quickActions = [
    {
      id: 'scene_help',
      label: 'Scene Ideas',
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'player_stuck',
      label: 'Help Players',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'rule_question',
      label: 'Check Rules',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'general_tip',
      label: 'GM Tips',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Master Dashboard</h1>
            <p className="text-gray-600 mt-2">AI-powered GM assistance for SPARC RPG sessions</p>
          </div>
          
          {/* Performance Indicator */}
          {performanceStatus.responseTime && (
            <Card className="w-64">
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Response Time</span>
                  <ResponseTimeIndicator
                    responseTime={performanceStatus.responseTime}
                    target={3000}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Success Rate: {Math.round(performanceStatus.successRate * 100)}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Session Info */}
        {activeSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activeSession.status === 'active' ? 'bg-green-500' :
                    activeSession.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <CardTitle>{activeSession.name}</CardTitle>
                  <Badge variant="outline">{activeSession.difficulty_level}</Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{activeSession.players} players</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 60000)}m
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {activeSession.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-blue-600">{gameContext.player_engagement}/10</div>
                  <div className="text-sm text-gray-600">Player Engagement</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600 capitalize">{gameContext.scene_energy}</div>
                  <div className="text-sm text-gray-600">Scene Energy</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-purple-600">{gameContext.current_scene}</div>
                  <div className="text-sm text-gray-600">Current Scene</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Quick AI Assistance</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => handleQuickAdvice(action.id)}
                  disabled={isLoading}
                  className={`${action.color} text-white h-16 flex flex-col items-center justify-center space-y-1`}
                >
                  {action.icon}
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Error: {error}
                <Button variant="link" size="sm" onClick={clearError} className="ml-2 text-red-600">
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="suggestions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Rules</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Players</span>
            </TabsTrigger>
            <TabsTrigger value="dice" className="flex items-center space-x-2">
              <Dice1 className="w-4 h-4" />
              <span>Dice & Actions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <ContextualSuggestions
              gameState={gameContext}
              onSuggestionSelected={handleSuggestionSelected}
              maxSuggestions={6}
            />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <RuleClarification gameContext={gameContext} />
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Player character sheets and status tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dice Rolling & Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Dice rolling interface and quick action buttons coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating AI Seer Assistant */}
      <AISeerAssistant
        gameContext={gameContext}
        className="fixed bottom-4 right-4"
      />
    </div>
  )
}

export default GameMasterPage