import React, { useState } from 'react'
import { 
  Heart, Sword, Shield, Wand, Users, Zap, RotateCcw, 
  Plus, Minus, ChevronDown, ChevronUp 
} from 'lucide-react'
import { Character, characterApi, diceApi } from '../../../services/sparcService'

interface CharacterSheetProps {
  character: Character
  isCurrentTurn?: boolean
  canEdit?: boolean
  sessionId?: string
  onCharacterUpdate?: (character: Character) => void
}

export default function CharacterSheet({ 
  character, 
  isCurrentTurn = false, 
  canEdit = false,
  sessionId,
  onCharacterUpdate 
}: CharacterSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  const getClassIcon = (characterClass: string) => {
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
  
  const getClassColor = (characterClass: string) => {
    const colorMap: Record<string, string> = {
      warrior: 'from-red-500 to-orange-500',
      paladin: 'from-yellow-500 to-orange-500',
      wizard: 'from-purple-500 to-blue-500',
      cleric: 'from-blue-500 to-cyan-500',
      rogue: 'from-gray-600 to-gray-800',
      ranger: 'from-green-500 to-emerald-500',
      necromancer: 'from-purple-800 to-black'
    }
    return colorMap[characterClass.toLowerCase()] || 'from-blue-500 to-purple-500'
  }
  
  const updateHP = async (newHP: number) => {
    if (!canEdit || !onCharacterUpdate) return
    
    try {
      setUpdating(true)
      const updatedCharacter = await characterApi.updateCharacterHP(character.id, newHP)
      onCharacterUpdate(updatedCharacter)
    } catch (err) {
      console.error('Failed to update HP:', err)
    } finally {
      setUpdating(false)
    }
  }
  
  const useSpecialAbility = async () => {
    if (!canEdit || !character.special_ability_available || !onCharacterUpdate) return
    
    try {
      setUpdating(true)
      const updatedCharacter = await characterApi.useSpecialAbility(character.id)
      onCharacterUpdate(updatedCharacter)
    } catch (err) {
      console.error('Failed to use special ability:', err)
    } finally {
      setUpdating(false)
    }
  }
  
  const useHeroicSave = async () => {
    if (!canEdit || character.heroic_saves_available <= 0 || !onCharacterUpdate) return
    
    try {
      setUpdating(true)
      const updatedCharacter = await characterApi.useHeroicSave(character.id)
      onCharacterUpdate(updatedCharacter)
    } catch (err) {
      console.error('Failed to use heroic save:', err)
    } finally {
      setUpdating(false)
    }
  }
  
  const rollStat = async (statName: string, statValue: number) => {
    if (!sessionId) return
    
    try {
      await diceApi.rollSkillCheck(
        character.id,
        statName,
        12, // Medium difficulty
        sessionId,
        `${character.name} ${statName.toUpperCase()} check`
      )
    } catch (err) {
      console.error('Failed to roll stat:', err)
    }
  }
  
  const ClassIcon = getClassIcon(character.character_class)
  const classGradient = getClassColor(character.character_class)
  const hpPercentage = (character.current_hp / character.max_hp) * 100
  
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl overflow-hidden character-card transition-all duration-300 ${
      isCurrentTurn ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/20' : ''
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${classGradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ClassIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{character.name}</h3>
              <p className="text-white/80 capitalize text-sm">
                Level {character.level} {character.character_class}
              </p>
            </div>
          </div>
          
          {isCurrentTurn && (
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Current Turn</span>
            </div>
          )}
        </div>
      </div>
      
      {/* HP Section */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            <span className="text-white font-medium">Health Points</span>
          </div>
          <div className="text-white font-bold">
            {character.current_hp}/{character.max_hp}
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 hp-bar ${
              hpPercentage > 75 ? 'bg-green-500' :
              hpPercentage > 50 ? 'bg-yellow-500' :
              hpPercentage > 25 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          />
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => updateHP(Math.max(0, character.current_hp - 1))}
              disabled={character.current_hp <= 0 || updating}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            
            <button
              onClick={() => updateHP(Math.min(character.max_hp, character.current_hp + 1))}
              disabled={character.current_hp >= character.max_hp || updating}
              className="w-8 h-8 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
            
            <span className="text-blue-200 text-sm ml-2">
              {updating ? 'Updating...' : 'Adjust HP'}
            </span>
          </div>
        )}
      </div>
      
      {/* Stats Section */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'str', label: 'STR', value: character.stats.str, color: 'bg-red-500' },
            { key: 'dex', label: 'DEX', value: character.stats.dex, color: 'bg-green-500' },
            { key: 'int', label: 'INT', value: character.stats.int, color: 'bg-blue-500' },
            { key: 'cha', label: 'CHA', value: character.stats.cha, color: 'bg-purple-500' }
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => rollStat(stat.key, stat.value)}
              className="bg-black/20 hover:bg-black/30 rounded-lg p-3 text-center transition-colors group"
            >
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-blue-300 text-sm">{stat.label}</div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-200 mt-1">
                Click to roll
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Abilities Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Special Ability */}
          <div className={`p-3 rounded-lg ${
            character.special_ability_available 
              ? 'bg-yellow-500/20 border border-yellow-500/30' 
              : 'bg-gray-500/20 border border-gray-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className={character.special_ability_available ? 'text-yellow-400' : 'text-gray-400'} />
                <span className={`font-medium ${
                  character.special_ability_available ? 'text-white' : 'text-gray-400'
                }`}>
                  Special Ability
                </span>
              </div>
              
              {canEdit && character.special_ability_available && (
                <button
                  onClick={useSpecialAbility}
                  disabled={updating}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Use
                </button>
              )}
            </div>
            
            <div className={`text-sm mt-1 ${
              character.special_ability_available ? 'text-yellow-200' : 'text-gray-500'
            }`}>
              {character.special_ability_available ? 'Available' : 'Used'}
            </div>
          </div>
          
          {/* Heroic Saves */}
          <div className={`p-3 rounded-lg ${
            character.heroic_saves_available > 0 
              ? 'bg-blue-500/20 border border-blue-500/30' 
              : 'bg-gray-500/20 border border-gray-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className={character.heroic_saves_available > 0 ? 'text-blue-400' : 'text-gray-400'} />
                <span className={`font-medium ${
                  character.heroic_saves_available > 0 ? 'text-white' : 'text-gray-400'
                }`}>
                  Heroic Saves
                </span>
              </div>
              
              {canEdit && character.heroic_saves_available > 0 && (
                <button
                  onClick={useHeroicSave}
                  disabled={updating}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Use
                </button>
              )}
            </div>
            
            <div className={`text-sm mt-1 ${
              character.heroic_saves_available > 0 ? 'text-blue-200' : 'text-gray-500'
            }`}>
              {character.heroic_saves_available}/3 remaining
            </div>
          </div>
        </div>
        
        {/* Equipment (Expandable) */}
        {character.equipment.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
            >
              <span className="text-white font-medium">Equipment</span>
              {isExpanded ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
            </button>
            
            {isExpanded && (
              <div className="mt-2 space-y-1">
                {character.equipment.map((item, index) => (
                  <div key={index} className="bg-black/20 rounded px-3 py-2">
                    <span className="text-blue-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Background */}
        {character.background && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <div className="text-white font-medium text-sm mb-1">Background</div>
            <div className="text-blue-200 text-xs">{character.background}</div>
          </div>
        )}
      </div>
    </div>
  )
}