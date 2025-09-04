import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, ArrowRight, Sparkles, User, Sword, Eye, 
  CheckCircle, AlertCircle, Clock, Loader2 
} from 'lucide-react'
import { characterApi, CharacterTemplate, CharacterPreview, CreateCharacterRequest } from '../../../services/sparcService'

interface CharacterCreationWizardProps {
  onCharacterCreated: (character: any) => void
  onCancel: () => void
  className?: string
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
}

export default function CharacterCreationWizard({
  onCharacterCreated,
  onCancel,
  className = ""
}: CharacterCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  // Character creation data
  const [characterName, setCharacterName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [primaryStat, setPrimaryStat] = useState('')
  const [selectedBackground, setSelectedBackground] = useState('')
  const [templates, setTemplates] = useState<Record<string, CharacterTemplate>>({})
  const [preview, setPreview] = useState<CharacterPreview | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const steps: WizardStep[] = [
    {
      id: 'class',
      title: 'Choose Your Class',
      description: 'Select your character\'s adventure class and primary attribute',
      icon: Sword,
      completed: selectedClass !== '' && primaryStat !== ''
    },
    {
      id: 'identity',
      title: 'Define Identity',
      description: 'Name your character and choose their background',
      icon: User,
      completed: characterName.trim() !== '' && selectedBackground !== ''
    },
    {
      id: 'preview',
      title: 'Review & Create',
      description: 'Review your character and bring them to life',
      icon: Eye,
      completed: preview !== null
    }
  ]

  // Load character templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        const templatesData = await characterApi.getTemplates()
        setTemplates(templatesData)
        setError(null)
      } catch (err) {
        setError('Failed to load character classes. Please try again.')
        console.error('Failed to load templates:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [])

  // Generate preview when step 2 is completed
  useEffect(() => {
    if (currentStep === 2 && characterName && selectedClass && primaryStat && selectedBackground) {
      generatePreview()
    }
  }, [currentStep, characterName, selectedClass, primaryStat, selectedBackground])

  const generatePreview = async () => {
    try {
      setIsLoading(true)
      const previewData = await characterApi.previewCharacter({
        name: characterName,
        character_class: selectedClass,
        primary_stat: primaryStat
      })
      setPreview(previewData)
      setError(null)
    } catch (err) {
      setError('Failed to generate character preview.')
      console.error('Failed to generate preview:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    if (!preview) return

    try {
      setIsCreating(true)
      const character = await characterApi.createCharacter({
        name: characterName,
        character_class: selectedClass,
        primary_stat: primaryStat
      })

      // Track creation time - target is under 5 minutes
      const creationTime = Date.now() - startTime
      console.log(`Character created in ${Math.round(creationTime / 1000)}s`)

      onCharacterCreated(character)
    } catch (err) {
      setError('Failed to create character. Please try again.')
      console.error('Failed to create character:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const getTimeElapsed = (): string => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  const canProceed = (): boolean => {
    return steps[currentStep].completed
  }

  if (isLoading && currentStep === 0) {
    return (
      <div className={`bg-gray-900/95 backdrop-blur-md rounded-xl p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div className="text-white text-lg">Loading character classes...</div>
          <div className="text-blue-300 text-sm">This should take just a moment</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/95 backdrop-blur-md rounded-xl ${className}`}>
      {/* Header with Progress */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Create Your Character
          </h2>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300">{getTimeElapsed()}</span>
            <span className="text-gray-400">/ 5min target</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = step.completed
            const isPast = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <div className={`relative flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  {/* Step Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted || isPast
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                      : 'border-gray-600 text-gray-400 bg-gray-600/10'
                  }`}>
                    {isCompleted || isPast ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-20">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    isPast || (isActive && isCompleted) ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Step 0: Class Selection */}
        {currentStep === 0 && (
          <ClassSelectionStep
            templates={templates}
            selectedClass={selectedClass}
            primaryStat={primaryStat}
            onClassSelect={setSelectedClass}
            onStatSelect={setPrimaryStat}
            isLoading={isLoading}
          />
        )}

        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <IdentityStep
            characterName={characterName}
            selectedBackground={selectedBackground}
            backgroundOptions={templates[selectedClass]?.background_options || []}
            onNameChange={setCharacterName}
            onBackgroundSelect={setSelectedBackground}
            selectedClass={selectedClass}
            primaryStat={primaryStat}
          />
        )}

        {/* Step 2: Preview */}
        {currentStep === 2 && (
          <PreviewStep
            preview={preview}
            characterName={characterName}
            selectedBackground={selectedBackground}
            isLoading={isLoading}
            isCreating={isCreating}
          />
        )}
      </div>

      {/* Footer with Navigation */}
      <div className="border-t border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={isCreating}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={onCancel}
              disabled={isCreating}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isCreating}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || isCreating}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Character</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components will be defined in separate files
import ClassSelectionStep from './steps/ClassSelectionStep'
import IdentityStep from './steps/IdentityStep'
import PreviewStep from './steps/PreviewStep'