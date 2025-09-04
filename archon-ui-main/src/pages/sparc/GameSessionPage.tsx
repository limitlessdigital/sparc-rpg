import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Users, Dice6, Settings, MessageCircle, Play, Pause, 
  SkipForward, Crown, Shield, Sword, Wand, Heart,
  ChevronRight, ChevronLeft, Maximize2, Minimize2
} from 'lucide-react'
import { 
  sessionApi, pollingApi, diceApi, aiSeerApi,
  type GameSession, type SessionState, type Character,
  type RollDiceRequest, type RollDiceResponse
} from '../../services/sparcService'
import TurnOrderDisplay from '../../components/sparc/session/TurnOrderDisplay'
import CharacterSheet from '../../components/sparc/character/CharacterSheet'
import DiceRoller from '../../components/sparc/dice/DiceRoller'
import SceneManager from '../../components/sparc/session/SceneManager'
import AISeerAssistant from '../../components/sparc/ai/AISeerAssistant'

interface GameSessionPageProps {
  sessionId?: string
}

export default function GameSessionPage({ sessionId: propSessionId }: GameSessionPageProps) {
  const { sessionId: paramSessionId } = useParams()
  const navigate = useNavigate()
  const sessionId = propSessionId || paramSessionId
  
  // Core state
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState<'game' | 'characters' | 'chat'>('game')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Dice rolling state
  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<RollDiceResponse | null>(null)
  const [rollHistory, setRollHistory] = useState<RollDiceResponse[]>([])
  
  // AI Seer state
  const [seerAdvice, setSeerAdvice] = useState<any>(null)
  const [loadingSeerAdvice, setLoadingSeerAdvice] = useState(false)
  
  // Polling state
  const [pollingEtag, setPollingEtag] = useState<string | null>(null)
  const [lastPollTime, setLastPollTime] = useState<number>(Date.now())
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // User state - TODO: Replace with actual auth
  const [currentUserId] = useState('temp_user')
  const [userRole, setUserRole] = useState<'seer' | 'player'>('player')
  
  // Initialize session
  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }
    
    loadSessionState()
  }, [sessionId])
  
  // Set up polling
  useEffect(() => {
    if (!sessionState) return
    
    // Determine user role
    const isSessionSeer = sessionState.session.seer_id === currentUserId
    setUserRole(isSessionSeer ? 'seer' : 'player')
    
    // Start polling based on session status
    startPolling()
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [sessionState])
  
  const loadSessionState = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const state = await sessionApi.getSessionState(sessionId!)
      setSessionState(state)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load session')
      console.error('Failed to load session:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const startPolling = async () => {
    if (!sessionId || !sessionState) return
    
    // Get optimal polling intervals
    try {
      const intervals = await pollingApi.getPollingIntervals(sessionId)
      const pollInterval = sessionState.session.status === 'active' ? intervals.session_state : 5000
      
      // Clear existing polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      
      // Start new polling
      pollIntervalRef.current = setInterval(async () => {
        await pollSessionState()
      }, pollInterval)
      
      // Initial poll
      await pollSessionState()
    } catch (err) {
      console.error('Failed to start polling:', err)
    }
  }
  
  const pollSessionState = async () => {
    if (!sessionId) return
    
    try {
      const result = await pollingApi.pollSessionState(sessionId, pollingEtag)
      
      if (result.status === 'modified' && result.data) {
        setSessionState(result.data)
        setPollingEtag(result.etag || null)
        setLastPollTime(Date.now())
      }
    } catch (err) {
      console.error('Polling failed:', err)
    }
  }
  
  const rollDice = async (diceCount: number, rollType: string, characterId?: string, context = '') => {
    if (!sessionId || isDiceRolling) return
    
    try {
      setIsDiceRolling(true)
      
      const request: RollDiceRequest = {
        dice_count: diceCount,
        roll_type: rollType as any,
        character_id: characterId,
        modifier: 0,
        context
      }
      
      const response = await diceApi.rollDice(request, sessionId)
      
      setLastRoll(response)
      setRollHistory(prev => [response, ...prev.slice(0, 9)]) // Keep last 10 rolls
      
      // Animate dice for the duration specified
      setTimeout(() => {
        setIsDiceRolling(false)
      }, response.animation_duration_ms)
      
    } catch (err: any) {
      console.error('Dice roll failed:', err)
      setError(err.response?.data?.detail || 'Dice roll failed')
      setIsDiceRolling(false)
    }
  }
  
  const getSeerAdvice = async (situation: string) => {
    if (!sessionId || loadingSeerAdvice) return
    
    try {
      setLoadingSeerAdvice(true)
      const advice = await aiSeerApi.getSeerAdvice(sessionId, situation)
      setSeerAdvice(advice)
    } catch (err) {
      console.error('Failed to get Seer advice:', err)
    } finally {
      setLoadingSeerAdvice(false)
    }
  }
  
  const nextTurn = async () => {
    if (!sessionId || userRole !== 'seer') return
    
    try {
      const result = await sessionApi.nextTurn(sessionId)
      // Session state will update via polling
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to advance turn')
    }
  }
  
  const startSession = async () => {
    if (!sessionId || userRole !== 'seer') return
    
    try {
      await sessionApi.startSession(sessionId)
      // Session state will update via polling
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start session')
    }
  }
  
  const pauseSession = async () => {
    if (!sessionId || userRole !== 'seer') return
    
    try {
      await sessionApi.pauseSession(sessionId)
      // Session state will update via polling
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to pause session')
    }
  }
  
  const resumeSession = async () => {
    if (!sessionId || userRole !== 'seer') return
    
    try {
      await sessionApi.resumeSession(sessionId)
      // Session state will update via polling
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resume session')
    }
  }
  
  const getCurrentCharacter = (): Character | null => {
    if (!sessionState || !sessionState.session.turn_order.length) return null
    
    const currentCharId = sessionState.session.turn_order[sessionState.session.current_turn_index]
    return sessionState.characters.find(c => c.id === currentCharId) || null
  }
  
  const getCharacterIcon = (characterClass: string) => {
    const iconMap: Record<string, any> = {
      warrior: Sword,
      paladin: Shield,
      wizard: Wand,
      cleric: Heart,
      rogue: Users,
      ranger: Users,
      necromancer: Wand
    }
    return iconMap[characterClass.toLowerCase()] || Users
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game session...</div>
      </div>
    )
  }
  
  if (error || !sessionState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Session Error</h2>
          <p>{error || 'Session not found'}</p>
          <button 
            onClick={() => navigate('/sessions')} 
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    )
  }
  
  const currentCharacter = getCurrentCharacter()
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex ${isFullscreen ? 'fixed inset-0' : ''}`}>
      {/* Sidebar */}
      <div className={`bg-black/30 backdrop-blur-md transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-white font-bold text-lg">{sessionState.session.name}</h1>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    sessionState.session.status === 'active' ? 'bg-green-400' :
                    sessionState.session.status === 'waiting' ? 'bg-yellow-400' :
                    sessionState.session.status === 'paused' ? 'bg-orange-400' : 'bg-gray-400'
                  }`} />
                  {sessionState.session.status.toUpperCase()}
                  {userRole === 'seer' && <Crown size={16} className="text-yellow-400" />}
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>
        
        {!sidebarCollapsed && (
          <>
            {/* Turn Order */}
            {sessionState.session.status === 'active' && sessionState.session.turn_order.length > 0 && (
              <div className="p-4 border-b border-white/20">
                <h3 className="text-white font-medium mb-3">Turn Order</h3>
                <div className="space-y-2">
                  {sessionState.session.turn_order.map((characterId, index) => {
                    const character = sessionState.characters.find(c => c.id === characterId)
                    if (!character) return null
                    
                    const isCurrentTurn = index === sessionState.session.current_turn_index
                    const CharacterIcon = getCharacterIcon(character.character_class)
                    
                    return (
                      <div 
                        key={characterId}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isCurrentTurn 
                            ? 'bg-blue-500/30 border border-blue-400' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrentTurn ? 'bg-blue-500' : 'bg-gray-600'
                        }`}>
                          <CharacterIcon size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            isCurrentTurn ? 'text-white' : 'text-blue-200'
                          }`}>
                            {character.name}
                          </div>
                          <div className="text-xs text-blue-300">
                            {character.character_class} • {character.current_hp}/{character.max_hp} HP
                          </div>
                        </div>
                        {isCurrentTurn && (
                          <div className="text-xs text-blue-200">
                            Turn {sessionState.session.current_turn_index + 1}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="p-4 border-b border-white/20">
              <h3 className="text-white font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => rollDice(1, 'skill_check', undefined, 'Quick roll')}
                  disabled={isDiceRolling}
                  className="w-full flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Dice6 size={16} className={isDiceRolling ? 'animate-spin' : ''} />
                  Roll 1d6
                </button>
                
                {userRole === 'seer' && (
                  <>
                    {sessionState.session.status === 'waiting' && (
                      <button
                        onClick={startSession}
                        className="w-full flex items-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <Play size={16} />
                        Start Session
                      </button>
                    )}
                    
                    {sessionState.session.status === 'active' && (
                      <>
                        <button
                          onClick={nextTurn}
                          className="w-full flex items-center gap-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                          <SkipForward size={16} />
                          Next Turn
                        </button>
                        
                        <button
                          onClick={pauseSession}
                          className="w-full flex items-center gap-2 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        >
                          <Pause size={16} />
                          Pause Session
                        </button>
                      </>
                    )}
                    
                    {sessionState.session.status === 'paused' && (
                      <button
                        onClick={resumeSession}
                        className="w-full flex items-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <Play size={16} />
                        Resume Session
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Recent Rolls */}
            {rollHistory.length > 0 && (
              <div className="p-4">
                <h3 className="text-white font-medium mb-3">Recent Rolls</h3>
                <div className="space-y-2">
                  {rollHistory.slice(0, 5).map((roll, index) => (
                    <div key={`${roll.roll.id}-${index}`} className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200 text-sm">
                          {roll.roll.dice_count}d6
                        </span>
                        <span className="text-white font-bold">
                          {roll.roll.total}
                        </span>
                      </div>
                      {roll.roll.context && (
                        <div className="text-xs text-blue-300 mt-1">
                          {roll.roll.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-white/10 rounded-lg p-1">
                {[
                  { id: 'game', label: 'Game', icon: Play },
                  { id: 'characters', label: 'Characters', icon: Users },
                  { id: 'chat', label: 'Chat', icon: MessageCircle }
                ].map(tab => {
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-blue-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <TabIcon size={16} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <div className="text-blue-200 text-sm">
                Last update: {new Date(lastPollTime).toLocaleTimeString()}
              </div>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              
              <button
                onClick={() => navigate('/sessions')}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Game Area */}
        <div className="flex-1 p-6">
          {activeTab === 'game' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Scene & AI */}
              <div className="lg:col-span-2 space-y-6">
                <SceneManager
                  session={sessionState.session}
                  characters={sessionState.characters}
                  userRole={userRole}
                  onSceneAction={async (action, data) => {
                    // Handle scene actions - this would connect to backend
                    console.log('Scene action:', action, data)
                  }}
                />
                
                <AISeerAssistant
                  gameContext={{
                    session_id: sessionId!,
                    current_scene: sessionState.session.current_scene || 'General',
                    active_characters: sessionState.characters,
                    difficulty_level: userRole === 'seer' ? 'experienced' : 'newcomer'
                  }}
                />
              </div>
              
              {/* Right Column - Turn Order & Dice */}
              <div className="space-y-6">
                <TurnOrderDisplay
                  session={sessionState.session}
                  characters={sessionState.characters}
                  userRole={userRole}
                  onTurnAdvance={nextTurn}
                  onSessionAction={async (action) => {
                    if (action === 'start') await startSession()
                    else if (action === 'pause') await pauseSession()
                    else if (action === 'resume') await resumeSession()
                    else if (action === 'reroll_initiative') {
                      // Handle initiative reroll
                      console.log('Rerolling initiative')
                    }
                  }}
                />
                
                <DiceRoller
                  sessionId={sessionId!}
                  onRollComplete={(result) => {
                    setLastRoll(result)
                    setRollHistory(prev => [result, ...prev].slice(0, 10))
                  }}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sessionState.characters.map(character => {
                const isCurrentTurn = currentCharacter?.id === character.id
                const canEdit = userRole === 'seer' || character.user_id === currentUserId
                
                return (
                  <CharacterSheet
                    key={character.id}
                    character={character}
                    isCurrentTurn={isCurrentTurn}
                    canEdit={canEdit}
                    sessionId={sessionId}
                    onCharacterUpdate={(updatedCharacter) => {
                      // Update character in session state
                      setSessionState(prev => prev ? {
                        ...prev,
                        characters: prev.characters.map(c => 
                          c.id === updatedCharacter.id ? updatedCharacter : c
                        )
                      } : null)
                    }}
                  />
                )
              })}
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Session Chat</h3>
              <div className="bg-black/20 rounded-lg p-4 min-h-[400px] mb-4">
                <p className="text-blue-200 text-center">
                  Chat system coming soon! Use voice communication for now.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-black/20 text-white rounded-lg border border-white/20 focus:border-blue-400 focus:outline-none"
                  disabled
                />
                <button
                  disabled
                  className="px-4 py-2 bg-blue-500/50 text-white rounded-lg cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}