from typing import Dict, List, Optional, Any
import asyncio
import time
from datetime import datetime
import json

from .models import GameSession, Character, Adventure, DiceRoll


class AISeerAssistant:
    """
    AI Seer Assistant for providing contextual GM guidance.
    
    Designed to meet <3 second response time requirement while providing
    intelligent, context-aware suggestions for Game Masters.
    """
    
    # Pre-computed responses for common situations (performance optimization)
    QUICK_RESPONSES = {
        "combat_start": [
            "Roll initiative for all characters to determine turn order.",
            "Describe the scene and ask what each character wants to do.",
            "Remember characters can move, attack, or use special abilities."
        ],
        "skill_check": [
            "Choose the most relevant stat (STR, DEX, INT, CHA) for this action.",
            "Set difficulty: Easy (8), Medium (12), Hard (16), Very Hard (20).",
            "Let the player describe their approach before rolling."
        ],
        "player_confused": [
            "Ask the player what their character is trying to accomplish.",
            "Offer 2-3 specific action options based on their class.",
            "Remind them of their special abilities and equipment."
        ],
        "story_stall": [
            "Have an NPC react to the characters' presence.",
            "Introduce a complication or time pressure.",
            "Ask each character what they're doing right now."
        ]
    }
    
    # Common GM advice patterns
    ADVICE_PATTERNS = {
        "new_scene": "Start with what the characters see, hear, and smell.",
        "player_action": "Let players describe their approach before asking for rolls.",
        "combat_flow": "Keep turns under 30 seconds - ask 'what do you do?' and move on.",
        "story_focus": "Say yes to creative ideas, even if they're not in the adventure.",
        "difficulty": "Most checks should be Medium (12) - only use Hard (16) for dramatic moments."
    }
    
    def __init__(self):
        """Initialize AI Seer Assistant with performance tracking."""
        self._response_times: List[float] = []
        self._cache: Dict[str, Any] = {}
        self._context_memory: Dict[str, List[str]] = {}  # Session-based context
    
    async def get_seer_advice(
        self,
        session: GameSession,
        current_situation: str,
        characters: List[Character],
        recent_rolls: List[DiceRoll],
        adventure: Optional[Adventure] = None
    ) -> Dict[str, Any]:
        """
        Get AI advice for the current game situation.
        
        Args:
            session: Current game session
            current_situation: Description of what's happening
            characters: Active characters in the session
            recent_rolls: Recent dice rolls for context
            adventure: Current adventure (if any)
            
        Returns:
            AI advice with suggestions and quick actions
        """
        start_time = time.perf_counter()
        
        try:
            # Build context for AI
            context = self._build_context(
                session, current_situation, characters, recent_rolls, adventure
            )
            
            # Check for quick responses first (performance optimization)
            quick_response = self._check_quick_responses(current_situation, context)
            if quick_response:
                self._track_performance(time.perf_counter() - start_time)
                return quick_response
            
            # For MVP, provide structured advice without actual AI calls
            # This ensures <3 second response time while we develop AI integration
            advice = await self._generate_structured_advice(context)
            
            # Track performance
            elapsed_time = time.perf_counter() - start_time
            self._track_performance(elapsed_time)
            
            # Log warning if approaching time limit
            if elapsed_time > 2.0:  # 67% of 3 second budget
                print(f"WARNING: AI Seer response took {elapsed_time:.2f}s (approaching 3s limit)")
            
            return advice
            
        except Exception as e:
            # Fallback to quick advice on errors
            elapsed_time = time.perf_counter() - start_time
            self._track_performance(elapsed_time)
            
            print(f"ERROR: AI Seer failed after {elapsed_time:.2f}s: {str(e)}")
            
            return {
                "advice": "Keep the story moving forward and ask players what they want to do.",
                "suggestions": [
                    "Describe what the characters see and hear",
                    "Ask each player for their character's action",
                    "Use dice rolls when outcomes are uncertain"
                ],
                "quick_actions": ["Roll dice", "Next scene", "Combat"],
                "response_time_ms": int(elapsed_time * 1000),
                "fallback": True
            }
    
    def _build_context(
        self,
        session: GameSession,
        situation: str,
        characters: List[Character],
        recent_rolls: List[DiceRoll],
        adventure: Optional[Adventure]
    ) -> Dict[str, Any]:
        """Build context dictionary for AI decision making."""
        
        # Analyze recent rolls for patterns
        roll_analysis = self._analyze_recent_rolls(recent_rolls)
        
        # Character status summary
        character_status = []
        for char in characters:
            status = {
                "name": char.name,
                "class": char.character_class,
                "hp_percentage": char.current_hp / char.max_hp,
                "special_available": char.special_ability_available,
                "heroic_saves": char.heroic_saves_available
            }
            character_status.append(status)
        
        return {
            "session_id": session.id,
            "situation": situation.lower(),
            "session_status": session.status,
            "turn_count": len(recent_rolls),
            "characters": character_status,
            "recent_rolls": roll_analysis,
            "adventure_context": adventure.title if adventure else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_quick_responses(
        self, 
        situation: str, 
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Check for pre-computed quick responses."""
        
        situation_lower = situation.lower()
        
        # Pattern matching for common situations
        if "initiative" in situation_lower or "combat" in situation_lower:
            return self._format_quick_response("combat_start", context)
        
        if "skill check" in situation_lower or "roll" in situation_lower:
            return self._format_quick_response("skill_check", context)
        
        if "confused" in situation_lower or "what do i do" in situation_lower:
            return self._format_quick_response("player_confused", context)
        
        if "stuck" in situation_lower or "stall" in situation_lower:
            return self._format_quick_response("story_stall", context)
        
        return None
    
    def _format_quick_response(
        self, 
        response_type: str, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Format a quick response with context."""
        
        base_advice = self.QUICK_RESPONSES[response_type]
        
        return {
            "advice": base_advice[0],
            "suggestions": base_advice,
            "quick_actions": self._get_relevant_actions(response_type),
            "context_aware": True,
            "response_time_ms": 50,  # Quick responses are very fast
            "type": "quick_response"
        }
    
    def _get_relevant_actions(self, situation_type: str) -> List[str]:
        """Get relevant quick actions for situation type."""
        
        action_map = {
            "combat_start": ["Roll Initiative", "Describe Scene", "Start Combat"],
            "skill_check": ["Set Difficulty", "Roll Dice", "Describe Outcome"],
            "player_confused": ["Suggest Actions", "Show Abilities", "Describe Scene"],
            "story_stall": ["Add NPC", "Create Complication", "Next Scene"]
        }
        
        return action_map.get(situation_type, ["Continue", "Roll Dice", "Next Scene"])
    
    async def _generate_structured_advice(
        self, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate structured advice using rule-based logic.
        
        For MVP, this uses game design patterns rather than AI.
        Will be replaced with actual AI integration later.
        """
        
        # Simulate processing time (remove in production)
        await asyncio.sleep(0.1)
        
        advice_components = []
        suggestions = []
        
        # Analyze session state
        if context["turn_count"] == 0:
            advice_components.append("This is the beginning of the session.")
            suggestions.append("Start with scene setting and character introductions")
        
        # Character health analysis
        low_health_chars = [c for c in context["characters"] if c["hp_percentage"] < 0.3]
        if low_health_chars:
            advice_components.append(f"{len(low_health_chars)} character(s) are in danger.")
            suggestions.append("Consider healing opportunities or retreat options")
        
        # Recent roll analysis
        if context["recent_rolls"]["failure_streak"] >= 3:
            advice_components.append("Players have had several failures recently.")
            suggestions.append("Consider lower difficulties or automatic successes")
        
        # Default advice
        if not advice_components:
            advice_components.append("Keep the story moving and ask players for actions.")
        
        if not suggestions:
            suggestions = [
                "Describe what characters see and experience",
                "Ask each player what their character does",
                "Use dice rolls when outcomes are uncertain"
            ]
        
        primary_advice = " ".join(advice_components)
        
        return {
            "advice": primary_advice,
            "suggestions": suggestions,
            "quick_actions": ["Continue Story", "Roll Dice", "Combat", "Skill Check"],
            "context_summary": self._summarize_context(context),
            "response_time_ms": 100,
            "confidence": 0.8,
            "type": "structured_advice"
        }
    
    def _analyze_recent_rolls(self, recent_rolls: List[DiceRoll]) -> Dict[str, Any]:
        """Analyze recent dice rolls for patterns."""
        
        if not recent_rolls:
            return {"count": 0, "success_rate": 0.5, "failure_streak": 0}
        
        # Look at last 10 rolls max
        recent = recent_rolls[-10:]
        
        successes = sum(1 for roll in recent if roll.is_success is True)
        failures = sum(1 for roll in recent if roll.is_success is False)
        total_with_difficulty = successes + failures
        
        success_rate = successes / total_with_difficulty if total_with_difficulty > 0 else 0.5
        
        # Calculate failure streak
        failure_streak = 0
        for roll in reversed(recent):
            if roll.is_success is False:
                failure_streak += 1
            else:
                break
        
        return {
            "count": len(recent),
            "success_rate": success_rate,
            "failure_streak": failure_streak,
            "recent_types": [roll.roll_type for roll in recent[-3:]]
        }
    
    def _summarize_context(self, context: Dict[str, Any]) -> str:
        """Create a brief context summary for the Seer."""
        
        char_count = len(context["characters"])
        situation = context["situation"]
        
        summary_parts = [f"{char_count} characters active"]
        
        if "combat" in situation:
            summary_parts.append("in combat")
        elif "skill" in situation:
            summary_parts.append("making skill checks")
        
        if context["recent_rolls"]["failure_streak"] > 2:
            summary_parts.append("recent failures")
        
        return ", ".join(summary_parts)
    
    def _track_performance(self, elapsed_time: float) -> None:
        """Track response time performance."""
        
        self._response_times.append(elapsed_time)
        
        # Keep only last 100 responses for memory efficiency
        if len(self._response_times) > 100:
            self._response_times.pop(0)
    
    def get_performance_stats(self) -> Dict[str, float]:
        """Get AI Seer performance statistics."""
        
        if not self._response_times:
            return {
                "total_requests": 0,
                "avg_time_s": 0.0,
                "p95_time_s": 0.0,
                "max_time_s": 0.0,
                "healthy": True
            }
        
        sorted_times = sorted(self._response_times)
        count = len(sorted_times)
        
        avg_time = sum(sorted_times) / count
        p95_time = sorted_times[int(count * 0.95)] if count > 0 else 0.0
        max_time = max(sorted_times)
        
        return {
            "total_requests": count,
            "avg_time_s": avg_time,
            "p95_time_s": p95_time,
            "max_time_s": max_time,
            "healthy": p95_time < 3.0,  # <3 second requirement
            "performance_target_s": 3.0
        }
    
    async def get_rule_clarification(
        self, 
        rule_question: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get clarification on SPARC game rules.
        
        Args:
            rule_question: Question about game mechanics
            context: Optional context for more specific advice
            
        Returns:
            Rule clarification and examples
        """
        
        # Rule database for quick lookups
        rules_db = {
            "attack": {
                "rule": "Roll 1d6 + attacking stat vs defender's 1d6 + defending stat",
                "example": "Warrior (STR 6) attacks: rolls 4+6=10 vs Goblin defense 3+2=5. Hit!",
                "tip": "Higher stat gives better chance to hit"
            },
            "damage": {
                "rule": "Roll 1d6 damage on successful hit",
                "example": "Successful attack rolls 1d6: rolls 4 damage to target",
                "tip": "Some weapons or abilities modify damage"
            },
            "initiative": {
                "rule": "Each character rolls 1d6, highest goes first",
                "example": "Alice rolls 5, Bob rolls 3, Carol rolls 5. Alice and Carol tied - roll again or choose order.",
                "tip": "Resolve ties with another roll or Seer decision"
            },
            "skill_check": {
                "rule": "Roll 1d6 + relevant stat vs difficulty number",
                "example": "Climbing (STR check): roll 3+4 STR = 7 vs difficulty 12. Failure.",
                "tip": "Easy 8, Medium 12, Hard 16, Very Hard 20"
            },
            "special_ability": {
                "rule": "Each class has one special ability, usable once per adventure",
                "example": "Cleric uses Divine Healing to restore 1d6+2 HP to an ally",
                "tip": "Abilities recharge after a full rest between adventures"
            },
            "heroic_save": {
                "rule": "Reroll any die roll, 3 uses per character per adventure",
                "example": "Failed attack roll of 2? Use heroic save to reroll: now rolled 5!",
                "tip": "Save these for important moments - they don't recharge easily"
            }
        }
        
        question_lower = rule_question.lower()
        
        # Find matching rule
        for rule_key, rule_data in rules_db.items():
            if rule_key in question_lower:
                return {
                    "question": rule_question,
                    "rule": rule_data["rule"],
                    "example": rule_data["example"],
                    "seer_tip": rule_data["tip"],
                    "quick_reference": True,
                    "response_time_ms": 10
                }
        
        # General rule guidance
        return {
            "question": rule_question,
            "rule": "SPARC uses simple d6 mechanics for everything",
            "guidance": "When in doubt: roll 1d6 + stat vs difficulty (8/12/16/20)",
            "seer_tip": "Keep it simple and keep the story moving forward",
            "quick_reference": False,
            "response_time_ms": 10
        }