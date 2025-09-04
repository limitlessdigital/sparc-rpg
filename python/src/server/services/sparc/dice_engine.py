"""
High-Performance SPARC Dice Rolling Engine

Optimized for <100ms P95 response times with cryptographically secure RNG.
Features pre-computed probability tables and memory-efficient roll generation.
"""

import secrets
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio
import random
from collections import defaultdict, deque
import statistics

class DifficultyLevel(Enum):
    """Standard SPARC difficulty levels."""
    TRIVIAL = 4
    EASY = 8
    MEDIUM = 12
    HARD = 16
    VERY_HARD = 20
    LEGENDARY = 24

@dataclass
class DiceRoll:
    """Individual dice roll result."""
    id: str
    session_id: str
    character_id: str
    roll_type: str
    dice_count: int
    dice_sides: int
    modifier: int
    result: int
    individual_rolls: List[int]
    difficulty: Optional[int]
    success: Optional[bool]
    timestamp: float
    response_time_ms: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses."""
        return asdict(self)

@dataclass
class DiceStatistics:
    """Aggregate statistics for dice rolls."""
    total_rolls: int
    average_result: float
    success_rate: float
    common_roll_types: Dict[str, int]
    performance_p95_ms: float
    sub_100ms_rate: float

class SecureRandomGenerator:
    """Cryptographically secure random number generator with performance optimization."""
    
    def __init__(self, pool_size: int = 10000):
        self.pool_size = pool_size
        self._random_pool: deque = deque()
        self._fill_random_pool()
    
    def _fill_random_pool(self):
        """Pre-generate random numbers for fast access."""
        while len(self._random_pool) < self.pool_size:
            # Generate batch of cryptographically secure random bytes
            random_bytes = secrets.token_bytes(4)
            random_int = int.from_bytes(random_bytes, 'big')
            self._random_pool.append(random_int)
    
    def get_secure_random(self, min_val: int, max_val: int) -> int:
        """Get cryptographically secure random number in range."""
        if len(self._random_pool) < 100:
            # Asynchronously refill pool when running low
            asyncio.create_task(self._async_refill_pool())
        
        raw_random = self._random_pool.popleft()
        # Convert to range using modulo (acceptable for gaming applications)
        range_size = max_val - min_val + 1
        return min_val + (raw_random % range_size)
    
    async def _async_refill_pool(self):
        """Asynchronously refill random pool."""
        await asyncio.sleep(0)  # Yield control
        self._fill_random_pool()

class ProbabilityEngine:
    """Pre-computed probability tables for common dice combinations."""
    
    def __init__(self):
        self._probability_cache: Dict[Tuple, List[float]] = {}
        self._precompute_common_combinations()
    
    def _precompute_common_combinations(self):
        """Pre-compute probability distributions for common dice rolls."""
        common_combinations = [
            (1, 6), (2, 6), (3, 6), (4, 6),  # d6 variations
            (1, 20), (2, 20),  # d20 variations
            (1, 4), (1, 8), (1, 10), (1, 12)  # Other common dice
        ]
        
        for dice_count, dice_sides in common_combinations:
            self._compute_probability_distribution(dice_count, dice_sides)
    
    def _compute_probability_distribution(self, dice_count: int, dice_sides: int):
        """Compute probability distribution for dice combination."""
        key = (dice_count, dice_sides)
        if key in self._probability_cache:
            return
        
        min_roll = dice_count
        max_roll = dice_count * dice_sides
        total_outcomes = dice_sides ** dice_count
        
        # Count occurrences of each sum
        outcome_counts = defaultdict(int)
        
        def generate_all_combinations(remaining_dice: int, current_sum: int):
            if remaining_dice == 0:
                outcome_counts[current_sum] += 1
                return
            
            for roll in range(1, dice_sides + 1):
                generate_all_combinations(remaining_dice - 1, current_sum + roll)
        
        generate_all_combinations(dice_count, 0)
        
        # Convert to probability distribution
        probabilities = []
        for result in range(min_roll, max_roll + 1):
            prob = outcome_counts[result] / total_outcomes
            probabilities.append(prob)
        
        self._probability_cache[key] = probabilities
    
    def get_expected_value(self, dice_count: int, dice_sides: int, modifier: int = 0) -> float:
        """Calculate expected value for dice combination."""
        base_expected = dice_count * (dice_sides + 1) / 2
        return base_expected + modifier
    
    def get_success_probability(self, dice_count: int, dice_sides: int, 
                               modifier: int, difficulty: int) -> float:
        """Calculate probability of success against difficulty."""
        key = (dice_count, dice_sides)
        
        if key not in self._probability_cache:
            self._compute_probability_distribution(dice_count, dice_sides)
        
        probabilities = self._probability_cache[key]
        min_roll = dice_count
        
        success_prob = 0.0
        for i, prob in enumerate(probabilities):
            total_result = min_roll + i + modifier
            if total_result >= difficulty:
                success_prob += prob
        
        return success_prob

class PerformanceTracker:
    """Track dice engine performance metrics."""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self._response_times: deque = deque(maxlen=max_history)
        self._total_rolls = 0
        self._sub_100ms_count = 0
    
    def record_roll(self, response_time_ms: float):
        """Record a dice roll performance metric."""
        self._response_times.append(response_time_ms)
        self._total_rolls += 1
        
        if response_time_ms < 100:
            self._sub_100ms_count += 1
    
    def get_p95_response_time(self) -> float:
        """Get 95th percentile response time."""
        if not self._response_times:
            return 0.0
        
        sorted_times = sorted(self._response_times)
        p95_index = int(len(sorted_times) * 0.95)
        return sorted_times[p95_index] if p95_index < len(sorted_times) else sorted_times[-1]
    
    def get_sub_100ms_rate(self) -> float:
        """Get percentage of rolls completed under 100ms."""
        if self._total_rolls == 0:
            return 0.0
        return self._sub_100ms_count / self._total_rolls
    
    def get_average_response_time(self) -> float:
        """Get average response time."""
        if not self._response_times:
            return 0.0
        return statistics.mean(self._response_times)

class DiceEngine:
    """High-performance dice rolling engine for SPARC RPG."""
    
    def __init__(self):
        self.rng = SecureRandomGenerator()
        self.probability_engine = ProbabilityEngine()
        self.performance_tracker = PerformanceTracker()
        self._roll_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self._session_stats: Dict[str, Dict] = defaultdict(dict)
    
    async def roll_dice(
        self,
        session_id: str,
        character_id: str,
        dice_count: int,
        dice_sides: int,
        modifier: int = 0,
        difficulty: Optional[int] = None,
        roll_type: str = "general"
    ) -> DiceRoll:
        """
        Execute dice roll with <100ms P95 performance guarantee.
        
        Args:
            session_id: Game session identifier
            character_id: Rolling character identifier
            dice_count: Number of dice to roll
            dice_sides: Sides per die
            modifier: Flat modifier to add
            difficulty: Target number for success/failure
            roll_type: Type of roll (attack, skill, save, etc.)
        
        Returns:
            DiceRoll object with complete results
        """
        start_time = time.perf_counter()
        
        # Validate inputs (fast fail)
        if dice_count <= 0 or dice_count > 20:
            raise ValueError("Dice count must be between 1 and 20")
        if dice_sides not in [4, 6, 8, 10, 12, 20]:
            raise ValueError("Dice sides must be 4, 6, 8, 10, 12, or 20")
        
        # Generate individual dice rolls
        individual_rolls = []
        for _ in range(dice_count):
            roll = self.rng.get_secure_random(1, dice_sides)
            individual_rolls.append(roll)
        
        # Calculate total result
        total_result = sum(individual_rolls) + modifier
        
        # Determine success if difficulty provided
        success = None
        if difficulty is not None:
            success = total_result >= difficulty
        
        # Create roll result
        roll_id = secrets.token_hex(8)
        end_time = time.perf_counter()
        response_time_ms = (end_time - start_time) * 1000
        
        dice_roll = DiceRoll(
            id=roll_id,
            session_id=session_id,
            character_id=character_id,
            roll_type=roll_type,
            dice_count=dice_count,
            dice_sides=dice_sides,
            modifier=modifier,
            result=total_result,
            individual_rolls=individual_rolls,
            difficulty=difficulty,
            success=success,
            timestamp=time.time(),
            response_time_ms=response_time_ms
        )
        
        # Record performance and history
        self.performance_tracker.record_roll(response_time_ms)
        self._roll_history[session_id].append(dice_roll)
        
        # Update session statistics
        self._update_session_stats(session_id, dice_roll)
        
        return dice_roll
    
    def _update_session_stats(self, session_id: str, roll: DiceRoll):
        """Update statistics for a session."""
        if session_id not in self._session_stats:
            self._session_stats[session_id] = {
                'total_rolls': 0,
                'total_result': 0,
                'success_count': 0,
                'roll_types': defaultdict(int)
            }
        
        stats = self._session_stats[session_id]
        stats['total_rolls'] += 1
        stats['total_result'] += roll.result
        stats['roll_types'][roll.roll_type] += 1
        
        if roll.success:
            stats['success_count'] += 1
    
    def get_recent_rolls(self, session_id: str, limit: int = 10) -> List[DiceRoll]:
        """Get recent dice rolls for a session."""
        rolls = list(self._roll_history[session_id])
        return rolls[-limit:] if rolls else []
    
    def get_session_statistics(self, session_id: str) -> DiceStatistics:
        """Get comprehensive statistics for a session."""
        if session_id not in self._session_stats:
            return DiceStatistics(0, 0.0, 0.0, {}, 0.0, 0.0)
        
        stats = self._session_stats[session_id]
        total_rolls = stats['total_rolls']
        
        if total_rolls == 0:
            return DiceStatistics(0, 0.0, 0.0, {}, 0.0, 0.0)
        
        average_result = stats['total_result'] / total_rolls
        success_rate = stats['success_count'] / total_rolls if stats['success_count'] > 0 else 0.0
        
        return DiceStatistics(
            total_rolls=total_rolls,
            average_result=average_result,
            success_rate=success_rate,
            common_roll_types=dict(stats['roll_types']),
            performance_p95_ms=self.performance_tracker.get_p95_response_time(),
            sub_100ms_rate=self.performance_tracker.get_sub_100ms_rate()
        )
    
    def get_probability_analysis(self, dice_count: int, dice_sides: int, 
                                modifier: int, difficulty: int) -> Dict[str, float]:
        """Get probability analysis for a potential roll."""
        expected_value = self.probability_engine.get_expected_value(
            dice_count, dice_sides, modifier
        )
        success_prob = self.probability_engine.get_success_probability(
            dice_count, dice_sides, modifier, difficulty
        )
        
        return {
            'expected_value': expected_value,
            'success_probability': success_prob,
            'failure_probability': 1.0 - success_prob,
            'difficulty_rating': self._get_difficulty_rating(success_prob)
        }
    
    def _get_difficulty_rating(self, success_prob: float) -> str:
        """Convert success probability to human-readable difficulty."""
        if success_prob >= 0.9:
            return "trivial"
        elif success_prob >= 0.75:
            return "easy"
        elif success_prob >= 0.5:
            return "medium"
        elif success_prob >= 0.25:
            return "hard"
        elif success_prob >= 0.1:
            return "very_hard"
        else:
            return "legendary"
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get engine performance statistics."""
        return {
            'p95_response_time_ms': self.performance_tracker.get_p95_response_time(),
            'average_response_time_ms': self.performance_tracker.get_average_response_time(),
            'sub_100ms_rate': self.performance_tracker.get_sub_100ms_rate(),
            'total_rolls': self.performance_tracker._total_rolls,
            'target_p95_ms': 100,
            'performance_health': 'excellent' if self.performance_tracker.get_p95_response_time() < 50 else
                                  'good' if self.performance_tracker.get_p95_response_time() < 100 else
                                  'degraded'
        }
    
    def clear_session_data(self, session_id: str):
        """Clear all data for a session."""
        if session_id in self._roll_history:
            del self._roll_history[session_id]
        if session_id in self._session_stats:
            del self._session_stats[session_id]

# Global dice engine instance
_dice_engine: Optional[DiceEngine] = None

def get_dice_engine() -> DiceEngine:
    """Get global dice engine instance."""
    global _dice_engine
    if _dice_engine is None:
        _dice_engine = DiceEngine()
    return _dice_engine