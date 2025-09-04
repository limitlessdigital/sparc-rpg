import { useState, useEffect, useCallback, useRef } from 'react'

interface AISeerRequest {
  query: string
  context: any
  request_type: string
  max_response_time_ms: number
}

interface AISeerResponse {
  success: boolean
  advice: {
    type: string
    title: string
    content: string
    context?: string
    confidence?: number
    relevant_rules?: string[]
    follow_up_suggestions?: string[]
  }
  response_time_ms: number
  error?: string
}

interface UseAISeerAdviceProps {
  gameContext?: any
  autoRefreshInterval?: number
  maxRetries?: number
}

export const useAISeerAdvice = ({
  gameContext,
  autoRefreshInterval = 30000, // 30 seconds
  maxRetries = 2
}: UseAISeerAdviceProps = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null)
  const [requestQueue, setRequestQueue] = useState<AISeerRequest[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  // Performance tracking
  const [performanceStats, setPerformanceStats] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    failureRate: 0,
    sub3SecondRate: 0
  })

  const updatePerformanceStats = useCallback((responseTime: number, success: boolean) => {
    setPerformanceStats(prev => {
      const newTotal = prev.totalRequests + 1
      const newAverage = ((prev.averageResponseTime * prev.totalRequests) + responseTime) / newTotal
      const failures = success ? prev.failureRate * prev.totalRequests : (prev.failureRate * prev.totalRequests) + 1
      const sub3Second = (responseTime < 3000 && success) ? 
        (prev.sub3SecondRate * prev.totalRequests) + 1 : 
        prev.sub3SecondRate * prev.totalRequests

      return {
        totalRequests: newTotal,
        averageResponseTime: newAverage,
        failureRate: failures / newTotal,
        sub3SecondRate: sub3Second / newTotal
      }
    })
  }, [])

  const makeRequest = useCallback(async (request: AISeerRequest): Promise<AISeerResponse> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const startTime = Date.now()

    try {
      const response = await fetch('/api/ai/seer-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setLastResponseTime(responseTime)
      updatePerformanceStats(responseTime, data.success)
      retryCountRef.current = 0 // Reset retry count on success

      return {
        ...data,
        response_time_ms: responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      updatePerformanceStats(responseTime, false)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request cancelled')
      }

      throw error
    }
  }, [updatePerformanceStats])

  const requestAdvice = useCallback(async (
    query: string,
    requestType: string = 'general',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<AISeerResponse> => {
    const request: AISeerRequest = {
      query,
      context: gameContext,
      request_type: requestType,
      max_response_time_ms: 3000
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await makeRequest(request)
      
      if (!response.success) {
        throw new Error(response.error || 'AI request failed')
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Retry logic for high priority requests or network errors
      if ((priority === 'high' || errorMessage.includes('network')) && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(`Retrying AI request (attempt ${retryCountRef.current}/${maxRetries})`)
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCountRef.current) * 500))
        
        return requestAdvice(query, requestType, priority)
      }

      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [gameContext, makeRequest, maxRetries])

  const requestContextualSuggestions = useCallback(async (
    suggestionTypes: string[] = ['scene_guidance', 'player_help'],
    maxSuggestions: number = 4
  ) => {
    try {
      const response = await fetch('/api/ai/contextual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: gameContext,
          suggestion_types: suggestionTypes,
          max_suggestions: maxSuggestions
        })
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to get suggestions')
      }

      return data.suggestions
    } catch (error) {
      console.error('Failed to get contextual suggestions:', error)
      return []
    }
  }, [gameContext])

  const requestRuleClarification = useCallback(async (
    query: string,
    category?: string
  ): Promise<any> => {
    try {
      const response = await fetch('/api/ai/rule-clarification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: gameContext,
          category,
          max_response_time_ms: 3000
        })
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to get rule clarification')
      }

      return data.clarification
    } catch (error) {
      console.error('Failed to get rule clarification:', error)
      throw error
    }
  }, [gameContext])

  // Queue management for batch requests
  const addToQueue = useCallback((request: AISeerRequest) => {
    setRequestQueue(prev => [...prev, request])
  }, [])

  const processQueue = useCallback(async () => {
    if (isProcessingQueue || requestQueue.length === 0) return

    setIsProcessingQueue(true)
    const responses = []

    try {
      // Process requests in batches to avoid overwhelming the service
      const batchSize = 3
      for (let i = 0; i < requestQueue.length; i += batchSize) {
        const batch = requestQueue.slice(i, i + batchSize)
        const batchPromises = batch.map(req => makeRequest(req).catch(err => ({ error: err.message })))
        
        const batchResults = await Promise.allSettled(batchPromises)
        responses.push(...batchResults)
        
        // Small delay between batches
        if (i + batchSize < requestQueue.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      setRequestQueue([]) // Clear the queue
      return responses
    } finally {
      setIsProcessingQueue(false)
    }
  }, [isProcessingQueue, requestQueue, makeRequest])

  // Auto-process queue when it has items
  useEffect(() => {
    if (requestQueue.length > 0 && !isProcessingQueue) {
      const timer = setTimeout(processQueue, 1000) // Process after 1 second
      return () => clearTimeout(timer)
    }
  }, [requestQueue, isProcessingQueue, processQueue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Performance monitoring
  const isPerformingWell = lastResponseTime !== null && lastResponseTime < 3000
  const performanceStatus = {
    responseTime: lastResponseTime,
    isUnderTarget: isPerformingWell,
    averageResponseTime: performanceStats.averageResponseTime,
    successRate: 1 - performanceStats.failureRate,
    sub3SecondRate: performanceStats.sub3SecondRate,
    totalRequests: performanceStats.totalRequests
  }

  return {
    // Core functionality
    requestAdvice,
    requestContextualSuggestions,
    requestRuleClarification,
    
    // Queue management
    addToQueue,
    processQueue,
    queueLength: requestQueue.length,
    isProcessingQueue,
    
    // State
    isLoading,
    error,
    lastResponseTime,
    
    // Performance monitoring
    performanceStats,
    performanceStatus,
    isPerformingWell,
    
    // Utilities
    clearError: () => setError(null),
    cancelRequest: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        setIsLoading(false)
      }
    }
  }
}