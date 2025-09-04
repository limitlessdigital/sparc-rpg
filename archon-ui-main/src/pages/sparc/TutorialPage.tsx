import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, CheckCircle, Clock, Star, BookOpen, Users, Dice6,
  Crown, ArrowRight, ArrowLeft, RotateCcw, Target, MessageSquare,
  Brain, Award, TrendingUp, ChevronRight
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  duration: number
  completed: boolean
  content: any
}

interface ConfidenceRating {
  area: string
  rating: number
  target: number
  description: string
}

export default function TutorialPage() {
  const navigate = useNavigate()
  
  // Tutorial state
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [tutorialStarted, setTutorialStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Practice scenario state
  const [scenarioActive, setScenarioActive] = useState(false)
  const [scenarioStep, setScenarioStep] = useState(0)
  const [playerActions, setPlayerActions] = useState<string[]>([])
  const [scenarioFeedback, setScenarioFeedback] = useState<string[]>([])
  
  // Confidence rating state
  const [confidenceRatings, setConfidenceRatings] = useState<ConfidenceRating[]>([
    { area: 'rules_knowledge', rating: 5, target: 7, description: 'Understanding SPARC rules and mechanics' },
    { area: 'scene_description', rating: 5, target: 6, description: 'Describing scenes vividly and engagingly' },
    { area: 'player_management', rating: 5, target: 6, description: 'Managing multiple players and turn order' },
    { area: 'dice_mechanics', rating: 5, target: 8, description: 'When and how to call for dice rolls' },
    { area: 'storytelling', rating: 5, target: 6, description: 'Creating compelling narratives' },
    { area: 'technical_comfort', rating: 5, target: 7, description: 'Using the SPARC interface confidently' }
  ])
  
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SPARC GM Training!',
      duration: 0.5,
      completed: false,
      content: {
        type: 'intro',
        text: 'In the next 10 minutes, you\'ll learn everything you need to run amazing SPARC adventures. SPARC is designed to be simple - perfect for your first time as a Game Master!',
        keyPoints: [
          'SPARC uses only 6-sided dice',
          'Players have 4 simple stats: STR, DEX, INT, CHA',
          'Your job is to describe scenes and guide the story',
          'The AI Assistant will help you with rules and ideas'
        ]
      }
    },
    {
      id: 'basic_rules',
      title: 'SPARC Rules in 90 Seconds',
      duration: 1.5,
      completed: false,
      content: {
        type: 'rules',
        keyPoints: [
          'Roll 1d6 + stat vs difficulty (usually 8-16)',
          'Combat: roll attack vs defense, deal damage',
          'Special abilities: each character has one per adventure',
          'Heroic saves: 3 per character to reroll failures'
        ],
        interactive: {
          type: 'dice_practice',
          scenarios: [
            { situation: 'Climbing a wall', stat: 'STR', difficulty: 10 },
            { situation: 'Picking a lock', stat: 'DEX', difficulty: 12 },
            { situation: 'Solving a riddle', stat: 'INT', difficulty: 14 }
          ]
        }
      }
    },
    {
      id: 'character_sheets',
      title: 'Understanding Character Sheets',
      duration: 1.0,
      completed: false,
      content: {
        type: 'demo',
        demoCharacter: {
          name: 'Tutorial Hero',
          class: 'warrior',
          stats: { str: 6, dex: 4, int: 2, cha: 3 },
          hp: { current: 18, max: 18 },
          specialAbility: 'Battle Fury',
          heroicSaves: 3
        }
      }
    },
    {
      id: 'dice_rolling',
      title: 'Managing Dice Rolls',
      duration: 2.0,
      completed: false,
      content: {
        type: 'scenarios',
        scenarios: [
          {
            situation: 'Player wants to climb a wall',
            options: ['No roll needed', 'Roll STR vs 10', 'Roll DEX vs 12'],
            correct: 1,
            explanation: 'Physical challenge with clear success/failure needs a roll'
          },
          {
            situation: 'Player asks what they see in a room',
            options: ['Roll INT vs 12', 'Just describe it', 'Roll DEX vs 8'],
            correct: 1,
            explanation: 'Basic perception doesn\'t need dice - just describe what they see'
          },
          {
            situation: 'Player tries to persuade the king',
            options: ['Roll CHA vs 16', 'No roll needed', 'Roll STR vs 12'],
            correct: 0,
            explanation: 'High stakes social challenge - CHA vs high difficulty'
          }
        ]
      }
    },
    {
      id: 'scene_management',
      title: 'Bringing Scenes to Life',
      duration: 1.5,
      completed: false,
      content: {
        type: 'examples',
        comparisons: [
          {
            bland: 'You\'re in a tavern.',
            vivid: 'Warm firelight flickers across weathered oak tables. The air smells of roasted meat and ale, while a bard\'s lute mingles with hushed conversations.'
          },
          {
            bland: 'There are some bandits.',
            vivid: 'Three rough-looking figures step from behind trees, leather armor creaking. Their leader grins, revealing gold teeth as he hefts a notched axe.'
          }
        ],
        techniques: [
          'Use 2-3 sensory details per scene',
          'Give NPCs one memorable trait',
          'Ask players what their characters do',
          'Build on player descriptions'
        ]
      }
    },
    {
      id: 'turn_order',
      title: 'Managing Turn Order & Initiative',
      duration: 1.0,
      completed: false,
      content: {
        type: 'demo',
        keyPoints: [
          'Roll initiative for combat (1d6 + DEX)',
          'Outside combat, spotlight different players',
          'Use the \'popcorn\' method - let players pass initiative',
          'Don\'t let anyone dominate the conversation'
        ]
      }
    },
    {
      id: 'ai_assistant',
      title: 'Using Your AI Seer Assistant',
      duration: 1.0,
      completed: false,
      content: {
        type: 'interactive_ai',
        features: [
          'Ask about any rule - get instant clarification',
          'Request scene suggestions when stuck',
          'Get tactical advice for combat balance',
          'Generate NPC names and personalities'
        ],
        samplePrompts: [
          'What should happen next in this scene?',
          'How does grappling work?',
          'Suggest some complications for this quest',
          'Is this encounter too hard for level 1 characters?'
        ]
      }
    },
    {
      id: 'practice_scenario',
      title: 'Practice Session: The Tavern',
      duration: 3.0,
      completed: false,
      content: {
        type: 'practice',
        scenario: {
          title: 'The Tavern Introduction',
          setup: 'Four adventurers sit around a wooden table in the Crimson Drake tavern. A hooded figure approaches with urgent news.',
          characters: [
            { name: 'Aria', class: 'warrior', personality: 'Bold and direct' },
            { name: 'Finn', class: 'wizard', personality: 'Curious and cautious' },
            { name: 'Luna', class: 'rogue', personality: 'Suspicious and witty' },
            { name: 'Marcus', class: 'cleric', personality: 'Kind and diplomatic' }
          ],
          decisionPoints: [
            {
              situation: 'The hooded figure says "I need brave souls for a dangerous task."',
              playerReactions: [
                'Aria wants to know more',
                'Finn examines the figure',
                'Luna checks for threats',
                'Marcus offers healing'
              ]
            }
          ]
        }
      }
    },
    {
      id: 'confidence_check',
      title: 'Confidence Assessment',
      duration: 1.0,
      completed: false,
      content: {
        type: 'confidence_rating'
      }
    }
  ]
  
  // Timer effect
  useEffect(() => {
    if (tutorialStarted && startTime) {
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime.getTime()) / 1000 / 60) // Minutes
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [tutorialStarted, startTime])
  
  const startTutorial = () => {
    setTutorialStarted(true)
    setStartTime(new Date())
    setCurrentStep(0)
  }
  
  const completeStep = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex])
    }
  }
  
  const nextStep = () => {
    completeStep(currentStep)
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const updateConfidenceRating = (index: number, rating: number) => {
    const updated = [...confidenceRatings]
    updated[index].rating = rating
    setConfidenceRatings(updated)
  }
  
  const calculateOverallConfidence = () => {
    const totalScore = confidenceRatings.reduce((sum, rating) => sum + rating.rating, 0)
    const maxScore = confidenceRatings.length * 10
    return (totalScore / maxScore) * 100
  }
  
  const isReadyToGM = () => {
    const overallConfidence = calculateOverallConfidence()
    const meetsTargets = confidenceRatings.every(rating => rating.rating >= rating.target)
    return overallConfidence >= 80 && meetsTargets && completedSteps.length >= 7
  }
  
  if (!tutorialStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown size={48} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Become a SPARC Seer in 10 Minutes
              </h1>
              <p className="text-xl text-blue-200 mb-8">
                Learn everything you need to run amazing adventures for newcomers to tabletop RPGs.
                No experience required!
              </p>
            </div>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <Clock size={32} className="text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Quick & Focused</h3>
                <p className="text-blue-200 text-sm">
                  Complete training in just 10 minutes with hands-on practice
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <Target size={32} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Practice Scenarios</h3>
                <p className="text-blue-200 text-sm">
                  Run realistic scenarios with feedback to build confidence
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <Award size={32} className="text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Confidence Certified</h3>
                <p className="text-blue-200 text-sm">
                  Achieve 80%+ confidence rating before running real games
                </p>
              </div>
            </div>
            
            {/* Start Button */}
            <button
              onClick={startTutorial}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play size={24} />
              Start Seer Training
            </button>
            
            <div className="mt-8 text-blue-300 text-sm">
              <p>✨ Perfect for first-time Game Masters</p>
              <p>🎲 Learn SPARC's simple 6-sided dice system</p>
              <p>🤖 Discover how the AI Assistant helps you</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const currentStepData = tutorialSteps[currentStep]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Crown size={24} className="text-yellow-400" />
              <div>
                <h1 className="text-white font-bold text-lg">SPARC Seer Training</h1>
                <p className="text-blue-200 text-sm">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Clock size={16} />
                <span className="text-sm font-mono">
                  {Math.floor(elapsedTime)}:{String(Math.floor((elapsedTime % 1) * 60)).padStart(2, '0')}
                </span>
              </div>
              
              <div className="text-blue-200 text-sm">
                Target: 10:00
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                {currentStepData.title}
              </h2>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Clock size={16} />
                <span>{currentStepData.duration} minutes</span>
              </div>
            </div>
            
            {/* Step Content */}
            <div className="mb-8">
              {currentStepData.content.type === 'intro' && (
                <div>
                  <p className="text-blue-100 text-lg mb-6">
                    {currentStepData.content.text}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentStepData.content.keyPoints.map((point: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg">
                        <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                        <span className="text-white">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStepData.content.type === 'rules' && (
                <div>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {currentStepData.content.keyPoints.map((point: string, index: number) => (
                      <div key={index} className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <div className="flex items-start gap-3">
                          <Dice6 size={20} className="text-purple-400 flex-shrink-0 mt-1" />
                          <span className="text-white">{point}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <h4 className="text-green-400 font-bold mb-2">Practice Time!</h4>
                    <p className="text-white mb-3">Try these example rolls:</p>
                    <div className="space-y-2">
                      {currentStepData.content.interactive.scenarios.map((scenario: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-black/20 rounded">
                          <span className="text-blue-200">{scenario.situation}</span>
                          <span className="text-white font-mono">
                            {scenario.stat.toUpperCase()} vs {scenario.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {currentStepData.content.type === 'confidence_rating' && (
                <div>
                  <p className="text-blue-100 mb-6">
                    Rate your confidence in each area on a scale of 1-10. We're aiming for 80%+ overall confidence!
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {confidenceRatings.map((rating, index) => (
                      <div key={index} className="p-4 bg-black/20 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{rating.description}</h4>
                            <p className="text-blue-300 text-sm">Target: {rating.target}/10</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{rating.rating}/10</div>
                            <div className={`text-sm ${rating.rating >= rating.target ? 'text-green-400' : 'text-yellow-400'}`}>
                              {rating.rating >= rating.target ? 'Meets Target' : 'Below Target'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <button
                              key={value}
                              onClick={() => updateConfidenceRating(index, value)}
                              className={`flex-1 h-8 rounded text-sm font-medium transition-colors ${
                                value <= rating.rating
                                  ? value <= rating.target 
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-green-500 text-white'
                                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {calculateOverallConfidence().toFixed(1)}%
                      </div>
                      <div className="text-blue-200 mb-4">Overall Confidence</div>
                      
                      {isReadyToGM() ? (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <Award size={20} />
                          <span className="font-bold">Ready to be a Seer!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                          <TrendingUp size={20} />
                          <span>Keep building confidence</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      completedSteps.includes(index)
                        ? 'bg-green-400'
                        : index === currentStep
                        ? 'bg-blue-400'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              {currentStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/sessions')}
                  disabled={!isReadyToGM()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors font-bold"
                >
                  Start GMing!
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}