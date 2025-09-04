import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  MessageCircle
} from 'lucide-react'

interface AILoadingStatesProps {
  loadingType: 'advice' | 'suggestions' | 'rules' | 'general'
  progress?: number
  estimatedTime?: number
  currentStep?: string
  performanceTarget?: number
  className?: string
}

const AILoadingStates: React.FC<AILoadingStatesProps> = ({
  loadingType,
  progress = 0,
  estimatedTime = 2000,
  currentStep,
  performanceTarget = 3000,
  className = ""
}) => {
  const getLoadingConfig = () => {
    switch (loadingType) {
      case 'advice':
        return {
          icon: <Brain className="w-6 h-6 text-purple-600" />,
          title: 'Getting AI Seer Advice',
          description: 'Analyzing your situation and generating contextual guidance',
          steps: [
            'Processing game context...',
            'Analyzing player situation...',
            'Generating personalized advice...',
            'Finalizing recommendations...'
          ],
          color: 'purple'
        }
      
      case 'suggestions':
        return {
          icon: <Sparkles className="w-6 h-6 text-yellow-600" />,
          title: 'Generating Suggestions',
          description: 'Creating contextual suggestions based on current game state',
          steps: [
            'Reading game state...',
            'Identifying opportunities...',
            'Crafting suggestions...',
            'Ranking by relevance...'
          ],
          color: 'yellow'
        }
      
      case 'rules':
        return {
          icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
          title: 'Clarifying Rules',
          description: 'Searching rules database and providing clear explanations',
          steps: [
            'Searching rule database...',
            'Finding relevant sections...',
            'Preparing explanation...',
            'Adding examples...'
          ],
          color: 'blue'
        }
      
      default:
        return {
          icon: <RefreshCw className="w-6 h-6 text-gray-600" />,
          title: 'Processing Request',
          description: 'AI is working on your request',
          steps: [
            'Processing request...',
            'Generating response...',
            'Finalizing...'
          ],
          color: 'gray'
        }
    }
  }

  const config = getLoadingConfig()
  const currentStepIndex = Math.floor((progress / 100) * config.steps.length)
  const displayStep = currentStep || config.steps[Math.min(currentStepIndex, config.steps.length - 1)]

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      gray: 'text-gray-600 bg-gray-50 border-gray-200'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const isWithinTarget = estimatedTime <= performanceTarget

  return (
    <Card className={`${className} ${getColorClasses(config.color)}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{config.title}</h3>
              <p className="text-xs opacity-75">{config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={isWithinTarget ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(estimatedTime)}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{displayStep}</span>
            </span>
            <span className="opacity-75">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="flex items-center justify-between text-xs border-t pt-2 opacity-75">
          <span>Target: &lt;{formatTime(performanceTarget)}</span>
          <div className="flex items-center space-x-1">
            {isWithinTarget ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-green-600">On track</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-orange-600" />
                <span className="text-orange-600">May exceed target</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AILoadingStates

// Skeleton loading component for AI responses
export const AISeerSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <Card className={`${className} animate-pulse`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-4/5"></div>
          <div className="h-3 bg-gray-300 rounded w-3/5"></div>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact loading indicator for inline use
export const AILoadingDot: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'blue' | 'yellow' | 'gray'
}> = ({ size = 'md', color = 'purple' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const colorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  }

  return (
    <RefreshCw className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
  )
}

// Response time indicator
export const ResponseTimeIndicator: React.FC<{
  responseTime: number
  target: number
  className?: string
}> = ({ responseTime, target, className = "" }) => {
  const isGood = responseTime <= target
  const percentage = Math.min(100, (responseTime / target) * 100)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isGood ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-orange-600" />
      )}
      
      <div className="flex-1 max-w-20">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isGood ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
      
      <span className={`text-xs ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
        {responseTime < 1000 ? `${responseTime}ms` : `${(responseTime / 1000).toFixed(1)}s`}
      </span>
    </div>
  )
}