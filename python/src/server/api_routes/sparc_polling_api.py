from fastapi import APIRouter, HTTPException, Header, status
from typing import Dict, List, Optional, Any
import time

from ..services.sparc.session_service import GameSessionManager
from ..services.sparc.polling_service import PollingService

router = APIRouter(prefix="/api/sparc/polling", tags=["SPARC Real-time Polling"])

# Initialize services
session_manager = GameSessionManager()
polling_service = PollingService(session_manager)


@router.get("/session/{session_id}/state")
async def poll_session_state(
    session_id: str,
    if_none_match: Optional[str] = Header(None),  # ETag header
    user_id: str = "temp_user"
):
    """
    Poll for session state changes with ETag caching.
    
    This endpoint provides efficient polling for the complete session state
    including characters, turn order, and recent activity. Uses HTTP ETags
    to minimize bandwidth when no changes have occurred.
    
    Args:
        session_id: UUID of the session to poll
        if_none_match: ETag from client's last successful request
        user_id: ID of the current user (for access validation)
        
    Returns:
        Session state data or 304 Not Modified
    """
    try:
        start_time = time.perf_counter()
        
        # TODO: Validate user access to session
        
        # Poll for changes
        result = await polling_service.poll_session_state(
            session_id=session_id,
            client_etag=if_none_match
        )
        
        # Track performance
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        if result["status"] == "not_modified":
            # Return 304 Not Modified with ETag
            return HTTPException(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={"ETag": result["etag"]}
            )
        elif result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["error"]
            )
        else:
            # Return updated data with ETag
            response_data = result["data"]
            response_data["_meta"] = {
                "etag": result["etag"],
                "cache_hit": result["cache_hit"],
                "response_time_ms": round(elapsed_ms, 2)
            }
            
            return response_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to poll session state: {str(e)}"
        )


@router.get("/session/{session_id}/turns")
async def poll_turn_order(
    session_id: str,
    if_none_match: Optional[str] = Header(None),
    user_id: str = "temp_user"
):
    """
    Poll for turn order and current turn changes.
    
    Optimized for frequent polling during combat. Returns minimal data
    focused on turn progression to maintain <100ms response times.
    
    Args:
        session_id: UUID of the session
        if_none_match: ETag from client's last request
        user_id: ID of the current user
        
    Returns:
        Turn order data or 304 Not Modified
    """
    try:
        start_time = time.perf_counter()
        
        result = await polling_service.poll_turn_order(
            session_id=session_id,
            client_etag=if_none_match
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        if result["status"] == "not_modified":
            return HTTPException(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={"ETag": result["etag"]}
            )
        elif result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["error"]
            )
        else:
            response_data = result["data"]
            response_data["_meta"] = {
                "etag": result["etag"],
                "cache_hit": result["cache_hit"],
                "response_time_ms": round(elapsed_ms, 2)
            }
            
            return response_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to poll turn order: {str(e)}"
        )


@router.get("/session/{session_id}/dice")
async def poll_dice_activity(
    session_id: str,
    since: Optional[str] = None,  # ISO timestamp
    if_none_match: Optional[str] = Header(None),
    user_id: str = "temp_user"
):
    """
    Poll for recent dice roll activity.
    
    Returns dice rolls that occurred after the 'since' timestamp.
    Critical for maintaining game flow - targets <100ms response time.
    
    Args:
        session_id: UUID of the session
        since: ISO timestamp - only return rolls after this time
        if_none_match: ETag from client's last request
        user_id: ID of the current user
        
    Returns:
        Recent dice rolls or 304 Not Modified
    """
    try:
        start_time = time.perf_counter()
        
        result = await polling_service.poll_dice_activity(
            session_id=session_id,
            since_timestamp=since,
            client_etag=if_none_match
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Log warning if approaching performance limit
        if elapsed_ms > 50:  # 50% of 100ms target
            print(f"WARNING: Dice polling took {elapsed_ms:.1f}ms (target: <100ms)")
        
        if result["status"] == "not_modified":
            return HTTPException(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={"ETag": result["etag"]}
            )
        elif result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["error"]
            )
        else:
            response_data = result["data"]
            response_data["_meta"] = {
                "etag": result["etag"],
                "cache_hit": result["cache_hit"],
                "response_time_ms": round(elapsed_ms, 2),
                "performance_ok": elapsed_ms < 100
            }
            
            return response_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to poll dice activity: {str(e)}"
        )


@router.get("/session/{session_id}/characters")
async def poll_character_updates(
    session_id: str,
    character_ids: str,  # Comma-separated character IDs
    if_none_match: Optional[str] = Header(None),
    user_id: str = "temp_user"
):
    """
    Poll for character stat updates (HP, abilities, etc.).
    
    Monitors frequently changing character data like current HP,
    special ability availability, and heroic save counts.
    
    Args:
        session_id: UUID of the session
        character_ids: Comma-separated list of character UUIDs to monitor
        if_none_match: ETag from client's last request
        user_id: ID of the current user
        
    Returns:
        Character update data or 304 Not Modified
    """
    try:
        start_time = time.perf_counter()
        
        # Parse character IDs
        char_ids = [cid.strip() for cid in character_ids.split(",") if cid.strip()]
        
        if not char_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No character IDs provided"
            )
        
        result = await polling_service.poll_character_updates(
            session_id=session_id,
            character_ids=char_ids,
            client_etag=if_none_match
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        if result["status"] == "not_modified":
            return HTTPException(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={"ETag": result["etag"]}
            )
        elif result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["error"]
            )
        else:
            response_data = result["data"]
            response_data["_meta"] = {
                "etag": result["etag"],
                "cache_hit": result["cache_hit"],
                "response_time_ms": round(elapsed_ms, 2),
                "characters_monitored": len(char_ids)
            }
            
            return response_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to poll character updates: {str(e)}"
        )


@router.get("/session/{session_id}/events")
async def poll_session_events(
    session_id: str,
    since: Optional[str] = None,
    if_none_match: Optional[str] = Header(None),
    user_id: str = "temp_user"
):
    """
    Poll for recent session events.
    
    Returns events like player joins/leaves, scene changes, and other
    session-level activities that occurred after the 'since' timestamp.
    
    Args:
        session_id: UUID of the session
        since: ISO timestamp - only return events after this time
        if_none_match: ETag from client's last request
        user_id: ID of the current user
        
    Returns:
        Recent session events or 304 Not Modified
    """
    try:
        start_time = time.perf_counter()
        
        result = await polling_service.poll_session_events(
            session_id=session_id,
            since_timestamp=since,
            client_etag=if_none_match
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        if result["status"] == "not_modified":
            return HTTPException(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={"ETag": result["etag"]}
            )
        elif result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["error"]
            )
        else:
            response_data = result["data"]
            response_data["_meta"] = {
                "etag": result["etag"],
                "cache_hit": result["cache_hit"],
                "response_time_ms": round(elapsed_ms, 2)
            }
            
            return response_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to poll session events: {str(e)}"
        )


@router.get("/session/{session_id}/intervals")
async def get_polling_intervals(
    session_id: str,
    user_id: str = "temp_user"
):
    """
    Get recommended polling intervals for the session.
    
    Returns optimal polling frequencies based on current session status
    to balance real-time updates with performance and bandwidth usage.
    
    Args:
        session_id: UUID of the session
        user_id: ID of the current user
        
    Returns:
        Recommended polling intervals in milliseconds
    """
    try:
        # Get session to determine status
        session = await session_manager.get_session(session_id)
        
        intervals = polling_service.get_polling_intervals(session.status)
        
        return {
            "session_id": session_id,
            "session_status": session.status,
            "intervals_ms": intervals,
            "adaptive_polling": True,
            "recommendations": {
                "active_gameplay": "Use 500-2000ms intervals for responsive gameplay",
                "waiting_lobby": "Use 3000-10000ms intervals to conserve bandwidth", 
                "inactive_session": "Use 10000-30000ms intervals for monitoring only"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get polling intervals: {str(e)}"
        )


@router.get("/performance")
async def get_polling_performance():
    """
    Get polling service performance statistics.
    
    Returns metrics on cache efficiency, response times, and bandwidth
    savings to help monitor the real-time system health.
    
    Returns:
        Polling performance metrics
    """
    try:
        stats = polling_service.get_performance_stats()
        
        # Add health assessment
        stats["health_status"] = "healthy" if stats["cache_hit_rate_percent"] > 50 else "degraded"
        stats["efficiency"] = "high" if stats["cache_hit_rate_percent"] > 70 else "medium"
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get polling performance: {str(e)}"
        )


@router.post("/session/{session_id}/cache/clear")
async def clear_session_cache(
    session_id: str,
    seer_id: str = "temp_seer"  # TODO: Replace with actual auth
):
    """
    Clear polling cache for a session (Seer only).
    
    Forces fresh data on the next poll request. Useful when session
    state may be inconsistent or after major changes.
    
    Args:
        session_id: UUID of the session to clear cache for
        seer_id: ID of the Seer (must match session Seer)
        
    Returns:
        Cache clear confirmation
    """
    try:
        # TODO: Validate seer ownership
        
        cleared_count = polling_service.clear_cache(session_id)
        
        return {
            "message": "Session cache cleared successfully",
            "session_id": session_id,
            "cache_entries_cleared": cleared_count,
            "next_poll_will_refresh": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear session cache: {str(e)}"
        )


@router.post("/cache/clear-all")
async def clear_all_cache(admin_key: str = "admin"):  # TODO: Proper admin auth
    """
    Clear all polling cache (Admin only).
    
    Emergency function to clear all cached data across all sessions.
    
    Args:
        admin_key: Admin authentication key
        
    Returns:
        Global cache clear confirmation
    """
    try:
        # TODO: Validate admin access
        
        cleared_count = polling_service.clear_cache()
        
        return {
            "message": "All polling cache cleared successfully",
            "cache_entries_cleared": cleared_count,
            "all_sessions_will_refresh": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear all cache: {str(e)}"
        )