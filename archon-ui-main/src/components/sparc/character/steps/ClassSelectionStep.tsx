import React from 'react'
import { 
  Sword, Shield, Wand, Heart, Users, Zap, Loader2,
  Sparkles, Target, Brain, MessageCircle 
} from 'lucide-react'
import { CharacterTemplate } from '../../../../services/sparcService'

interface ClassSelectionStepProps {
  templates: Record<string, CharacterTemplate>
  selectedClass: string
  primaryStat: string
  onClassSelect: (className: string) => void
  onStatSelect: (stat: string) => void
  isLoading: boolean
}

export default function ClassSelectionStep({
  templates,
  selectedClass,
  primaryStat,
  onClassSelect,
  onStatSelect,
  isLoading
}: ClassSelectionStepProps) {
  const getClassIcon = (characterClass: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      warrior: Sword,
      paladin: Shield,
      wizard: Wand,
      cleric: Heart,
      rogue: Users,
      ranger: Target,
      necromancer: Sparkles
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

  const getStatIcon = (stat: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      str: Sword,
      dex: Target,
      int: Brain,
      cha: MessageCircle
    }
    return iconMap[stat.toLowerCase()] || Sword
  }

  const getStatDescription = (stat: string) => {
    const descriptions: Record<string, string> = {
      str: 'Physical power and combat prowess',
      dex: 'Agility, stealth, and precision',
      int: 'Knowledge, problem-solving, and magic',
      cha: 'Leadership, persuasion, and inspiration'
    }
    return descriptions[stat.toLowerCase()] || ''
  }

  const statOptions = [
    { key: 'str', name: 'Strength', short: 'STR' },
    { key: 'dex', name: 'Dexterity', short: 'DEX' },
    { key: 'int', name: 'Intelligence', short: 'INT' },
    { key: 'cha', name: 'Charisma', short: 'CHA' }
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <div className="text-white text-lg">Loading character classes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Class Selection */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Choose Your Adventure Class</h3>
        <p className="text-gray-300 mb-6">
          Each class has unique abilities and playstyles. Pick one that excites you!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(templates).map(([className, template]) => {
            const ClassIcon = getClassIcon(className)
            const classGradient = getClassColor(className)
            const isSelected = selectedClass === className

            return (
              <button
                key={className}
                onClick={() => onClassSelect(className)}
                className={`relative p-6 rounded-xl text-left transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/20 scale-105' 
                    : 'hover:scale-102 hover:shadow-lg'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${classGradient} opacity-20 rounded-xl`} />
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${classGradient}`}>
                      <ClassIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg capitalize">{className}</h4>
                      <div className="text-blue-300 text-sm">
                        HP: {template.starting_hp} | Equipment: {template.equipment.length} items
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-300 text-sm mb-4">
                    <div className="font-medium text-yellow-400 mb-1">{template.special_ability_name}</div>
                    <div className="line-clamp-2">{template.special_ability_description}</div>
                  </div>

                  {/* Base Stats Preview */}
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(template.base_stats).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <div className="text-white font-bold">{value}</div>
                        <div className="text-blue-300 text-xs uppercase">{stat}</div>
                      </div>
                    ))}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Stat Selection */}
      {selectedClass && (
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-bold text-white mb-2">Choose Your Primary Attribute</h3>
          <p className="text-gray-300 mb-6">
            Your primary attribute gets a +1 bonus and defines your character's main strength.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statOptions.map((stat) => {
              const StatIcon = getStatIcon(stat.key)
              const isSelected = primaryStat === stat.key
              const baseValue = templates[selectedClass]?.base_stats[stat.key as keyof typeof templates[selectedClass]['base_stats']] || 3
              const finalValue = baseValue + 1 // Primary stat bonus

              return (
                <button
                  key={stat.key}
                  onClick={() => onStatSelect(stat.key)}
                  className={`relative p-4 rounded-lg text-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-500/20 ring-2 ring-blue-400 text-white scale-105'
                      : 'bg-black/20 hover:bg-black/30 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-600'
                    }`}>
                      <StatIcon className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <div className="font-bold text-lg">{stat.short}</div>
                      <div className="text-sm">{stat.name}</div>
                    </div>

                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                        {baseValue} → {finalValue}
                      </div>
                      <div className="text-xs text-green-400">+1 Primary Bonus</div>
                    </div>

                    <div className="text-xs text-gray-400 leading-tight">
                      {getStatDescription(stat.key)}
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

      {/* Selection Summary */}
      {selectedClass && primaryStat && (
        <div className="border-t border-white/10 pt-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="font-medium">Class Selection Complete</span>
            </div>
            <div className="text-white">
              <span className="capitalize font-bold">{selectedClass}</span> with{' '}
              <span className="font-bold text-blue-400">{primaryStat.toUpperCase()}</span> focus
            </div>
            <div className="text-gray-300 text-sm mt-1">
              Ready to continue to character identity
            </div>
          </div>
        </div>
      )}
    </div>
  )
}