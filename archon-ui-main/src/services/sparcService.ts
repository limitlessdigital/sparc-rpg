import axios from 'axios'

// API client configuration
const api = axios.create({
  baseURL: '/api/sparc',
  timeout: 10000,
})

// Types
export interface CharacterStats {
  str: number
  dex: number
  int: number
  cha: number
}

export interface CharacterTemplate {
  character_class: string
  base_stats: CharacterStats
  starting_hp: number
  equipment: string[]
  background_options: string[]
  special_ability_name: string
  special_ability_description: string
}

export interface Character {
  id: string
  user_id: string
  name: string
  character_class: string
  stats: CharacterStats
  current_hp: number
  max_hp: number
  level: number
  special_ability_available: boolean
  heroic_saves_available: number
  equipment: string[]
  background: string
  created_at: string
  updated_at: string
}

export interface CreateCharacterRequest {
  name: string
  character_class: string
  primary_stat: string
}

export interface CharacterPreview {
  name: string
  character_class: string
  stats: CharacterStats
  starting_hp: number
  equipment: string[]
  special_ability: {
    name: string
    description: string
  }
  background_options: string[]
  primary_stat_bonus: string
}

export interface DiceRoll {
  id: string
  session_id: string
  character_id?: string
  roll_type: string
  dice_count: number
  results: number[]
  total: number
  difficulty?: number
  is_success?: boolean
  modifier: number
  context: string
  rolled_at: string
}

export interface RollDiceRequest {
  dice_count: number
  roll_type: string
  character_id?: string
  difficulty?: number
  modifier: number
  context: string
}

export interface RollDiceResponse {
  roll: DiceRoll
  animation_duration_ms: number
}

export interface SeerAdvice {
  advice: string
  suggestions: string[]
  quick_actions: string[]
  context_aware?: boolean
  response_time_ms: number
  type: string
  fallback?: boolean
}

export interface GameSession {
  id: string
  name: string
  seer_id: string
  adventure_id?: string
  status: string
  current_node_id?: string
  max_players: number
  player_characters: string[]
  turn_order: string[]
  current_turn_index: number
  session_data: Record<string, any>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface CreateSessionRequest {
  name: string
  adventure_id?: string
  max_players: number
}

export interface SessionState {
  session: GameSession
  characters: Character[]
  current_adventure?: any
  recent_rolls: DiceRoll[]
  seer_notes: string
}

export interface PollResult<T> {
  status: 'modified' | 'not_modified' | 'error'
  etag?: string
  data?: T
  cache_hit?: boolean
  error?: string
}

// Character API
export const characterApi = {
  // Get all character class templates
  async getTemplates(): Promise<Record<string, CharacterTemplate>> {
    const response = await api.get('/characters/templates')
    return response.data
  },

  // Get specific character class template
  async getTemplate(characterClass: string): Promise<CharacterTemplate> {
    const response = await api.get(`/characters/templates/${characterClass}`)
    return response.data
  },

  // Preview character before creation
  async previewCharacter(request: CreateCharacterRequest): Promise<CharacterPreview> {
    const response = await api.post('/characters/preview', request)
    return response.data
  },

  // Create a new character
  async createCharacter(request: CreateCharacterRequest): Promise<Character> {
    const response = await api.post('/characters', request)
    return response.data
  },

  // Get user's characters
  async getUserCharacters(): Promise<Character[]> {
    const response = await api.get('/characters')
    return response.data
  },

  // Get specific character
  async getCharacter(characterId: string): Promise<Character> {
    const response = await api.get(`/characters/${characterId}`)
    return response.data
  },

  // Update character HP
  async updateCharacterHP(characterId: string, newHP: number): Promise<Character> {
    const response = await api.put(`/characters/${characterId}/hp`, { new_hp: newHP })
    return response.data
  },

  // Use special ability
  async useSpecialAbility(characterId: string): Promise<Character> {
    const response = await api.post(`/characters/${characterId}/special-ability`)
    return response.data
  },

  // Use heroic save
  async useHeroicSave(characterId: string): Promise<Character> {
    const response = await api.post(`/characters/${characterId}/heroic-save`)
    return response.data
  },

  // Rest character
  async restCharacter(characterId: string): Promise<Character> {
    const response = await api.post(`/characters/${characterId}/rest`)
    return response.data
  }
}

// Dice API
export const diceApi = {
  // Roll dice
  async rollDice(request: RollDiceRequest, sessionId: string): Promise<RollDiceResponse> {
    const response = await api.post('/dice/roll', request, {
      params: { session_id: sessionId }
    })
    return response.data
  },

  // Roll initiative for multiple characters
  async rollInitiative(characterIds: string[], sessionId: string): Promise<Array<{
    character_id: string
    initiative: number
    turn_order: number
  }>> {
    const response = await api.post('/dice/roll/initiative', {
      character_ids: characterIds
    }, {
      params: { session_id: sessionId }
    })
    return response.data
  },

  // Roll attack sequence
  async rollAttack(
    attackerId: string, 
    attackerStat: number,
    defenderId: string,
    defenderStat: number,
    sessionId: string
  ): Promise<any> {
    const response = await api.post('/dice/roll/attack', {
      attacker_id: attackerId,
      attacker_stat: attackerStat,
      defender_id: defenderId,
      defender_stat: defenderStat
    }, {
      params: { session_id: sessionId }
    })
    return response.data
  },

  // Get attack probability
  async getAttackProbability(
    attackerStat: number,
    defenderStat: number,
    attackerDice = 1,
    defenderDice = 1
  ): Promise<{
    success_probability: number
    attacker_expected: number
    defender_expected: number
    advantage: string
  }> {
    const response = await api.get('/dice/probability', {
      params: {
        attacker_stat: attackerStat,
        defender_stat: defenderStat,
        attacker_dice: attackerDice,
        defender_dice: defenderDice
      }
    })
    return response.data
  },

  // Roll skill check
  async rollSkillCheck(
    characterId: string,
    statName: string,
    difficulty: number,
    sessionId: string,
    context = ''
  ): Promise<any> {
    const response = await api.post('/dice/roll/skill-check', {
      character_id: characterId,
      stat_name: statName,
      difficulty,
      context
    }, {
      params: { session_id: sessionId }
    })
    return response.data
  },

  // Get dice performance stats
  async getPerformanceStats(): Promise<{
    total_rolls: number
    avg_time_ms: number
    p95_time_ms: number
    p99_time_ms: number
    max_time_ms: number
    healthy: boolean
    performance_target_ms: number
  }> {
    const response = await api.get('/dice/stats')
    return response.data
  }
}

// AI Seer API
export const aiSeerApi = {
  // Get AI advice for current situation
  async getSeerAdvice(sessionId: string, situation: string, context?: string): Promise<SeerAdvice> {
    const response = await api.post('/ai/advice', {
      session_id: sessionId,
      current_situation: situation,
      additional_context: context
    })
    return response.data
  },

  // Get rule clarification
  async getRuleClarification(question: string, context?: string): Promise<{
    question: string
    rule: string
    example?: string
    guidance?: string
    seer_tip: string
    quick_reference: boolean
    response_time_ms: number
  }> {
    const response = await api.post('/ai/rules', {
      rule_question: question,
      session_context: context
    })
    return response.data
  },

  // Get situation-specific suggestions
  async getSituationSuggestions(situationType: string): Promise<{
    advice: string
    suggestions: string[]
    quick_actions: string[]
    timing: string
  }> {
    const response = await api.get(`/ai/suggestions/${situationType}`)
    return response.data
  },

  // Get quick actions available to Seers
  async getQuickActions(): Promise<Record<string, Array<{
    name: string
    description: string
  }>>> {
    const response = await api.get('/ai/quick-actions')
    return response.data
  },

  // Get AI performance stats
  async getPerformanceStats(): Promise<{
    total_requests: number
    avg_time_s: number
    p95_time_s: number
    max_time_s: number
    healthy: boolean
    performance_target_s: number
    status: string
    features_available: Record<string, boolean>
  }> {
    const response = await api.get('/ai/performance')
    return response.data
  },

  // Submit feedback on AI advice
  async submitFeedback(
    sessionId: string, 
    helpful: boolean, 
    feedbackText?: string
  ): Promise<{
    message: string
    helpful_count: number
    total_feedback: number
    thank_you: string
  }> {
    const response = await api.post('/ai/feedback', {
      session_id: sessionId,
      advice_helpful: helpful,
      feedback_text: feedbackText
    })
    return response.data
  }
}

// Utility functions
export const sparcUtils = {
  // Format stat name for display
  formatStatName(stat: string): string {
    const statNames: Record<string, string> = {
      str: 'Strength',
      dex: 'Dexterity', 
      int: 'Intelligence',
      cha: 'Charisma'
    }
    return statNames[stat.toLowerCase()] || stat.toUpperCase()
  },

  // Format character class for display
  formatClassName(className: string): string {
    return className.charAt(0).toUpperCase() + className.slice(1)
  },

  // Calculate HP percentage for health display
  calculateHPPercentage(current: number, max: number): number {
    return Math.round((current / max) * 100)
  },

  // Get HP status color for UI
  getHPStatusColor(percentage: number): string {
    if (percentage > 75) return 'text-green-600'
    if (percentage > 50) return 'text-yellow-600'
    if (percentage > 25) return 'text-orange-600'
    return 'text-red-600'
  },

  // Format dice roll results for display
  formatDiceResults(results: number[]): string {
    if (results.length === 1) {
      return `Rolled ${results[0]}`
    }
    return `Rolled [${results.join(', ')}] = ${results.reduce((a, b) => a + b, 0)}`
  },

  // Calculate time since roll for display
  formatTimeSince(timestamp: string): string {
    const now = new Date()
    const rollTime = new Date(timestamp)
    const diffMs = now.getTime() - rollTime.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
    return `${Math.floor(diffSecs / 3600)}h ago`
  }
}

// Session API
export const sessionApi = {
  // Create a new session
  async createSession(request: CreateSessionRequest): Promise<GameSession> {
    const response = await api.post('/sessions', request)
    return response.data.session
  },

  // Get user's sessions
  async getUserSessions(includeCompleted = false): Promise<GameSession[]> {
    const response = await api.get('/sessions', {
      params: { include_completed: includeCompleted }
    })
    return response.data.sessions
  },

  // Get specific session
  async getSession(sessionId: string): Promise<GameSession> {
    const response = await api.get(`/sessions/${sessionId}`)
    return response.data
  },

  // Get complete session state
  async getSessionState(sessionId: string): Promise<SessionState> {
    const response = await api.get(`/sessions/${sessionId}/state`)
    return response.data
  },

  // Join session with character
  async joinSession(sessionId: string, characterId: string): Promise<{
    session: GameSession
    character: Character
  }> {
    const response = await api.post(`/sessions/${sessionId}/join`, {
      character_id: characterId
    })
    return {
      session: response.data.session,
      character: response.data.character
    }
  },

  // Leave session
  async leaveSession(sessionId: string, characterId: string): Promise<GameSession> {
    const response = await api.post(`/sessions/${sessionId}/leave`, {
      character_id: characterId
    })
    return response.data.session
  },

  // Start session (Seer only)
  async startSession(sessionId: string): Promise<GameSession> {
    const response = await api.post(`/sessions/${sessionId}/start`)
    return response.data.session
  },

  // Advance to next turn (Seer only)
  async nextTurn(sessionId: string): Promise<{
    session: GameSession
    currentCharacterId?: string
    turnNumber: number
  }> {
    const response = await api.post(`/sessions/${sessionId}/next-turn`)
    return {
      session: response.data.session,
      currentCharacterId: response.data.current_character_id,
      turnNumber: response.data.turn_number
    }
  },

  // Pause session (Seer only)
  async pauseSession(sessionId: string): Promise<GameSession> {
    const response = await api.post(`/sessions/${sessionId}/pause`)
    return response.data.session
  },

  // Resume session (Seer only)
  async resumeSession(sessionId: string): Promise<GameSession> {
    const response = await api.post(`/sessions/${sessionId}/resume`)
    return response.data.session
  },

  // End session (Seer only)
  async endSession(sessionId: string): Promise<GameSession> {
    const response = await api.post(`/sessions/${sessionId}/end`)
    return response.data.session
  }
}

// Polling API for real-time updates
export const pollingApi = {
  // Poll session state with ETag caching
  async pollSessionState(sessionId: string, etag?: string): Promise<PollResult<SessionState>> {
    try {
      const headers: Record<string, string> = {}
      if (etag) {
        headers['If-None-Match'] = etag
      }

      const response = await api.get(`/polling/session/${sessionId}/state`, { headers })
      
      return {
        status: 'modified',
        etag: response.data._meta?.etag,
        data: response.data,
        cache_hit: response.data._meta?.cache_hit || false
      }
    } catch (error: any) {
      if (error.response?.status === 304) {
        return {
          status: 'not_modified',
          etag: etag,
          cache_hit: true
        }
      }
      return {
        status: 'error',
        error: error.message
      }
    }
  },

  // Poll dice activity
  async pollDiceActivity(sessionId: string, since?: string, etag?: string): Promise<PollResult<any>> {
    try {
      const headers: Record<string, string> = {}
      if (etag) {
        headers['If-None-Match'] = etag
      }

      const params: Record<string, string> = {}
      if (since) {
        params.since = since
      }

      const response = await api.get(`/polling/session/${sessionId}/dice`, { 
        headers, 
        params 
      })
      
      return {
        status: 'modified',
        etag: response.data._meta?.etag,
        data: response.data,
        cache_hit: response.data._meta?.cache_hit || false
      }
    } catch (error: any) {
      if (error.response?.status === 304) {
        return {
          status: 'not_modified',
          etag: etag,
          cache_hit: true
        }
      }
      return {
        status: 'error',
        error: error.message
      }
    }
  },

  // Get recommended polling intervals
  async getPollingIntervals(sessionId: string): Promise<Record<string, number>> {
    const response = await api.get(`/polling/session/${sessionId}/intervals`)
    return response.data.intervals_ms
  }
}