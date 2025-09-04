from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
import time

from ..services.sparc.models import (
    GameSession, Character, SessionState, CreateSessionRequest, 
    JoinSessionRequest, SessionStatus
)
from ..services.sparc.session_service import GameSessionManager, SessionError

router = APIRouter(prefix="/api/sparc/sessions", tags=["SPARC Sessions"])

# Initialize session manager
session_manager = GameSessionManager()


class SessionResponse(BaseModel):
    """Response model for session operations."""
    session: GameSession
    message: str


class SessionListResponse(BaseModel):
    """Response model for session lists."""
    sessions: List[GameSession]
    total_count: int


class JoinSessionResponse(BaseModel):
    """Response model for joining sessions."""
    session: GameSession
    character: Character
    message: str


class TurnAdvanceResponse(BaseModel):
    """Response model for turn advancement."""
    session: GameSession
    current_character_id: Optional[str]
    turn_number: int
    message: str


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: CreateSessionRequest,
    seer_id: str = "temp_seer"  # TODO: Replace with actual auth
):
    """
    Create a new game session.
    
    The Seer (Game Master) creates a session that players can join.
    Sessions support up to 6 players and include turn order management.
    
    Args:
        request: Session creation parameters (name, max_players, adventure)
        seer_id: ID of the user creating the session
        
    Returns:
        Created session with unique ID
    """
    try:
        session = await session_manager.create_session(
            seer_id=seer_id,
            request=request
        )
        
        return SessionResponse(
            session=session,
            message="Session created successfully"
        )
        
    except SessionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.get("/", response_model=SessionListResponse)
async def get_user_sessions(
    include_completed: bool = False,
    user_id: str = "temp_user"  # TODO: Replace with actual auth
):
    """
    Get all sessions for the current user.
    
    Returns sessions where the user is either the Seer or has characters participating.
    
    Args:
        include_completed: Whether to include completed sessions
        user_id: ID of the current user
        
    Returns:
        List of user's sessions
    """
    try:
        sessions = await session_manager.get_sessions_for_user(
            user_id=user_id,
            include_completed=include_completed
        )
        
        return SessionListResponse(
            sessions=sessions,
            total_count=len(sessions)
        )
        
    except SessionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sessions: {str(e)}"
        )


@router.get("/{session_id}", response_model=GameSession)
async def get_session(
    session_id: str,
    user_id: str = "temp_user"  # TODO: Replace with actual auth
):
    """
    Get detailed information about a specific session.
    
    Args:
        session_id: UUID of the session
        user_id: ID of the current user (for access validation)
        
    Returns:
        Complete session details
    """
    try:
        session = await session_manager.get_session(session_id)
        
        # TODO: Validate user has access to this session
        
        return session
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session: {str(e)}"
        )


@router.get("/{session_id}/state", response_model=SessionState)
async def get_session_state(
    session_id: str,
    user_id: str = "temp_user"
):
    """
    Get complete session state including characters and recent events.
    
    This endpoint provides all data needed for the game interface:
    session details, participant characters, recent dice rolls, and events.
    
    Args:
        session_id: UUID of the session
        user_id: ID of the current user
        
    Returns:
        Complete session state for game interface
    """
    try:
        session_state = await session_manager.get_session_state(session_id)
        
        # TODO: Validate user has access to this session
        
        return session_state
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session state: {str(e)}"
        )


@router.post("/{session_id}/join", response_model=JoinSessionResponse)
async def join_session(
    session_id: str,
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Join a session with a character.
    
    Players use this endpoint to add their characters to a session.
    Sessions are limited to 6 players maximum.
    
    Args:
        session_id: UUID of the session to join
        character_id: UUID of the character joining
        user_id: ID of the current user
        
    Returns:
        Updated session and character information
    """
    try:
        session, character = await session_manager.join_session(
            session_id=session_id,
            character_id=character_id,
            user_id=user_id
        )
        
        return JoinSessionResponse(
            session=session,
            character=character,
            message=f"{character.name} joined the session"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join session: {str(e)}"
        )


@router.post("/{session_id}/leave", response_model=SessionResponse)
async def leave_session(
    session_id: str,
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Leave a session with a character.
    
    Removes the character from the session and updates turn order if needed.
    
    Args:
        session_id: UUID of the session to leave
        character_id: UUID of the character leaving
        user_id: ID of the current user
        
    Returns:
        Updated session information
    """
    try:
        session = await session_manager.leave_session(
            session_id=session_id,
            character_id=character_id,
            user_id=user_id
        )
        
        return SessionResponse(
            session=session,
            message="Successfully left the session"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to leave session: {str(e)}"
        )


@router.post("/{session_id}/kick", response_model=SessionResponse)
async def kick_player(
    session_id: str,
    character_id: str,
    seer_id: str = "temp_seer"
):
    """
    Kick a player from the session (Seer only).
    
    Only the session Seer can remove players from the session.
    
    Args:
        session_id: UUID of the session
        character_id: UUID of the character to kick
        seer_id: ID of the Seer (must match session Seer)
        
    Returns:
        Updated session information
    """
    try:
        session = await session_manager.kick_player(
            session_id=session_id,
            character_id=character_id,
            seer_id=seer_id
        )
        
        return SessionResponse(
            session=session,
            message="Player kicked from session"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to kick player: {str(e)}"
        )


@router.post("/{session_id}/start", response_model=SessionResponse)
async def start_session(
    session_id: str,
    seer_id: str = "temp_seer"
):
    """
    Start a game session and roll initiative.
    
    This transitions the session from WAITING to ACTIVE and establishes
    turn order through initiative rolls.
    
    Args:
        session_id: UUID of the session to start
        seer_id: ID of the Seer (must match session Seer)
        
    Returns:
        Started session with turn order
    """
    try:
        session = await session_manager.start_session(
            session_id=session_id,
            seer_id=seer_id
        )
        
        return SessionResponse(
            session=session,
            message="Session started! Initiative rolled and turn order established."
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start session: {str(e)}"
        )


@router.post("/{session_id}/next-turn", response_model=TurnAdvanceResponse)
async def next_turn(
    session_id: str,
    seer_id: str = "temp_seer"
):
    """
    Advance to the next player's turn.
    
    Cycles through the turn order established during session start.
    
    Args:
        session_id: UUID of the session
        seer_id: ID of the Seer (must match session Seer)
        
    Returns:
        Updated session with new current turn
    """
    try:
        session, current_character_id = await session_manager.next_turn(
            session_id=session_id,
            seer_id=seer_id
        )
        
        return TurnAdvanceResponse(
            session=session,
            current_character_id=current_character_id,
            turn_number=session.current_turn_index + 1,
            message=f"Turn advanced to player {session.current_turn_index + 1}"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to advance turn: {str(e)}"
        )


@router.post("/{session_id}/pause", response_model=SessionResponse)
async def pause_session(
    session_id: str,
    seer_id: str = "temp_seer"
):
    """
    Pause an active session.
    
    Args:
        session_id: UUID of the session to pause
        seer_id: ID of the Seer
        
    Returns:
        Paused session
    """
    try:
        session = await session_manager.pause_session(
            session_id=session_id,
            seer_id=seer_id
        )
        
        return SessionResponse(
            session=session,
            message="Session paused"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to pause session: {str(e)}"
        )


@router.post("/{session_id}/resume", response_model=SessionResponse)
async def resume_session(
    session_id: str,
    seer_id: str = "temp_seer"
):
    """
    Resume a paused session.
    
    Args:
        session_id: UUID of the session to resume
        seer_id: ID of the Seer
        
    Returns:
        Resumed session
    """
    try:
        session = await session_manager.resume_session(
            session_id=session_id,
            seer_id=seer_id
        )
        
        return SessionResponse(
            session=session,
            message="Session resumed"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resume session: {str(e)}"
        )


@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: str,
    seer_id: str = "temp_seer"
):
    """
    End a session and mark it as completed.
    
    Args:
        session_id: UUID of the session to end
        seer_id: ID of the Seer
        
    Returns:
        Completed session
    """
    try:
        session = await session_manager.end_session(
            session_id=session_id,
            seer_id=seer_id
        )
        
        return SessionResponse(
            session=session,
            message="Session completed"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to end session: {str(e)}"
        )


@router.put("/{session_id}/data", response_model=SessionResponse)
async def update_session_data(
    session_id: str,
    data_updates: Dict[str, Any],
    seer_id: str = "temp_seer"
):
    """
    Update session's custom data (adventure progress, variables, etc.).
    
    Args:
        session_id: UUID of the session
        data_updates: Dictionary of data to update
        seer_id: ID of the Seer
        
    Returns:
        Updated session
    """
    try:
        session = await session_manager.update_session_data(
            session_id=session_id,
            seer_id=seer_id,
            data_updates=data_updates
        )
        
        return SessionResponse(
            session=session,
            message="Session data updated"
        )
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        if "Only the Seer" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update session data: {str(e)}"
        )


@router.get("/{session_id}/stats", response_model=Dict[str, Any])
async def get_session_stats(session_id: str):
    """
    Get session statistics and performance metrics.
    
    Args:
        session_id: UUID of the session
        
    Returns:
        Session statistics
    """
    try:
        session = await session_manager.get_session(session_id)
        
        # Calculate session stats
        stats = {
            "session_id": session_id,
            "status": session.status,
            "player_count": len(session.player_characters),
            "max_players": session.max_players,
            "current_turn": session.current_turn_index + 1 if session.turn_order else 0,
            "total_turns": len(session.turn_order) if session.turn_order else 0,
            "created_at": session.created_at.isoformat(),
            "duration_minutes": 0 if not session.completed_at else 
                              int((session.completed_at - session.created_at).total_seconds() / 60),
            "has_adventure": session.adventure_id is not None
        }
        
        return stats
        
    except SessionError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session stats: {str(e)}"
        )


@router.get("/manager/performance")
async def get_session_manager_performance():
    """
    Get session manager performance statistics.
    
    Returns:
        Performance metrics for monitoring
    """
    try:
        stats = session_manager.get_performance_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance stats: {str(e)}"
        )