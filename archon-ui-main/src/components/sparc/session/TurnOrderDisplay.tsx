import React from 'react'
import { 
  Crown, SkipForward, Play, Pause, RotateCcw, 
  Sword, Shield, Wand, Heart, Users 
} from 'lucide-react'
import { GameSession, Character, sessionApi } from '../../../services/sparcService'

interface TurnOrderDisplayProps {
  session: GameSession
  characters: Character[]
  userRole: 'seer' | 'player'
  onTurnAdvance?: () => void
  onSessionAction?: (action: string) => void
  className?: string
}

export default function TurnOrderDisplay({
  session,
  characters,
  userRole,
  onTurnAdvance,
  onSessionAction,
  className = ""
}: TurnOrderDisplayProps) {
  
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
  
  const getCharacterColor = (characterClass: string) => {
    const colorMap: Record<string, string> = {
      warrior: 'border-red-400 bg-red-500/20',
      paladin: 'border-yellow-400 bg-yellow-500/20',
      wizard: 'border-purple-400 bg-purple-500/20',
      cleric: 'border-blue-400 bg-blue-500/20',
      rogue: 'border-gray-400 bg-gray-500/20',
      ranger: 'border-green-400 bg-green-500/20',
      necromancer: 'border-purple-800 bg-purple-800/20'
    }
    return colorMap[characterClass.toLowerCase()] || 'border-blue-400 bg-blue-500/20'
  }
  
  const getCurrentCharacter = (): Character | null => {
    if (!session.turn_order.length) return null
    const currentCharId = session.turn_order[session.current_turn_index]
    return characters.find(c => c.id === currentCharId) || null
  }
  
  const getRoundNumber = (): number => {
    if (!session.turn_order.length) return 0
    return Math.floor(session.current_turn_index / session.turn_order.length) + 1
  }
  
  const getTurnInRound = (): number => {
    if (!session.turn_order.length) return 0
    return (session.current_turn_index % session.turn_order.length) + 1
  }
  
  const currentCharacter = getCurrentCharacter()
  
  if (session.status === 'waiting') {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-white font-bold text-lg mb-4">Waiting to Start</h3>
          <div className="text-blue-200 mb-4">
            Players in session: {characters.length}/{session.max_players}
          </div>
          
          {characters.length > 0 && (
            <div className="space-y-2 mb-4">
              {characters.map(character => {
                const CharacterIcon = getCharacterIcon(character.character_class)
                return (
                  <div 
                    key={character.id}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CharacterIcon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{character.name}</div>
                      <div className="text-blue-300 text-sm capitalize">{character.character_class}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {userRole === 'seer' && characters.length > 0 && (
            <button
              onClick={() => onSessionAction?.('start')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <Play size={20} />
              Start Session & Roll Initiative
            </button>
          )}
        </div>
      </div>
    )
  }
  
  if (!session.turn_order.length) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${className}`}>
        <div className="text-center text-blue-200">
          <p>No turn order established</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Turn Order</h3>
          <div className="text-blue-200 text-sm">
            Round {getRoundNumber()} • Turn {getTurnInRound()}/{session.turn_order.length}
          </div>
        </div>
        
        {userRole === 'seer' && (
          <Crown size={20} className="text-yellow-400" />
        )}
      </div>
      
      {/* Current Turn Highlight */}
      {currentCharacter && session.status === 'active' && (
        <div className={`p-4 rounded-lg border-2 mb-4 ${getCharacterColor(currentCharacter.character_class)}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {React.createElement(getCharacterIcon(currentCharacter.character_class), {
                size: 24,
                className: 'text-white'
              })}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-lg">
                {currentCharacter.name}'s Turn
              </div>
              <div className="text-white/80 text-sm">
                {currentCharacter.character_class} • {currentCharacter.current_hp}/{currentCharacter.max_hp} HP
              </div>
            </div>
            <div className="text-white font-bold text-2xl">
              #{getTurnInRound()}
            </div>
          </div>
        </div>
      )}
      
      {/* Turn Order List */}
      <div className="space-y-2 mb-4">
        {session.turn_order.map((characterId, index) => {
          const character = characters.find(c => c.id === characterId)
          if (!character) return null
          
          const isCurrentTurn = index === session.current_turn_index
          const CharacterIcon = getCharacterIcon(character.character_class)
          
          return (
            <div 
              key={characterId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrentTurn && session.status === 'active'
                  ? 'bg-blue-500/30 border border-blue-400 shadow-lg' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrentTurn && session.status === 'active' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  <CharacterIcon size={16} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${
                  isCurrentTurn && session.status === 'active' ? 'text-white' : 'text-blue-200'
                }`}>
                  {character.name}
                </div>
                <div className="text-xs text-blue-300">
                  {character.character_class} • {character.current_hp}/{character.max_hp} HP
                </div>
              </div>
              
              {isCurrentTurn && session.status === 'active' && (
                <div className="text-xs text-blue-200 bg-blue-500/20 px-2 py-1 rounded">
                  Active
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Seer Controls */}
      {userRole === 'seer' && (
        <div className="space-y-2 pt-4 border-t border-white/20">
          {session.status === 'active' && (
            <>
              <button
                onClick={() => onTurnAdvance?.()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                <SkipForward size={18} />
                Next Turn
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSessionAction?.('pause')}
                  className="flex items-center justify-center gap-2 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Pause size={16} />
                  Pause
                </button>
                
                <button
                  onClick={() => onSessionAction?.('reroll_initiative')}
                  className="flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  <RotateCcw size={16} />
                  Reroll
                </button>
              </div>
            </>
          )}
          
          {session.status === 'paused' && (
            <button
              onClick={() => onSessionAction?.('resume')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <Play size={18} />
              Resume Session
            </button>
          )}
        </div>
      )}
      
      {/* Session Status */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-300">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              session.status === 'active' ? 'bg-green-400' :
              session.status === 'waiting' ? 'bg-yellow-400' :
              session.status === 'paused' ? 'bg-orange-400' : 'bg-gray-400'
            }`} />
            <span className={`capitalize font-medium ${
              session.status === 'active' ? 'text-green-400' :
              session.status === 'waiting' ? 'text-yellow-400' :
              session.status === 'paused' ? 'text-orange-400' : 'text-gray-400'
            }`}>
              {session.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}