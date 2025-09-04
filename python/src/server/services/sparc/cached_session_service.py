"""
Performance-optimized session service with Redis caching.
Built for <100ms response times and 99.5% uptime.
"""

from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timezone
import asyncio
import json
import time
import logging
from enum import Enum

from .models import (
    GameSession, Character, Adventure, SessionStatus, 
    CreateSessionRequest, JoinSessionRequest, SessionState
)
from .character_service import CharacterCreationService
from .dice_service import DiceRollingEngine
from ..cache_service import (
    PerformanceCacheService, CacheConfig, CacheType, 
    get_cache_service, cached_operation
)

logger = logging.getLogger(__name__)


class OptimizedSessionManager:
    """
    High-performance session manager with Redis caching and query optimization.
    
    Performance targets:
    - Session state retrieval: <10ms (cached)
    - Session updates: <50ms
    - Player join/leave: <100ms
    - Turn advancement: <25ms
    
    Features:
    - Redis-backed caching with memory fallback
    - Bulk operations for character updates
    - Optimized query patterns
    - Performance monitoring and health checks
    """
    
    def __init__(self):
        self.character_service = CharacterCreationService()
        self.dice_engine = DiceRollingEngine()
        self.cache_service: Optional[PerformanceCacheService] = None
        
        # Performance metrics
        self.metrics = {
            'session_retrievals': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'avg_response_time_ms': 0.0,
            'operations_count': 0
        }
        
        # Initialize cache service
        asyncio.create_task(self._initialize_cache())
    
    async def _initialize_cache(self):
        """Initialize cache service with performance tuning."""
        try:
            self.cache_service = await get_cache_service()
            logger.info("Session cache service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize cache: {e}")
    
    def _track_performance(self, operation_name: str, duration_ms: float):
        """Track operation performance for monitoring."""
        self.metrics['operations_count'] += 1
        old_avg = self.metrics['avg_response_time_ms']
        count = self.metrics['operations_count']
        self.metrics['avg_response_time_ms'] = (old_avg * (count - 1) + duration_ms) / count
        
        # Log slow operations
        if duration_ms > 100:
            logger.warning(f"Slow operation {operation_name}: {duration_ms:.2f}ms")
    
    async def get_session_state_cached(self, session_id: str) -> Optional[SessionState]:
        """
        Get complete session state with aggressive caching.
        Target: <10ms for cached, <50ms for uncached.
        """
        start_time = time.perf_counter()
        
        if not self.cache_service:
            # Fallback to uncached retrieval
            return await self._get_session_state_direct(session_id)
        
        async with cached_operation(CacheType.SESSION_STATE, session_id) as (result_or_writer, was_cached):
            if was_cached:
                self.metrics['cache_hits'] += 1
                duration_ms = (time.perf_counter() - start_time) * 1000
                self._track_performance('get_session_cached', duration_ms)
                return result_or_writer
            
            # Cache miss - fetch from database
            self.metrics['cache_misses'] += 1
            session_state = await self._get_session_state_direct(session_id)
            
            if session_state:
                # Convert to dict for caching
                cache_data = {
                    'session': session_state.session.model_dump(),
                    'characters': [char.model_dump() for char in session_state.characters],
                    'recent_rolls': [roll.model_dump() for roll in session_state.recent_rolls],
                    'seer_notes': session_state.seer_notes,
                    'cached_at': datetime.now().isoformat()
                }
                await result_or_writer.set_result(cache_data)
            
            duration_ms = (time.perf_counter() - start_time) * 1000
            self._track_performance('get_session_uncached', duration_ms)
            return session_state
    
    async def _get_session_state_direct(self, session_id: str) -> Optional[SessionState]:
        """Direct database retrieval without caching."""
        # This would connect to actual database - for now simulate
        # TODO: Replace with actual Supabase queries
        return None
    
    async def bulk_update_characters(self, character_updates: Dict[str, Dict[str, Any]]) -> bool:
        """
        Bulk update multiple characters with cache invalidation.
        Optimized for session-wide character updates.
        """
        start_time = time.perf_counter()
        
        try:
            # Update cache for each character
            if self.cache_service:
                await self.cache_service.bulk_set_characters(character_updates)
            
            # TODO: Bulk database update
            # This would be a single SQL transaction updating multiple characters
            
            # Invalidate affected session caches
            affected_sessions = set()
            for char_id, char_data in character_updates.items():
                if 'session_id' in char_data:
                    affected_sessions.add(char_data['session_id'])
            
            if self.cache_service:
                for session_id in affected_sessions:
                    await self.cache_service.delete(CacheType.SESSION_STATE, session_id)
            
            duration_ms = (time.perf_counter() - start_time) * 1000
            self._track_performance('bulk_update_characters', duration_ms)
            return True
            
        except Exception as e:
            logger.error(f"Bulk character update failed: {e}")
            return False
    
    async def advance_turn_optimized(self, session_id: str) -> Tuple[bool, Optional[str]]:
        """
        Optimized turn advancement with minimal database hits.
        Target: <25ms response time.
        """
        start_time = time.perf_counter()
        
        try:
            # Get current session from cache
            session_state = await self.get_session_state_cached(session_id)
            if not session_state:
                return False, "Session not found"
            
            session = session_state.session
            
            # Validate turn advancement
            if session.status != SessionStatus.ACTIVE:
                return False, "Session not active"
            
            # Calculate next turn
            new_turn_index = (session.current_turn_index + 1) % len(session.turn_order)
            current_character_id = session.turn_order[new_turn_index] if session.turn_order else None
            
            # Update session with single atomic operation
            update_data = {
                'current_turn_index': new_turn_index,
                'updated_at': datetime.now(timezone.utc)
            }
            
            # TODO: Single database update query
            # await self._update_session_atomic(session_id, update_data)
            
            # Update cache immediately
            if self.cache_service:
                session.current_turn_index = new_turn_index
                session.updated_at = update_data['updated_at']
                
                cache_data = {
                    'session': session.model_dump(),
                    'characters': [char.model_dump() for char in session_state.characters],
                    'recent_rolls': [roll.model_dump() for roll in session_state.recent_rolls],
                    'seer_notes': session_state.seer_notes,
                    'cached_at': datetime.now().isoformat()
                }
                await self.cache_service.set_session_state(session_id, cache_data)
            
            duration_ms = (time.perf_counter() - start_time) * 1000
            self._track_performance('advance_turn', duration_ms)
            return True, current_character_id
            
        except Exception as e:
            logger.error(f"Turn advancement failed: {e}")
            return False, f"Turn advancement error: {e}"
    
    async def join_session_optimized(
        self, 
        session_id: str, 
        character_id: str,
        user_id: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Optimized session joining with cache updates.
        Target: <100ms response time.
        """
        start_time = time.perf_counter()
        
        try:
            # Get session state
            session_state = await self.get_session_state_cached(session_id)
            if not session_state:
                return False, "Session not found"
            
            session = session_state.session
            
            # Validation
            if session.status not in [SessionStatus.WAITING, SessionStatus.ACTIVE]:
                return False, "Session cannot accept new players"
            
            if len(session.player_characters) >= session.max_players:
                return False, "Session is full"
            
            if character_id in session.player_characters:
                return False, "Character already in session"
            
            # Add character to session
            updated_player_list = session.player_characters + [character_id]
            
            # TODO: Atomic database update
            # await self._add_character_to_session(session_id, character_id, user_id)
            
            # Update cache immediately
            if self.cache_service:
                session.player_characters = updated_player_list
                session.updated_at = datetime.now(timezone.utc)
                
                # Invalidate session cache to force refresh with character data
                await self.cache_service.delete(CacheType.SESSION_STATE, session_id)
            
            duration_ms = (time.perf_counter() - start_time) * 1000
            self._track_performance('join_session', duration_ms)
            return True, None
            
        except Exception as e:
            logger.error(f"Session join failed: {e}")
            return False, f"Join error: {e}"
    
    async def cache_ai_response(self, prompt: str, context: str, response: Dict[str, Any]) -> bool:
        """Cache AI responses for common gaming scenarios."""
        if not self.cache_service:
            return False
        
        # Generate prompt hash for caching
        import hashlib
        prompt_context = f"{prompt}|{context}"
        prompt_hash = hashlib.sha256(prompt_context.encode()).hexdigest()[:32]
        
        return await self.cache_service.cache_ai_response(prompt_hash, response)
    
    async def get_cached_ai_response(self, prompt: str, context: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached AI response."""
        if not self.cache_service:
            return None
        
        import hashlib
        prompt_context = f"{prompt}|{context}"
        prompt_hash = hashlib.sha256(prompt_context.encode()).hexdigest()[:32]
        
        return await self.cache_service.get_cached_ai_response(prompt_hash)
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        metrics = {
            **self.metrics,
            'cache_hit_rate': self.metrics['cache_hits'] / max(1, self.metrics['cache_hits'] + self.metrics['cache_misses']),
            'meets_response_target': self.metrics['avg_response_time_ms'] < 50.0,
        }
        
        if self.cache_service:
            cache_stats = await self.cache_service.get_performance_stats()
            metrics['cache_service'] = cache_stats
        
        return metrics
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check for monitoring."""
        health = {
            'service_healthy': True,
            'performance_ok': self.metrics['avg_response_time_ms'] < 50.0,
            'cache_available': self.cache_service is not None,
        }
        
        if self.cache_service:
            cache_health = await self.cache_service.health_check()
            health['cache_service'] = cache_health
        
        # Overall health determination
        health['overall_healthy'] = (
            health['service_healthy'] and 
            health['performance_ok'] and
            health['cache_available']
        )
        
        return health


# Global optimized session manager instance
_session_manager: Optional[OptimizedSessionManager] = None


async def get_optimized_session_manager() -> OptimizedSessionManager:
    """Get or create optimized session manager."""
    global _session_manager
    if _session_manager is None:
        _session_manager = OptimizedSessionManager()
    return _session_manager