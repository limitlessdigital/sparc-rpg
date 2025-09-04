import { useState, useEffect, useRef, useCallback } from 'react'

interface PollingOptions {
  interval?: number
  enabled?: boolean
  pauseOnHidden?: boolean
  retryOnError?: boolean
  maxRetries?: number
  backoffMultiplier?: number
}

interface PollingState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  lastUpdate: Date | null
  retryCount: number
}

interface UsePollingResult<T> extends PollingState<T> {
  refetch: () => Promise<void>
  pause: () => void
  resume: () => void
  isPaused: boolean
  isActive: boolean
  resetError: () => void
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: PollingOptions = {}
): UsePollingResult<T> {
  const {
    interval = 1000,
    enabled = true,
    pauseOnHidden = true,
    retryOnError = true,
    maxRetries = 3,
    backoffMultiplier = 2
  } = options

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
    retryCount: 0
  })

  const [isPaused, setIsPaused] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Track tab visibility
  useEffect(() => {
    if (!pauseOnHidden) return

    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [pauseOnHidden])

  const isActive = enabled && !isPaused && (!pauseOnHidden || isTabVisible)

  const fetchData = useCallback(async () => {
    if (!isActive || isActiveRef.current) return

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isActiveRef.current = true

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await fetcher()
      
      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null,
        lastUpdate: new Date(),
        retryCount: 0
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setState(prev => {
        const newRetryCount = prev.retryCount + 1
        
        // If we should retry and haven't exceeded max retries
        if (retryOnError && newRetryCount <= maxRetries) {
          // Schedule retry with exponential backoff
          setTimeout(() => {
            if (isActive) {
              fetchData()
            }
          }, interval * Math.pow(backoffMultiplier, newRetryCount - 1))
        }

        return {
          ...prev,
          isLoading: false,
          error: errorMessage,
          retryCount: newRetryCount
        }
      })
    } finally {
      isActiveRef.current = false
      abortControllerRef.current = null
    }
  }, [isActive, fetcher, interval, retryOnError, maxRetries, backoffMultiplier])

  // Main polling effect
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial fetch
    fetchData()

    // Set up polling interval
    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isActive, fetchData, interval])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }))
  }, [])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch,
    pause,
    resume,
    isPaused,
    isActive,
    resetError
  }
}

// Specialized hook for SPARC game session polling
export function useSessionPolling(sessionId: string | null, options: PollingOptions = {}) {
  const fetcher = useCallback(async () => {
    if (!sessionId) return null

    const response = await fetch(`/api/sparc/sessions/${sessionId}`)
    if (!response.ok) {
      throw new Error(`Session fetch failed: ${response.statusText}`)
    }
    return response.json()
  }, [sessionId])

  return usePolling(fetcher, {
    interval: 2000, // 2 second intervals for session state
    enabled: Boolean(sessionId),
    pauseOnHidden: true,
    retryOnError: true,
    ...options
  })
}

// Specialized hook for dice roll polling (performance critical)
export function useDicePolling(sessionId: string | null, options: PollingOptions = {}) {
  const fetcher = useCallback(async () => {
    if (!sessionId) return null

    const response = await fetch(`/api/sparc/dice/recent/${sessionId}`)
    if (!response.ok) {
      throw new Error(`Dice fetch failed: ${response.statusText}`)
    }
    return response.json()
  }, [sessionId])

  return usePolling(fetcher, {
    interval: 500, // 500ms intervals for dice rolls to meet <100ms P95 requirement
    enabled: Boolean(sessionId),
    pauseOnHidden: true,
    retryOnError: true,
    maxRetries: 2,
    ...options
  })
}

// Specialized hook for character updates
export function useCharacterPolling(characterIds: string[] = [], options: PollingOptions = {}) {
  const fetcher = useCallback(async () => {
    if (!characterIds.length) return null

    const response = await fetch('/api/sparc/characters/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character_ids: characterIds })
    })
    
    if (!response.ok) {
      throw new Error(`Character fetch failed: ${response.statusText}`)
    }
    return response.json()
  }, [characterIds])

  return usePolling(fetcher, {
    interval: 3000, // 3 second intervals for character updates
    enabled: characterIds.length > 0,
    pauseOnHidden: true,
    retryOnError: true,
    ...options
  })
}

// Hook for AI Seer performance polling
export function useAIPerformancePolling(options: PollingOptions = {}) {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/sparc/ai/performance')
    if (!response.ok) {
      throw new Error(`AI performance fetch failed: ${response.statusText}`)
    }
    return response.json()
  }, [])

  return usePolling(fetcher, {
    interval: 10000, // 10 second intervals for performance monitoring
    pauseOnHidden: false, // Keep monitoring even when tab is hidden
    retryOnError: true,
    ...options
  })
}

// Hook for adventure progress polling
export function useAdventureProgressPolling(sessionId: string | null, options: PollingOptions = {}) {
  const fetcher = useCallback(async () => {
    if (!sessionId) return null

    const response = await fetch(`/api/adventure/progress/${sessionId}`)
    if (!response.ok) {
      throw new Error(`Adventure progress fetch failed: ${response.statusText}`)
    }
    return response.json()
  }, [sessionId])

  return usePolling(fetcher, {
    interval: 5000, // 5 second intervals for adventure progress
    enabled: Boolean(sessionId),
    pauseOnHidden: true,
    retryOnError: true,
    ...options
  })
}