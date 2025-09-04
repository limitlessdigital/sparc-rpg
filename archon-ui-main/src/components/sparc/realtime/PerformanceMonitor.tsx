import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Activity,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAIPerformancePolling } from '@/hooks/useSPARCPolling'
import { sparcApi } from '@/services/sparcApiClient'

interface PerformanceMetrics {
  diceRolls: {
    averageMs: number
    p95Ms: number
    sub100msRate: number
    totalRolls: number
  }
  aiResponses: {
    averageMs: number
    p95Ms: number
    sub3sRate: number
    totalRequests: number
  }
  polling: {
    activeConnections: number
    cacheHitRate: number
    errorRate: number
    pausedConnections: number
  }
  system: {
    uptime: number
    health: string
    lastUpdate: string
  }
}

const PerformanceMonitor: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: serverMetrics, error } = useAIPerformancePolling({
    interval: 5000,
    pauseOnHidden: false
  })

  const clientMetrics = sparcApi.getClientPerformanceStats()

  const getDicePerformanceStatus = (p95Ms: number) => {
    if (p95Ms < 50) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (p95Ms < 100) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (p95Ms < 200) return { status: 'acceptable', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const getAIPerformanceStatus = (avgMs: number, sub3sRate: number) => {
    if (avgMs < 1500 && sub3sRate > 0.95) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (avgMs < 2500 && sub3sRate > 0.85) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (avgMs < 3000 && sub3sRate > 0.7) return { status: 'acceptable', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const formatUptime = (uptimeHours: number) => {
    if (uptimeHours < 1) return `${Math.round(uptimeHours * 60)}m`
    if (uptimeHours < 24) return `${Math.round(uptimeHours)}h`
    return `${Math.round(uptimeHours / 24)}d`
  }

  if (!isExpanded) {
    // Compact view
    return (
      <Card className="w-80">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm">Performance</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Dice Performance Indicator */}
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-600" />
                <Badge variant="outline" className="text-xs">
                  {clientMetrics.sub100msRateFormatted}
                </Badge>
              </div>
              
              {/* AI Performance Indicator */}
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-purple-600" />
                <Badge variant="outline" className="text-xs">
                  {clientMetrics.sub3sRateFormatted}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-red-600 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Monitoring offline
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Expanded view
  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Performance Monitor</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dice Rolling Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Dice Performance</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Target: &lt;100ms P95
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Sub-100ms Rate</span>
              <span className="font-medium">{clientMetrics.sub100msRateFormatted}</span>
            </div>
            <Progress 
              value={clientMetrics.sub100msRate * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Avg: {clientMetrics.averageResponseTimeFormatted}</span>
              <span>Requests: {clientMetrics.totalRequests}</span>
            </div>
          </div>
        </div>

        {/* AI Response Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm">AI Performance</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              Target: &lt;3s
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Sub-3s Rate</span>
              <span className="font-medium">{clientMetrics.sub3sRateFormatted}</span>
            </div>
            <Progress 
              value={clientMetrics.sub3sRate * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Avg: {clientMetrics.averageResponseTimeFormatted}</span>
              <span>Cache: {clientMetrics.cacheSize} entries</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm">System Health</span>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rate</span>
                  <span className={clientMetrics.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'}>
                    {clientMetrics.errorRateFormatted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requests</span>
                  <span>{clientMetrics.totalRequests}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Size</span>
                  <span>{clientMetrics.cacheSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {error ? 'Offline' : 'Online'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Server Metrics (if available) */}
        {serverMetrics && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">Server Metrics</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span>Health Status</span>
                <Badge variant="outline" className={serverMetrics.healthy ? 'text-green-600' : 'text-red-600'}>
                  {serverMetrics.status || (serverMetrics.healthy ? 'Healthy' : 'Degraded')}
                </Badge>
              </div>
              {serverMetrics.average_response_time_ms && (
                <div className="flex justify-between">
                  <span>Server Avg Response</span>
                  <span>{Math.round(serverMetrics.average_response_time_ms)}ms</span>
                </div>
              )}
              {serverMetrics.total_requests && (
                <div className="flex justify-between">
                  <span>Server Requests</span>
                  <span>{serverMetrics.total_requests}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sparcApi.clearCache()}
            className="flex-1"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Clear Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Reload
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Monitoring Error</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Performance targets: Dice &lt;100ms P95, AI &lt;3s, Uptime &gt;99.5%
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformanceMonitor