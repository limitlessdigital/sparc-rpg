"""
API endpoints for SPARC Adventure Content System.
Provides structured 1-hour adventures with branching paths and progression tracking.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from ..services.sparc.adventure_service import (
    get_adventure_service, AdventureProgress, SceneType, OutcomeType
)
from ..services.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/adventure", tags=["sparc_adventure"])


@router.post("/start")
async def start_adventure(
    adventure_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Start a new adventure session."""
    try:
        adventure_service = await get_adventure_service()
        
        adventure_id = adventure_data.get("adventure_id")
        player_count = adventure_data.get("player_count", 2)
        session_id = adventure_data.get("session_id") or f"{user_id}_{int(datetime.now().timestamp())}"
        
        if not adventure_id:
            raise HTTPException(status_code=400, detail="Adventure ID is required")
        
        progress = await adventure_service.start_adventure(
            session_id=session_id,
            adventure_id=adventure_id,
            player_count=player_count
        )
        
        # Get the initial scene
        initial_scene = await adventure_service.get_current_scene(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "adventure_id": adventure_id,
            "started_at": progress.started_at.isoformat(),
            "initial_scene": initial_scene,
            "message": "Adventure started successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to start adventure: {e}")
        raise HTTPException(status_code=500, detail="Failed to start adventure")


@router.get("/scene/{session_id}")
async def get_current_scene(
    session_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get the current scene for an active adventure."""
    try:
        adventure_service = await get_adventure_service()
        scene_data = await adventure_service.get_current_scene(session_id)
        
        if not scene_data:
            raise HTTPException(status_code=404, detail="Adventure session not found")
        
        return {
            "success": True,
            "session_id": session_id,
            "scene_data": scene_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current scene for {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get scene")


@router.post("/scene/{session_id}/action")
async def process_scene_action(
    session_id: str,
    action_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Process a scene action and advance the adventure."""
    try:
        adventure_service = await get_adventure_service()
        
        action_taken = action_data.get("action_taken")
        dice_results = action_data.get("dice_results")
        player_narrative = action_data.get("player_narrative")
        
        if not action_taken:
            raise HTTPException(status_code=400, detail="Action taken is required")
        
        outcome_result = await adventure_service.process_scene_outcome(
            session_id=session_id,
            action_taken=action_taken,
            dice_results=dice_results,
            player_narrative=player_narrative
        )
        
        # Get next scene if adventure continues
        next_scene_data = None
        if not outcome_result["adventure_complete"]:
            next_scene_data = await adventure_service.get_current_scene(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "outcome": outcome_result,
            "next_scene": next_scene_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process scene action for {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process action")


@router.post("/content/generate")
async def generate_dynamic_content(
    content_request: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate dynamic content for an adventure session."""
    try:
        adventure_service = await get_adventure_service()
        
        session_id = content_request.get("session_id")
        content_type = content_request.get("content_type")
        context = content_request.get("context", {})
        
        if not session_id or not content_type:
            raise HTTPException(status_code=400, detail="Session ID and content type are required")
        
        generated_content = await adventure_service.generate_dynamic_content(
            session_id=session_id,
            content_type=content_type,
            context=context
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "content_type": content_type,
            "generated_content": generated_content
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate dynamic content: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate content")


@router.get("/templates")
async def get_adventure_templates() -> Dict[str, Any]:
    """Get available adventure templates."""
    try:
        adventure_service = await get_adventure_service()
        
        templates = []
        for template_id, template in adventure_service.adventure_templates.items():
            templates.append({
                "id": template.id,
                "title": template.title,
                "description": template.description,
                "theme": template.theme,
                "difficulty_level": template.difficulty_level.value,
                "total_time_minutes": template.total_time_minutes,
                "target_players": template.target_players,
                "scene_count": len(template.scenes),
                "learning_objectives": template.learning_objectives,
                "required_materials": template.required_materials
            })
        
        return {
            "success": True,
            "templates": templates,
            "total_count": len(templates)
        }
        
    except Exception as e:
        logger.error(f"Failed to get adventure templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to get templates")


@router.get("/templates/{template_id}")
async def get_adventure_template(template_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific adventure template."""
    try:
        adventure_service = await get_adventure_service()
        
        if template_id not in adventure_service.adventure_templates:
            raise HTTPException(status_code=404, detail="Adventure template not found")
        
        template = adventure_service.adventure_templates[template_id]
        
        # Include scene previews but not full content (spoilers)
        scene_previews = []
        for scene in template.scenes:
            scene_previews.append({
                "id": scene.id,
                "title": scene.title,
                "scene_type": scene.scene_type.value,
                "time_estimate_minutes": scene.time_estimate_minutes,
                "description": scene.description[:150] + "..." if len(scene.description) > 150 else scene.description
            })
        
        return {
            "success": True,
            "template": {
                "id": template.id,
                "title": template.title,
                "description": template.description,
                "theme": template.theme,
                "difficulty_level": template.difficulty_level.value,
                "total_time_minutes": template.total_time_minutes,
                "target_players": template.target_players,
                "learning_objectives": template.learning_objectives,
                "required_materials": template.required_materials,
                "success_criteria": template.success_criteria,
                "scene_previews": scene_previews
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get adventure template {template_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get template")


@router.get("/progress/{session_id}")
async def get_adventure_progress(
    session_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed progress information for an adventure session."""
    try:
        adventure_service = await get_adventure_service()
        
        if session_id not in adventure_service.active_adventures:
            return {
                "success": True,
                "progress": None,
                "message": "No active adventure found for session"
            }
        
        progress = adventure_service.active_adventures[session_id]
        
        return {
            "success": True,
            "progress": {
                "session_id": progress.session_id,
                "adventure_id": progress.adventure_id,
                "current_scene_id": progress.current_scene_id,
                "completed_scenes": progress.completed_scenes,
                "scene_outcomes": {k: v.value for k, v in progress.scene_outcomes.items()},
                "total_progress_points": progress.total_progress_points,
                "confidence_score": progress.confidence_score,
                "time_spent_minutes": progress.time_spent_minutes,
                "started_at": progress.started_at.isoformat(),
                "last_activity": progress.last_activity.isoformat(),
                "player_notes": progress.player_notes,
                "gm_interventions": progress.gm_interventions,
                "is_completed": progress.is_completed
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get adventure progress for {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progress")


@router.get("/analytics/{session_id}")
async def get_adventure_analytics(
    session_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed analytics for a completed or active adventure session."""
    try:
        adventure_service = await get_adventure_service()
        analytics = await adventure_service.get_adventure_analytics(session_id)
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error(f"Failed to get adventure analytics for {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")


@router.get("/sessions/active")
async def get_active_sessions(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get all active adventure sessions."""
    try:
        adventure_service = await get_adventure_service()
        
        active_sessions = []
        for session_id, progress in adventure_service.active_adventures.items():
            # Only include sessions that haven't been idle too long
            idle_minutes = (datetime.now() - progress.last_activity).total_seconds() / 60
            if idle_minutes < 120:  # 2 hours
                active_sessions.append({
                    "session_id": session_id,
                    "adventure_id": progress.adventure_id,
                    "current_scene_id": progress.current_scene_id,
                    "progress_percentage": (len(progress.completed_scenes) / 
                                          len(adventure_service.adventure_templates[progress.adventure_id].scenes)) * 100,
                    "confidence_score": progress.confidence_score,
                    "time_spent_minutes": progress.time_spent_minutes,
                    "last_activity": progress.last_activity.isoformat(),
                    "is_completed": progress.is_completed
                })
        
        return {
            "success": True,
            "active_sessions": active_sessions,
            "session_count": len(active_sessions)
        }
        
    except Exception as e:
        logger.error(f"Failed to get active sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get active sessions")


@router.delete("/session/{session_id}")
async def end_adventure_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """End an adventure session and cleanup resources."""
    try:
        adventure_service = await get_adventure_service()
        
        if session_id in adventure_service.active_adventures:
            # Get final analytics before cleanup
            final_analytics = await adventure_service.get_adventure_analytics(session_id)
            
            # Remove from active adventures
            del adventure_service.active_adventures[session_id]
            
            return {
                "success": True,
                "session_id": session_id,
                "final_analytics": final_analytics,
                "message": "Adventure session ended successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Adventure session not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to end adventure session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to end session")


# Health check endpoint
@router.get("/health")
async def adventure_health_check() -> Dict[str, Any]:
    """Health check for adventure system."""
    try:
        adventure_service = await get_adventure_service()
        
        return {
            "success": True,
            "service_healthy": True,
            "active_adventures": len(adventure_service.active_adventures),
            "available_templates": len(adventure_service.adventure_templates),
            "cache_entries": len(adventure_service.scene_transition_cache),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Adventure health check failed: {e}")
        return {
            "success": False,
            "service_healthy": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }