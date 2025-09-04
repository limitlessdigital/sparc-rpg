import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus } from 'lucide-react'
import CharacterCreationWizard from '../../components/sparc/character/CharacterCreationWizard'
import CharacterSheet from '../../components/sparc/character/CharacterSheet'
import { Character } from '../../services/sparcService'

interface CharacterCreationPageProps {
  onCharacterCreated?: (character: any) => void
  onCancel?: () => void
}

export default function CharacterCreationPage({ onCharacterCreated, onCancel }: CharacterCreationPageProps) {
  const navigate = useNavigate()
  const [showWizard, setShowWizard] = useState(false)
  const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null)

  const handleCharacterCreated = (character: Character) => {
    setCreatedCharacter(character)
    setShowWizard(false)
    if (onCharacterCreated) {
      onCharacterCreated(character)
    }
  }

  const handleStartWizard = () => {
    setShowWizard(true)
    setCreatedCharacter(null)
  }

  const handleCancelWizard = () => {
    setShowWizard(false)
    if (onCancel) {
      onCancel()
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleStartAdventure = () => {
    // Navigate to session creation or character list
    navigate('/sparc/sessions')
  }

  const handleCreateAnother = () => {
    setCreatedCharacter(null)
    setShowWizard(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-blue-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Character Creation</h1>
            <p className="text-blue-300 mt-2">Create your SPARC RPG character in under 5 minutes</p>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        {showWizard ? (
          /* Character Creation Wizard */
          <CharacterCreationWizard
            onCharacterCreated={handleCharacterCreated}
            onCancel={handleCancelWizard}
            className="max-w-4xl mx-auto"
          />
        ) : createdCharacter ? (
          /* Character Created Successfully */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
              <div className="text-green-400 text-xl font-bold mb-2">
                🎉 Character Created Successfully!
              </div>
              <div className="text-white text-lg">
                <span className="font-bold">{createdCharacter.name}</span> is ready for adventure!
              </div>
              <div className="text-green-300 text-sm mt-2">
                Your character has been saved and is ready to join a game session.
              </div>
            </div>

            {/* Character Display */}
            <div className="flex justify-center">
              <CharacterSheet
                character={createdCharacter}
                canEdit={false}
                className="max-w-md"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartAdventure}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Users className="w-5 h-5" />
                <span>Find Adventure</span>
              </button>
              
              <button
                onClick={handleCreateAnother}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create Another Character</span>
              </button>
            </div>

            {/* Character Tips */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold text-lg mb-3">Next Steps</h3>
              <div className="space-y-2 text-blue-200">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Join a game session to start your first adventure</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Use your special ability wisely - it's available once per adventure</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Remember your 3 heroic saves for crucial moments</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Your character will grow stronger through adventures</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Create Your Character?
              </h2>
              <p className="text-blue-300 text-lg mb-6">
                Build your perfect SPARC RPG character in just 3 simple steps.
                Choose your class, define your identity, and start your adventure!
              </p>
              
              <button
                onClick={handleStartWizard}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Start Character Creation</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-white font-bold text-lg mb-2">Quick Creation</h3>
                <p className="text-gray-300 text-sm">
                  Complete character creation in under 5 minutes with our streamlined wizard
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-white font-bold text-lg mb-2">Perfect Balance</h3>
                <p className="text-gray-300 text-sm">
                  Choose your primary attribute and get auto-balanced stats for fair gameplay
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="text-white font-bold text-lg mb-2">Ready to Play</h3>
                <p className="text-gray-300 text-sm">
                  Start with equipment, abilities, and everything needed for your first adventure
                </p>
              </div>
            </div>

            {/* Class Preview */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Choose from 7 Unique Classes</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: 'Warrior', icon: '⚔️', color: 'bg-red-500/20 text-red-400' },
                  { name: 'Paladin', icon: '🛡️', color: 'bg-yellow-500/20 text-yellow-400' },
                  { name: 'Wizard', icon: '🔮', color: 'bg-purple-500/20 text-purple-400' },
                  { name: 'Cleric', icon: '💙', color: 'bg-blue-500/20 text-blue-400' },
                  { name: 'Rogue', icon: '🗡️', color: 'bg-gray-500/20 text-gray-400' },
                  { name: 'Ranger', icon: '🏹', color: 'bg-green-500/20 text-green-400' },
                  { name: 'Necromancer', icon: '💀', color: 'bg-black/40 text-purple-300' }
                ].map(cls => (
                  <div key={cls.name} className={`px-4 py-2 rounded-lg ${cls.color} border border-current/30`}>
                    <span className="text-lg mr-2">{cls.icon}</span>
                    <span className="font-medium">{cls.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}