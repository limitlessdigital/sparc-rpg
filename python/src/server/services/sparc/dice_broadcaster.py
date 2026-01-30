"""
SPARC Dice Roll Real-time Broadcasting Service

Provides real-time dice roll broadcasting using HTTP polling optimization.
Integrates with the existing HTTP polling infrastructure for efficient updates.
"""

import asyncio
import json
import time
from typing import Dict, List, Optional, Set, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading
from concurrent.futures import ThreadPoolExecutor

from .dice_engine import DiceRoll

@dataclass
class RollBroadcast:
    """Broadcast message for dice rolls."""
    roll_id: str
    session_id: str
    character_id: str
    roll_data: Dict[str, Any]
    broadcast_time: float
    event_type: str = "dice_roll"

@dataclass
class SessionUpdate:
    """Session-level update for polling."""
    session_id: str
    last_updated: float
    roll_count: int
    recent_rolls: List[DiceRoll]
    etag: str

class RollQueue:
    """Thread-safe queue for dice roll broadcasts."""
    
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self._queue: deque = deque(maxlen=max_size)
        self._lock = threading.Lock()
        self._session_queues: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
    
    def add_roll(self, roll: DiceRoll):
        """Add a dice roll to broadcast queues."""
        broadcast = RollBroadcast(
            roll_id=roll.id,
            session_id=roll.session_id,
            character_id=roll.character_id,
            roll_data=roll.to_dict(),
            broadcast_time=time.time()
        )
        
        with self._lock:
            self._queue.append(broadcast)
            self._session_queues[roll.session_id].append(broadcast)
    
    def get_session_updates(self, session_id: str, since: float = 0) -> List[RollBroadcast]:
        """Get updates for a session since timestamp."""
        with self._lock:
            session_queue = self._session_queues.get(session_id, deque())
            return [
                broadcast for broadcast in session_queue 
                if broadcast.broadcast_time > since
            ]
    
    def get_recent_rolls(self, session_id: str, limit: int = 10) -> List[RollBroadcast]:
        """Get recent rolls for a session."""
        with self._lock:
            session_queue = self._session_queues.get(session_id, deque())
            return list(session_queue)[-limit:] if session_queue else []
    
    def clear_session(self, session_id: str):
        """Clear all broadcasts for a session."""
        with self._lock:
            if session_id in self._session_queues:
                self._session_queues[session_id].clear()
    
    def cleanup_old_broadcasts(self, max_age_seconds: int = 3600):
        """Remove broadcasts older than specified age."""
        current_time = time.time()
        cutoff_time = current_time - max_age_seconds
        
        with self._lock:
            # Clean main queue
            while self._queue and self._queue[0].broadcast_time < cutoff_time:
                self._queue.popleft()
            
            # Clean session queues
            for session_id in list(self._session_queues.keys()):
                session_queue = self._session_queues[session_id]
                while session_queue and session_queue[0].broadcast_time < cutoff_time:
                    session_queue.popleft()
                
                # Remove empty session queues
                if not session_queue:
                    del self._session_queues[session_id]

class ETagManager:
    """Manage ETags for efficient HTTP polling."""
    
    def __init__(self):
        self._etags: Dict[str, str] = {}
        self._last_modified: Dict[str, float] = {}
        self._lock = threading.Lock()
    
    def generate_etag(self, session_id: str, data: Any) -> str:
        """Generate ETag for session data."""
        import hashlib
        data_str = json.dumps(data, sort_keys=True, default=str)
        etag = hashlib.md5(data_str.encode()).hexdigest()
        
        with self._lock:
            self._etags[session_id] = etag
            self._last_modified[session_id] = time.time()
        
        return etag
    
    def check_etag(self, session_id: str, client_etag: Optional[str]) -> bool:
        """Check if client ETag matches current ETag."""
        with self._lock:
            current_etag = self._etags.get(session_id)
            return current_etag is not None and current_etag == client_etag
    
    def get_etag(self, session_id: str) -> Optional[str]:
        """Get current ETag for session."""
        with self._lock:
            return self._etags.get(session_id)
    
    def get_last_modified(self, session_id: str) -> Optional[float]:
        """Get last modified timestamp for session."""
        with self._lock:
            return self._last_modified.get(session_id)

class DiceBroadcaster:
    """High-performance dice roll broadcaster with HTTP polling optimization."""
    
    def __init__(self):
        self.roll_queue = RollQueue()
        self.etag_manager = ETagManager()
        self._active_sessions: Set[str] = set()
        self._session_subscribers: Dict[str, int] = defaultdict(int)
        self._cleanup_interval = 300  # 5 minutes
        self._last_cleanup = time.time()
        self._executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="dice_broadcast")
    
    async def broadcast_roll(self, roll: DiceRoll):
        """
        Broadcast a dice roll to all session subscribers.
        
        Args:
            roll: DiceRoll object to broadcast
        """
        # Add to queue for HTTP polling
        self.roll_queue.add_roll(roll)
        
        # Track active session
        self._active_sessions.add(roll.session_id)
        
        # Schedule cleanup if needed
        await self._maybe_cleanup()
    
    async def get_session_updates(
        self, 
        session_id: str, 
        since: Optional[float] = None,
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get dice roll updates for a session (optimized for HTTP polling).
        
        Args:
            session_id: Session to get updates for
            since: Timestamp to get updates since (optional)
            client_etag: Client's ETag for cache validation
            
        Returns:
            Dictionary with updates and ETag information
        """
        # Track session subscriber
        self._session_subscribers[session_id] += 1
        
        # Get updates since timestamp
        if since is None:
            since = time.time() - 30  # Default to last 30 seconds
        
        updates = self.roll_queue.get_session_updates(session_id, since)
        
        # Prepare response data
        response_data = {
            'session_id': session_id,
            'updates': [asdict(update) for update in updates],
            'update_count': len(updates),
            'timestamp': time.time(),
            'has_updates': len(updates) > 0
        }
        
        # Generate ETag
        current_etag = self.etag_manager.generate_etag(session_id, response_data)
        
        # Check if client has current version
        if client_etag and self.etag_manager.check_etag(session_id, client_etag):
            return {
                'not_modified': True,
                'etag': current_etag,
                'timestamp': time.time()
            }
        
        response_data['etag'] = current_etag
        return response_data
    
    async def get_recent_rolls(
        self, 
        session_id: str, 
        limit: int = 10,
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get recent dice rolls for a session.
        
        Args:
            session_id: Session to get rolls for
            limit: Maximum number of rolls to return
            client_etag: Client's ETag for cache validation
            
        Returns:
            Dictionary with recent rolls and ETag information
        """
        recent_broadcasts = self.roll_queue.get_recent_rolls(session_id, limit)
        recent_rolls = [
            DiceRoll(**broadcast.roll_data) 
            for broadcast in recent_broadcasts
        ]
        
        response_data = {
            'session_id': session_id,
            'rolls': [roll.to_dict() for roll in recent_rolls],
            'count': len(recent_rolls),
            'timestamp': time.time()
        }
        
        # Generate ETag
        current_etag = self.etag_manager.generate_etag(session_id, response_data)
        
        # Check if client has current version
        if client_etag and self.etag_manager.check_etag(session_id, client_etag):
            return {
                'not_modified': True,
                'etag': current_etag,
                'timestamp': time.time()
            }
        
        response_data['etag'] = current_etag
        return response_data
    
    async def get_session_status(
        self, 
        session_id: str,
        client_etag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive session status for polling.
        
        Args:
            session_id: Session to get status for
            client_etag: Client's ETag for cache validation
            
        Returns:
            Dictionary with session status and ETag information
        """
        recent_broadcasts = self.roll_queue.get_recent_rolls(session_id, 5)
        recent_rolls = [
            DiceRoll(**broadcast.roll_data) 
            for broadcast in recent_broadcasts
        ]
        
        # Calculate session metrics
        total_rolls = len(self.roll_queue._session_queues.get(session_id, []))
        last_activity = max(
            [broadcast.broadcast_time for broadcast in recent_broadcasts],
            default=0
        )
        
        response_data = {
            'session_id': session_id,
            'is_active': session_id in self._active_sessions,
            'subscriber_count': self._session_subscribers.get(session_id, 0),
            'total_rolls': total_rolls,
            'recent_rolls': [roll.to_dict() for roll in recent_rolls[-3:]],  # Last 3 rolls
            'last_activity': last_activity,
            'timestamp': time.time()
        }
        
        # Generate ETag
        current_etag = self.etag_manager.generate_etag(session_id, response_data)
        
        # Check if client has current version
        if client_etag and self.etag_manager.check_etag(session_id, client_etag):
            return {
                'not_modified': True,
                'etag': current_etag,
                'timestamp': time.time()
            }
        
        response_data['etag'] = current_etag
        return response_data
    
    async def subscribe_session(self, session_id: str):
        """Subscribe to dice roll updates for a session."""
        self._active_sessions.add(session_id)
        self._session_subscribers[session_id] += 1
    
    async def unsubscribe_session(self, session_id: str):
        """Unsubscribe from dice roll updates for a session."""
        if session_id in self._session_subscribers:
            self._session_subscribers[session_id] -= 1
            
            if self._session_subscribers[session_id] <= 0:
                self._session_subscribers.pop(session_id, None)
                self._active_sessions.discard(session_id)
    
    async def clear_session_data(self, session_id: str):
        """Clear all data for a session."""
        self.roll_queue.clear_session(session_id)
        self._active_sessions.discard(session_id)
        self._session_subscribers.pop(session_id, None)
    
    async def get_broadcast_stats(self) -> Dict[str, Any]:
        """Get broadcaster performance statistics."""
        return {
            'active_sessions': len(self._active_sessions),
            'total_subscribers': sum(self._session_subscribers.values()),
            'queue_size': len(self.roll_queue._queue),
            'session_queues': len(self.roll_queue._session_queues),
            'etag_cache_size': len(self.etag_manager._etags),
            'last_cleanup': self._last_cleanup,
            'uptime': time.time() - self._last_cleanup
        }
    
    async def _maybe_cleanup(self):
        """Perform cleanup if interval has passed."""
        current_time = time.time()
        if current_time - self._last_cleanup > self._cleanup_interval:
            await self._cleanup_old_data()
            self._last_cleanup = current_time
    
    async def _cleanup_old_data(self):
        """Clean up old broadcasts and inactive sessions."""
        # Clean old broadcasts
        self.roll_queue.cleanup_old_broadcasts(max_age_seconds=3600)  # 1 hour
        
        # Remove inactive sessions (no activity for 30 minutes)
        inactive_threshold = time.time() - 1800  # 30 minutes
        inactive_sessions = []
        
        for session_id in list(self._active_sessions):
            last_modified = self.etag_manager.get_last_modified(session_id)
            if last_modified and last_modified < inactive_threshold:
                inactive_sessions.append(session_id)
        
        for session_id in inactive_sessions:
            await self.clear_session_data(session_id)
        
        print(f"Cleaned up {len(inactive_sessions)} inactive sessions")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check broadcaster health status."""
        stats = await self.get_broadcast_stats()
        
        health_status = "healthy"
        if stats['queue_size'] > 5000:
            health_status = "overloaded"
        elif stats['active_sessions'] > 100:
            health_status = "busy"
        
        return {
            'status': health_status,
            'active_sessions': stats['active_sessions'],
            'queue_size': stats['queue_size'],
            'total_subscribers': stats['total_subscribers'],
            'last_cleanup_age': time.time() - stats['last_cleanup'],
            'memory_usage': {
                'roll_queue': len(self.roll_queue._queue),
                'session_queues': len(self.roll_queue._session_queues),
                'etag_cache': len(self.etag_manager._etags)
            }
        }

# Global broadcaster instance
_dice_broadcaster: Optional[DiceBroadcaster] = None

def get_dice_broadcaster() -> DiceBroadcaster:
    """Get global dice broadcaster instance."""
    global _dice_broadcaster
    if _dice_broadcaster is None:
        _dice_broadcaster = DiceBroadcaster()
    return _dice_broadcaster