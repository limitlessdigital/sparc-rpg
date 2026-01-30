import secrets
import time
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone
from collections import defaultdict

from .models import DiceRoll, DiceRollType, RollDiceRequest, RollDiceResponse


class DiceRollingEngine:
    """
    High-performance dice rolling engine for SPARC game system.
    
    Designed to meet <100ms P95 response time requirement using:
    - Cryptographically secure random number generation
    - Optimized calculation paths 
    - Pre-computed difficulty tables
    - Minimal object creation
    """
    
    # Pre-computed success probabilities for quick difficulty validation
    DIFFICULTY_PROBABILITIES = {
        1: 1.0,      # Always succeed
        2: 0.833,    # 5/6 chance  
        3: 0.667,    # 4/6 chance
        4: 0.500,    # 3/6 chance
        5: 0.333,    # 2/6 chance
        6: 0.167     # 1/6 chance
    }
    
    # Performance tracking for monitoring
    _roll_times: List[float] = []
    _roll_count = 0
    
    def __init__(self):
        """Initialize dice engine with secure random generator."""
        self._rng = secrets.SystemRandom()
    
    def roll_dice(
        self, 
        session_id: str, 
        request: RollDiceRequest
    ) -> RollDiceResponse:
        """
        Roll dice with <100ms performance requirement.
        
        Args:
            session_id: Current game session ID
            request: Dice roll request parameters
            
        Returns:
            RollDiceResponse with roll results and animation duration
            
        Raises:
            ValueError: If invalid roll parameters
        """
        start_time = time.perf_counter()
        
        try:
            # Validate request parameters quickly
            self._validate_roll_request(request)
            
            # Generate cryptographically secure random results
            results = self._generate_dice_results(request.dice_count)
            
            # Calculate total with modifier
            total = sum(results) + request.modifier
            
            # Determine success/failure if difficulty set
            is_success = None
            if request.difficulty is not None:
                is_success = total >= request.difficulty
            
            # Create dice roll record
            dice_roll = DiceRoll(
                session_id=session_id,
                character_id=request.character_id,
                roll_type=request.roll_type,
                dice_count=request.dice_count,
                results=results,
                total=total,
                difficulty=request.difficulty,
                is_success=is_success,
                modifier=request.modifier,
                context=request.context,
                rolled_at=datetime.now(timezone.utc)
            )
            
            # Calculate animation duration based on dice count
            animation_duration = self._calculate_animation_duration(request.dice_count)
            
            # Track performance
            elapsed_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
            self._track_performance(elapsed_time)
            
            return RollDiceResponse(
                roll=dice_roll,
                animation_duration_ms=animation_duration
            )
            
        except Exception as e:
            # Ensure we don't exceed performance budget even on errors
            elapsed_time = (time.perf_counter() - start_time) * 1000
            self._track_performance(elapsed_time)
            raise e
    
    def _validate_roll_request(self, request: RollDiceRequest) -> None:
        """
        Fast validation of roll request parameters.
        
        Args:
            request: Roll request to validate
            
        Raises:
            ValueError: If invalid parameters
        """
        if request.dice_count < 1 or request.dice_count > 10:
            raise ValueError("Dice count must be between 1 and 10")
        
        if request.difficulty is not None and (request.difficulty < 1 or request.difficulty > 36):
            raise ValueError("Difficulty must be between 1 and 36")
        
        if abs(request.modifier) > 20:
            raise ValueError("Modifier must be between -20 and +20")
    
    def _generate_dice_results(self, dice_count: int) -> List[int]:
        """
        Generate cryptographically secure dice results.
        
        Uses secrets.SystemRandom for fairness and security.
        Optimized for minimal object creation.
        
        Args:
            dice_count: Number of d6 dice to roll
            
        Returns:
            List of dice results (1-6 each)
        """
        # Pre-allocate list for performance
        results = [0] * dice_count
        
        # Generate results in tight loop for performance
        for i in range(dice_count):
            results[i] = self._rng.randint(1, 6)
        
        return results
    
    def _calculate_animation_duration(self, dice_count: int) -> int:
        """
        Calculate optimal animation duration based on dice count.
        
        Balances visual appeal with game flow speed.
        
        Args:
            dice_count: Number of dice rolled
            
        Returns:
            Animation duration in milliseconds
        """
        # Base duration: 800ms for single die
        # Additional time: 100ms per extra die
        # Max duration: 2000ms to keep game flowing
        base_duration = 800
        additional_duration = (dice_count - 1) * 100
        return min(base_duration + additional_duration, 2000)
    
    def _track_performance(self, elapsed_time_ms: float) -> None:
        """
        Track rolling performance for monitoring.
        
        Args:
            elapsed_time_ms: Time taken for roll in milliseconds
        """
        self._roll_times.append(elapsed_time_ms)
        self._roll_count += 1
        
        # Keep only last 1000 rolls for memory efficiency
        if len(self._roll_times) > 1000:
            self._roll_times.pop(0)
    
    def get_performance_stats(self) -> Dict[str, float]:
        """
        Get current performance statistics.
        
        Returns:
            Dictionary with performance metrics
        """
        if not self._roll_times:
            return {
                "total_rolls": 0,
                "avg_time_ms": 0.0,
                "p95_time_ms": 0.0,
                "p99_time_ms": 0.0,
                "max_time_ms": 0.0
            }
        
        sorted_times = sorted(self._roll_times)
        count = len(sorted_times)
        
        return {
            "total_rolls": self._roll_count,
            "avg_time_ms": sum(sorted_times) / count,
            "p95_time_ms": sorted_times[int(count * 0.95)] if count > 0 else 0.0,
            "p99_time_ms": sorted_times[int(count * 0.99)] if count > 0 else 0.0,
            "max_time_ms": max(sorted_times)
        }
    
    def roll_initiative(self, character_ids: List[str], session_id: str) -> List[Tuple[str, int]]:
        """
        Roll initiative for all characters and return sorted order.
        
        Args:
            character_ids: List of character IDs to roll for
            session_id: Current session ID
            
        Returns:
            List of (character_id, initiative_roll) tuples sorted by initiative
        """
        initiative_rolls = []
        
        for character_id in character_ids:
            request = RollDiceRequest(
                dice_count=1,
                roll_type=DiceRollType.INITIATIVE,
                character_id=character_id,
                context="Initiative roll"
            )
            
            response = self.roll_dice(session_id, request)
            initiative_rolls.append((character_id, response.roll.total))
        
        # Sort by initiative (highest first), with random tiebreaker
        initiative_rolls.sort(key=lambda x: (x[1], self._rng.random()), reverse=True)
        
        return initiative_rolls
    
    def calculate_attack_success(
        self, 
        attacker_stat: int, 
        defender_stat: int,
        attacker_dice: int = 1,
        defender_dice: int = 1
    ) -> Dict[str, float]:
        """
        Calculate attack success probability for tactical planning.
        
        Args:
            attacker_stat: Attacker's relevant stat (1-6)
            defender_stat: Defender's relevant stat (1-6)  
            attacker_dice: Number of dice attacker rolls
            defender_dice: Number of dice defender rolls
            
        Returns:
            Dictionary with success probability and expected outcomes
        """
        # This is a simplified calculation - in production you'd want
        # a more sophisticated probability calculation
        
        attacker_avg = (3.5 * attacker_dice) + attacker_stat
        defender_avg = (3.5 * defender_dice) + defender_stat
        
        # Simple probability based on average outcomes
        if attacker_avg >= defender_avg:
            success_prob = 0.6 + (attacker_avg - defender_avg) * 0.1
        else:
            success_prob = 0.4 - (defender_avg - attacker_avg) * 0.1
        
        success_prob = max(0.05, min(0.95, success_prob))
        
        return {
            "success_probability": success_prob,
            "attacker_expected": attacker_avg,
            "defender_expected": defender_avg,
            "advantage": "attacker" if attacker_avg > defender_avg else "defender"
        }
    
    def simulate_combat_round(
        self,
        session_id: str,
        attacker_id: str,
        attacker_stat: int,
        defender_id: str,
        defender_stat: int
    ) -> Dict[str, any]:
        """
        Simulate a complete combat round with attack and damage rolls.
        
        Args:
            session_id: Current session ID
            attacker_id: Attacking character ID
            attacker_stat: Attacker's attack stat
            defender_id: Defending character ID (None for monster)
            defender_stat: Defender's defense stat
            
        Returns:
            Dictionary with complete combat results
        """
        # Attack roll
        attack_request = RollDiceRequest(
            dice_count=1,
            roll_type=DiceRollType.ATTACK,
            character_id=attacker_id,
            difficulty=None,  # Will compare to defense roll
            modifier=attacker_stat,
            context=f"Attack vs {defender_id or 'monster'}"
        )
        
        attack_response = self.roll_dice(session_id, attack_request)
        attack_total = attack_response.roll.total
        
        # Defense roll (simulate for defender)
        defense_total = sum(self._generate_dice_results(1)) + defender_stat
        
        hit = attack_total >= defense_total
        damage = 0
        damage_roll = None
        
        if hit:
            # Damage roll
            damage_request = RollDiceRequest(
                dice_count=1,
                roll_type=DiceRollType.DAMAGE,
                character_id=attacker_id,
                context=f"Damage to {defender_id or 'monster'}"
            )
            
            damage_response = self.roll_dice(session_id, damage_request)
            damage = damage_response.roll.total
            damage_roll = damage_response.roll
        
        return {
            "hit": hit,
            "attack_roll": attack_response.roll,
            "attack_total": attack_total,
            "defense_total": defense_total,
            "damage": damage,
            "damage_roll": damage_roll,
            "summary": f"Attack {attack_total} vs Defense {defense_total} - {'HIT' if hit else 'MISS'}"
        }