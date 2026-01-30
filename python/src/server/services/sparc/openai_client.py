"""
OpenAI Client Service for SPARC AI Seer Assistant.
Provides <3 second response time guarantee with fallback strategies.
"""

import asyncio
import aiohttp
import time
import json
import logging
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class OpenAIClientService:
    """
    OpenAI client with strict timeout handling and fallback strategies.
    
    Designed to meet <3 second response time requirement while providing
    intelligent AI responses for Game Master assistance.
    """
    
    def __init__(self):
        """Initialize OpenAI client with performance monitoring."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
        # Performance tracking
        self._response_times: List[float] = []
        self._failed_requests = 0
        self._total_requests = 0
        self._cache_hits = 0
        
        # Response caching for performance
        self._response_cache: Dict[str, Tuple[Dict[str, Any], datetime]] = {}
        self._cache_ttl_minutes = 15
        
        # Rate limiting protection
        self._last_request_time = 0.0
        self._min_request_interval = 0.1  # 100ms minimum between requests
        
        # Model configuration for optimal performance
        self._model = "gpt-3.5-turbo"  # Fastest OpenAI model
        self._max_tokens = 150  # Keep responses concise for speed
        self._temperature = 0.7  # Balanced creativity vs consistency
    
    async def generate_contextual_advice(
        self,
        prompt: str,
        context: Dict[str, Any],
        max_time_ms: int = 2800  # Leave 200ms buffer for processing
    ) -> Dict[str, Any]:
        """
        Generate AI advice with strict timeout enforcement.
        
        Args:
            prompt: The user's question or situation
            context: Game context for better responses
            max_time_ms: Maximum response time in milliseconds
            
        Returns:
            AI response with metadata and performance stats
        """
        start_time = time.perf_counter()
        self._total_requests += 1
        
        try:
            # Check cache first for performance
            cache_key = self._generate_cache_key(prompt, context)
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                self._cache_hits += 1
                elapsed_ms = int((time.perf_counter() - start_time) * 1000)
                cached_response["response_time_ms"] = elapsed_ms
                cached_response["from_cache"] = True
                self._track_performance(elapsed_ms)
                return cached_response
            
            # Check if OpenAI API is available
            if not self.api_key:
                logger.warning("OpenAI API key not configured, using fallback")
                return self._get_fallback_response(prompt, context)
            
            # Build optimized prompt for fast response
            system_prompt = self._build_system_prompt(context)
            user_prompt = self._build_user_prompt(prompt, context)
            
            # Make API call with timeout
            timeout_seconds = max_time_ms / 1000.0
            response = await self._make_openai_request(
                system_prompt, 
                user_prompt, 
                timeout_seconds
            )
            
            if response["success"]:
                # Cache successful response
                self._cache_response(cache_key, response["data"])
                
                elapsed_ms = int((time.perf_counter() - start_time) * 1000)
                response["data"]["response_time_ms"] = elapsed_ms
                response["data"]["from_cache"] = False
                
                self._track_performance(elapsed_ms)
                return response["data"]
            else:
                # API failed, use fallback
                logger.warning(f"OpenAI API failed: {response['error']}")
                return self._get_fallback_response(prompt, context)
                
        except asyncio.TimeoutError:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            logger.warning(f"OpenAI request timed out after {elapsed_ms}ms")
            self._failed_requests += 1
            return self._get_timeout_fallback(prompt, context, elapsed_ms)
            
        except Exception as e:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            logger.error(f"OpenAI request failed after {elapsed_ms}ms: {str(e)}")
            self._failed_requests += 1
            return self._get_error_fallback(prompt, context, str(e), elapsed_ms)
    
    async def _make_openai_request(
        self,
        system_prompt: str,
        user_prompt: str,
        timeout_seconds: float
    ) -> Dict[str, Any]:
        """Make OpenAI API request with timeout."""
        
        # Rate limiting protection
        current_time = time.perf_counter()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self._min_request_interval:
            await asyncio.sleep(self._min_request_interval - time_since_last)
        
        self._last_request_time = time.perf_counter()
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": self._max_tokens,
            "temperature": self._temperature,
            "presence_penalty": 0.1,  # Avoid repetition
            "frequency_penalty": 0.1   # Encourage variety
        }
        
        try:
            timeout = aiohttp.ClientTimeout(total=timeout_seconds)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        return {
                            "success": True,
                            "data": {
                                "type": "ai_generated",
                                "title": "AI Seer Advice",
                                "content": content.strip(),
                                "confidence": 0.9,
                                "model": self._model,
                                "tokens_used": data.get("usage", {}).get("total_tokens", 0)
                            }
                        }
                    else:
                        error_data = await response.json()
                        return {
                            "success": False,
                            "error": f"OpenAI API error {response.status}: {error_data}"
                        }
                        
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": f"Request timed out after {timeout_seconds}s"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build optimized system prompt for GM assistance."""
        
        difficulty_level = context.get("difficulty_level", "newcomer")
        session_status = context.get("session_status", "active")
        
        base_prompt = """You are an expert Game Master assistant for SPARC RPG. Provide concise, actionable advice in 1-2 sentences.

SPARC Rules:
- All rolls use 1d6 + stat vs difficulty (Easy: 8, Medium: 12, Hard: 16, Very Hard: 20)
- Combat: Roll initiative, attack vs defense, deal 1d6 damage
- Special abilities: Once per adventure, heroic saves: 3 per adventure

Response Format:
- Be specific and actionable
- Focus on immediate next steps
- Keep responses under 50 words when possible
- Suggest concrete actions the GM can take right now"""
        
        if difficulty_level == "newcomer":
            base_prompt += "\n\nPlayer Experience: New to RPGs - provide clear, simple guidance with specific options."
        elif difficulty_level == "experienced":
            base_prompt += "\n\nPlayer Experience: Experienced - can handle open-ended challenges and complex scenarios."
        
        return base_prompt
    
    def _build_user_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Build optimized user prompt with context."""
        
        # Extract relevant context
        characters = context.get("characters", [])
        scene_energy = context.get("scene_energy", "medium")
        player_engagement = context.get("player_engagement", 5)
        
        context_parts = []
        
        if characters:
            char_count = len(characters)
            context_parts.append(f"{char_count} active characters")
        
        if player_engagement < 6:
            context_parts.append("players seem disengaged")
        elif player_engagement > 8:
            context_parts.append("players highly engaged")
        
        if scene_energy == "low":
            context_parts.append("scene needs energy")
        elif scene_energy == "high":
            context_parts.append("scene has high energy")
        
        context_summary = ", ".join(context_parts) if context_parts else "standard situation"
        
        return f"Situation: {prompt}\nContext: {context_summary}\n\nWhat should the GM do right now?"
    
    def _generate_cache_key(self, prompt: str, context: Dict[str, Any]) -> str:
        """Generate cache key for response caching."""
        
        # Use hash of prompt + relevant context fields
        relevant_context = {
            "difficulty_level": context.get("difficulty_level", "newcomer"),
            "scene_energy": context.get("scene_energy", "medium"),
            "player_count": len(context.get("characters", [])),
            "engagement_level": "low" if context.get("player_engagement", 5) < 6 else "high"
        }
        
        cache_input = f"{prompt}:{json.dumps(relevant_context, sort_keys=True)}"
        return str(hash(cache_input))
    
    def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response if still valid."""
        
        if cache_key not in self._response_cache:
            return None
        
        response, timestamp = self._response_cache[cache_key]
        
        # Check if cache is still valid
        if datetime.now() - timestamp > timedelta(minutes=self._cache_ttl_minutes):
            del self._response_cache[cache_key]
            return None
        
        return response.copy()
    
    def _cache_response(self, cache_key: str, response: Dict[str, Any]) -> None:
        """Cache response for future use."""
        
        # Limit cache size
        if len(self._response_cache) > 100:
            # Remove oldest entries
            sorted_items = sorted(
                self._response_cache.items(),
                key=lambda x: x[1][1]  # Sort by timestamp
            )
            for key, _ in sorted_items[:20]:  # Remove oldest 20%
                del self._response_cache[key]
        
        self._response_cache[cache_key] = (response.copy(), datetime.now())
    
    def _get_fallback_response(
        self,
        prompt: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get rule-based fallback response when AI is unavailable."""
        
        prompt_lower = prompt.lower()
        
        # Pattern matching for common situations
        if "combat" in prompt_lower or "fight" in prompt_lower:
            content = "Roll initiative (1d6 each), act in turn order, keep turns under 30 seconds."
            suggestions = ["Roll Initiative", "Describe Scene", "Start Combat"]
        elif "skill" in prompt_lower or "check" in prompt_lower:
            content = "Choose relevant stat (STR/DEX/INT/CHA), set difficulty (8/12/16/20), let player describe approach."
            suggestions = ["Set Difficulty", "Roll Dice", "Describe Outcome"]
        elif "stuck" in prompt_lower or "stall" in prompt_lower:
            content = "Add NPC reaction, create urgency, or ask each character what they're doing right now."
            suggestions = ["Add NPC", "Create Urgency", "Focus Players"]
        elif "confused" in prompt_lower or "help" in prompt_lower:
            content = "Offer 2-3 specific action options based on character class and current situation."
            suggestions = ["Show Options", "List Abilities", "Clarify Scene"]
        else:
            content = "Keep story moving forward. Ask players what their characters want to do."
            suggestions = ["Ask for Actions", "Describe Scene", "Add Complication"]
        
        return {
            "type": "fallback",
            "title": "GM Guidance (Fallback)",
            "content": content,
            "confidence": 0.6,
            "follow_up_suggestions": suggestions,
            "fallback": True,
            "ai_unavailable": True
        }
    
    def _get_timeout_fallback(
        self,
        prompt: str,
        context: Dict[str, Any],
        elapsed_ms: int
    ) -> Dict[str, Any]:
        """Get fallback response for timeout situations."""
        
        fallback = self._get_fallback_response(prompt, context)
        fallback.update({
            "title": "GM Guidance (Timeout Fallback)",
            "timeout_ms": elapsed_ms,
            "reason": "AI response exceeded time limit"
        })
        return fallback
    
    def _get_error_fallback(
        self,
        prompt: str,
        context: Dict[str, Any],
        error: str,
        elapsed_ms: int
    ) -> Dict[str, Any]:
        """Get fallback response for error situations."""
        
        fallback = self._get_fallback_response(prompt, context)
        fallback.update({
            "title": "GM Guidance (Error Fallback)",
            "error": error,
            "response_time_ms": elapsed_ms,
            "reason": "AI service temporarily unavailable"
        })
        return fallback
    
    def _track_performance(self, elapsed_ms: float) -> None:
        """Track response time performance."""
        
        elapsed_seconds = elapsed_ms / 1000.0
        self._response_times.append(elapsed_seconds)
        
        # Keep only last 100 responses for memory efficiency
        if len(self._response_times) > 100:
            self._response_times.pop(0)
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics for monitoring."""
        
        if not self._response_times:
            return {
                "healthy": False,
                "total_requests": self._total_requests,
                "failed_requests": self._failed_requests,
                "cache_hits": self._cache_hits,
                "avg_response_time_ms": 0,
                "p95_response_time_ms": 0,
                "success_rate": 0.0,
                "cache_hit_rate": 0.0,
                "api_available": bool(self.api_key)
            }
        
        sorted_times = sorted(self._response_times)
        count = len(sorted_times)
        
        avg_time = sum(sorted_times) / count
        p95_time = sorted_times[int(count * 0.95)] if count > 0 else 0.0
        
        success_rate = (self._total_requests - self._failed_requests) / max(self._total_requests, 1)
        cache_hit_rate = self._cache_hits / max(self._total_requests, 1)
        
        return {
            "healthy": p95_time < 3.0 and success_rate > 0.8,
            "total_requests": self._total_requests,
            "failed_requests": self._failed_requests,
            "cache_hits": self._cache_hits,
            "avg_response_time_ms": int(avg_time * 1000),
            "p95_response_time_ms": int(p95_time * 1000),
            "max_response_time_ms": int(max(sorted_times) * 1000),
            "success_rate": success_rate,
            "cache_hit_rate": cache_hit_rate,
            "cache_size": len(self._response_cache),
            "api_available": bool(self.api_key),
            "performance_target_ms": 3000,
            "model": self._model
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Quick health check for the OpenAI service."""
        
        if not self.api_key:
            return {
                "status": "unavailable",
                "reason": "OpenAI API key not configured",
                "fallback_available": True
            }
        
        try:
            # Quick test request with very short timeout
            test_response = await self._make_openai_request(
                "You are a test assistant.",
                "Say 'OK' if you can respond.",
                1.0  # 1 second timeout for health check
            )
            
            if test_response["success"]:
                return {
                    "status": "healthy",
                    "api_responsive": True,
                    "fallback_available": True
                }
            else:
                return {
                    "status": "degraded",
                    "reason": test_response["error"],
                    "fallback_available": True
                }
                
        except Exception as e:
            return {
                "status": "unhealthy",
                "reason": str(e),
                "fallback_available": True
            }


# Global service instance
_openai_client: Optional[OpenAIClientService] = None


async def get_openai_client() -> OpenAIClientService:
    """Get the global OpenAI client instance."""
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAIClientService()
    return _openai_client