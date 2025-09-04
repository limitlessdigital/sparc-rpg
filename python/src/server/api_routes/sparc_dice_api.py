from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import time
import asyncio

from ..services.sparc.dice_engine import get_dice_engine, DifficultyLevel
from ..services.sparc.dice_history_service import get_dice_history_service
from ..services.sparc.dice_broadcaster import get_dice_broadcaster

router = APIRouter(prefix="/api/sparc/dice", tags=["SPARC Dice Rolling"])

class DiceRollRequest(BaseModel):
    """Request model for dice rolling."""
    session_id: str = Field(..., description="Game session ID")
    character_id: str = Field(..., description="Rolling character ID")
    dice_count: int = Field(..., ge=1, le=20, description="Number of dice (1-20)")
    dice_sides: int = Field(..., description="Sides per die (4,6,8,10,12,20)")
    modifier: int = Field(0, ge=-50, le=50, description="Flat modifier (-50 to +50)")
    difficulty: Optional[int] = Field(None, ge=1, le=30, description="Target difficulty")
    roll_type: str = Field("general", description="Type of roll (attack, skill, save, etc.)")

class BulkRollRequest(BaseModel):
    """Request model for multiple dice rolls."""
    session_id: str
    character_id: str
    rolls: List[DiceRollRequest]
    max_parallel: int = Field(5, ge=1, le=10, description="Max parallel rolls")

class DiceAnalysisRequest(BaseModel):
    """Request model for dice probability analysis."""
    dice_count: int = Field(..., ge=1, le=20)
    dice_sides: int = Field(..., description="Sides per die (4,6,8,10,12,20)")
    modifier: int = Field(0, ge=-50, le=50)
    difficulty: int = Field(..., ge=1, le=30)


@router.post("/roll", response_model=Dict[str, Any])
async def roll_dice(
    request: DiceRollRequest,
    if_none_match: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Execute a dice roll with <100ms P95 performance guarantee.
    
    This is the primary dice rolling endpoint optimized for real-time gameplay.
    Supports all standard SPARC RPG dice combinations with cryptographically
    secure random number generation.
    
    Performance Targets:
    - P95 response time: <100ms
    - Average response time: <50ms
    - Success rate: >99.9%
    """
    start_time = time.perf_counter()
    
    try:
        # Validate dice type
        if request.dice_sides not in [4, 6, 8, 10, 12, 20]:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid dice type: d{request.dice_sides}. Must be d4, d6, d8, d10, d12, or d20"
            )
        
        # Get dice engine
        dice_engine = get_dice_engine()
        
        # Execute dice roll
        dice_roll = await dice_engine.roll_dice(
            session_id=request.session_id,
            character_id=request.character_id,
            dice_count=request.dice_count,
            dice_sides=request.dice_sides,
            modifier=request.modifier,
            difficulty=request.difficulty,
            roll_type=request.roll_type
        )
        
        # Store in history (async, don't wait)
        history_service = get_dice_history_service()
        asyncio.create_task(history_service.store_dice_roll(dice_roll))
        
        # Broadcast to subscribers (async, don't wait)
        broadcaster = get_dice_broadcaster()
        asyncio.create_task(broadcaster.broadcast_roll(dice_roll))
        
        # Track total API response time
        end_time = time.perf_counter()
        api_response_time = (end_time - start_time) * 1000
        
        # Performance warning if approaching target
        if api_response_time > 80:  # 80ms warning threshold for 100ms target
            print(f"WARNING: Dice roll API took {api_response_time:.1f}ms (approaching 100ms limit)")
        
        response_data = {
            "success": True,
            "roll": dice_roll.to_dict(),
            "api_response_time_ms": api_response_time,
            "performance_status": "excellent" if api_response_time < 50 else
                                  "good" if api_response_time < 100 else "degraded"
        }
        
        return JSONResponse(
            content=response_data,
            headers={
                "ETag": f'"{dice_roll.id}"',
                "Cache-Control": "no-cache"
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        end_time = time.perf_counter()
        api_response_time = (end_time - start_time) * 1000
        
        print(f"ERROR: Dice roll failed after {api_response_time:.1f}ms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dice roll failed: {str(e)}")


@router.get("/recent/{session_id}")
async def get_recent_rolls(
    session_id: str,
    limit: int = 10,
    if_none_match: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Get recent dice rolls for a session with ETag support."""
    try:
        broadcaster = get_dice_broadcaster()
        
        # Get recent rolls with ETag support
        result = await broadcaster.get_recent_rolls(
            session_id=session_id,
            limit=limit,
            client_etag=if_none_match
        )
        
        # Return 304 Not Modified if no changes
        if result.get('not_modified'):
            return JSONResponse(
                status_code=304,
                content={},
                headers={
                    "ETag": f'"{result["etag"]}"',
                    "Cache-Control": "max-age=5"
                }
            )
        
        return JSONResponse(
            content=result,
            headers={
                "ETag": f'"{result["etag"]}"',
                "Cache-Control": "max-age=5"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent rolls: {str(e)}")


@router.get("/updates/{session_id}")
async def get_session_updates(
    session_id: str,
    since: Optional[float] = None,
    if_none_match: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Get dice roll updates since timestamp (polling endpoint)."""
    try:
        broadcaster = get_dice_broadcaster()
        
        # Subscribe to session (tracking)
        await broadcaster.subscribe_session(session_id)
        
        # Get updates with ETag support
        result = await broadcaster.get_session_updates(
            session_id=session_id,
            since=since,
            client_etag=if_none_match
        )
        
        # Return 304 Not Modified if no changes
        if result.get('not_modified'):
            return JSONResponse(
                status_code=304,
                content={},
                headers={
                    "ETag": f'"{result["etag"]}"',
                    "Cache-Control": "max-age=2"
                }
            )
        
        return JSONResponse(
            content=result,
            headers={
                "ETag": f'"{result["etag"]}"',
                "Cache-Control": "max-age=2"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get updates: {str(e)}")


@router.get("/statistics/{session_id}")
async def get_session_statistics(session_id: str) -> Dict[str, Any]:
    """Get comprehensive dice rolling statistics for a session."""
    try:
        history_service = get_dice_history_service()
        statistics = await history_service.get_session_statistics(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "statistics": {
                "total_rolls": statistics.total_rolls,
                "average_result": statistics.average_result,
                "success_rate": statistics.success_rate,
                "common_roll_types": statistics.common_roll_types,
                "performance": {
                    "p95_response_time_ms": statistics.performance_p95_ms,
                    "sub_100ms_rate": statistics.sub_100ms_rate
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")


@router.get("/performance")
async def get_dice_engine_performance() -> Dict[str, Any]:
    """Get dice engine performance metrics for monitoring."""
    try:
        dice_engine = get_dice_engine()
        broadcaster = get_dice_broadcaster()
        
        engine_stats = dice_engine.get_performance_stats()
        broadcast_stats = await broadcaster.get_broadcast_stats()
        
        return {
            "success": True,
            "performance": {
                "engine": engine_stats,
                "broadcaster": broadcast_stats,
                "targets": {
                    "p95_response_time_ms": 100,
                    "sub_100ms_rate_target": 0.95,
                    "uptime_target": 0.999
                },
                "health": {
                    "overall": "excellent" if engine_stats["p95_response_time_ms"] < 50 else
                              "good" if engine_stats["p95_response_time_ms"] < 100 else
                              "degraded",
                    "engine": engine_stats["performance_health"],
                    "broadcaster": "healthy" if broadcast_stats["active_sessions"] < 100 else "busy"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")


@router.post("/roll/initiative", response_model=List[Dict[str, Any]])
async def roll_initiative(
    character_ids: List[str],
    session_id: str,
    user_id: str = "temp_user"
):
    """
    Roll initiative for all characters in a session.
    
    Returns characters sorted by initiative order (highest first).
    Used at the start of combat encounters.
    
    Args:
        character_ids: List of character IDs to roll initiative for
        session_id: Current game session ID
        user_id: ID of the user (must be session Seer)
        
    Returns:
        List of characters with initiative rolls, sorted by initiative
    """
    try:
        if not character_ids:
            raise HTTPException(
                status_code=400,
                detail="No characters provided for initiative"
            )
        
        if len(character_ids) > 6:
            raise HTTPException(
                status_code=400,
                detail="Too many characters for initiative (max 6)"
            )
        
        dice_engine = get_dice_engine()
        history_service = get_dice_history_service()
        broadcaster = get_dice_broadcaster()
        
        # Roll initiative for all characters (1d6 + DEX modifier)
        initiative_results = []
        
        for character_id in character_ids:
            # Roll 1d6 for initiative (standard SPARC)
            dice_roll = await dice_engine.roll_dice(
                session_id=session_id,
                character_id=character_id,
                dice_count=1,
                dice_sides=6,
                modifier=0,  # TODO: Add DEX modifier from character
                roll_type="initiative"
            )
            
            # Store and broadcast
            asyncio.create_task(history_service.store_dice_roll(dice_roll))
            asyncio.create_task(broadcaster.broadcast_roll(dice_roll))
            
            initiative_results.append({
                "character_id": character_id,
                "initiative": dice_roll.result,
                "roll_details": dice_roll.to_dict()
            })
        
        # Sort by initiative (highest first)
        initiative_results.sort(key=lambda x: x["initiative"], reverse=True)
        
        # Add turn order
        for i, result in enumerate(initiative_results):
            result["turn_order"] = i + 1
        
        return initiative_results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to roll initiative: {str(e)}")




@router.post("/roll/skill-check")
async def roll_skill_check(
    character_id: str,
    stat_name: str,
    difficulty: int,
    session_id: str,
    context: str = "",
    user_id: str = "temp_user"
):
    """
    Roll a skill check against a difficulty number.
    
    Args:
        character_id: Character making the skill check
        stat_name: Which stat to use ("str", "dex", "int", "cha")
        difficulty: Target number to beat (1-20)
        session_id: Current game session ID
        context: Description of what the check is for
        user_id: ID of the user making the roll
        
    Returns:
        Skill check results with success/failure
    """
    try:
        # TODO: Get character stats from database
        # For now, assume stat value of 3
        stat_value = 3
        
        # Validate parameters
        if stat_name not in ["str", "dex", "int", "cha"]:
            raise HTTPException(
                status_code=400,
                detail="Stat must be one of: str, dex, int, cha"
            )
        
        if not (1 <= difficulty <= 20):
            raise HTTPException(
                status_code=400,
                detail="Difficulty must be between 1 and 20"
            )
        
        dice_engine = get_dice_engine()
        history_service = get_dice_history_service()
        broadcaster = get_dice_broadcaster()
        
        # Roll 1d6 + stat for skill check
        dice_roll = await dice_engine.roll_dice(
            session_id=session_id,
            character_id=character_id,
            dice_count=1,
            dice_sides=6,
            modifier=stat_value,
            difficulty=difficulty,
            roll_type=f"skill_check_{stat_name}"
        )
        
        # Store and broadcast
        asyncio.create_task(history_service.store_dice_roll(dice_roll))
        asyncio.create_task(broadcaster.broadcast_roll(dice_roll))
        
        return {
            "success": True,
            "roll": dice_roll.to_dict(),
            "skill_check": {
                "stat_used": stat_name,
                "stat_value": stat_value,
                "difficulty": difficulty,
                "success": dice_roll.success,
                "margin": dice_roll.result - difficulty,
                "context": context or f"{stat_name.upper()} check (DC {difficulty})"
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to roll skill check: {str(e)}")


@router.post("/analyze")
async def analyze_dice_probability(request: DiceAnalysisRequest) -> Dict[str, Any]:
    """
    Analyze probability for a dice roll configuration.
    
    Provides probability analysis without executing the roll.
    Useful for strategic planning and difficulty assessment.
    """
    try:
        dice_engine = get_dice_engine()
        
        analysis = dice_engine.get_probability_analysis(
            dice_count=request.dice_count,
            dice_sides=request.dice_sides,
            modifier=request.modifier,
            difficulty=request.difficulty
        )
        
        return {
            "success": True,
            "analysis": {
                "dice_configuration": f"{request.dice_count}d{request.dice_sides}+{request.modifier}",
                "difficulty": request.difficulty,
                "expected_value": analysis["expected_value"],
                "success_probability": analysis["success_probability"],
                "failure_probability": analysis["failure_probability"],
                "difficulty_rating": analysis["difficulty_rating"],
                "recommended_action": (
                    "Excellent odds" if analysis["success_probability"] > 0.8 else
                    "Good odds" if analysis["success_probability"] > 0.6 else
                    "Fair chance" if analysis["success_probability"] > 0.4 else
                    "Long shot" if analysis["success_probability"] > 0.2 else
                    "Extremely difficult"
                )
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze probability: {str(e)}")


@router.get("/health")
async def dice_system_health() -> Dict[str, Any]:
    """Comprehensive health check for dice rolling system."""
    try:
        dice_engine = get_dice_engine()
        broadcaster = get_dice_broadcaster()
        
        engine_stats = dice_engine.get_performance_stats()
        broadcast_health = await broadcaster.health_check()
        
        overall_health = "healthy"
        if (engine_stats["p95_response_time_ms"] > 100 or 
            broadcast_health["status"] == "overloaded"):
            overall_health = "degraded"
        elif (engine_stats["p95_response_time_ms"] > 75 or 
              broadcast_health["status"] == "busy"):
            overall_health = "warning"
        
        return {
            "status": overall_health,
            "timestamp": time.time(),
            "components": {
                "dice_engine": {
                    "status": engine_stats["performance_health"],
                    "p95_response_time_ms": engine_stats["p95_response_time_ms"],
                    "sub_100ms_rate": engine_stats["sub_100ms_rate"],
                    "total_rolls": engine_stats["total_rolls"]
                },
                "broadcaster": {
                    "status": broadcast_health["status"],
                    "active_sessions": broadcast_health["active_sessions"],
                    "queue_size": broadcast_health["queue_size"],
                    "memory_usage": broadcast_health["memory_usage"]
                }
            },
            "performance_targets": {
                "p95_response_time_ms": 100,
                "sub_100ms_rate": 0.95,
                "max_queue_size": 5000,
                "max_active_sessions": 100
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "timestamp": time.time(),
            "error": str(e)
        }