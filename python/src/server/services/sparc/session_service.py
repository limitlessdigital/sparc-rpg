from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timezone
import asyncio
import json
from enum import Enum

from .models import (
    GameSession, Character, Adventure, SessionStatus, 
    CreateSessionRequest, JoinSessionRequest, SessionState
)
from .character_service import CharacterCreationService
from .dice_service import DiceRollingEngine


class SessionEvent(str, Enum):
    """Events that can occur during a game session."""
    SESSION_CREATED = "session_created"
    PLAYER_JOINED = "player_joined"
    PLAYER_LEFT = "player_left"
    PLAYER_KICKED = "player_kicked"
    SESSION_STARTED = "session_started"
    SESSION_PAUSED = "session_paused"
    SESSION_RESUMED = "session_resumed"
    SESSION_ENDED = "session_ended"
    TURN_CHANGED = "turn_changed"
    SCENE_CHANGED = "scene_changed"
    DICE_ROLLED = "dice_rolled"
    CHARACTER_UPDATED = "character_updated"


class SessionError(Exception):
    """Custom exception for session-related errors."""
    pass


class GameSessionManager:
    """
    Core session management service for SPARC multiplayer games.
    
    Handles session lifecycle, player management, turn order, and real-time
    state synchronization for up to 6 concurrent players per session.
    """
    
    def __init__(self):
        """Initialize session manager with dependencies."""
        self.character_service = CharacterCreationService()
        self.dice_engine = DiceRollingEngine()
        
        # In-memory session cache for performance (TODO: Replace with Redis)
        self._session_cache: Dict[str, GameSession] = {}
        self._session_participants: Dict[str, Dict[str, Character]] = {}
        self._session_events: Dict[str, List[Dict[str, Any]]] = {}
        
        # Performance tracking
        self._operation_times: List[float] = []
    
    async def create_session(
        self, 
        seer_id: str, 
        request: CreateSessionRequest,
        adventure: Optional[Adventure] = None
    ) -> GameSession:
        """
        Create a new game session.
        
        Args:
            seer_id: ID of the user creating the session (becomes Seer)
            request: Session creation parameters
            adventure: Optional adventure to load
            
        Returns:
            Created game session
            
        Raises:
            SessionError: If session creation fails
        """
        try:
            # Create session
            session = GameSession(
                name=request.name,
                seer_id=seer_id,
                adventure_id=adventure.id if adventure else None,
                status=SessionStatus.WAITING,
                max_players=request.max_players,
                current_node_id=adventure.starting_node_id if adventure else None,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            # Cache session
            self._session_cache[session.id] = session
            self._session_participants[session.id] = {}
            self._session_events[session.id] = []
            
            # Log session creation event
            await self._log_session_event(
                session.id,
                SessionEvent.SESSION_CREATED,
                {"seer_id": seer_id, "session_name": session.name}
            )
            
            # TODO: Save to database
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to create session: {str(e)}")
    
    async def join_session(
        self, 
        session_id: str, 
        character_id: str,
        user_id: str
    ) -> Tuple[GameSession, Character]:
        """
        Add a character to an existing session.
        
        Args:
            session_id: ID of the session to join
            character_id: ID of the character joining
            user_id: ID of the user (for validation)
            
        Returns:
            Tuple of updated session and character
            
        Raises:
            SessionError: If join fails
        """
        try:
            # Get session
            session = await self.get_session(session_id)
            
            # Validate session state
            if session.status == SessionStatus.COMPLETED:
                raise SessionError("Cannot join completed session")
            
            # Check player limit
            if len(session.player_characters) >= session.max_players:
                raise SessionError(f"Session is full ({session.max_players} players maximum)")
            
            # Check if character already in session
            if character_id in session.player_characters:
                raise SessionError("Character is already in this session")
            
            # TODO: Get character from database and validate ownership
            # For now, create a mock character
            character = Character(
                id=character_id,
                user_id=user_id,
                name="Test Character",
                character_class="warrior",
                stats={"str": 6, "dex": 4, "int": 2, "cha": 3},
                current_hp=18,
                max_hp=18
            )
            
            # Add character to session
            session.player_characters.append(character_id)
            session.updated_at = datetime.now(timezone.utc)
            
            # Cache character
            self._session_participants[session_id][character_id] = character
            
            # Update cache
            self._session_cache[session_id] = session
            
            # Log event
            await self._log_session_event(
                session_id,
                SessionEvent.PLAYER_JOINED,
                {"character_id": character_id, "character_name": character.name}
            )
            
            # TODO: Save to database
            
            return session, character
            
        except Exception as e:
            raise SessionError(f"Failed to join session: {str(e)}")
    
    async def leave_session(
        self, 
        session_id: str, 
        character_id: str,
        user_id: str
    ) -> GameSession:
        """
        Remove a character from a session.
        
        Args:
            session_id: ID of the session
            character_id: ID of the character leaving
            user_id: ID of the user (for validation)
            
        Returns:
            Updated session
            
        Raises:
            SessionError: If leave fails
        """
        try:
            session = await self.get_session(session_id)
            
            # Check if character is in session
            if character_id not in session.player_characters:
                raise SessionError("Character is not in this session")
            
            # Remove character
            session.player_characters.remove(character_id)
            session.updated_at = datetime.now(timezone.utc)
            
            # Remove from turn order if present
            if character_id in session.turn_order:
                session.turn_order.remove(character_id)
                # Adjust current turn index if needed
                if session.current_turn_index >= len(session.turn_order) and session.turn_order:
                    session.current_turn_index = 0
            
            # Remove from cache
            if character_id in self._session_participants[session_id]:
                character_name = self._session_participants[session_id][character_id].name
                del self._session_participants[session_id][character_id]
            else:
                character_name = "Unknown"
            
            # Update cache
            self._session_cache[session_id] = session
            
            # Log event
            await self._log_session_event(
                session_id,
                SessionEvent.PLAYER_LEFT,
                {"character_id": character_id, "character_name": character_name}
            )
            
            # TODO: Save to database
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to leave session: {str(e)}")
    
    async def kick_player(
        self, 
        session_id: str, 
        character_id: str,
        seer_id: str
    ) -> GameSession:
        """
        Kick a player from the session (Seer only).
        
        Args:
            session_id: ID of the session
            character_id: ID of the character to kick
            seer_id: ID of the Seer (must match session Seer)
            
        Returns:
            Updated session
            
        Raises:
            SessionError: If kick fails
        """
        try:
            session = await self.get_session(session_id)
            
            # Validate Seer
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can kick players")
            
            # Use leave_session logic but with different event
            session = await self.leave_session(session_id, character_id, "system")
            
            # Override event log
            await self._log_session_event(
                session_id,
                SessionEvent.PLAYER_KICKED,
                {"character_id": character_id, "kicked_by": seer_id}
            )
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to kick player: {str(e)}")
    
    async def start_session(
        self, 
        session_id: str, 
        seer_id: str
    ) -> GameSession:
        """
        Start a game session and initialize turn order.
        
        Args:
            session_id: ID of the session to start
            seer_id: ID of the Seer (must match session Seer)
            
        Returns:
            Started session with turn order
            
        Raises:
            SessionError: If start fails
        """
        try:
            session = await self.get_session(session_id)
            
            # Validate Seer
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can start the session")
            
            # Validate session state
            if session.status != SessionStatus.WAITING:
                raise SessionError(f"Session is already {session.status}")
            
            # Check minimum players
            if len(session.player_characters) < 1:
                raise SessionError("Need at least 1 player to start session")
            
            # Roll initiative and set turn order
            initiative_results = self.dice_engine.roll_initiative(
                session.player_characters, 
                session_id
            )
            
            session.turn_order = [char_id for char_id, _ in initiative_results]
            session.current_turn_index = 0
            session.status = SessionStatus.ACTIVE
            session.updated_at = datetime.now(timezone.utc)
            
            # Update cache
            self._session_cache[session_id] = session
            
            # Log events
            await self._log_session_event(
                session_id,
                SessionEvent.SESSION_STARTED,
                {
                    "turn_order": session.turn_order,
                    "initiative_results": initiative_results
                }
            )
            
            # TODO: Save to database
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to start session: {str(e)}")
    
    async def next_turn(
        self, 
        session_id: str, 
        seer_id: str
    ) -> Tuple[GameSession, Optional[str]]:
        """
        Advance to the next player's turn.
        
        Args:
            session_id: ID of the session
            seer_id: ID of the Seer (must match session Seer)
            
        Returns:
            Tuple of updated session and next character ID
            
        Raises:
            SessionError: If turn advance fails
        """
        try:
            session = await self.get_session(session_id)
            
            # Validate Seer
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can advance turns")
            
            # Validate session state
            if session.status != SessionStatus.ACTIVE:
                raise SessionError("Session must be active to advance turns")
            
            if not session.turn_order:
                raise SessionError("No turn order established")
            
            # Advance turn index
            session.current_turn_index = (session.current_turn_index + 1) % len(session.turn_order)
            session.updated_at = datetime.now(timezone.utc)
            
            current_character_id = session.turn_order[session.current_turn_index]
            
            # Update cache
            self._session_cache[session_id] = session
            
            # Log event
            await self._log_session_event(
                session_id,
                SessionEvent.TURN_CHANGED,
                {
                    "current_turn_index": session.current_turn_index,
                    "current_character_id": current_character_id
                }
            )
            
            # TODO: Save to database
            
            return session, current_character_id
            
        except Exception as e:
            raise SessionError(f"Failed to advance turn: {str(e)}")
    
    async def pause_session(
        self, 
        session_id: str, 
        seer_id: str
    ) -> GameSession:
        """
        Pause an active session.
        
        Args:
            session_id: ID of the session to pause
            seer_id: ID of the Seer
            
        Returns:
            Paused session
        """
        try:
            session = await self.get_session(session_id)
            
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can pause the session")
            
            if session.status != SessionStatus.ACTIVE:
                raise SessionError("Can only pause active sessions")
            
            session.status = SessionStatus.PAUSED
            session.updated_at = datetime.now(timezone.utc)
            
            self._session_cache[session_id] = session
            
            await self._log_session_event(session_id, SessionEvent.SESSION_PAUSED, {})
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to pause session: {str(e)}")
    
    async def resume_session(
        self, 
        session_id: str, 
        seer_id: str
    ) -> GameSession:
        """
        Resume a paused session.
        
        Args:
            session_id: ID of the session to resume
            seer_id: ID of the Seer
            
        Returns:
            Resumed session
        """
        try:
            session = await self.get_session(session_id)
            
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can resume the session")
            
            if session.status != SessionStatus.PAUSED:
                raise SessionError("Can only resume paused sessions")
            
            session.status = SessionStatus.ACTIVE
            session.updated_at = datetime.now(timezone.utc)
            
            self._session_cache[session_id] = session
            
            await self._log_session_event(session_id, SessionEvent.SESSION_RESUMED, {})
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to resume session: {str(e)}")
    
    async def end_session(
        self, 
        session_id: str, 
        seer_id: str
    ) -> GameSession:
        """
        End a session and mark it as completed.
        
        Args:
            session_id: ID of the session to end
            seer_id: ID of the Seer
            
        Returns:
            Completed session
        """
        try:
            session = await self.get_session(session_id)
            
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can end the session")
            
            session.status = SessionStatus.COMPLETED
            session.completed_at = datetime.now(timezone.utc)
            session.updated_at = datetime.now(timezone.utc)
            
            self._session_cache[session_id] = session
            
            await self._log_session_event(
                session_id, 
                SessionEvent.SESSION_ENDED, 
                {"duration_minutes": self._calculate_session_duration(session)}
            )
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to end session: {str(e)}")
    
    async def get_session(self, session_id: str) -> GameSession:
        """
        Get session by ID.
        
        Args:
            session_id: ID of the session
            
        Returns:
            Game session
            
        Raises:
            SessionError: If session not found
        """
        # Try cache first
        if session_id in self._session_cache:
            return self._session_cache[session_id]
        
        # TODO: Load from database
        raise SessionError(f"Session {session_id} not found")
    
    async def get_session_state(self, session_id: str) -> SessionState:
        """
        Get complete session state including characters and recent events.
        
        Args:
            session_id: ID of the session
            
        Returns:
            Complete session state
        """
        try:
            session = await self.get_session(session_id)
            characters = list(self._session_participants[session_id].values())
            recent_events = self._session_events[session_id][-10:]  # Last 10 events
            
            return SessionState(
                session=session,
                characters=characters,
                current_adventure=None,  # TODO: Load adventure
                recent_rolls=[],  # TODO: Get recent dice rolls
                seer_notes=""
            )
            
        except Exception as e:
            raise SessionError(f"Failed to get session state: {str(e)}")
    
    async def update_session_data(
        self, 
        session_id: str, 
        seer_id: str,
        data_updates: Dict[str, Any]
    ) -> GameSession:
        """
        Update session's custom data (adventure progress, variables, etc.).
        
        Args:
            session_id: ID of the session
            seer_id: ID of the Seer
            data_updates: Dictionary of data to update
            
        Returns:
            Updated session
        """
        try:
            session = await self.get_session(session_id)
            
            if session.seer_id != seer_id:
                raise SessionError("Only the Seer can update session data")
            
            # Merge updates into session data
            session.session_data.update(data_updates)
            session.updated_at = datetime.now(timezone.utc)
            
            self._session_cache[session_id] = session
            
            return session
            
        except Exception as e:
            raise SessionError(f"Failed to update session data: {str(e)}")
    
    async def get_sessions_for_user(
        self, 
        user_id: str,
        include_completed: bool = False
    ) -> List[GameSession]:
        """
        Get all sessions where user is Seer or has characters.
        
        Args:
            user_id: ID of the user
            include_completed: Whether to include completed sessions
            
        Returns:
            List of sessions
        """
        try:
            # TODO: Query database for user's sessions
            # For now, filter cache
            sessions = []
            for session in self._session_cache.values():
                # Check if user is Seer
                if session.seer_id == user_id:
                    if include_completed or session.status != SessionStatus.COMPLETED:
                        sessions.append(session)
                    continue
                
                # Check if user has characters in session
                user_characters = [
                    char_id for char_id in session.player_characters
                    if char_id in self._session_participants[session.id] and
                    self._session_participants[session.id][char_id].user_id == user_id
                ]
                
                if user_characters:
                    if include_completed or session.status != SessionStatus.COMPLETED:
                        sessions.append(session)
            
            return sessions
            
        except Exception as e:
            raise SessionError(f"Failed to get user sessions: {str(e)}")
    
    async def _log_session_event(
        self, 
        session_id: str, 
        event_type: SessionEvent, 
        data: Dict[str, Any]
    ) -> None:
        """Log an event for the session."""
        event = {
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        
        if session_id not in self._session_events:
            self._session_events[session_id] = []
        
        self._session_events[session_id].append(event)
        
        # Keep only last 100 events per session
        if len(self._session_events[session_id]) > 100:
            self._session_events[session_id] = self._session_events[session_id][-100:]
    
    def _calculate_session_duration(self, session: GameSession) -> int:
        """Calculate session duration in minutes."""
        if session.completed_at:
            duration = session.completed_at - session.created_at
            return int(duration.total_seconds() / 60)
        return 0
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get session management performance statistics."""
        if not self._operation_times:
            return {
                "total_operations": 0,
                "avg_time_ms": 0.0,
                "active_sessions": len([s for s in self._session_cache.values() if s.status == SessionStatus.ACTIVE]),
                "total_sessions": len(self._session_cache)
            }
        
        return {
            "total_operations": len(self._operation_times),
            "avg_time_ms": sum(self._operation_times) / len(self._operation_times),
            "active_sessions": len([s for s in self._session_cache.values() if s.status == SessionStatus.ACTIVE]),
            "total_sessions": len(self._session_cache),
            "total_players": sum(len(s.player_characters) for s in self._session_cache.values())
        }