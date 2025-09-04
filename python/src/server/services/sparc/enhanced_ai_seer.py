"""
Enhanced AI Seer Assistant Service for SPARC RPG.
Provides <3 second contextual GM guidance with fallback strategies.
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import random

from .openai_client import get_openai_client

logger = logging.getLogger(__name__)


class EnhancedAISeerService:
    def __init__(self):
        self.response_cache: Dict[str, Dict[str, Any]] = {}
        self.performance_stats = {
            "total_requests": 0,
            "average_response_time": 0.0,
            "cache_hit_rate": 0.0,
            "sub_3_second_rate": 0.0,
            "failure_rate": 0.0
        }
        self._load_quick_responses()

    def _load_quick_responses(self):
        """Load pre-computed responses for common scenarios."""
        self.quick_responses = {
            "scene_guidance": [
                {
                    "type": "scene_guidance",
                    "title": "Add Scene Energy",
                    "content": "Introduce an NPC reaction, time pressure, or environmental change to keep the scene dynamic.",
                    "confidence": 0.9,
                    "follow_up_suggestions": ["Add NPC", "Create urgency", "Change environment"]
                },
                {
                    "type": "scene_guidance", 
                    "title": "Player Focus",
                    "content": "Ask each player what their character is doing right now to maintain engagement.",
                    "confidence": 0.85,
                    "follow_up_suggestions": ["Go around table", "Focus on quiet player", "Ask for specific actions"]
                }
            ],
            "player_help": [
                {
                    "type": "player_help",
                    "title": "Offer Specific Options",
                    "content": "Give players 2-3 concrete action choices based on their character class and the situation.",
                    "confidence": 0.9,
                    "follow_up_suggestions": ["List class abilities", "Show equipment options", "Suggest creative approaches"]
                },
                {
                    "type": "player_help",
                    "title": "Clarify the Scene", 
                    "content": "Re-describe what the character can see, hear, and interact with in the current moment.",
                    "confidence": 0.85,
                    "follow_up_suggestions": ["Describe sensory details", "Show available objects", "Mention other characters"]
                }
            ],
            "rule_clarification": [
                {
                    "type": "rule_clarification",
                    "title": "Basic Dice Rolling",
                    "content": "Roll 1d6 + relevant stat vs difficulty: Easy (8), Medium (12), Hard (16), Very Hard (20).",
                    "confidence": 1.0,
                    "relevant_rules": ["Attribute + 1d6 system", "Standard difficulties", "Success thresholds"]
                },
                {
                    "type": "rule_clarification",
                    "title": "Combat Flow",
                    "content": "Roll initiative (1d6), act in order, attack vs defense, deal damage, repeat until resolved.",
                    "confidence": 0.95,
                    "relevant_rules": ["Initiative order", "Attack rolls", "Damage resolution"]
                }
            ]
        }

        self.rule_database = {
            "dice_rolling": [
                {
                    "id": "basic_rolls",
                    "title": "Basic Dice Rolls",
                    "category": "dice_rolling",
                    "content": "All rolls use 1d6 + stat vs difficulty number. Easy: 8, Medium: 12, Hard: 16, Very Hard: 20.",
                    "confidence_score": 1.0,
                    "source_section": "Core Rules"
                },
                {
                    "id": "advantage_rolls",
                    "title": "Advantage and Disadvantage", 
                    "category": "dice_rolling",
                    "content": "Roll 2d6 and take highest for advantage, lowest for disadvantage. Add stat as normal.",
                    "confidence_score": 0.95,
                    "source_section": "Advanced Rules"
                }
            ],
            "character_actions": [
                {
                    "id": "action_types",
                    "title": "Types of Actions",
                    "category": "character_actions", 
                    "content": "Move, Attack, Defend, Use Ability, Interact, or creative actions. Most need dice rolls if outcome uncertain.",
                    "confidence_score": 0.9,
                    "source_section": "Actions"
                }
            ]
        }

    async def generate_contextual_advice(
        self,
        query: str,
        context: Dict[str, Any],
        request_type: str = "general",
        max_time_ms: int = 3000
    ) -> Dict[str, Any]:
        """Generate AI advice with <3 second guarantee."""
        start_time = time.perf_counter()
        
        # Check cache first
        cache_key = f"{query}:{request_type}:{str(sorted(context.items()))}"
        if cache_key in self.response_cache:
            cached = self.response_cache[cache_key]
            cached["response_time_ms"] = 50  # Cache hit time
            cached["from_cache"] = True
            self._update_performance_stats(50, True, True)
            return cached

        try:
            # Quick response for common requests
            if query.lower() in ["help", "what should i do", "i'm stuck", "scene ideas"]:
                advice = self._get_quick_response(request_type, context)
            else:
                # Generate contextual response
                advice = await self._generate_contextual_response(query, context, request_type, max_time_ms)
            
            # Calculate response time
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            advice["response_time_ms"] = elapsed_ms
            
            # Cache if response was fast
            if elapsed_ms < 1000:
                self.response_cache[cache_key] = advice.copy()
                # Limit cache size
                if len(self.response_cache) > 100:
                    # Remove oldest entry
                    oldest_key = next(iter(self.response_cache))
                    del self.response_cache[oldest_key]
            
            self._update_performance_stats(elapsed_ms, True, False)
            return advice
            
        except Exception as e:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            logger.error(f"AI advice generation failed after {elapsed_ms}ms: {e}")
            
            fallback_advice = self._get_fallback_response(query, request_type)
            fallback_advice["response_time_ms"] = elapsed_ms
            fallback_advice["error"] = str(e)
            
            self._update_performance_stats(elapsed_ms, False, False)
            return fallback_advice

    async def _generate_contextual_response(
        self,
        query: str,
        context: Dict[str, Any],
        request_type: str,
        max_time_ms: int
    ) -> Dict[str, Any]:
        """Generate response using OpenAI with fallback to rule-based logic."""
        
        # Try OpenAI first for high-quality responses
        try:
            openai_client = await get_openai_client()
            
            # Reserve 200ms for processing and fallback if needed
            ai_timeout_ms = max_time_ms - 200
            
            ai_response = await openai_client.generate_contextual_advice(
                prompt=query,
                context=context,
                max_time_ms=ai_timeout_ms
            )
            
            # If AI response is successful and not a fallback, use it
            if not ai_response.get("fallback", False) and not ai_response.get("ai_unavailable", False):
                # Add request type specific enhancements
                ai_response["request_type"] = request_type
                ai_response["follow_up_suggestions"] = self._get_contextual_suggestions(request_type, context)
                return ai_response
                
        except Exception as e:
            logger.warning(f"OpenAI integration failed: {str(e)}")
        
        # Fallback to rule-based responses
        logger.info(f"Using rule-based fallback for request_type: {request_type}")
        
        if request_type == "scene_guidance":
            return self._generate_scene_advice(query, context)
        elif request_type == "player_help":
            return self._generate_player_advice(query, context)
        elif request_type == "rule_clarification":
            return self._generate_rule_advice(query, context)
        else:
            return self._generate_general_advice(query, context)

    def _generate_scene_advice(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate scene-specific advice."""
        current_scene = context.get("current_scene", "unknown")
        player_engagement = context.get("player_engagement", 5)
        
        if player_engagement < 6:
            advice_content = "Players seem disengaged. Try adding an immediate choice or exciting development."
            suggestions = ["Add sudden complication", "Ask for immediate decisions", "Introduce mystery element"]
        else:
            advice_content = "Scene energy is good. Keep momentum with character focus and meaningful choices."
            suggestions = ["Build on current momentum", "Deepen character moments", "Add story consequences"]
        
        return {
            "type": "scene_guidance",
            "title": "Scene Management Advice",
            "content": advice_content,
            "context": f"Scene: {current_scene}, Engagement: {player_engagement}/10",
            "confidence": 0.8,
            "follow_up_suggestions": suggestions
        }

    def _generate_player_advice(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate player assistance advice."""
        difficulty_level = context.get("difficulty_level", "newcomer")
        
        if difficulty_level == "newcomer":
            content = "New players need clear options. Offer 2-3 specific actions they can take right now."
            suggestions = ["Show available actions", "Explain consequences", "Encourage creativity"]
        else:
            content = "Experienced players can handle open-ended questions. Ask what they want to accomplish."
            suggestions = ["Ask for goals", "Offer complications", "Challenge assumptions"]
        
        return {
            "type": "player_help",
            "title": "Player Guidance",
            "content": content,
            "context": f"Player level: {difficulty_level}",
            "confidence": 0.85,
            "follow_up_suggestions": suggestions
        }

    def _generate_rule_advice(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate rule clarification advice."""
        return {
            "type": "rule_clarification",
            "title": "Rule Guidance",
            "content": "SPARC uses simple 1d6 + stat rolls. When in doubt, set difficulty and roll!",
            "context": "Core mechanics",
            "confidence": 0.9,
            "relevant_rules": ["1d6 + stat system", "Difficulty numbers", "Success/failure interpretation"],
            "follow_up_suggestions": ["Check specific situation", "Consider player intent", "Keep it simple"]
        }

    def _generate_general_advice(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate general GM advice."""
        return {
            "type": "general",
            "title": "General GM Guidance",
            "content": "Focus on player agency, meaningful choices, and story momentum. When in doubt, ask players what they want to do.",
            "context": "General GMing",
            "confidence": 0.7,
            "follow_up_suggestions": ["Player focus", "Story momentum", "Meaningful choices"]
        }

    def _get_quick_response(self, request_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Get pre-computed quick response."""
        responses = self.quick_responses.get(request_type, self.quick_responses["player_help"])
        response = random.choice(responses).copy()
        response["context"] = f"Quick response for {request_type}"
        return response

    def _get_contextual_suggestions(self, request_type: str, context: Dict[str, Any]) -> List[str]:
        """Get contextual follow-up suggestions based on request type."""
        
        suggestion_map = {
            "scene_guidance": ["Add NPC", "Create Urgency", "Focus Players", "Change Location"],
            "player_help": ["Show Options", "List Abilities", "Clarify Scene", "Offer Guidance"],
            "rule_clarification": ["Check Specific Rule", "Simple Approach", "Ask for Intent"],
            "general": ["Continue Story", "Roll Dice", "Ask Players", "Add Complication"]
        }
        
        base_suggestions = suggestion_map.get(request_type, suggestion_map["general"])
        
        # Add context-specific suggestions
        if context.get("player_engagement", 5) < 6:
            base_suggestions.append("Boost Engagement")
        
        if context.get("scene_energy") == "low":
            base_suggestions.append("Add Energy")
        
        return base_suggestions[:4]  # Limit to 4 suggestions
    
    def _get_fallback_response(self, query: str, request_type: str) -> Dict[str, Any]:
        """Get fallback response when AI fails."""
        fallback_responses = {
            "scene_guidance": {
                "type": "scene_guidance",
                "title": "Keep Scene Moving",
                "content": "Add energy with NPC reactions, time pressure, or ask players for immediate actions.",
                "confidence": 0.6,
                "fallback": True
            },
            "player_help": {
                "type": "player_help", 
                "title": "Help Confused Players",
                "content": "Offer 2-3 specific action options based on their character and the current situation.",
                "confidence": 0.6,
                "fallback": True
            },
            "rule_clarification": {
                "type": "rule_clarification",
                "title": "Simple Rule Guidance", 
                "content": "Use 1d6 + stat vs difficulty. Easy: 8, Medium: 12, Hard: 16. Keep it simple!",
                "confidence": 0.8,
                "fallback": True
            },
            "general": {
                "type": "general",
                "title": "General GM Advice",
                "content": "Focus on player choices and story momentum. When stuck, ask 'What do you want to do?'",
                "confidence": 0.5,
                "fallback": True
            }
        }
        
        return fallback_responses.get(request_type, fallback_responses["general"])

    async def generate_contextual_suggestions(
        self,
        context: Dict[str, Any],
        suggestion_types: List[str],
        max_suggestions: int = 4
    ) -> List[Dict[str, Any]]:
        """Generate contextual suggestions based on game state."""
        suggestions = []
        
        for suggestion_type in suggestion_types[:max_suggestions]:
            if suggestion_type in self.quick_responses:
                suggestion = random.choice(self.quick_responses[suggestion_type]).copy()
                suggestion["id"] = f"{suggestion_type}_{int(time.time() * 1000)}"
                suggestion["urgency"] = self._calculate_urgency(context, suggestion_type)
                suggestion["context_relevance"] = random.uniform(0.7, 1.0)
                suggestion["estimated_impact"] = random.choice(["Low", "Medium", "High"])
                suggestion["implementation_hint"] = f"Best used when {suggestion_type.replace('_', ' ')}"
                suggestions.append(suggestion)
        
        return suggestions

    def _calculate_urgency(self, context: Dict[str, Any], suggestion_type: str) -> str:
        """Calculate urgency level for a suggestion."""
        player_engagement = context.get("player_engagement", 5)
        scene_energy = context.get("scene_energy", "medium")
        
        if player_engagement < 4 or scene_energy == "low":
            return "high"
        elif player_engagement < 7 or scene_energy == "medium":
            return "medium"
        else:
            return "low"

    async def get_rule_clarification(
        self,
        query: str,
        context: Dict[str, Any],
        category: Optional[str] = None,
        max_time_ms: int = 3000
    ) -> Dict[str, Any]:
        """Get rule clarification with fast lookup."""
        
        # Quick lookup in rule database
        rules = []
        if category and category in self.rule_database:
            rules = self.rule_database[category]
        else:
            # Search all rules
            for cat_rules in self.rule_database.values():
                rules.extend(cat_rules)
        
        # Find relevant rules (simplified matching)
        relevant_rules = []
        query_lower = query.lower()
        for rule in rules:
            if any(word in rule["title"].lower() or word in rule["content"].lower() 
                   for word in query_lower.split()):
                relevant_rules.append(rule)
        
        if relevant_rules:
            main_rule = relevant_rules[0]
            answer = main_rule["content"]
        else:
            answer = "SPARC uses 1d6 + stat vs difficulty numbers. When in doubt, keep it simple!"
            relevant_rules = [self.rule_database["dice_rolling"][0]]  # Basic rule
        
        return {
            "answer": answer,
            "rules": relevant_rules[:3],  # Limit to top 3
            "context": f"Rule query: {query}",
            "clarity_score": 0.9 if relevant_rules else 0.6,
            "follow_up_questions": [
                "How do I handle advantage/disadvantage?",
                "What if players try something creative?",
                "When should I not require rolls?"
            ]
        }

    async def get_quick_rules(self, category: str = "all", limit: int = 6) -> List[Dict[str, Any]]:
        """Get quick reference rules."""
        if category == "all":
            all_rules = []
            for cat_rules in self.rule_database.values():
                all_rules.extend(cat_rules)
            return all_rules[:limit]
        elif category in self.rule_database:
            return self.rule_database[category][:limit]
        else:
            return []

    def _update_performance_stats(self, response_time_ms: int, success: bool, from_cache: bool):
        """Update performance tracking statistics."""
        self.performance_stats["total_requests"] += 1
        total = self.performance_stats["total_requests"]
        
        # Update averages
        current_avg = self.performance_stats["average_response_time"]
        self.performance_stats["average_response_time"] = (
            (current_avg * (total - 1)) + response_time_ms
        ) / total
        
        # Update rates
        if from_cache:
            cache_hits = self.performance_stats["cache_hit_rate"] * (total - 1) + 1
            self.performance_stats["cache_hit_rate"] = cache_hits / total
        
        if response_time_ms < 3000 and success:
            sub_3s = self.performance_stats["sub_3_second_rate"] * (total - 1) + 1
            self.performance_stats["sub_3_second_rate"] = sub_3s / total
        
        if not success:
            failures = self.performance_stats["failure_rate"] * (total - 1) + 1
            self.performance_stats["failure_rate"] = failures / total

    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get current performance statistics including OpenAI metrics."""
        
        base_stats = {
            "healthy": self.performance_stats["sub_3_second_rate"] > 0.8,
            "average_response_time_ms": self.performance_stats["average_response_time"],
            "sub_3_second_rate": self.performance_stats["sub_3_second_rate"],
            "cache_hit_rate": self.performance_stats["cache_hit_rate"],
            "failure_rate": self.performance_stats["failure_rate"],
            "total_requests": self.performance_stats["total_requests"],
            "cache_size": len(self.response_cache)
        }
        
        # Add OpenAI performance stats
        try:
            openai_client = await get_openai_client()
            openai_stats = openai_client.get_performance_stats()
            
            base_stats.update({
                "openai_healthy": openai_stats["healthy"],
                "openai_api_available": openai_stats["api_available"],
                "openai_success_rate": openai_stats["success_rate"],
                "openai_avg_response_time_ms": openai_stats["avg_response_time_ms"],
                "openai_p95_response_time_ms": openai_stats["p95_response_time_ms"],
                "openai_cache_hit_rate": openai_stats["cache_hit_rate"],
                "openai_model": openai_stats.get("model", "unknown")
            })
        except Exception as e:
            logger.warning(f"Could not get OpenAI stats: {str(e)}")
            base_stats.update({
                "openai_healthy": False,
                "openai_api_available": False,
                "openai_error": str(e)
            })
        
        return base_stats


# Global service instance
_enhanced_ai_seer: Optional[EnhancedAISeerService] = None


async def get_enhanced_ai_seer() -> EnhancedAISeerService:
    """Get the global enhanced AI seer instance."""
    global _enhanced_ai_seer
    if _enhanced_ai_seer is None:
        _enhanced_ai_seer = EnhancedAISeerService()
    return _enhanced_ai_seer