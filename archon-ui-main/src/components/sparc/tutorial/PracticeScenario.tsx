import React, { useState, useEffect } from 'react'
import {
  Play, Pause, RotateCcw, CheckCircle, AlertCircle, Star,
  Users, MessageSquare, Dice6, Target, Clock, Award,
  ThumbsUp, ThumbsDown, Lightbulb, TrendingUp
} from 'lucide-react'

interface Character {
  name: string
  class: string
  personality: string
  hp: string
}

interface DecisionPoint {
  id: string
  situation: string
  playerReactions: string[]
  seerChoices: string[]
  correctChoice?: number
  feedback?: string
}

interface ScenarioProps {
  scenario: {
    title: string
    description: string
    setup: string
    characters: Character[]
    decisionPoints: DecisionPoint[]
    successCriteria: Record<string, string>
    timeLimit: number
  }
  onComplete: (results: any) => void
}

interface ActionLog {
  id: string
  timestamp: Date
  type: 'scene_description' | 'dice_call' | 'player_response' | 'story_advance'
  content: string
  score?: number
}

export default function PracticeScenario({ scenario, onComplete }: ScenarioProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentDecisionPoint, setCurrentDecisionPoint] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [actionLog, setActionLog] = useState<ActionLog[]>([])
  const [sceneDescription, setSceneDescription] = useState('')
  const [playerResponse, setPlayerResponse] = useState('')
  const [feedback, setFeedback] = useState<string[]>([])
  const [scenarioComplete, setScenarioComplete] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  
  // Scene management
  const [currentScene, setCurrentScene] = useState(scenario.setup)
  const [diceRollsCalled, setDiceRollsCalled] = useState<Array<{
    character: string
    stat: string
    difficulty: number
    reason: string
  }>>([])
  
  // Timer effect
  useEffect(() => {
    if (isActive && startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime.getTime()) / 1000 / 60
        setElapsedTime(elapsed)
        
        if (elapsed >= scenario.timeLimit) {
          handleTimeUp()
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isActive, startTime, scenario.timeLimit])
  
  const startScenario = () => {
    setIsActive(true)
    setStartTime(new Date())
    setCurrentDecisionPoint(0)
    setActionLog([])
    setFeedback([])
    setScenarioComplete(false)
    setFinalScore(null)
  }
  
  const logAction = (type: ActionLog['type'], content: string, score?: number) => {
    const action: ActionLog = {
      id: `action_${actionLog.length}`,
      timestamp: new Date(),
      type,
      content,
      score
    }
    setActionLog(prev => [...prev, action])
  }
  
  const handleSceneDescription = () => {
    if (!sceneDescription.trim()) return
    
    // Evaluate scene description quality
    const wordCount = sceneDescription.split(' ').length
    const hasSensoryDetails = /\b(smell|sound|feel|hear|see|taste|touch)\w*\b/i.test(sceneDescription)
    const hasEmotionalTone = /\b(warm|cold|mysterious|ominous|bright|dark|peaceful|tense)\w*\b/i.test(sceneDescription)
    
    let score = 0
    if (wordCount >= 15) score += 30
    if (hasSensoryDetails) score += 35
    if (hasEmotionalTone) score += 35
    
    logAction('scene_description', sceneDescription, score)
    
    // Provide immediate feedback
    const sceneFeedback = []
    if (score >= 80) {
      sceneFeedback.push("🌟 Excellent scene description! Great use of sensory details.")
    } else if (score >= 60) {
      sceneFeedback.push("👍 Good scene description! Try adding more sensory details.")
    } else {
      sceneFeedback.push("💡 Try making your scene more vivid with sensory details (what do they see, hear, smell?).")
    }
    
    setFeedback(prev => [...prev, ...sceneFeedback])
    setSceneDescription('')
  }
  
  const handlePlayerReaction = (reaction: string) => {
    logAction('player_response', `Player reaction: ${reaction}`)
    
    // Simulate AI player response
    setTimeout(() => {
      const responses = [
        `"${reaction}" - The player looks to you expectantly for your response.`,
        `The player acts on their impulse: "${reaction}" - What happens next?`,
        `"${reaction}" - This creates an interesting situation. How do you respond as the Seer?`
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setFeedback(prev => [...prev, `🎭 ${randomResponse}`])
    }, 1000)
  }
  
  const handleDiceCall = (character: string, stat: string, difficulty: number, reason: string) => {
    const diceRoll = { character, stat, difficulty, reason }
    setDiceRollsCalled(prev => [...prev, diceRoll])
    
    // Evaluate dice call appropriateness
    let score = 50 // Base score
    if (difficulty >= 8 && difficulty <= 16) score += 30 // Good difficulty range
    if (['str', 'dex', 'int', 'cha'].includes(stat.toLowerCase())) score += 20 // Valid stat
    
    logAction('dice_call', `Called for ${stat.toUpperCase()} roll vs ${difficulty} (${reason})`, score)
    
    // Simulate dice result
    const result = Math.floor(Math.random() * 6) + 1
    const success = result >= difficulty
    
    setTimeout(() => {
      setFeedback(prev => [...prev, 
        `🎲 ${character} rolled ${result} for ${stat.toUpperCase()}. ${success ? 'Success!' : 'Failure!'}`
      ])
    }, 500)
  }
  
  const handleDecisionChoice = (choiceIndex: number) => {
    const decisionPoint = scenario.decisionPoints[currentDecisionPoint]
    const choice = decisionPoint.seerChoices[choiceIndex]
    
    logAction('story_advance', `Chose: ${choice}`)
    
    // Check if this was the optimal choice
    if (decisionPoint.correctChoice !== undefined) {
      const isCorrect = choiceIndex === decisionPoint.correctChoice
      const feedbackMsg = isCorrect 
        ? `✅ Great choice! ${decisionPoint.feedback || 'This advances the story well.'}`
        : `💡 Consider this: ${decisionPoint.feedback || 'Think about what would engage players most.'}`
      
      setFeedback(prev => [...prev, feedbackMsg])
    }
    
    // Advance to next decision point
    if (currentDecisionPoint < scenario.decisionPoints.length - 1) {
      setCurrentDecisionPoint(currentDecisionPoint + 1)
    } else {
      completeScenario()
    }
  }
  
  const handleTimeUp = () => {
    setFeedback(prev => [...prev, "⏰ Time's up! Let's see how you did."])
    completeScenario()
  }
  
  const completeScenario = () => {
    setIsActive(false)
    setScenarioComplete(true)
    
    // Calculate final score
    const sceneDescriptions = actionLog.filter(a => a.type === 'scene_description')
    const diceRolls = actionLog.filter(a => a.type === 'dice_call')
    const storyAdvances = actionLog.filter(a => a.type === 'story_advance')
    
    const sceneScore = sceneDescriptions.length > 0 
      ? sceneDescriptions.reduce((sum, a) => sum + (a.score || 0), 0) / sceneDescriptions.length 
      : 0
    const diceScore = diceRolls.length > 0 
      ? diceRolls.reduce((sum, a) => sum + (a.score || 0), 0) / diceRolls.length 
      : 50
    const participationScore = Math.min(100, (actionLog.length / 5) * 100) // 5 actions for full points
    
    const final = (sceneScore * 0.4) + (diceScore * 0.3) + (participationScore * 0.3)
    setFinalScore(Math.round(final))
    
    // Call completion callback
    onComplete({
      score: Math.round(final),
      timeSpent: elapsedTime,
      actionLog,
      diceRollsCalled,
      sceneDescriptionsCount: sceneDescriptions.length,
      feedback: feedback
    })
  }
  
  if (!isActive && !scenarioComplete) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">{scenario.title}</h3>
          <p className="text-blue-200 mb-4">{scenario.description}</p>
          
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <h4 className="text-white font-bold mb-2">The Situation:</h4>
            <p className="text-blue-100 italic">{scenario.setup}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                <Users size={16} />
                Characters
              </h4>
              <div className="space-y-2">
                {scenario.characters.map((char, index) => (
                  <div key={index} className="text-sm text-white">
                    <strong>{char.name}</strong> the {char.class} - {char.personality}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                <Target size={16} />
                Your Goals
              </h4>
              <div className="space-y-1 text-sm text-white">
                {Object.entries(scenario.successCriteria).map(([key, value]) => (
                  <div key={key}>• {value}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-blue-200 mb-6">
            <Clock size={16} />
            <span>Time Limit: {scenario.timeLimit} minutes</span>
          </div>
        </div>
        
        <button
          onClick={startScenario}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-bold transition-colors"
        >
          <Play size={20} />
          Start Practice Scenario
        </button>
      </div>
    )
  }
  
  if (scenarioComplete && finalScore !== null) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="text-center mb-6">
          <Award size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Scenario Complete!</h3>
          <div className="text-4xl font-bold text-white mb-2">{finalScore}/100</div>
          
          <div className={`text-lg font-bold ${
            finalScore >= 80 ? 'text-green-400' : 
            finalScore >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {finalScore >= 80 ? '🌟 Excellent Performance!' :
             finalScore >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <MessageSquare size={24} className="text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {actionLog.filter(a => a.type === 'scene_description').length}
            </div>
            <div className="text-blue-200 text-sm">Scene Descriptions</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <Dice6 size={24} className="text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{diceRollsCalled.length}</div>
            <div className="text-blue-200 text-sm">Dice Rolls Called</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <Clock size={24} className="text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {Math.floor(elapsedTime)}:{String(Math.floor((elapsedTime % 1) * 60)).padStart(2, '0')}
            </div>
            <div className="text-blue-200 text-sm">Time Spent</div>
          </div>
        </div>
        
        {feedback.length > 0 && (
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Lightbulb size={16} />
              Session Feedback
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {feedback.map((fb, index) => (
                <div key={index} className="text-blue-200 text-sm p-2 bg-white/5 rounded">
                  {fb}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Active scenario interface
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{scenario.title}</h3>
          <p className="text-blue-200">Decision Point {currentDecisionPoint + 1} of {scenario.decisionPoints.length}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-200">
            <Clock size={16} />
            <span className="font-mono">
              {Math.floor(elapsedTime)}:{String(Math.floor((elapsedTime % 1) * 60)).padStart(2, '0')}
            </span>
          </div>
          
          <div className="text-blue-200 text-sm">
            / {scenario.timeLimit}:00
          </div>
        </div>
      </div>
      
      {/* Current Scene */}
      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <h4 className="text-white font-bold mb-2">Current Scene:</h4>
        <p className="text-blue-100">{currentScene}</p>
      </div>
      
      {/* Decision Point */}
      {scenario.decisionPoints[currentDecisionPoint] && (
        <div className="mb-6">
          <div className="bg-yellow-500/20 rounded-lg p-4 mb-4 border border-yellow-500/30">
            <h4 className="text-yellow-400 font-bold mb-2">Situation:</h4>
            <p className="text-white">{scenario.decisionPoints[currentDecisionPoint].situation}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-white font-bold mb-2">Player Reactions:</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {scenario.decisionPoints[currentDecisionPoint].playerReactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handlePlayerReaction(reaction)}
                  className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg text-left transition-colors"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-white font-bold mb-2">Your Response Options:</h4>
            <div className="grid md:grid-cols-1 gap-2">
              {scenario.decisionPoints[currentDecisionPoint].seerChoices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleDecisionChoice(index)}
                  className="p-3 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg text-left transition-colors"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Action Panel */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Scene Description */}
        <div className="bg-purple-500/20 rounded-lg p-4">
          <h4 className="text-purple-400 font-bold mb-2">Describe the Scene:</h4>
          <textarea
            value={sceneDescription}
            onChange={(e) => setSceneDescription(e.target.value)}
            placeholder="Paint the scene with vivid details..."
            className="w-full bg-black/20 text-white rounded border border-white/20 p-3 h-24 resize-none"
          />
          <button
            onClick={handleSceneDescription}
            disabled={!sceneDescription.trim()}
            className="mt-2 w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            Add Description
          </button>
        </div>
        
        {/* Dice Rolling */}
        <div className="bg-red-500/20 rounded-lg p-4">
          <h4 className="text-red-400 font-bold mb-2">Call for Dice Roll:</h4>
          <div className="space-y-2">
            <select className="w-full bg-black/20 text-white rounded border border-white/20 p-2">
              <option value="">Select Character</option>
              {scenario.characters.map((char, index) => (
                <option key={index} value={char.name}>{char.name}</option>
              ))}
            </select>
            
            <div className="grid grid-cols-2 gap-2">
              <select className="bg-black/20 text-white rounded border border-white/20 p-2">
                <option value="str">STR</option>
                <option value="dex">DEX</option>
                <option value="int">INT</option>
                <option value="cha">CHA</option>
              </select>
              
              <select className="bg-black/20 text-white rounded border border-white/20 p-2">
                <option value="8">Easy (8)</option>
                <option value="12">Medium (12)</option>
                <option value="16">Hard (16)</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                const characterSelect = document.querySelector('select') as HTMLSelectElement
                const statSelect = document.querySelectorAll('select')[1] as HTMLSelectElement
                const difficultySelect = document.querySelectorAll('select')[2] as HTMLSelectElement
                
                if (characterSelect.value && statSelect.value && difficultySelect.value) {
                  handleDiceCall(
                    characterSelect.value,
                    statSelect.value,
                    parseInt(difficultySelect.value),
                    'Action check'
                  )
                }
              }}
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Roll Dice
            </button>
          </div>
        </div>
      </div>
      
      {/* Live Feedback */}
      {feedback.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-bold mb-2">Live Feedback:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {feedback.slice(-3).map((fb, index) => (
              <div key={index} className="text-blue-200 text-sm p-2 bg-white/5 rounded">
                {fb}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={completeScenario}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          Finish Scenario
        </button>
        
        <button
          onClick={() => setFeedback([])}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Clear Feedback
        </button>
      </div>
    </div>
  )
}