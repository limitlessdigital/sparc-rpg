/**
 * SPARC API Client with optimized polling and performance monitoring
 * Integrates with existing Archon HTTP polling infrastructure
 */

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
  response_time_ms?: number
}

interface SessionState {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  seer_id: string
  players: any[]
  current_scene?: string
  created_at: string
  updated_at: string
}

interface DiceRoll {
  id: string
  session_id: string
  character_id: string
  roll_type: string
  dice_count: number
  dice_sides: number
  modifier: number
  result: number
  individual_rolls: number[]
  difficulty: number
  success: boolean
  timestamp: string
  response_time_ms: number
}

interface Character {
  id: string
  user_id: string
  name: string
  character_class: string
  stats: Record<string, number>
  current_hp: number
  max_hp: number
  special_ability_available: boolean
  heroic_saves_available: number
  equipment: string[]
  background: string
  created_at: string
  updated_at: string
}

interface AdventureProgress {
  session_id: string
  adventure_id: string
  current_scene_id: string
  completed_scenes: string[]
  total_progress_points: number
  confidence_score: number
  time_spent_minutes: number
  is_completed: boolean
}

class SPARCApiClient {
  private baseUrl: string
  private cache: Map<string, { data: any; etag: string; timestamp: number }>
  private performanceMetrics: {
    totalRequests: number
    averageResponseTime: number
    sub100msRate: number // For dice rolls
    sub3sRate: number // For AI requests
    errorRate: number
  }

  constructor(baseUrl: string = '/api/sparc') {
    this.baseUrl = baseUrl
    this.cache = new Map()
    this.performanceMetrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      sub100msRate: 0,
      sub3sRate: 0,
      errorRate: 0
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now()
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = `${url}:${JSON.stringify(options)}`

    try {
      // Check cache first for GET requests
      if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE' && useCache) {
        const cached = this.cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
          return {
            success: true,
            data: cached.data,
            timestamp: new Date().toISOString(),
            response_time_ms: 1 // Cache hit
          }
        }
      }

      // Add ETag header for cache validation
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      } as Record<string, string>

      const cached = this.cache.get(cacheKey)
      if (cached?.etag) {
        headers['If-None-Match'] = cached.etag
      }

      const response = await fetch(url, {
        ...options,
        headers
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      // Handle 304 Not Modified
      if (response.status === 304 && cached) {
        this._updatePerformanceMetrics(responseTime, true)
        return {
          success: true,
          data: cached.data,
          timestamp: new Date().toISOString(),
          response_time_ms: responseTime
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache successful GET responses with ETag
      if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        const etag = response.headers.get('etag')
        if (etag) {
          this.cache.set(cacheKey, {
            data,
            etag,
            timestamp: Date.now()
          })
        }
      }

      this._updatePerformanceMetrics(responseTime, true)

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime
      }

    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      this._updatePerformanceMetrics(responseTime, false)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime
      }
    }
  }

  private _updatePerformanceMetrics(responseTime: number, success: boolean) {
    const prevTotal = this.performanceMetrics.totalRequests
    const newTotal = prevTotal + 1

    // Update average response time
    this.performanceMetrics.averageResponseTime = (
      (this.performanceMetrics.averageResponseTime * prevTotal) + responseTime
    ) / newTotal

    // Update sub-100ms rate (for dice rolls)
    if (responseTime < 100 && success) {
      this.performanceMetrics.sub100msRate = (
        (this.performanceMetrics.sub100msRate * prevTotal) + 1
      ) / newTotal
    } else {
      this.performanceMetrics.sub100msRate = (
        this.performanceMetrics.sub100msRate * prevTotal
      ) / newTotal
    }

    // Update sub-3s rate (for AI requests)
    if (responseTime < 3000 && success) {
      this.performanceMetrics.sub3sRate = (
        (this.performanceMetrics.sub3sRate * prevTotal) + 1
      ) / newTotal
    } else {
      this.performanceMetrics.sub3sRate = (
        this.performanceMetrics.sub3sRate * prevTotal
      ) / newTotal
    }

    // Update error rate
    if (!success) {
      this.performanceMetrics.errorRate = (
        (this.performanceMetrics.errorRate * prevTotal) + 1
      ) / newTotal
    } else {
      this.performanceMetrics.errorRate = (
        this.performanceMetrics.errorRate * prevTotal
      ) / newTotal
    }

    this.performanceMetrics.totalRequests = newTotal
  }

  // Session Management
  async getSession(sessionId: string): Promise<ApiResponse<SessionState>> {
    return this.request<SessionState>(`/sessions/${sessionId}`)
  }

  async createSession(sessionData: Partial<SessionState>): Promise<ApiResponse<SessionState>> {
    return this.request<SessionState>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }, false)
  }

  async updateSession(sessionId: string, updates: Partial<SessionState>): Promise<ApiResponse<SessionState>> {
    return this.request<SessionState>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, false)
  }

  // Dice Rolling (Performance Critical - <100ms P95)
  async rollDice(params: {
    session_id: string
    character_id: string
    dice_count: number
    dice_sides: number
    modifier?: number
    difficulty?: number
    roll_type?: string
  }): Promise<ApiResponse<DiceRoll>> {
    return this.request<DiceRoll>('/dice/roll', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async getRecentDiceRolls(sessionId: string, limit: number = 10): Promise<ApiResponse<DiceRoll[]>> {
    return this.request<DiceRoll[]>(`/dice/recent/${sessionId}?limit=${limit}`)
  }

  async getDiceStatistics(sessionId: string): Promise<ApiResponse<any>> {
    return this.request(`/dice/stats/${sessionId}`)
  }

  // Character Management
  async getCharacter(characterId: string): Promise<ApiResponse<Character>> {
    return this.request<Character>(`/characters/${characterId}`)
  }

  async getCharactersBatch(characterIds: string[]): Promise<ApiResponse<Character[]>> {
    return this.request<Character[]>('/characters/batch', {
      method: 'POST',
      body: JSON.stringify({ character_ids: characterIds })
    })
  }

  async createCharacter(characterData: Partial<Character>): Promise<ApiResponse<Character>> {
    return this.request<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData)
    }, false)
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<ApiResponse<Character>> {
    return this.request<Character>(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, false)
  }

  // AI Seer Integration
  async getAIAdvice(params: {
    query: string
    context: any
    request_type: string
    max_response_time_ms?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/ai/seer-advice', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async getContextualSuggestions(params: {
    context: any
    suggestion_types: string[]
    max_suggestions?: number
  }): Promise<ApiResponse<any[]>> {
    return this.request('/ai/contextual-suggestions', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async getRuleClarification(params: {
    query: string
    context?: any
    category?: string
    max_response_time_ms?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/ai/rule-clarification', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  // Adventure System
  async startAdventure(params: {
    adventure_id: string
    session_id?: string
    player_count?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/adventure/start', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async getAdventureProgress(sessionId: string): Promise<ApiResponse<AdventureProgress>> {
    return this.request<AdventureProgress>(`/adventure/progress/${sessionId}`)
  }

  async processSceneAction(sessionId: string, params: {
    action_taken: string
    dice_results?: any
    player_narrative?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/adventure/scene/${sessionId}/action`, {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async getAdventureTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('/adventure/templates')
  }

  // Tutorial System
  async startTutorial(params: { user_id?: string }): Promise<ApiResponse<any>> {
    return this.request('/tutorial/seer/start', {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  async advanceTutorialStep(step: string, params: {
    step_data?: any
    user_id?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/tutorial/seer/step/${step}`, {
      method: 'POST',
      body: JSON.stringify(params)
    }, false)
  }

  // Performance Monitoring
  async getPerformanceStats(): Promise<ApiResponse<any>> {
    return this.request('/performance')
  }

  getClientPerformanceStats() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.cache.size,
      sub100msRateFormatted: `${(this.performanceMetrics.sub100msRate * 100).toFixed(1)}%`,
      sub3sRateFormatted: `${(this.performanceMetrics.sub3sRate * 100).toFixed(1)}%`,
      errorRateFormatted: `${(this.performanceMetrics.errorRate * 100).toFixed(1)}%`,
      averageResponseTimeFormatted: `${this.performanceMetrics.averageResponseTime.toFixed(1)}ms`
    }
  }

  // Cache Management
  clearCache() {
    this.cache.clear()
  }

  invalidateCachePattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health')
  }
}

// Global instance
export const sparcApi = new SPARCApiClient()

// Re-export types for convenience
export type {
  ApiResponse,
  SessionState,
  DiceRoll,
  Character,
  AdventureProgress
}