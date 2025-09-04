import React from 'react'
import { 
  Sword, Shield, Wand, Heart, Users, Target, Sparkles, Brain, MessageCircle,
  Package, Scroll, Zap, RotateCcw, Star, Loader2
} from 'lucide-react'
import { CharacterPreview } from '../../../../services/sparcService'

interface PreviewStepProps {
  preview: CharacterPreview | null
  characterName: string
  selectedBackground: string
  isLoading: boolean
  isCreating: boolean
}

export default function PreviewStep({
  preview,
  characterName,
  selectedBackground,
  isLoading,
  isCreating
}: PreviewStepProps) {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <div className="text-white text-lg">Generating character preview...</div>
        <div className="text-gray-300 text-sm">Calculating stats and equipment</div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 text-lg">Failed to generate preview</div>
        <div className="text-gray-300 text-sm">Please go back and try again</div>
      </div>
    )
  }

  const ClassIcon = getClassIcon(preview.character_class)
  const classGradient = getClassColor(preview.character_class)

  return (
    <div className="space-y-6">
      {/* Character Overview */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Character Preview</h3>
        <p className="text-gray-300 mb-6">
          Review your character before bringing them to life. Everything looks good? Let's adventure!
        </p>
      </div>

      {/* Character Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${classGradient} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <ClassIcon size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl">{characterName}</h3>
                <p className="text-white/80 capitalize text-lg">
                  Level 1 {preview.character_class}
                </p>
                <p className="text-white/60 text-sm">
                  {selectedBackground} Background
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <div className="text-white font-bold text-lg">{preview.starting_hp} HP</div>
                <div className="text-white/80 text-sm">Health Points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Attributes
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(preview.stats).map(([stat, value]) => {
                const StatIcon = getStatIcon(stat)
                const isPrimary = preview.primary_stat_bonus.toLowerCase().includes(stat.toLowerCase())
                
                return (
                  <div 
                    key={stat}
                    className={`p-4 rounded-lg text-center ${
                      isPrimary 
                        ? 'bg-yellow-500/20 border border-yellow-500/30' 
                        : 'bg-black/20'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      isPrimary ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}>
                      <StatIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`text-2xl font-bold ${isPrimary ? 'text-yellow-400' : 'text-white'}`}>
                      {value}
                    </div>
                    <div className={`text-sm uppercase ${isPrimary ? 'text-yellow-300' : 'text-gray-300'}`}>
                      {stat}
                    </div>
                    {isPrimary && (
                      <div className="text-xs text-yellow-400 mt-1">Primary</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Special Ability */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Special Ability
            </h4>
            
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-lg">{preview.special_ability.name}</h5>
                  <p className="text-purple-200 text-sm leading-relaxed">
                    {preview.special_ability.description}
                  </p>
                  <div className="mt-2 text-xs text-purple-300">
                    Available once per adventure
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Starting Equipment
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {preview.equipment.map((item, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-blue-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Character Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heroic Saves */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Heroic Saves</span>
              </div>
              <div className="text-blue-200 text-sm">
                3 uses per adventure. Reroll any failed die to attempt success.
              </div>
            </div>

            {/* Level Benefits */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Growth Potential</span>
              </div>
              <div className="text-green-200 text-sm">
                Gain experience and level up through adventures.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Status */}
      {isCreating ? (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 text-blue-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <div>
              <div className="font-medium">Creating your character...</div>
              <div className="text-sm text-blue-300">This will just take a moment</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 text-green-400 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="font-medium text-lg">Ready to Create!</span>
          </div>
          
          <div className="text-white">
            <div className="font-bold text-xl mb-2">{characterName}</div>
            <div className="text-gray-300">
              Your <span className="text-blue-400 font-medium">{selectedBackground}</span>{' '}
              <span className="capitalize font-medium">{preview.character_class}</span> is ready to begin their first adventure.
              Click "Create Character" to bring them to life!
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!isCreating && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <div className="text-yellow-400 font-medium mb-1">Adventure Tip</div>
              <div className="text-yellow-200 text-sm leading-relaxed">
                Your character will grow stronger through adventures! Look for opportunities to use your 
                special ability and don't forget about your heroic saves in tough situations.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}