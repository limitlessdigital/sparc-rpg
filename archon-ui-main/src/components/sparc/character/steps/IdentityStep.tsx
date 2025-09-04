import React, { useState } from 'react'
import { User, Scroll, Sparkles, AlertCircle } from 'lucide-react'

interface IdentityStepProps {
  characterName: string
  selectedBackground: string
  backgroundOptions: string[]
  onNameChange: (name: string) => void
  onBackgroundSelect: (background: string) => void
  selectedClass: string
  primaryStat: string
}

export default function IdentityStep({
  characterName,
  selectedBackground,
  backgroundOptions,
  onNameChange,
  onBackgroundSelect,
  selectedClass,
  primaryStat
}: IdentityStepProps) {
  const [nameError, setNameError] = useState('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    
    // Validation
    if (name.length > 30) {
      setNameError('Name must be 30 characters or less')
      return
    }
    
    if (name.includes('<') || name.includes('>')) {
      setNameError('Name cannot contain < or > characters')
      return
    }

    setNameError('')
    onNameChange(name)
  }

  const generateRandomName = () => {
    const namesByClass: Record<string, string[]> = {
      warrior: [
        'Thorin Ironheart', 'Vera Stormborn', 'Marcus Dawnblade', 'Aria Shieldbreaker',
        'Gareth the Bold', 'Luna Battlecry', 'Kaiden Steelwind', 'Zara Ironwill'
      ],
      paladin: [
        'Seraphina Light', 'Gabriel Dawnguard', 'Isabella Pure', 'Roland the Just',
        'Celeste Divine', 'Alexander Noble', 'Aurelia Bright', 'Thaddeus Holy'
      ],
      wizard: [
        'Eldric Starweaver', 'Lyra Moonscribe', 'Alaric Spellborn', 'Morgana Wise',
        'Zephyr Arcane', 'Nyx Shadowmend', 'Orion Mindforge', 'Vera Mystral'
      ],
      cleric: [
        'Benedict Healer', 'Cordelia Grace', 'Matthias Kind', 'Serenity Peace',
        'Father Goodwin', 'Sister Mercy', 'Raphael Light', 'Hope Dawnprayer'
      ],
      rogue: [
        'Raven Nightwhisper', 'Jasper Quickfingers', 'Sable Shadow', 'Finn Lockpick',
        'Naia Silvertongue', 'Dex Shadowstep', 'Zoe Whisperwind', 'Kit Nimblefeet'
      ],
      ranger: [
        'Leaf Treewalker', 'Robin Swiftarrow', 'Sage Wildborn', 'Hunter Greycloak',
        'Willow Moontracker', 'Ash Pathfinder', 'Reed Forestwarden', 'Star Nightrunner'
      ],
      necromancer: [
        'Mortis Darkwhisper', 'Raven Soulbinder', 'Vex Nightcaller', 'Salem Grimspell',
        'Onyx Deathmage', 'Ivory Boneseer', 'Shade Voidwalker', 'Ember Darkcaster'
      ]
    }

    const classNames = namesByClass[selectedClass] || namesByClass.warrior
    const randomName = classNames[Math.floor(Math.random() * classNames.length)]
    onNameChange(randomName)
    setNameError('')
  }

  const getBackgroundDescription = (background: string): string => {
    const descriptions: Record<string, string> = {
      'Noble': 'Raised in luxury with education and social connections',
      'Commoner': 'Practical upbringing with street smarts and resilience',
      'Hermit': 'Years of solitude brought wisdom and self-reliance',
      'Entertainer': 'Life of performance built charisma and crowd appeal',
      'Soldier': 'Military training provided discipline and tactics',
      'Scholar': 'Academic pursuits expanded knowledge and research skills',
      'Criminal': 'Underground connections and survival instincts',
      'Acolyte': 'Religious training in service to divine powers',
      'Guild Artisan': 'Master craftsperson with trade connections',
      'Folk Hero': 'Champion of common people with local fame',
      'Outlander': 'Wilderness survivor with nature knowledge',
      'Sailor': 'Maritime experience with weather and navigation'
    }
    return descriptions[background] || 'A unique background that shaped your character'
  }

  const isNameValid = characterName.trim().length > 0 && nameError === ''

  return (
    <div className="space-y-8">
      {/* Character Name */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Name Your Character</h3>
        <p className="text-gray-300 mb-4">
          Choose a name that represents your {selectedClass}'s personality and story.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={characterName}
              onChange={handleNameChange}
              placeholder="Enter character name..."
              className={`w-full pl-10 pr-4 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                nameError 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : isNameValid
                  ? 'border-green-500 focus:ring-green-500/50'
                  : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              maxLength={30}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {characterName.length}/30
            </div>
          </div>

          {nameError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{nameError}</span>
            </div>
          )}

          <button
            onClick={generateRandomName}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Random Name</span>
          </button>

          {isNameValid && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-medium">Perfect!</div>
              <div className="text-white">
                <span className="font-bold">{characterName}</span> is a great name for a {selectedClass}.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background Selection */}
      {isNameValid && (
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Choose Your Background</h3>
          <p className="text-gray-300 mb-4">
            Your background tells the story of {characterName}'s life before becoming an adventurer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backgroundOptions.map((background) => {
              const isSelected = selectedBackground === background

              return (
                <button
                  key={background}
                  onClick={() => onBackgroundSelect(background)}
                  className={`relative p-4 rounded-lg text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-500/20 ring-2 ring-blue-400 scale-105'
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-600'
                    }`}>
                      <Scroll className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {background}
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        isSelected ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {getBackgroundDescription(background)}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Identity Summary */}
      {isNameValid && selectedBackground && (
        <div className="border-t border-white/10 pt-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="font-medium">Character Identity Complete</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-white text-lg">
                <span className="font-bold">{characterName}</span>
              </div>
              <div className="text-gray-300">
                A <span className="text-blue-400 font-medium">{selectedBackground}</span>{' '}
                <span className="capitalize font-medium">{selectedClass}</span> focused on{' '}
                <span className="text-yellow-400 font-medium uppercase">{primaryStat}</span>
              </div>
              <div className="text-sm text-gray-400 mt-3">
                Ready to see the complete character preview
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}