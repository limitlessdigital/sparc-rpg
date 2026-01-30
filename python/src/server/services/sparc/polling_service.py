from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import hashlib
import json
from dataclasses import dataclass

from .models import GameSession, Character, DiceRoll
from .session_service import GameSessionManager


@dataclass
class PollableResource:
    """Represents a resource that can be polled for changes."""
    resource_type: str
    resource_id: str
    data: Any
    last_modified: datetime
    etag: str


class PollingService:
    """
    HTTP Polling service for real-time game state synchronization.
    
    Provides ETag-based caching and change detection for efficient
    polling without WebSocket complexity. Supports the existing
    Archon HTTP polling infrastructure.
    """
    
    def __init__(self, session_manager: GameSessionManager):
        """Initialize polling service with session manager."""
        self.session_manager = session_manager
        
        # Cache for pollable resources with ETags
        self._resource_cache: Dict[str, PollableResource] = {}
        
        # Track last update times for change detection
        self._last_updates: Dict[str, datetime] = {}
        
        # Performance tracking
        self._poll_count = 0
        self._cache_hits = 0
    
    def generate_etag(self, data: Any) -> str:
        """
        Generate ETag for data using content hash.
        
        Args:
            data: Data to generate ETag for
            
        Returns:
            ETag string
        """
        content = json.dumps(data, default=str, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    async def poll_session_state(
        self, 
        session_id: str, 
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll for session state changes with ETag support.
        
        Args:
            session_id: ID of the session to poll
            client_etag: Client's current ETag for cache validation
            
        Returns:
            Dictionary with session state or 304 Not Modified indicator
        """
        self._poll_count += 1
        
        try:
            # Get current session state
            session_state = await self.session_manager.get_session_state(session_id)
            
            # Create pollable data
            pollable_data = {
                "session": session_state.session.dict(),
                "characters": [char.dict() for char in session_state.characters],
                "recent_rolls": [roll.dict() for roll in session_state.recent_rolls],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Generate ETag
            current_etag = self.generate_etag(pollable_data)
            
            # Check if client has current version
            if client_etag == current_etag:
                self._cache_hits += 1
                return {
                    "status": "not_modified",
                    "etag": current_etag,
                    "cache_hit": True
                }
            
            # Create pollable resource
            resource = PollableResource(
                resource_type="session_state",
                resource_id=session_id,
                data=pollable_data,
                last_modified=datetime.now(timezone.utc),
                etag=current_etag
            )
            
            # Cache the resource
            cache_key = f"session_state:{session_id}"
            self._resource_cache[cache_key] = resource
            
            return {
                "status": "modified",
                "etag": current_etag,
                "data": pollable_data,
                "cache_hit": False
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "etag": None
            }
    
    async def poll_dice_activity(
        self, 
        session_id: str, 
        since_timestamp: Optional[str] = None,
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll for recent dice roll activity with timestamp filtering.
        
        Args:
            session_id: ID of the session
            since_timestamp: Only return rolls after this timestamp
            client_etag: Client's current ETag
            
        Returns:
            Recent dice rolls or 304 Not Modified
        """
        self._poll_count += 1
        
        try:
            # TODO: Get recent dice rolls from database
            # For now, return mock data
            recent_rolls = []  # Mock empty rolls
            
            # Create pollable data
            pollable_data = {
                "session_id": session_id,
                "rolls": recent_rolls,
                "poll_timestamp": datetime.now(timezone.utc).isoformat(),
                "since": since_timestamp
            }
            
            current_etag = self.generate_etag(pollable_data)
            
            # Check ETag
            if client_etag == current_etag:
                self._cache_hits += 1
                return {
                    "status": "not_modified",
                    "etag": current_etag,
                    "cache_hit": True
                }
            
            return {
                "status": "modified",
                "etag": current_etag,
                "data": pollable_data,
                "cache_hit": False
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "etag": None
            }
    
    async def poll_turn_order(
        self, 
        session_id: str, 
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll for turn order and current turn changes.
        
        Optimized for frequent polling during active combat.
        
        Args:
            session_id: ID of the session
            client_etag: Client's current ETag
            
        Returns:
            Turn order data or 304 Not Modified
        """
        self._poll_count += 1
        
        try:
            session = await self.session_manager.get_session(session_id)
            
            # Create minimal turn data for performance
            turn_data = {
                "session_id": session_id,
                "status": session.status,
                "turn_order": session.turn_order,
                "current_turn_index": session.current_turn_index,
                "current_character_id": (
                    session.turn_order[session.current_turn_index] 
                    if session.turn_order and session.current_turn_index < len(session.turn_order)
                    else None
                ),
                "round_number": (session.current_turn_index // len(session.turn_order) + 1) if session.turn_order else 0,
                "updated_at": session.updated_at.isoformat()
            }
            
            current_etag = self.generate_etag(turn_data)
            
            # Check ETag
            if client_etag == current_etag:
                self._cache_hits += 1
                return {
                    "status": "not_modified",
                    "etag": current_etag,
                    "cache_hit": True
                }
            
            return {
                "status": "modified",
                "etag": current_etag,
                "data": turn_data,
                "cache_hit": False
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "etag": None
            }
    
    async def poll_character_updates(
        self, 
        session_id: str, 
        character_ids: List[str],
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll for character stat updates (HP, abilities, etc.).
        
        Args:
            session_id: ID of the session
            character_ids: List of character IDs to poll
            client_etag: Client's current ETag
            
        Returns:
            Character data or 304 Not Modified
        """
        self._poll_count += 1
        
        try:
            session_state = await self.session_manager.get_session_state(session_id)
            
            # Filter characters
            relevant_characters = [
                char for char in session_state.characters 
                if char.id in character_ids
            ]
            
            # Create character data focused on frequently changing fields
            character_data = {
                "session_id": session_id,
                "characters": [
                    {
                        "id": char.id,
                        "name": char.name,
                        "current_hp": char.current_hp,
                        "max_hp": char.max_hp,
                        "special_ability_available": char.special_ability_available,
                        "heroic_saves_available": char.heroic_saves_available,
                        "updated_at": char.updated_at.isoformat()
                    }
                    for char in relevant_characters
                ],
                "poll_timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            current_etag = self.generate_etag(character_data)
            
            # Check ETag
            if client_etag == current_etag:
                self._cache_hits += 1
                return {
                    "status": "not_modified",
                    "etag": current_etag,
                    "cache_hit": True
                }
            
            return {
                "status": "modified",
                "etag": current_etag,
                "data": character_data,
                "cache_hit": False
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "etag": None
            }
    
    async def poll_session_events(
        self, 
        session_id: str, 
        since_timestamp: Optional[str] = None,
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll for recent session events (joins, leaves, dice rolls, etc.).
        
        Args:
            session_id: ID of the session
            since_timestamp: Only return events after this timestamp  
            client_etag: Client's current ETag
            
        Returns:
            Recent events or 304 Not Modified
        """
        self._poll_count += 1
        
        try:
            # TODO: Get events from session manager
            # For now, return mock data
            events = []
            
            event_data = {
                "session_id": session_id,
                "events": events,
                "since": since_timestamp,
                "poll_timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            current_etag = self.generate_etag(event_data)
            
            if client_etag == current_etag:
                self._cache_hits += 1
                return {
                    "status": "not_modified",
                    "etag": current_etag,
                    "cache_hit": True
                }
            
            return {
                "status": "modified",
                "etag": current_etag,
                "data": event_data,
                "cache_hit": False
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "etag": None
            }
    
    def get_polling_intervals(self, session_status: str) -> Dict[str, int]:
        """
        Get recommended polling intervals based on session status.
        
        Args:
            session_status: Current session status
            
        Returns:
            Dictionary of recommended intervals in milliseconds
        """
        if session_status == "active":
            return {
                "session_state": 2000,      # 2 seconds for active games
                "turn_order": 1000,         # 1 second during combat
                "dice_activity": 500,       # 500ms for dice rolls
                "character_updates": 3000,  # 3 seconds for HP/abilities
                "session_events": 2000      # 2 seconds for general events
            }
        elif session_status == "waiting":
            return {
                "session_state": 5000,      # 5 seconds when waiting
                "turn_order": 10000,        # 10 seconds (not relevant)
                "dice_activity": 10000,     # 10 seconds (minimal activity)
                "character_updates": 10000, # 10 seconds
                "session_events": 3000      # 3 seconds for joins/leaves
            }
        else:  # paused, completed
            return {
                "session_state": 10000,     # 10 seconds for inactive
                "turn_order": 30000,        # 30 seconds
                "dice_activity": 30000,     # 30 seconds
                "character_updates": 30000, # 30 seconds
                "session_events": 10000     # 10 seconds
            }
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get polling service performance statistics."""
        cache_hit_rate = (self._cache_hits / self._poll_count * 100) if self._poll_count > 0 else 0
        
        return {
            "total_polls": self._poll_count,
            "cache_hits": self._cache_hits,
            "cache_hit_rate_percent": round(cache_hit_rate, 2),
            "active_resources": len(self._resource_cache),
            "bandwidth_saved_percent": round(cache_hit_rate, 2),  # Approximate bandwidth savings
            "performance_target": "70% cache hit rate"
        }
    
    def clear_cache(self, session_id: Optional[str] = None) -> int:
        """
        Clear polling cache for session or all sessions.
        
        Args:
            session_id: Specific session to clear, or None for all
            
        Returns:
            Number of cache entries cleared
        """
        if session_id:
            # Clear specific session cache
            keys_to_remove = [
                key for key in self._resource_cache.keys()
                if key.endswith(f":{session_id}")
            ]
            for key in keys_to_remove:
                del self._resource_cache[key]
            return len(keys_to_remove)
        else:
            # Clear all cache
            count = len(self._resource_cache)
            self._resource_cache.clear()
            return count