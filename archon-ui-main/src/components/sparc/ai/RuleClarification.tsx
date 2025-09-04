import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  Clock,
  Bookmark,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react'

interface RuleReference {
  id: string
  title: string
  category: string
  content: string
  examples?: string[]
  related_rules?: string[]
  difficulty_context?: string
  confidence_score: number
  source_section?: string
}

interface RuleClarification {
  id: string
  query: string
  answer: string
  rules: RuleReference[]
  context: string
  clarity_score: number
  response_time_ms: number
  timestamp: string
  follow_up_questions?: string[]
}

interface RuleClarificationProps {
  gameContext?: {
    current_situation?: string
    active_mechanics?: string[]
    difficulty_level?: string
    session_id?: string
  }
  className?: string
}

const RuleClarification: React.FC<RuleClarificationProps> = ({
  gameContext,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clarifications, setClarifications] = useState<RuleClarification[]>([])
  const [quickRules, setQuickRules] = useState<RuleReference[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const ruleCategories = [
    { id: 'all', name: 'All Rules', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'dice_rolling', name: 'Dice & Rolls', icon: <Zap className="w-4 h-4" /> },
    { id: 'character_actions', name: 'Actions', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'social_interaction', name: 'Social', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'game_flow', name: 'Game Flow', icon: <Clock className="w-4 h-4" /> },
    { id: 'gm_guidance', name: 'GM Tips', icon: <Info className="w-4 h-4" /> }
  ]

  // Load frequently referenced rules on mount
  useEffect(() => {
    loadQuickRules()
  }, [selectedCategory])

  // Load contextual rules when game context changes
  useEffect(() => {
    if (gameContext?.current_situation) {
      loadContextualRules()
    }
  }, [gameContext?.current_situation, gameContext?.active_mechanics])

  const loadQuickRules = async () => {
    try {
      const response = await fetch('/api/ai/quick-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          limit: 6
        })
      })

      const data = await response.json()
      if (data.success) {
        setQuickRules(data.rules)
      }
    } catch (error) {
      console.error('Failed to load quick rules:', error)
    }
  }

  const loadContextualRules = async () => {
    if (!gameContext) return

    try {
      const response = await fetch('/api/ai/contextual-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_context: gameContext,
          max_rules: 4
        })
      })

      const data = await response.json()
      if (data.success) {
        setQuickRules(prev => [...data.rules, ...prev.slice(0, 2)]) // Merge with existing
      }
    } catch (error) {
      console.error('Failed to load contextual rules:', error)
    }
  }

  const searchRules = async (query?: string) => {
    const searchTerm = query || searchQuery.trim()
    if (!searchTerm) return

    setIsLoading(true)
    setError(null)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/ai/rule-clarification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTerm,
          context: gameContext,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          max_response_time_ms: 3000
        })
      })

      const data = await response.json()
      const endTime = Date.now()

      if (data.success) {
        const clarification: RuleClarification = {
          id: `clarification_${Date.now()}`,
          query: searchTerm,
          answer: data.clarification.answer,
          rules: data.clarification.rules,
          context: data.clarification.context || 'General rules',
          clarity_score: data.clarification.clarity_score || 0.8,
          response_time_ms: endTime - startTime,
          timestamp: new Date().toISOString(),
          follow_up_questions: data.clarification.follow_up_questions || []
        }

        setClarifications(prev => [clarification, ...prev.slice(0, 4)]) // Keep last 5
        setSearchQuery('')
      } else {
        throw new Error(data.error || 'Failed to get rule clarification')
      }
    } catch (error) {
      console.error('Rule clarification failed:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const quickSearches = [
    "How do difficulty checks work?",
    "When do players roll dice?",
    "How to handle player disagreements?",
    "What if a player wants to try something creative?",
    "How to determine NPC reactions?",
    "When should I ask for rolls vs auto-succeed?"
  ]

  const getRuleCategoryIcon = (category: string) => {
    const cat = ruleCategories.find(c => c.id === category)
    return cat ? cat.icon : <BookOpen className="w-4 h-4" />
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Rule Clarification</span>
            {gameContext?.session_id && (
              <Badge variant="outline" className="ml-auto">
                Context-Aware
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Category Selection */}
          <div className="flex flex-wrap gap-2">
            {ruleCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.icon}
                <span className="ml-1">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about any rule or situation..."
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchRules()
                  }
                }}
              />
            </div>
            <Button
              onClick={() => searchRules()}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Searches */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Quick Questions:</span>
            <div className="flex flex-wrap gap-2">
              {quickSearches.slice(0, 3).map((search, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => searchRules(search)}
                >
                  {search.length > 30 ? `${search.substring(0, 30)}...` : search}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Rules */}
          {quickRules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {gameContext?.current_situation ? 'Relevant Rules' : 'Quick Reference'}
                </span>
              </div>
              
              <div className="grid gap-2">
                {quickRules.slice(0, 4).map((rule) => (
                  <Card key={rule.id} className="border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => searchRules(`Tell me more about: ${rule.title}`)}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{rule.title}</h4>
                        <div className="flex items-center space-x-1">
                          {getRuleCategoryIcon(rule.category)}
                          <Badge variant="outline" className="text-xs">
                            {rule.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">{rule.content}</p>
                      
                      {rule.difficulty_context && (
                        <div className="mt-2 text-xs text-blue-600">
                          Context: {rule.difficulty_context}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(rule.confidence_score * 100)}%
                        </span>
                        {rule.source_section && (
                          <span className="text-xs text-gray-500">
                            {rule.source_section}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Clarifications */}
          {clarifications.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <span className="text-sm font-medium text-gray-700">Recent Clarifications</span>
              
              <ScrollArea className="h-64">
                <div className="space-y-3 pr-2">
                  {clarifications.map((clarification) => (
                    <Card key={clarification.id} className="border border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-blue-900">
                            {clarification.query}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={clarification.response_time_ms < 3000 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                              {formatResponseTime(clarification.response_time_ms)}
                            </Badge>
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{clarification.answer}</p>
                        
                        {clarification.rules.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-600">Referenced Rules:</span>
                            {clarification.rules.slice(0, 2).map((rule, idx) => (
                              <div key={idx} className="bg-blue-50 p-2 rounded text-xs">
                                <div className="font-medium text-blue-900">{rule.title}</div>
                                <div className="text-blue-700">{rule.content.substring(0, 100)}...</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {clarification.follow_up_questions && clarification.follow_up_questions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-600 mb-1 block">Follow-up:</span>
                            <div className="flex flex-wrap gap-1">
                              {clarification.follow_up_questions.slice(0, 2).map((question, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    searchRules(question)
                                  }}
                                >
                                  {question.length > 25 ? `${question.substring(0, 25)}...` : question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Clarity: {Math.round(clarification.clarity_score * 100)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(clarification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RuleClarification