import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Clock, 
  Users, 
  BookOpen, 
  Dice1, 
  CheckCircle, 
  AlertCircle,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface AdventureTemplate {
  id: string
  title: string
  description: string
  theme: string
  difficulty_level: string
  total_time_minutes: number
  target_players: number
  scene_count: number
  learning_objectives: string[]
  required_materials: string[]
}

interface AdventureScene {
  id: string
  title: string
  scene_type: string
  description: string
  setup_text: string
  decision_prompt: string
  available_actions: Array<{
    id: string
    text: string
    difficulty: string
  }>
  time_estimate_minutes: number
  difficulty_hints: string[]
  gm_notes: string
  required_dice_rolls: Array<{
    type: string
    difficulty: number
    purpose: string
  }>
}

interface AdventureProgress {
  session_id: string
  adventure_id: string
  current_scene_id: string
  completed_scenes: string[]
  scene_outcomes: Record<string, string>
  total_progress_points: number
  confidence_score: number
  time_spent_minutes: number
  started_at: string
  last_activity: string
  player_notes: string[]
  gm_interventions: number
  is_completed: boolean
}

interface SceneOutcome {
  type: string
  description: string
  consequence: string
  progress_points_earned: number
  confidence_impact: number
}

const AdventurePage: React.FC = () => {
  const [templates, setTemplates] = useState<AdventureTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<AdventureTemplate | null>(null)
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [currentScene, setCurrentScene] = useState<AdventureScene | null>(null)
  const [progress, setProgress] = useState<AdventureProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [playerNarrative, setPlayerNarrative] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<SceneOutcome | null>(null)
  const [sceneProgress, setSceneProgress] = useState<{
    scenes_completed: number
    total_scenes: number
    progress_points: number
    confidence_score: number
    time_spent_minutes: number
    estimated_time_remaining: number
  } | null>(null)

  useEffect(() => {
    loadAdventureTemplates()
  }, [])

  const loadAdventureTemplates = async () => {
    try {
      const response = await fetch('/api/adventure/templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to load adventure templates:', error)
    }
  }

  const startAdventure = async (templateId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/adventure/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adventure_id: templateId,
          player_count: 2,
          session_id: `adventure_${Date.now()}`
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCurrentSession(data.session_id)
        setCurrentScene(data.initial_scene.scene)
        setSceneProgress(data.initial_scene.progress)
        setSelectedTemplate(templates.find(t => t.id === templateId) || null)
        setLastOutcome(null)
        setPlayerNarrative('')
        setSelectedAction(null)
      }
    } catch (error) {
      console.error('Failed to start adventure:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAction = async () => {
    if (!currentSession || !selectedAction) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/adventure/scene/${currentSession}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_taken: selectedAction,
          player_narrative: playerNarrative.trim() || undefined,
          dice_results: { total: Math.floor(Math.random() * 20) + 1 } // Simple dice roll
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setLastOutcome(data.outcome.outcome)
        setProgress(data.outcome.updated_progress)
        
        if (data.outcome.adventure_complete) {
          setCurrentScene(null)
          setCurrentSession(null)
        } else if (data.next_scene) {
          setCurrentScene(data.next_scene.scene)
          setSceneProgress(data.next_scene.progress)
        }
        
        setSelectedAction(null)
        setPlayerNarrative('')
      }
    } catch (error) {
      console.error('Failed to process action:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'newcomer': return 'bg-green-100 text-green-800'
      case 'beginner': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-300 bg-green-50 hover:bg-green-100'
      case 'medium': return 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
      case 'hard': return 'border-red-300 bg-red-50 hover:bg-red-100'
      default: return 'border-gray-300 bg-gray-50 hover:bg-gray-100'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SPARC Adventures</h1>
        <p className="text-lg text-gray-600 mb-6">
          Choose your adventure - structured 1-hour RPG experiences designed for newcomers
        </p>
      </div>
      
      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{template.title}</CardTitle>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                </div>
                <Badge className={getDifficultyColor(template.difficulty_level)}>
                  {template.difficulty_level}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(template.total_time_minutes)}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {template.target_players} players
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {template.scene_count} scenes
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Theme:</h4>
                  <p className="text-sm text-gray-600">{template.theme}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Learning Objectives:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.learning_objectives.slice(0, 3).map((objective, idx) => (
                      <li key={idx} className="flex items-center">
                        <Star className="w-3 h-3 mr-2 text-yellow-500" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Required Materials:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.required_materials.map((material, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => startAdventure(template.id)}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Adventure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderActiveAdventure = () => (
    <div className="space-y-6">
      {/* Adventure Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{selectedTemplate?.title}</CardTitle>
              <p className="text-gray-600">{selectedTemplate?.theme}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentSession(null)
                setCurrentScene(null)
                setProgress(null)
                setSelectedTemplate(null)
              }}
            >
              End Adventure
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {sceneProgress && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Adventure Progress</span>
                  <span className="text-sm text-gray-500">
                    {sceneProgress.scenes_completed} / {sceneProgress.total_scenes} scenes
                  </span>
                </div>
                <Progress 
                  value={(sceneProgress.scenes_completed / sceneProgress.total_scenes) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {sceneProgress.progress_points}
                  </div>
                  <div className="text-xs text-gray-500">Progress Points</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {sceneProgress.confidence_score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {formatTime(sceneProgress.time_spent_minutes)}
                  </div>
                  <div className="text-xs text-gray-500">Time Spent</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Outcome */}
      {lastOutcome && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {lastOutcome.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-blue-700">{lastOutcome.description}</p>
              <p className="text-blue-600 text-sm">{lastOutcome.consequence}</p>
              
              {lastOutcome.progress_points_earned > 0 && (
                <div className="text-sm text-blue-600">
                  <strong>+{lastOutcome.progress_points_earned} progress points</strong>
                  {lastOutcome.confidence_impact > 0 && (
                    <span className="ml-2">
                      +{lastOutcome.confidence_impact.toFixed(1)} confidence
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Scene */}
      {currentScene && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentScene.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {currentScene.scene_type.replace('_', ' ')}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  ~{currentScene.time_estimate_minutes}min
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Scene Description */}
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">{currentScene.description}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 italic">"{currentScene.setup_text}"</p>
              </div>
            </div>

            <Separator />

            {/* Decision Prompt */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">{currentScene.decision_prompt}</h3>
              
              {/* Available Actions */}
              <div className="space-y-3">
                {currentScene.available_actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : getActionDifficultyColor(action.difficulty)
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{action.text}</span>
                      <Badge variant="outline" className="text-xs">
                        {action.difficulty}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Player Narrative Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Describe how your character approaches this (optional):
              </label>
              <Textarea
                value={playerNarrative}
                onChange={(e) => setPlayerNarrative(e.target.value)}
                placeholder="Tell the story of how your character handles this situation..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Action Button */}
            <Button
              onClick={processAction}
              disabled={!selectedAction || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Dice1 className="w-4 h-4 mr-2" />
                  Take Action
                </>
              )}
            </Button>

            {/* Hints and GM Notes */}
            {currentScene.difficulty_hints.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">Helpful Hints:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {currentScene.difficulty_hints.map((hint, idx) => (
                          <li key={idx}>• {hint}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCompletedAdventure = () => (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-xl text-green-800 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Adventure Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress && (
            <div className="space-y-4">
              <p className="text-green-700">
                Congratulations! You've completed "{selectedTemplate?.title}" successfully.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {progress.total_progress_points}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.confidence_score.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-gray-600">Final Confidence</div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setCurrentSession(null)
                  setCurrentScene(null)
                  setProgress(null)
                  setSelectedTemplate(null)
                  setLastOutcome(null)
                }}
                className="w-full"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Choose Another Adventure
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {!currentSession && !progress?.is_completed && renderTemplateSelection()}
        {currentSession && currentScene && renderActiveAdventure()}
        {progress?.is_completed && renderCompletedAdventure()}
      </div>
    </div>
  )
}

export default AdventurePage