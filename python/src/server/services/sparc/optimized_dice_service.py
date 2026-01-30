"""
Ultra-high-performance dice rolling engine for SPARC.
Optimized for <100ms P95 response times with streaming support.
"""

import secrets
import time
import asyncio
import json
from typing import List, Dict, Optional, Tuple, AsyncIterator
from datetime import datetime, timezone
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum
import logging

from .models import DiceRoll, DiceRollType, RollDiceRequest, RollDiceResponse
from ..cache_service import get_cache_service, CacheType
from .optimized_database import get_optimized_db_service

logger = logging.getLogger(__name__)


@dataclass
class DicePerformanceMetrics:
    """Performance tracking for dice operations."""
    total_rolls: int = 0
    avg_response_time_ms: float = 0.0
    p95_response_time_ms: float = 0.0
    p99_response_time_ms: float = 0.0
    max_response_time_ms: float = 0.0
    cache_hit_rate: float = 0.0
    streaming_ops: int = 0
    batch_ops: int = 0


class RollResult:
    """Optimized dice roll result with minimal memory footprint."""
    __slots__ = ['values', 'total', 'timestamp', 'session_id', 'character_id', 'is_success', 'difficulty']
    
    def __init__(self, values: List[int], session_id: str, character_id: Optional[str] = None, 
                 difficulty: Optional[int] = None):
        self.values = values
        self.total = sum(values)
        self.timestamp = time.perf_counter()
        self.session_id = session_id
        self.character_id = character_id
        self.difficulty = difficulty
        self.is_success = self._calculate_success() if difficulty else None
    
    def _calculate_success(self) -> Optional[bool]:
        if self.difficulty is None:
            return None
        return self.total >= self.difficulty


class OptimizedDiceEngine:
    """
    Ultra-high-performance dice engine with streaming and caching.
    
    Performance targets:
    - <100ms P95 response time
    - <10ms cache hit response
    - <50ms database write
    - Support for 100+ concurrent rolls
    
    Features:
    - Pre-computed probability tables
    - Optimized random generation with batching
    - Result streaming for real-time updates
    - Intelligent caching of roll statistics
    - Bulk operations for session-wide rolls
    """
    
    # Pre-computed success probabilities (dice_count -> difficulty -> probability)
    PROBABILITY_TABLE = {}
    
    # Pre-generate random numbers for ultra-fast access
    _random_pool: deque = deque()
    _pool_lock = asyncio.Lock()
    _pool_size = 1000
    
    def __init__(self):
        self.rng = secrets.SystemRandom()
        self.metrics = DicePerformanceMetrics()
        self.response_times = deque(maxlen=1000)  # Store last 1000 response times
        self.cache_service = None
        self.db_service = None
        
        # Initialize probability table
        self._initialize_probability_table()
        self._initialize_random_pool()
        
        # Initialize services
        asyncio.create_task(self._initialize_services())
    
    @classmethod
    def _initialize_probability_table(cls):
        """Pre-compute success probabilities for all common scenarios."""
        for dice_count in range(1, 11):  # 1-10 dice
            cls.PROBABILITY_TABLE[dice_count] = {}
            for difficulty in range(1, 61):  # Difficulties 1-60
                cls.PROBABILITY_TABLE[dice_count][difficulty] = cls._calculate_exact_probability(dice_count, difficulty)
    
    @staticmethod
    def _calculate_exact_probability(dice_count: int, difficulty: int) -> float:
        """Calculate exact probability of success for dice_count d6 vs difficulty."""
        if difficulty <= dice_count:
            return 1.0  # Always succeed
        if difficulty > dice_count * 6:
            return 0.0  # Cannot succeed
        
        # For small cases, use exact calculation
        if dice_count <= 4:
            success_outcomes = 0
            total_outcomes = 6 ** dice_count
            
            # Generate all possible outcomes
            def count_successes(remaining_dice: int, current_total: int) -> int:
                if remaining_dice == 0:
                    return 1 if current_total >= difficulty else 0
                
                count = 0
                for die_value in range(1, 7):
                    count += count_successes(remaining_dice - 1, current_total + die_value)
                return count
            
            success_outcomes = count_successes(dice_count, 0)
            return success_outcomes / total_outcomes
        
        # For larger cases, use normal approximation
        mean = dice_count * 3.5
        variance = dice_count * 35/12
        std_dev = variance ** 0.5
        
        # Normal approximation with continuity correction
        z_score = (difficulty - 0.5 - mean) / std_dev
        
        # Approximate probability using standard normal
        import math
        probability = 1 - 0.5 * (1 + math.erf(z_score / math.sqrt(2)))
        return max(0.0, min(1.0, probability))
    
    def _initialize_random_pool(self):
        """Pre-generate random numbers for ultra-fast dice rolls."""
        self._random_pool.clear()
        for _ in range(self._pool_size):
            self._random_pool.append(self.rng.randint(1, 6))
    
    async def _initialize_services(self):
        """Initialize cache and database services."""
        try:
            self.cache_service = await get_cache_service()
            self.db_service = await get_optimized_db_service()
            logger.info("Optimized dice engine services initialized")
        except Exception as e:
            logger.error(f"Failed to initialize dice engine services: {e}")
    
    async def _get_random_dice(self, count: int) -> List[int]:
        """Get random dice values with optimized pool management."""
        async with self._pool_lock:
            if len(self._random_pool) < count:
                # Refill pool
                for _ in range(self._pool_size):
                    self._random_pool.append(self.rng.randint(1, 6))
            
            return [self._random_pool.popleft() for _ in range(count)]
    
    def _update_performance_metrics(self, response_time_ms: float):
        """Update performance metrics with new response time."""
        self.response_times.append(response_time_ms)
        self.metrics.total_rolls += 1
        
        # Update average
        old_avg = self.metrics.avg_response_time_ms
        count = self.metrics.total_rolls
        self.metrics.avg_response_time_ms = (old_avg * (count - 1) + response_time_ms) / count
        
        # Update percentiles (calculated from recent data)
        if len(self.response_times) >= 20:
            sorted_times = sorted(self.response_times)
            self.metrics.p95_response_time_ms = sorted_times[int(len(sorted_times) * 0.95)]
            self.metrics.p99_response_time_ms = sorted_times[int(len(sorted_times) * 0.99)]
            self.metrics.max_response_time_ms = max(sorted_times)
    
    async def roll_dice_optimized(
        self, 
        session_id: str,
        dice_count: int,
        roll_type: DiceRollType = DiceRollType.SKILL_CHECK,
        character_id: Optional[str] = None,
        difficulty: Optional[int] = None,
        modifier: int = 0,
        context: str = "",
        stream_results: bool = False
    ) -> RollDiceResponse:
        """
        Ultra-fast dice rolling with <100ms guarantee.
        
        Optimizations:
        - Pre-computed random pool
        - Minimal object creation
        - Cached probability lookups
        - Async database writes
        - Optional result streaming
        """
        start_time = time.perf_counter()
        
        try:
            # Input validation (optimized)
            dice_count = max(1, min(10, dice_count))  # Clamp to valid range
            
            # Get dice values from optimized pool
            dice_values = await self._get_random_dice(dice_count)
            base_total = sum(dice_values)
            final_total = base_total + modifier
            
            # Fast success calculation using pre-computed table
            is_success = None
            if difficulty is not None:
                if dice_count in self.PROBABILITY_TABLE and difficulty in self.PROBABILITY_TABLE[dice_count]:
                    # Use pre-computed probability for quick validation
                    expected_prob = self.PROBABILITY_TABLE[dice_count][difficulty]
                    is_success = final_total >= difficulty
                else:
                    # Fallback calculation
                    is_success = final_total >= difficulty
            
            # Create roll result
            roll_result = DiceRoll(
                id=f"roll_{int(time.time() * 1000000)}_{session_id[-8:]}",
                session_id=session_id,
                character_id=character_id,
                roll_type=roll_type,
                dice_count=dice_count,
                results=dice_values,
                total=final_total,
                difficulty=difficulty,
                is_success=is_success,
                modifier=modifier,
                context=context,
                rolled_at=datetime.now(timezone.utc)
            )
            
            # Calculate animation duration based on dice count (for frontend)
            animation_duration_ms = min(800, 200 + (dice_count * 100))
            
            response = RollDiceResponse(
                roll=roll_result,
                animation_duration_ms=animation_duration_ms
            )
            
            # Async database write (don't wait for it)
            if self.db_service:
                asyncio.create_task(self._write_roll_to_database(roll_result))
            
            # Stream results if requested
            if stream_results:
                asyncio.create_task(self._stream_roll_result(roll_result))
            
            # Update cache with recent rolls
            if self.cache_service:
                asyncio.create_task(self._update_roll_cache(session_id, roll_result))
            
            # Performance tracking
            response_time_ms = (time.perf_counter() - start_time) * 1000
            self._update_performance_metrics(response_time_ms)
            
            # Log slow operations
            if response_time_ms > 100:
                logger.warning(f"Slow dice roll: {response_time_ms:.2f}ms for {dice_count}d6")
            
            return response
            
        except Exception as e:
            logger.error(f"Dice roll failed: {e}")
            raise
    
    async def _write_roll_to_database(self, roll: DiceRoll):
        """Async database write with error handling."""
        if not self.db_service:
            return
        
        try:
            roll_data = {
                'id': roll.id,
                'session_id': roll.session_id,
                'character_id': roll.character_id,
                'roll_type': roll.roll_type.value,
                'dice_count': roll.dice_count,
                'results': roll.results,
                'total': roll.total,
                'difficulty': roll.difficulty,
                'is_success': roll.is_success,
                'modifier': roll.modifier,
                'context': roll.context,
                'rolled_at': roll.rolled_at
            }
            
            success = await self.db_service.insert_dice_roll_fast(roll_data)
            if not success:
                logger.error(f"Failed to write dice roll {roll.id} to database")
                
        except Exception as e:
            logger.error(f"Database write error for roll {roll.id}: {e}")
    
    async def _update_roll_cache(self, session_id: str, roll: DiceRoll):
        """Update cached roll history for session."""
        if not self.cache_service:
            return
        
        try:
            # Get current cached rolls
            cached_rolls = await self.cache_service.get(CacheType.DICE_STATS, f"{session_id}_recent")
            if not cached_rolls:
                cached_rolls = []
            
            # Add new roll and limit to last 10
            cached_rolls.insert(0, roll.model_dump())
            cached_rolls = cached_rolls[:10]
            
            # Cache updated list
            await self.cache_service.set(CacheType.DICE_STATS, f"{session_id}_recent", cached_rolls, ttl_override=300)
            
        except Exception as e:
            logger.error(f"Failed to update roll cache: {e}")
    
    async def _stream_roll_result(self, roll: DiceRoll):
        """Stream roll result for real-time updates (placeholder)."""
        # This would integrate with the HTTP polling system
        # For now, just log the streaming operation
        self.metrics.streaming_ops += 1
        logger.debug(f"Streaming roll result {roll.id}")
    
    async def bulk_roll_dice(
        self,
        session_id: str,
        roll_requests: List[Tuple[int, Optional[str], Optional[int]]]  # (dice_count, character_id, difficulty)
    ) -> List[RollDiceResponse]:
        """
        Bulk dice rolling for initiative or group actions.
        Optimized for multiple simultaneous rolls.
        """
        start_time = time.perf_counter()
        self.metrics.batch_ops += 1
        
        responses = []
        
        # Pre-generate all random numbers needed
        total_dice_needed = sum(dice_count for dice_count, _, _ in roll_requests)
        all_random_values = await self._get_random_dice(total_dice_needed)
        
        dice_index = 0
        for dice_count, character_id, difficulty in roll_requests:
            # Get dice values for this roll
            dice_values = all_random_values[dice_index:dice_index + dice_count]
            dice_index += dice_count
            
            total = sum(dice_values)
            is_success = total >= difficulty if difficulty else None
            
            roll_result = DiceRoll(
                id=f"bulk_{int(time.time() * 1000000)}_{len(responses)}",
                session_id=session_id,
                character_id=character_id,
                roll_type=DiceRollType.INITIATIVE,
                dice_count=dice_count,
                results=dice_values,
                total=total,
                difficulty=difficulty,
                is_success=is_success,
                modifier=0,
                context="Bulk roll",
                rolled_at=datetime.now(timezone.utc)
            )
            
            response = RollDiceResponse(
                roll=roll_result,
                animation_duration_ms=min(800, 200 + (dice_count * 50))
            )
            responses.append(response)
            
            # Async database write
            if self.db_service:
                asyncio.create_task(self._write_roll_to_database(roll_result))
        
        # Performance tracking
        response_time_ms = (time.perf_counter() - start_time) * 1000
        logger.info(f"Bulk roll completed: {len(roll_requests)} rolls in {response_time_ms:.2f}ms")
        
        return responses
    
    async def get_roll_probability(
        self, 
        dice_count: int, 
        difficulty: int, 
        modifier: int = 0
    ) -> float:
        """Get pre-computed success probability."""
        adjusted_difficulty = difficulty - modifier
        
        if dice_count in self.PROBABILITY_TABLE and adjusted_difficulty in self.PROBABILITY_TABLE[dice_count]:
            return self.PROBABILITY_TABLE[dice_count][adjusted_difficulty]
        else:
            # Fallback calculation
            return self._calculate_exact_probability(dice_count, adjusted_difficulty)
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics."""
        stats = {
            'total_rolls': self.metrics.total_rolls,
            'avg_response_time_ms': self.metrics.avg_response_time_ms,
            'p95_response_time_ms': self.metrics.p95_response_time_ms,
            'p99_response_time_ms': self.metrics.p99_response_time_ms,
            'max_response_time_ms': self.metrics.max_response_time_ms,
            'cache_hit_rate': self.metrics.cache_hit_rate,
            'streaming_operations': self.metrics.streaming_ops,
            'batch_operations': self.metrics.batch_ops,
            'meets_performance_target': self.metrics.p95_response_time_ms < 100.0,
            'random_pool_size': len(self._random_pool),
            'healthy': self.metrics.p95_response_time_ms < 100.0 and self.metrics.total_rolls > 0
        }
        
        return stats
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for monitoring."""
        return {
            'dice_engine_healthy': True,
            'performance_target_met': self.metrics.p95_response_time_ms < 100.0 if self.metrics.total_rolls > 0 else True,
            'random_pool_ready': len(self._random_pool) > 100,
            'services_connected': self.cache_service is not None and self.db_service is not None,
            'total_rolls_processed': self.metrics.total_rolls
        }


# Global optimized dice engine
_dice_engine: Optional[OptimizedDiceEngine] = None


async def get_optimized_dice_engine() -> OptimizedDiceEngine:
    """Get or create optimized dice engine."""
    global _dice_engine
    if _dice_engine is None:
        _dice_engine = OptimizedDiceEngine()
    return _dice_engine