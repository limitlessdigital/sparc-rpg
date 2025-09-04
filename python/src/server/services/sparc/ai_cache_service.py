"""
AI Response Caching Service for SPARC Seer Assistant.
Optimized for <3 second response times with intelligent caching.
"""

import json
import hashlib
import time
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict

from ..cache_service import get_cache_service, CacheType

logger = logging.getLogger(__name__)


class AIPromptType(str, Enum):
    """Types of AI prompts for different caching strategies."""
    RULE_CLARIFICATION = "rule_clarification"
    SCENE_SUGGESTION = "scene_suggestion"
    TACTICAL_ADVICE = "tactical_advice"
    CHARACTER_ACTION = "character_action"
    STORY_CONTINUATION = "story_continuation"
    DIFFICULTY_ADJUSTMENT = "difficulty_adjustment"
    ENCOUNTER_GENERATION = "encounter_generation"


@dataclass
class AIResponseMetadata:
    """Metadata for cached AI responses."""
    prompt_type: AIPromptType
    generated_at: datetime
    context_hash: str
    response_time_ms: float
    usage_count: int = 1
    last_used: Optional[datetime] = None
    relevance_score: float = 1.0  # Decay factor for aging responses


@dataclass
class CachedAIResponse:
    """Cached AI response with metadata."""
    response_data: Dict[str, Any]
    metadata: AIResponseMetadata
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'response_data': self.response_data,
            'metadata': asdict(self.metadata)
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CachedAIResponse':
        metadata_dict = data['metadata']
        metadata_dict['generated_at'] = datetime.fromisoformat(metadata_dict['generated_at'])
        if metadata_dict.get('last_used'):
            metadata_dict['last_used'] = datetime.fromisoformat(metadata_dict['last_used'])
        
        return cls(
            response_data=data['response_data'],
            metadata=AIResponseMetadata(**metadata_dict)
        )


class AIResponseCacheService:
    """
    Intelligent caching service for AI responses in SPARC.
    
    Features:
    - Context-aware prompt hashing
    - Response relevance scoring and aging
    - Hot cache for frequently requested prompts
    - Intelligent cache invalidation
    - Performance analytics for <3s target
    """
    
    def __init__(self):
        self.cache_service = None
        self.hot_cache: Dict[str, CachedAIResponse] = {}  # Memory cache for frequent prompts
        self.performance_stats = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'avg_response_time_ms': 0.0,
            'hot_cache_hits': 0,
            'cache_saves_ms': 0.0  # Time saved by caching
        }
        
        # Common prompts that should stay in hot cache
        self.hot_cache_prompts = {
            "what are the basic rules for combat",
            "how do dice rolls work in this game", 
            "what should happen next in this scene",
            "suggest tactical options for combat",
            "how do I make this more engaging",
            "what are good story hooks for beginners"
        }
        
        self._initialize_cache()
    
    async def _initialize_cache(self):
        """Initialize cache service connection."""
        try:
            self.cache_service = await get_cache_service()
        except Exception as e:
            logger.error(f"Failed to initialize AI cache service: {e}")
    
    def _generate_prompt_hash(self, prompt: str, context: Dict[str, Any], prompt_type: AIPromptType) -> str:
        """Generate context-aware hash for prompt caching."""
        # Normalize prompt for consistent hashing
        normalized_prompt = prompt.lower().strip()
        
        # Create context signature based on prompt type
        context_signature = ""
        if prompt_type == AIPromptType.RULE_CLARIFICATION:
            # Rules don't depend on session context
            context_signature = "static_rules"
        elif prompt_type == AIPromptType.SCENE_SUGGESTION:
            # Scene suggestions depend on current scene and characters
            context_signature = f"scene_{context.get('current_scene', 'unknown')}"
        elif prompt_type == AIPromptType.TACTICAL_ADVICE:
            # Tactical advice depends on current situation
            context_signature = f"tactical_{context.get('combat_state', 'unknown')}"
        else:
            # Generic context hash for other types
            context_str = json.dumps(context, sort_keys=True, default=str)
            context_signature = hashlib.md5(context_str.encode()).hexdigest()[:16]
        
        # Combine prompt, context, and type for unique hash
        hash_input = f"{normalized_prompt}|{context_signature}|{prompt_type.value}"
        return hashlib.sha256(hash_input.encode()).hexdigest()[:32]
    
    def _classify_prompt_type(self, prompt: str, context: Dict[str, Any]) -> AIPromptType:
        """Intelligently classify prompt type for optimal caching."""
        prompt_lower = prompt.lower()
        
        # Rule-based classification
        if any(word in prompt_lower for word in ['rule', 'how do', 'what are', 'explain']):
            return AIPromptType.RULE_CLARIFICATION
        elif any(word in prompt_lower for word in ['scene', 'story', 'narrative', 'next']):
            return AIPromptType.SCENE_SUGGESTION
        elif any(word in prompt_lower for word in ['combat', 'attack', 'defend', 'tactical']):
            return AIPromptType.TACTICAL_ADVICE
        elif any(word in prompt_lower for word in ['character', 'player', 'action']):
            return AIPromptType.CHARACTER_ACTION
        elif any(word in prompt_lower for word in ['difficulty', 'easier', 'harder', 'challenge']):
            return AIPromptType.DIFFICULTY_ADJUSTMENT
        elif any(word in prompt_lower for word in ['encounter', 'enemy', 'monster', 'generate']):
            return AIPromptType.ENCOUNTER_GENERATION
        else:
            return AIPromptType.STORY_CONTINUATION
    
    def _calculate_relevance_score(self, metadata: AIResponseMetadata) -> float:
        """Calculate relevance score based on age and usage."""
        now = datetime.now()
        age_hours = (now - metadata.generated_at).total_seconds() / 3600
        
        # Base relevance decreases with age
        age_factor = max(0.1, 1.0 - (age_hours / 24))  # Decay over 24 hours
        
        # Usage factor increases relevance
        usage_factor = min(2.0, 1.0 + (metadata.usage_count * 0.1))
        
        # Recent usage boosts relevance
        if metadata.last_used and (now - metadata.last_used).total_seconds() < 3600:
            recent_usage_boost = 1.2
        else:
            recent_usage_boost = 1.0
        
        return age_factor * usage_factor * recent_usage_boost
    
    async def get_cached_response(
        self, 
        prompt: str, 
        context: Dict[str, Any],
        prompt_type: Optional[AIPromptType] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached AI response with intelligent matching.
        Returns None if no suitable cached response found.
        """
        start_time = time.perf_counter()
        self.performance_stats['total_requests'] += 1
        
        # Auto-classify prompt type if not provided
        if prompt_type is None:
            prompt_type = self._classify_prompt_type(prompt, context)
        
        prompt_hash = self._generate_prompt_hash(prompt, context, prompt_type)
        
        # Check hot cache first (in-memory)
        if prompt_hash in self.hot_cache:
            cached_response = self.hot_cache[prompt_hash]
            
            # Check if still relevant
            relevance_score = self._calculate_relevance_score(cached_response.metadata)
            if relevance_score > 0.3:  # Minimum relevance threshold
                # Update usage statistics
                cached_response.metadata.usage_count += 1
                cached_response.metadata.last_used = datetime.now()
                
                self.performance_stats['cache_hits'] += 1
                self.performance_stats['hot_cache_hits'] += 1
                
                duration_ms = (time.perf_counter() - start_time) * 1000
                self.performance_stats['cache_saves_ms'] += max(0, 2000 - duration_ms)  # Assume 2s saved
                
                return cached_response.response_data
        
        # Check Redis cache
        if self.cache_service:
            try:
                cached_data = await self.cache_service.get_cached_ai_response(prompt_hash)
                if cached_data:
                    cached_response = CachedAIResponse.from_dict(cached_data)
                    
                    # Check relevance
                    relevance_score = self._calculate_relevance_score(cached_response.metadata)
                    if relevance_score > 0.2:  # Lower threshold for Redis cache
                        # Update usage and move to hot cache if frequently used
                        cached_response.metadata.usage_count += 1
                        cached_response.metadata.last_used = datetime.now()
                        
                        if cached_response.metadata.usage_count >= 3:
                            self.hot_cache[prompt_hash] = cached_response
                        
                        # Update cache with new metadata
                        await self.cache_service.cache_ai_response(prompt_hash, cached_response.to_dict())
                        
                        self.performance_stats['cache_hits'] += 1
                        duration_ms = (time.perf_counter() - start_time) * 1000
                        self.performance_stats['cache_saves_ms'] += max(0, 2000 - duration_ms)
                        
                        return cached_response.response_data
                        
            except Exception as e:
                logger.error(f"Error retrieving cached AI response: {e}")
        
        # Cache miss
        self.performance_stats['cache_misses'] += 1
        return None
    
    async def cache_response(
        self,
        prompt: str,
        context: Dict[str, Any],
        response_data: Dict[str, Any],
        response_time_ms: float,
        prompt_type: Optional[AIPromptType] = None
    ) -> bool:
        """Cache AI response with intelligent storage strategy."""
        if not self.cache_service:
            return False
        
        # Auto-classify prompt type if not provided
        if prompt_type is None:
            prompt_type = self._classify_prompt_type(prompt, context)
        
        prompt_hash = self._generate_prompt_hash(prompt, context, prompt_type)
        context_hash = hashlib.md5(json.dumps(context, sort_keys=True, default=str).encode()).hexdigest()[:16]
        
        # Create cached response with metadata
        metadata = AIResponseMetadata(
            prompt_type=prompt_type,
            generated_at=datetime.now(),
            context_hash=context_hash,
            response_time_ms=response_time_ms,
            usage_count=1,
            last_used=datetime.now(),
            relevance_score=1.0
        )
        
        cached_response = CachedAIResponse(
            response_data=response_data,
            metadata=metadata
        )
        
        try:
            # Cache in Redis
            success = await self.cache_service.cache_ai_response(prompt_hash, cached_response.to_dict())
            
            # Add to hot cache for certain prompt types or common prompts
            prompt_lower = prompt.lower().strip()
            if (prompt_type in [AIPromptType.RULE_CLARIFICATION, AIPromptType.TACTICAL_ADVICE] or
                any(common in prompt_lower for common in self.hot_cache_prompts)):
                self.hot_cache[prompt_hash] = cached_response
                
                # Limit hot cache size
                if len(self.hot_cache) > 50:
                    # Remove least relevant entries
                    sorted_items = sorted(
                        self.hot_cache.items(), 
                        key=lambda x: self._calculate_relevance_score(x[1].metadata)
                    )
                    for key, _ in sorted_items[:10]:  # Remove 10 least relevant
                        del self.hot_cache[key]
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to cache AI response: {e}")
            return False
    
    async def invalidate_context_cache(self, context_pattern: str):
        """Invalidate cached responses matching context pattern."""
        # Clear matching entries from hot cache
        keys_to_remove = []
        for key, cached_response in self.hot_cache.items():
            if context_pattern in cached_response.metadata.context_hash:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.hot_cache[key]
        
        # TODO: Implement Redis pattern-based invalidation
        logger.info(f"Invalidated {len(keys_to_remove)} cached AI responses matching pattern: {context_pattern}")
    
    def get_cache_effectiveness_report(self) -> Dict[str, Any]:
        """Generate cache effectiveness report."""
        total_requests = self.performance_stats['total_requests']
        cache_hits = self.performance_stats['cache_hits']
        
        if total_requests == 0:
            return {'cache_hit_rate': 0.0, 'time_saved_seconds': 0.0}
        
        hit_rate = cache_hits / total_requests
        time_saved_seconds = self.performance_stats['cache_saves_ms'] / 1000
        
        return {
            'cache_hit_rate': hit_rate,
            'total_requests': total_requests,
            'cache_hits': cache_hits,
            'hot_cache_hits': self.performance_stats['hot_cache_hits'],
            'hot_cache_size': len(self.hot_cache),
            'time_saved_seconds': time_saved_seconds,
            'meets_performance_target': hit_rate > 0.3,  # 30% hit rate target
            'estimated_cost_savings': time_saved_seconds * 0.01  # Assume $0.01 per second of AI processing
        }
    
    async def cleanup_expired_cache(self):
        """Remove expired and low-relevance cached responses."""
        cleaned_count = 0
        
        # Clean hot cache
        keys_to_remove = []
        for key, cached_response in self.hot_cache.items():
            if self._calculate_relevance_score(cached_response.metadata) < 0.1:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.hot_cache[key]
            cleaned_count += 1
        
        logger.info(f"Cleaned up {cleaned_count} expired AI cache entries")


# Global AI cache service
_ai_cache_service: Optional[AIResponseCacheService] = None


async def get_ai_cache_service() -> AIResponseCacheService:
    """Get or create AI response cache service."""
    global _ai_cache_service
    if _ai_cache_service is None:
        _ai_cache_service = AIResponseCacheService()
        await _ai_cache_service._initialize_cache()
    return _ai_cache_service