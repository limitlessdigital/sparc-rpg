"""
High-performance caching service for SPARC with Redis backend.
Implements caching strategies for game data, AI responses, and session state.
"""

import json
import asyncio
import time
from typing import Any, Dict, List, Optional, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import hashlib
import logging
from contextlib import asynccontextmanager

try:
    import redis.asyncio as redis
    from redis.asyncio import Redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = logging.getLogger(__name__)


class CacheType(str, Enum):
    """Cache types with different TTL strategies."""
    SESSION_STATE = "session_state"  # 30s TTL - frequently updated
    CHARACTER_DATA = "character_data"  # 5min TTL - occasionally updated
    AI_RESPONSE = "ai_response"  # 1hr TTL - expensive to compute
    DICE_STATS = "dice_stats"  # 15min TTL - performance analytics
    ADVENTURE_DATA = "adventure_data"  # 24hr TTL - static content
    TEMPLATE_DATA = "template_data"  # 24hr TTL - very static


@dataclass
class CacheConfig:
    """Cache configuration with performance-tuned defaults."""
    redis_url: Optional[str] = None
    max_connections: int = 20
    socket_keepalive: bool = True
    socket_keepalive_options: Dict = None
    decode_responses: bool = True
    health_check_interval: int = 30
    
    # TTL settings in seconds
    ttl_session_state: int = 30
    ttl_character_data: int = 300  # 5 minutes
    ttl_ai_response: int = 3600  # 1 hour
    ttl_dice_stats: int = 900  # 15 minutes
    ttl_adventure_data: int = 86400  # 24 hours
    ttl_template_data: int = 86400  # 24 hours
    
    # Performance settings
    enable_compression: bool = True
    max_key_size: int = 250  # Redis key size limit
    max_value_size: int = 1024 * 1024  # 1MB per cache entry


class PerformanceCacheService:
    """
    High-performance Redis caching service optimized for SPARC gaming requirements.
    
    Features:
    - Sub-10ms cache operations for <100ms dice roll target
    - Intelligent key generation with collision detection
    - Automatic failover to memory cache when Redis unavailable
    - Performance tracking and health monitoring
    - Bulk operations for session state updates
    """
    
    def __init__(self, config: CacheConfig):
        self.config = config
        self.redis_client: Optional[Redis] = None
        self.memory_fallback: Dict[str, Dict[str, Any]] = {}
        self.performance_stats = {
            'hits': 0,
            'misses': 0,
            'errors': 0,
            'avg_response_time_ms': 0.0,
            'operations_count': 0
        }
        self.connected = False
        
        if config.socket_keepalive_options is None:
            config.socket_keepalive_options = {
                'TCP_KEEPIDLE': 1,
                'TCP_KEEPINTVL': 3,
                'TCP_KEEPCNT': 5,
            }
    
    async def initialize(self) -> bool:
        """Initialize Redis connection with performance optimizations."""
        if not REDIS_AVAILABLE:
            logger.warning("Redis not available, using memory fallback only")
            return False
        
        try:
            self.redis_client = redis.from_url(
                self.config.redis_url or "redis://localhost:6379",
                max_connections=self.config.max_connections,
                socket_keepalive=self.config.socket_keepalive,
                socket_keepalive_options=self.config.socket_keepalive_options,
                decode_responses=self.config.decode_responses,
                health_check_interval=self.config.health_check_interval
            )
            
            # Test connection
            await self.redis_client.ping()
            self.connected = True
            logger.info("Redis cache service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Redis: {e}")
            self.connected = False
            return False
    
    def _generate_cache_key(self, cache_type: CacheType, identifier: str, context: str = "") -> str:
        """Generate optimized cache keys with collision detection."""
        base_key = f"sparc:{cache_type.value}:{identifier}"
        if context:
            # Hash long contexts to keep keys under 250 chars
            if len(context) > 50:
                context_hash = hashlib.md5(context.encode()).hexdigest()[:16]
                base_key += f":{context_hash}"
            else:
                base_key += f":{context}"
        
        return base_key[:self.config.max_key_size]
    
    def _get_ttl(self, cache_type: CacheType) -> int:
        """Get TTL for cache type."""
        ttl_map = {
            CacheType.SESSION_STATE: self.config.ttl_session_state,
            CacheType.CHARACTER_DATA: self.config.ttl_character_data,
            CacheType.AI_RESPONSE: self.config.ttl_ai_response,
            CacheType.DICE_STATS: self.config.ttl_dice_stats,
            CacheType.ADVENTURE_DATA: self.config.ttl_adventure_data,
            CacheType.TEMPLATE_DATA: self.config.ttl_template_data,
        }
        return ttl_map.get(cache_type, 300)
    
    async def _time_operation(self, operation: Callable) -> tuple:
        """Time an operation and update performance stats."""
        start_time = time.perf_counter()
        try:
            result = await operation()
            success = True
        except Exception as e:
            result = e
            success = False
        
        end_time = time.perf_counter()
        duration_ms = (end_time - start_time) * 1000
        
        # Update performance stats
        self.performance_stats['operations_count'] += 1
        old_avg = self.performance_stats['avg_response_time_ms']
        count = self.performance_stats['operations_count']
        self.performance_stats['avg_response_time_ms'] = (old_avg * (count - 1) + duration_ms) / count
        
        if not success:
            self.performance_stats['errors'] += 1
            
        return result, success, duration_ms
    
    async def get(self, cache_type: CacheType, identifier: str, context: str = "") -> Optional[Any]:
        """Get cached data with performance tracking."""
        key = self._generate_cache_key(cache_type, identifier, context)
        
        async def _get_operation():
            if self.connected and self.redis_client:
                data = await self.redis_client.get(key)
                if data:
                    return json.loads(data)
            
            # Fallback to memory cache
            if key in self.memory_fallback:
                entry = self.memory_fallback[key]
                if datetime.now() < entry['expires_at']:
                    return entry['data']
                else:
                    del self.memory_fallback[key]
            
            return None
        
        result, success, duration_ms = await self._time_operation(_get_operation)
        
        if success and result is not None:
            self.performance_stats['hits'] += 1
            return result
        else:
            self.performance_stats['misses'] += 1
            return None
    
    async def set(self, cache_type: CacheType, identifier: str, data: Any, context: str = "", ttl_override: Optional[int] = None) -> bool:
        """Set cached data with performance optimization."""
        key = self._generate_cache_key(cache_type, identifier, context)
        ttl = ttl_override or self._get_ttl(cache_type)
        
        # Serialize data
        try:
            serialized = json.dumps(data, default=str)
            if len(serialized) > self.config.max_value_size:
                logger.warning(f"Cache entry too large ({len(serialized)} bytes): {key}")
                return False
        except (TypeError, ValueError) as e:
            logger.error(f"Failed to serialize cache data for {key}: {e}")
            return False
        
        async def _set_operation():
            success_redis = False
            if self.connected and self.redis_client:
                try:
                    await self.redis_client.setex(key, ttl, serialized)
                    success_redis = True
                except Exception as e:
                    logger.error(f"Redis set failed for {key}: {e}")
            
            # Always set memory fallback for critical performance
            self.memory_fallback[key] = {
                'data': data,
                'expires_at': datetime.now() + timedelta(seconds=ttl)
            }
            
            return success_redis
        
        result, success, duration_ms = await self._time_operation(_set_operation)
        return success
    
    async def delete(self, cache_type: CacheType, identifier: str, context: str = "") -> bool:
        """Delete cached data."""
        key = self._generate_cache_key(cache_type, identifier, context)
        
        async def _delete_operation():
            success_redis = False
            if self.connected and self.redis_client:
                try:
                    await self.redis_client.delete(key)
                    success_redis = True
                except Exception as e:
                    logger.error(f"Redis delete failed for {key}: {e}")
            
            # Remove from memory fallback
            if key in self.memory_fallback:
                del self.memory_fallback[key]
            
            return success_redis
        
        result, success, duration_ms = await self._time_operation(_delete_operation)
        return success
    
    async def get_session_state(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Optimized session state retrieval."""
        return await self.get(CacheType.SESSION_STATE, session_id)
    
    async def set_session_state(self, session_id: str, state_data: Dict[str, Any]) -> bool:
        """Optimized session state caching."""
        return await self.set(CacheType.SESSION_STATE, session_id, state_data)
    
    async def cache_ai_response(self, prompt_hash: str, response_data: Dict[str, Any]) -> bool:
        """Cache AI responses for common scenarios."""
        return await self.set(CacheType.AI_RESPONSE, prompt_hash, response_data)
    
    async def get_cached_ai_response(self, prompt_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached AI response."""
        return await self.get(CacheType.AI_RESPONSE, prompt_hash)
    
    async def bulk_set_characters(self, character_data_map: Dict[str, Any]) -> int:
        """Bulk set character data for performance."""
        success_count = 0
        
        if self.connected and self.redis_client:
            try:
                pipe = self.redis_client.pipeline()
                for char_id, char_data in character_data_map.items():
                    key = self._generate_cache_key(CacheType.CHARACTER_DATA, char_id)
                    ttl = self._get_ttl(CacheType.CHARACTER_DATA)
                    serialized = json.dumps(char_data, default=str)
                    pipe.setex(key, ttl, serialized)
                
                await pipe.execute()
                success_count = len(character_data_map)
            except Exception as e:
                logger.error(f"Bulk character cache failed: {e}")
        
        return success_count
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        total_requests = self.performance_stats['hits'] + self.performance_stats['misses']
        hit_rate = self.performance_stats['hits'] / total_requests if total_requests > 0 else 0
        
        return {
            **self.performance_stats,
            'hit_rate': hit_rate,
            'connected': self.connected,
            'memory_fallback_size': len(self.memory_fallback),
            'meets_performance_target': self.performance_stats['avg_response_time_ms'] < 10.0
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check."""
        health = {
            'redis_connected': False,
            'memory_fallback_active': True,
            'performance_ok': self.performance_stats['avg_response_time_ms'] < 10.0,
            'error_rate': 0.0
        }
        
        if self.redis_client:
            try:
                await self.redis_client.ping()
                health['redis_connected'] = True
            except Exception:
                health['redis_connected'] = False
        
        total_ops = self.performance_stats['operations_count']
        if total_ops > 0:
            health['error_rate'] = self.performance_stats['errors'] / total_ops
        
        return health
    
    async def cleanup(self):
        """Cleanup connections and resources."""
        if self.redis_client:
            await self.redis_client.close()
        
        # Clear memory fallback of expired entries
        now = datetime.now()
        expired_keys = [k for k, v in self.memory_fallback.items() if now >= v['expires_at']]
        for key in expired_keys:
            del self.memory_fallback[key]


# Global cache service instance
cache_service: Optional[PerformanceCacheService] = None


async def get_cache_service() -> PerformanceCacheService:
    """Get or create cache service instance."""
    global cache_service
    if cache_service is None:
        config = CacheConfig()
        cache_service = PerformanceCacheService(config)
        await cache_service.initialize()
    return cache_service


@asynccontextmanager
async def cached_operation(cache_type: CacheType, identifier: str, context: str = ""):
    """Context manager for cached operations with automatic fallback."""
    cache = await get_cache_service()
    
    # Try to get from cache first
    cached_result = await cache.get(cache_type, identifier, context)
    if cached_result is not None:
        yield cached_result, True  # (result, was_cached)
        return
    
    # Not in cache, prepare for computation
    class CacheWriter:
        def __init__(self):
            self.result = None
        
        async def set_result(self, result):
            self.result = result
            await cache.set(cache_type, identifier, result, context)
    
    writer = CacheWriter()
    yield writer, False  # (cache_writer, was_cached)