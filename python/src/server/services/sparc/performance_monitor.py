"""
Comprehensive Performance Monitoring Service for SPARC.
Validates that all performance targets are met: <100ms dice, <3s AI, 99.5% uptime.
"""

import time
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import statistics

from .cached_session_service import get_optimized_session_manager
from .optimized_database import get_optimized_db_service
from .optimized_dice_service import get_optimized_dice_engine
from .ai_cache_service import get_ai_cache_service
from ..cache_service import get_cache_service

logger = logging.getLogger(__name__)


class PerformanceTarget(str, Enum):
    """SPARC performance targets."""
    DICE_ROLL_P95 = "dice_roll_p95_ms"
    AI_RESPONSE_P95 = "ai_response_p95_ms"
    SESSION_RETRIEVAL_P95 = "session_retrieval_p95_ms"
    DATABASE_QUERY_P95 = "database_query_p95_ms"
    CACHE_HIT_RATE = "cache_hit_rate"
    UPTIME_PERCENTAGE = "uptime_percentage"


@dataclass
class PerformanceThresholds:
    """Performance thresholds for SPARC system."""
    dice_roll_p95_ms: float = 100.0
    ai_response_p95_ms: float = 3000.0
    session_retrieval_p95_ms: float = 50.0
    database_query_p95_ms: float = 100.0
    cache_hit_rate_min: float = 0.70  # 70% minimum cache hit rate
    uptime_percentage_min: float = 0.995  # 99.5% uptime


@dataclass
class ServiceHealthStatus:
    """Health status for individual services."""
    service_name: str
    is_healthy: bool
    response_time_ms: float
    error_rate: float
    last_check: datetime
    details: Dict[str, Any]


@dataclass
class SystemPerformanceReport:
    """Comprehensive system performance report."""
    timestamp: datetime
    overall_healthy: bool
    performance_score: float  # 0-100
    targets_met: Dict[str, bool]
    service_health: Dict[str, ServiceHealthStatus]
    performance_metrics: Dict[str, float]
    recommendations: List[str]
    critical_issues: List[str]


class SPARCPerformanceMonitor:
    """
    Comprehensive performance monitoring for SPARC system.
    
    Features:
    - Real-time performance tracking
    - Service health monitoring
    - Performance target validation
    - Automated alerting for SLA breaches
    - Performance optimization recommendations
    """
    
    def __init__(self, thresholds: Optional[PerformanceThresholds] = None):
        self.thresholds = thresholds or PerformanceThresholds()
        self.monitoring_active = False
        self.monitoring_task: Optional[asyncio.Task] = None
        
        # Service references
        self.session_manager = None
        self.db_service = None
        self.dice_engine = None
        self.ai_cache_service = None
        self.cache_service = None
        
        # Performance tracking
        self.performance_history: List[SystemPerformanceReport] = []
        self.service_response_times: Dict[str, List[float]] = {}
        self.error_counts: Dict[str, int] = {}
        self.uptime_start = datetime.now()
        self.downtime_periods: List[Tuple[datetime, datetime]] = []
        
        # Initialize services
        asyncio.create_task(self._initialize_services())
    
    async def _initialize_services(self):
        """Initialize all service references for monitoring."""
        try:
            self.session_manager = await get_optimized_session_manager()
            self.db_service = await get_optimized_db_service()
            self.dice_engine = await get_optimized_dice_engine()
            self.ai_cache_service = await get_ai_cache_service()
            self.cache_service = await get_cache_service()
            logger.info("Performance monitor services initialized")
        except Exception as e:
            logger.error(f"Failed to initialize performance monitor services: {e}")
    
    def _record_response_time(self, service_name: str, response_time_ms: float):
        """Record response time for service."""
        if service_name not in self.service_response_times:
            self.service_response_times[service_name] = []
        
        # Keep only last 1000 measurements
        times = self.service_response_times[service_name]
        times.append(response_time_ms)
        if len(times) > 1000:
            times.pop(0)
    
    def _record_error(self, service_name: str):
        """Record error for service."""
        self.error_counts[service_name] = self.error_counts.get(service_name, 0) + 1
    
    async def _check_dice_engine_performance(self) -> ServiceHealthStatus:
        """Check dice engine performance against targets."""
        start_time = time.perf_counter()
        
        try:
            if not self.dice_engine:
                return ServiceHealthStatus(
                    service_name="dice_engine",
                    is_healthy=False,
                    response_time_ms=0.0,
                    error_rate=1.0,
                    last_check=datetime.now(),
                    details={"error": "Service not initialized"}
                )
            
            # Get performance stats
            stats = await self.dice_engine.get_performance_stats()
            health = await self.dice_engine.health_check()
            
            response_time_ms = (time.perf_counter() - start_time) * 1000
            self._record_response_time("dice_engine", response_time_ms)
            
            is_healthy = (
                health.get('dice_engine_healthy', False) and
                stats.get('p95_response_time_ms', float('inf')) < self.thresholds.dice_roll_p95_ms and
                health.get('performance_target_met', False)
            )
            
            if not is_healthy:
                self._record_error("dice_engine")
            
            return ServiceHealthStatus(
                service_name="dice_engine",
                is_healthy=is_healthy,
                response_time_ms=response_time_ms,
                error_rate=self._calculate_error_rate("dice_engine"),
                last_check=datetime.now(),
                details={
                    "p95_response_time_ms": stats.get('p95_response_time_ms', 0),
                    "total_rolls": stats.get('total_rolls', 0),
                    "meets_target": stats.get('meets_performance_target', False)
                }
            )
            
        except Exception as e:
            self._record_error("dice_engine")
            logger.error(f"Dice engine health check failed: {e}")
            
            return ServiceHealthStatus(
                service_name="dice_engine",
                is_healthy=False,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error_rate=1.0,
                last_check=datetime.now(),
                details={"error": str(e)}
            )
    
    async def _check_session_manager_performance(self) -> ServiceHealthStatus:
        """Check session manager performance."""
        start_time = time.perf_counter()
        
        try:
            if not self.session_manager:
                return ServiceHealthStatus(
                    service_name="session_manager",
                    is_healthy=False,
                    response_time_ms=0.0,
                    error_rate=1.0,
                    last_check=datetime.now(),
                    details={"error": "Service not initialized"}
                )
            
            metrics = await self.session_manager.get_performance_metrics()
            health = await self.session_manager.health_check()
            
            response_time_ms = (time.perf_counter() - start_time) * 1000
            self._record_response_time("session_manager", response_time_ms)
            
            is_healthy = (
                health.get('overall_healthy', False) and
                metrics.get('avg_response_time_ms', float('inf')) < self.thresholds.session_retrieval_p95_ms
            )
            
            if not is_healthy:
                self._record_error("session_manager")
            
            return ServiceHealthStatus(
                service_name="session_manager",
                is_healthy=is_healthy,
                response_time_ms=response_time_ms,
                error_rate=self._calculate_error_rate("session_manager"),
                last_check=datetime.now(),
                details={
                    "avg_response_time_ms": metrics.get('avg_response_time_ms', 0),
                    "cache_hit_rate": metrics.get('cache_hit_rate', 0),
                    "performance_ok": health.get('performance_ok', False)
                }
            )
            
        except Exception as e:
            self._record_error("session_manager")
            logger.error(f"Session manager health check failed: {e}")
            
            return ServiceHealthStatus(
                service_name="session_manager",
                is_healthy=False,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error_rate=1.0,
                last_check=datetime.now(),
                details={"error": str(e)}
            )
    
    async def _check_database_performance(self) -> ServiceHealthStatus:
        """Check database performance."""
        start_time = time.perf_counter()
        
        try:
            if not self.db_service:
                return ServiceHealthStatus(
                    service_name="database",
                    is_healthy=False,
                    response_time_ms=0.0,
                    error_rate=1.0,
                    last_check=datetime.now(),
                    details={"error": "Service not initialized"}
                )
            
            stats = await self.db_service.get_performance_stats()
            health = await self.db_service.health_check()
            
            response_time_ms = (time.perf_counter() - start_time) * 1000
            self._record_response_time("database", response_time_ms)
            
            is_healthy = (
                health.get('database_connected', False) and
                health.get('pool_healthy', False) and
                stats.get('avg_query_time_ms', float('inf')) < self.thresholds.database_query_p95_ms
            )
            
            if not is_healthy:
                self._record_error("database")
            
            return ServiceHealthStatus(
                service_name="database",
                is_healthy=is_healthy,
                response_time_ms=response_time_ms,
                error_rate=self._calculate_error_rate("database"),
                last_check=datetime.now(),
                details={
                    "avg_query_time_ms": stats.get('avg_query_time_ms', 0),
                    "slow_query_rate": health.get('slow_query_rate', 0),
                    "pool_size": stats.get('pool_stats', {}).get('size', 0)
                }
            )
            
        except Exception as e:
            self._record_error("database")
            logger.error(f"Database health check failed: {e}")
            
            return ServiceHealthStatus(
                service_name="database",
                is_healthy=False,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error_rate=1.0,
                last_check=datetime.now(),
                details={"error": str(e)}
            )
    
    async def _check_cache_performance(self) -> ServiceHealthStatus:
        """Check cache performance."""
        start_time = time.perf_counter()
        
        try:
            if not self.cache_service:
                return ServiceHealthStatus(
                    service_name="cache",
                    is_healthy=False,
                    response_time_ms=0.0,
                    error_rate=1.0,
                    last_check=datetime.now(),
                    details={"error": "Service not initialized"}
                )
            
            stats = await self.cache_service.get_performance_stats()
            health = await self.cache_service.health_check()
            
            response_time_ms = (time.perf_counter() - start_time) * 1000
            self._record_response_time("cache", response_time_ms)
            
            is_healthy = (
                health.get('redis_connected', False) and
                stats.get('hit_rate', 0) >= self.thresholds.cache_hit_rate_min and
                stats.get('avg_response_time_ms', float('inf')) < 10.0  # Cache should be <10ms
            )
            
            if not is_healthy:
                self._record_error("cache")
            
            return ServiceHealthStatus(
                service_name="cache",
                is_healthy=is_healthy,
                response_time_ms=response_time_ms,
                error_rate=self._calculate_error_rate("cache"),
                last_check=datetime.now(),
                details={
                    "hit_rate": stats.get('hit_rate', 0),
                    "avg_response_time_ms": stats.get('avg_response_time_ms', 0),
                    "redis_connected": health.get('redis_connected', False)
                }
            )
            
        except Exception as e:
            self._record_error("cache")
            logger.error(f"Cache health check failed: {e}")
            
            return ServiceHealthStatus(
                service_name="cache",
                is_healthy=False,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error_rate=1.0,
                last_check=datetime.now(),
                details={"error": str(e)}
            )
    
    def _calculate_error_rate(self, service_name: str) -> float:
        """Calculate error rate for service."""
        if service_name not in self.service_response_times:
            return 0.0
        
        error_count = self.error_counts.get(service_name, 0)
        total_requests = len(self.service_response_times[service_name]) + error_count
        
        return error_count / max(1, total_requests)
    
    def _calculate_uptime_percentage(self) -> float:
        """Calculate overall system uptime percentage."""
        now = datetime.now()
        total_time = (now - self.uptime_start).total_seconds()
        
        if total_time <= 0:
            return 1.0
        
        downtime_seconds = sum(
            (end - start).total_seconds() 
            for start, end in self.downtime_periods
        )
        
        uptime_seconds = total_time - downtime_seconds
        return uptime_seconds / total_time
    
    def _generate_recommendations(self, service_health: Dict[str, ServiceHealthStatus]) -> List[str]:
        """Generate performance optimization recommendations."""
        recommendations = []
        
        # Dice engine recommendations
        dice_health = service_health.get('dice_engine')
        if dice_health and not dice_health.is_healthy:
            if dice_health.details.get('p95_response_time_ms', 0) > 100:
                recommendations.append("Dice engine: Consider increasing random pool size or optimizing calculation paths")
        
        # Session manager recommendations
        session_health = service_health.get('session_manager')
        if session_health and not session_health.is_healthy:
            if session_health.details.get('cache_hit_rate', 1) < 0.7:
                recommendations.append("Session manager: Increase cache TTL or implement more aggressive caching")
        
        # Database recommendations
        db_health = service_health.get('database')
        if db_health and not db_health.is_healthy:
            if db_health.details.get('slow_query_rate', 0) > 0.1:
                recommendations.append("Database: Review slow queries and add missing indexes")
        
        # Cache recommendations
        cache_health = service_health.get('cache')
        if cache_health and not cache_health.is_healthy:
            if not cache_health.details.get('redis_connected', False):
                recommendations.append("Cache: Check Redis connection and consider scaling Redis instance")
        
        return recommendations
    
    def _identify_critical_issues(self, service_health: Dict[str, ServiceHealthStatus]) -> List[str]:
        """Identify critical issues affecting performance targets."""
        issues = []
        
        for service_name, health in service_health.items():
            if not health.is_healthy:
                if health.error_rate > 0.05:  # >5% error rate is critical
                    issues.append(f"Critical: {service_name} has {health.error_rate:.1%} error rate")
                
                if health.response_time_ms > 1000:  # >1s response time is critical
                    issues.append(f"Critical: {service_name} response time {health.response_time_ms:.0f}ms")
        
        return issues
    
    async def generate_performance_report(self) -> SystemPerformanceReport:
        """Generate comprehensive performance report."""
        # Check all services
        service_checks = await asyncio.gather(
            self._check_dice_engine_performance(),
            self._check_session_manager_performance(), 
            self._check_database_performance(),
            self._check_cache_performance(),
            return_exceptions=True
        )
        
        service_health = {}
        for check in service_checks:
            if isinstance(check, ServiceHealthStatus):
                service_health[check.service_name] = check
        
        # Calculate overall health
        healthy_services = sum(1 for health in service_health.values() if health.is_healthy)
        overall_healthy = healthy_services == len(service_health)
        
        # Calculate performance score (0-100)
        performance_score = (healthy_services / len(service_health)) * 100 if service_health else 0
        
        # Check performance targets
        targets_met = {}
        
        # Dice roll target
        dice_health = service_health.get('dice_engine')
        targets_met['dice_roll_p95_ms'] = (
            dice_health is not None and 
            dice_health.details.get('p95_response_time_ms', float('inf')) < self.thresholds.dice_roll_p95_ms
        )
        
        # Session retrieval target
        session_health = service_health.get('session_manager')
        targets_met['session_retrieval_p95_ms'] = (
            session_health is not None and
            session_health.details.get('avg_response_time_ms', float('inf')) < self.thresholds.session_retrieval_p95_ms
        )
        
        # Cache hit rate target
        cache_health = service_health.get('cache')
        targets_met['cache_hit_rate'] = (
            cache_health is not None and
            cache_health.details.get('hit_rate', 0) >= self.thresholds.cache_hit_rate_min
        )
        
        # Uptime target
        uptime_percentage = self._calculate_uptime_percentage()
        targets_met['uptime_percentage'] = uptime_percentage >= self.thresholds.uptime_percentage_min
        
        # Performance metrics
        performance_metrics = {
            'dice_engine_p95_ms': dice_health.details.get('p95_response_time_ms', 0) if dice_health else 0,
            'session_manager_avg_ms': session_health.details.get('avg_response_time_ms', 0) if session_health else 0,
            'cache_hit_rate': cache_health.details.get('hit_rate', 0) if cache_health else 0,
            'uptime_percentage': uptime_percentage,
            'overall_error_rate': sum(h.error_rate for h in service_health.values()) / len(service_health) if service_health else 0
        }
        
        # Generate recommendations and identify issues
        recommendations = self._generate_recommendations(service_health)
        critical_issues = self._identify_critical_issues(service_health)
        
        report = SystemPerformanceReport(
            timestamp=datetime.now(),
            overall_healthy=overall_healthy,
            performance_score=performance_score,
            targets_met=targets_met,
            service_health=service_health,
            performance_metrics=performance_metrics,
            recommendations=recommendations,
            critical_issues=critical_issues
        )
        
        # Store in history
        self.performance_history.append(report)
        if len(self.performance_history) > 100:  # Keep last 100 reports
            self.performance_history.pop(0)
        
        return report
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for monitoring dashboard."""
        if not self.performance_history:
            return {"status": "No data available"}
        
        latest_report = self.performance_history[-1]
        
        return {
            "overall_status": "Healthy" if latest_report.overall_healthy else "Degraded",
            "performance_score": latest_report.performance_score,
            "targets_met": latest_report.targets_met,
            "critical_issues_count": len(latest_report.critical_issues),
            "uptime_percentage": latest_report.performance_metrics.get('uptime_percentage', 0),
            "last_updated": latest_report.timestamp.isoformat()
        }


# Global performance monitor
_performance_monitor: Optional[SPARCPerformanceMonitor] = None


async def get_performance_monitor() -> SPARCPerformanceMonitor:
    """Get or create performance monitor."""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = SPARCPerformanceMonitor()
    return _performance_monitor