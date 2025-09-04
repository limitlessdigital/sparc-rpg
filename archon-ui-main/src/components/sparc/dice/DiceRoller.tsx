import React, { useState, useEffect } from 'react'
import { Dice6, Target, Plus, Minus } from 'lucide-react'
import { diceApi, type RollDiceRequest, type RollDiceResponse } from '../../../services/sparcService'

interface DiceRollerProps {
  sessionId: string
  characterId?: string
  onRollComplete?: (result: RollDiceResponse) => void
  disabled?: boolean
  className?: string
}

interface DiceAnimation {
  id: string
  value: number
  isRolling: boolean
}

export default function DiceRoller({ 
  sessionId, 
  characterId, 
  onRollComplete, 
  disabled = false,
  className = ""
}: DiceRollerProps) {
  const [diceCount, setDiceCount] = useState(1)
  const [modifier, setModifier] = useState(0)
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [rollType, setRollType] = useState<string>('skill_check')
  const [context, setContext] = useState('')
  
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<RollDiceResponse | null>(null)
  const [rollStartTime, setRollStartTime] = useState<number | null>(null)
  
  // Animation state
  const [diceAnimations, setDiceAnimations] = useState<DiceAnimation[]>([])
  
  useEffect(() => {
    // Initialize dice animations
    const animations = Array.from({ length: diceCount }, (_, i) => ({
      id: `dice-${i}`,
      value: Math.floor(Math.random() * 6) + 1,
      isRolling: false
    }))
    setDiceAnimations(animations)
  }, [diceCount])
  
  const rollDice = async () => {
    if (isRolling || disabled) return
    
    const startTime = performance.now()
    setRollStartTime(startTime)
    setIsRolling(true)
    
    // Start dice animations immediately for responsiveness
    setDiceAnimations(prev => prev.map(dice => ({
      ...dice,
      isRolling: true
    })))
    
    try {
      const request: RollDiceRequest = {
        dice_count: diceCount,
        roll_type: rollType as any,
        character_id: characterId,
        difficulty: difficulty,
        modifier: modifier,
        context: context || `${diceCount}d6${modifier !== 0 ? ` + ${modifier}` : ''}${difficulty ? ` vs DC ${difficulty}` : ''}`
      }
      
      const response = await diceApi.rollDice(request, sessionId)
      
      // Calculate actual response time
      const responseTime = performance.now() - startTime
      console.log(`Dice roll response time: ${responseTime.toFixed(2)}ms`)
      
      // Show results in dice animations
      const finalAnimations = response.roll.results.map((result, i) => ({
        id: `dice-${i}`,
        value: result,
        isRolling: false
      }))
      
      // Ensure minimum animation duration for visual satisfaction
      const minAnimationTime = 800
      const remainingTime = Math.max(0, minAnimationTime - responseTime)
      
      setTimeout(() => {
        setDiceAnimations(finalAnimations)
        setIsRolling(false)
        setLastResult(response)
        
        if (onRollComplete) {
          onRollComplete(response)
        }
      }, remainingTime)
      
    } catch (error: any) {
      console.error('Dice roll failed:', error)
      setIsRolling(false)
      setDiceAnimations(prev => prev.map(dice => ({
        ...dice,
        isRolling: false
      })))
    }
  }
  
  const getDifficultyLabel = (dc: number) => {
    if (dc <= 8) return 'Easy'
    if (dc <= 12) return 'Medium'  
    if (dc <= 16) return 'Hard'
    return 'Very Hard'
  }
  
  const getSuccessColor = (isSuccess: boolean | null) => {
    if (isSuccess === null) return 'text-blue-400'
    return isSuccess ? 'text-green-400' : 'text-red-400'
  }
  
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${className}`}>
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Dice6 size={20} />
        Dice Roller
      </h3>
      
      {/* Roll Configuration */}
      <div className="space-y-4 mb-6">
        {/* Dice Count */}
        <div>
          <label className="block text-white font-medium mb-2">Number of Dice</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
              disabled={isRolling || diceCount <= 1}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center"
            >
              <Minus size={16} />
            </button>
            
            <div className="w-16 text-center">
              <span className="text-white font-bold text-xl">{diceCount}</span>
              <div className="text-blue-300 text-sm">d6</div>
            </div>
            
            <button
              onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
              disabled={isRolling || diceCount >= 10}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        {/* Modifier */}
        <div>
          <label className="block text-white font-medium mb-2">Modifier</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModifier(Math.max(-10, modifier - 1))}
              disabled={isRolling}
              className="w-8 h-8 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center"
            >
              <Minus size={16} />
            </button>
            
            <div className="w-16 text-center">
              <span className="text-white font-bold text-xl">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            </div>
            
            <button
              onClick={() => setModifier(Math.min(10, modifier + 1))}
              disabled={isRolling}
              className="w-8 h-8 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        {/* Difficulty */}
        <div>
          <label className="block text-white font-medium mb-2">
            Difficulty (Optional)
          </label>
          <div className="flex items-center gap-2">
            <Target size={16} className="text-yellow-400" />
            <select
              value={difficulty || ''}
              onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : null)}
              disabled={isRolling}
              className="flex-1 px-3 py-2 bg-black/20 text-white rounded-lg border border-white/20 focus:border-blue-400 focus:outline-none"
            >
              <option value="">No difficulty</option>
              <option value="8">Easy (8)</option>
              <option value="12">Medium (12)</option>
              <option value="16">Hard (16)</option>
              <option value="20">Very Hard (20)</option>
            </select>
          </div>
        </div>
        
        {/* Context */}
        <div>
          <label className="block text-white font-medium mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isRolling}
            placeholder="What is this roll for?"
            className="w-full px-3 py-2 bg-black/20 text-white rounded-lg border border-white/20 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>
      
      {/* Dice Display */}
      <div className="mb-6">
        <div className="flex justify-center gap-3 mb-4">
          {diceAnimations.map((dice, index) => (
            <div
              key={dice.id}
              className={`w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl font-bold text-gray-800 transition-all duration-300 ${
                dice.isRolling ? 'animate-dice-roll' : ''
              }`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {dice.isRolling ? '?' : dice.value}
            </div>
          ))}
        </div>
        
        {/* Roll Formula Preview */}
        <div className="text-center text-blue-200">
          {diceCount}d6{modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
          {difficulty && ` vs DC ${difficulty} (${getDifficultyLabel(difficulty)})`}
        </div>
      </div>
      
      {/* Roll Button */}
      <button
        onClick={rollDice}
        disabled={isRolling || disabled}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
          isRolling
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
      
      {/* Last Result */}
      {lastResult && !isRolling && (
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {lastResult.roll.results.join(' + ')}
              {lastResult.roll.modifier !== 0 && ` ${lastResult.roll.modifier >= 0 ? '+' : ''}${lastResult.roll.modifier}`}
              {' = '}
              <span className={getSuccessColor(lastResult.roll.is_success)}>
                {lastResult.roll.total}
              </span>
            </div>
            
            {lastResult.roll.is_success !== null && (
              <div className={`text-lg font-bold ${getSuccessColor(lastResult.roll.is_success)}`}>
                {lastResult.roll.is_success ? '✓ SUCCESS' : '✗ FAILURE'}
                {lastResult.roll.difficulty && ` (vs DC ${lastResult.roll.difficulty})`}
              </div>
            )}
            
            {lastResult.roll.context && (
              <div className="text-blue-300 text-sm mt-2">
                {lastResult.roll.context}
              </div>
            )}
            
            {rollStartTime && (
              <div className="text-xs text-blue-400 mt-2">
                Response time: {((performance.now() - rollStartTime) / 1000).toFixed(2)}s
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Quick Roll Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setDiceCount(1)
            setModifier(0)
            setDifficulty(null)
            setContext('Quick d6')
            setTimeout(rollDice, 100)
          }}
          disabled={isRolling || disabled}
          className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          Quick d6
        </button>
        
        <button
          onClick={() => {
            setDiceCount(1)
            setModifier(0)
            setDifficulty(12)
            setContext('Skill check')
            setTimeout(rollDice, 100)
          }}
          disabled={isRolling || disabled}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          Skill Check
        </button>
      </div>
    </div>
  )
}