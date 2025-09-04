"""
API endpoints for SPARC Tutorial and Onboarding system.
Supports 10-minute Seer training with 80%+ confidence rating.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from ..services.sparc.tutorial_service import (
    get_tutorial_service, TutorialStep, OnboardingStage, 
    ConfidenceArea, TutorialProgress, OnboardingMetrics
)
from ..services.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tutorial", tags=["sparc_tutorial"])


@router.post("/seer/start")
async def start_seer_tutorial(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Start the 10-minute Seer tutorial."""
    try:
        tutorial_service = await get_tutorial_service()
        progress = await tutorial_service.start_seer_tutorial(user_id)
        
        return {
            "success": True,
            "tutorial_id": progress.user_id,
            "current_step": progress.current_step,
            "started_at": progress.started_at.isoformat(),
            "message": "Seer tutorial started successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to start Seer tutorial for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to start tutorial")


@router.post("/seer/step/{step}")
async def advance_tutorial_step(
    step: str,
    step_data: Optional[Dict[str, Any]] = None,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Advance to the next tutorial step."""
    try:
        tutorial_service = await get_tutorial_service()
        
        # Convert string to enum
        try:
            step_enum = TutorialStep(step)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid tutorial step")
        
        success, next_step = await tutorial_service.advance_tutorial_step(
            user_id, step_enum, step_data
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Tutorial not found")
        
        response = {
            "success": True,
            "completed_step": step,
            "next_step": next_step.value if next_step else None,
            "tutorial_complete": next_step is None
        }
        
        # If tutorial is complete, calculate final results
        if next_step is None:
            confidence_rating = await tutorial_service.calculate_confidence_rating(user_id)
            response["confidence_rating"] = confidence_rating
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to advance tutorial step for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to advance tutorial step")


@router.get("/seer/step/{step}/content")
async def get_step_content(step: str) -> Dict[str, Any]:
    """Get content for a specific tutorial step."""
    try:
        tutorial_service = await get_tutorial_service()
        
        try:
            step_enum = TutorialStep(step)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid tutorial step")
        
        content = tutorial_service.get_step_content(step_enum)
        
        return {
            "success": True,
            "step": step,
            "content": content
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get step content for {step}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get step content")


@router.post("/scenario/{scenario_id}/evaluate")
async def evaluate_scenario_performance(
    scenario_id: str,
    evaluation_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Evaluate user performance in a practice scenario."""
    try:
        tutorial_service = await get_tutorial_service()
        
        evaluation = await tutorial_service.evaluate_scenario_performance(
            user_id=user_id,
            scenario_id=scenario_id,
            actions_taken=evaluation_data.get("actions_taken", []),
            dice_rolls_called=evaluation_data.get("dice_rolls_called", []),
            scene_descriptions=evaluation_data.get("scene_descriptions", [])
        )
        
        return {
            "success": True,
            "evaluation": evaluation
        }
        
    except Exception as e:
        logger.error(f"Failed to evaluate scenario performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate scenario")


@router.get("/confidence-rating")
async def get_confidence_rating(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current confidence rating for user."""
    try:
        tutorial_service = await get_tutorial_service()
        confidence_data = await tutorial_service.calculate_confidence_rating(user_id)
        
        return {
            "success": True,
            "confidence_data": confidence_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get confidence rating for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get confidence rating")


@router.post("/confidence-rating")
async def update_confidence_rating(
    ratings: Dict[str, int],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Update user's confidence self-assessment."""
    try:
        tutorial_service = await get_tutorial_service()
        
        # Validate ratings
        for area, rating in ratings.items():
            try:
                ConfidenceArea(area)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid confidence area: {area}")
            
            if not 1 <= rating <= 10:
                raise HTTPException(status_code=400, detail=f"Rating must be between 1-10, got {rating}")
        
        # Update tutorial progress with confidence ratings
        if user_id in tutorial_service.active_tutorials:
            tutorial_service.active_tutorials[user_id].confidence_ratings.update(ratings)
        
        # Calculate updated confidence
        confidence_data = await tutorial_service.calculate_confidence_rating(user_id)
        
        return {
            "success": True,
            "confidence_data": confidence_data,
            "message": "Confidence ratings updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update confidence rating for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update confidence rating")


@router.post("/onboarding/milestone")
async def track_onboarding_milestone(
    milestone_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Track a player onboarding milestone."""
    try:
        tutorial_service = await get_tutorial_service()
        
        milestone = milestone_data.get("milestone")
        additional_data = milestone_data.get("additional_data", {})
        
        if not milestone:
            raise HTTPException(status_code=400, detail="Milestone is required")
        
        await tutorial_service.track_onboarding_milestone(
            user_id, milestone, additional_data
        )
        
        return {
            "success": True,
            "message": f"Milestone '{milestone}' tracked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to track onboarding milestone: {e}")
        raise HTTPException(status_code=500, detail="Failed to track milestone")


@router.get("/onboarding/progress")
async def get_onboarding_progress(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get user's onboarding progress."""
    try:
        tutorial_service = await get_tutorial_service()
        
        if user_id not in tutorial_service.onboarding_tracking:
            return {
                "success": True,
                "progress": None,
                "message": "No onboarding data found"
            }
        
        metrics = tutorial_service.onboarding_tracking[user_id]
        
        return {
            "success": True,
            "progress": {
                "current_stage": metrics.current_stage,
                "stages_completed": list(metrics.stage_timestamps.keys()),
                "sessions_played": metrics.sessions_played,
                "characters_created": metrics.characters_created,
                "dice_rolls_made": metrics.dice_rolls_made,
                "total_play_time_minutes": metrics.total_play_time_minutes,
                "milestone_achievements": metrics.milestone_achievements,
                "needs_guidance": metrics.needs_guidance,
                "last_activity": metrics.last_activity.isoformat() if metrics.last_activity else None
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get onboarding progress for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get onboarding progress")


@router.get("/progress")
async def get_tutorial_progress(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current tutorial progress."""
    try:
        tutorial_service = await get_tutorial_service()
        
        if user_id not in tutorial_service.active_tutorials:
            return {
                "success": True,
                "progress": None,
                "message": "No active tutorial found"
            }
        
        progress = tutorial_service.active_tutorials[user_id]
        
        return {
            "success": True,
            "progress": {
                "user_id": progress.user_id,
                "tutorial_type": progress.tutorial_type,
                "current_step": progress.current_step,
                "completed_steps": progress.completed_steps,
                "confidence_ratings": progress.confidence_ratings,
                "total_time_minutes": progress.total_time_minutes,
                "started_at": progress.started_at.isoformat(),
                "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
                "needs_additional_support": progress.needs_additional_support
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get tutorial progress for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tutorial progress")


@router.get("/analytics")
async def get_tutorial_analytics() -> Dict[str, Any]:
    """Get tutorial system analytics (admin only)."""
    try:
        tutorial_service = await get_tutorial_service()
        analytics = tutorial_service.get_tutorial_analytics()
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error(f"Failed to get tutorial analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")


@router.get("/scenarios")
async def get_available_scenarios() -> Dict[str, Any]:
    """Get list of available practice scenarios."""
    try:
        tutorial_service = await get_tutorial_service()
        
        scenarios = []
        for scenario in tutorial_service.seer_scenarios:
            scenarios.append({
                "id": scenario.id,
                "title": scenario.title,
                "description": scenario.description,
                "difficulty_level": scenario.difficulty_level,
                "time_limit_minutes": scenario.time_limit_minutes,
                "character_count": len(scenario.player_characters)
            })
        
        return {
            "success": True,
            "scenarios": scenarios
        }
        
    except Exception as e:
        logger.error(f"Failed to get scenarios: {e}")
        raise HTTPException(status_code=500, detail="Failed to get scenarios")


@router.get("/scenarios/{scenario_id}")
async def get_scenario_details(scenario_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific scenario."""
    try:
        tutorial_service = await get_tutorial_service()
        
        scenario = next((s for s in tutorial_service.seer_scenarios if s.id == scenario_id), None)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        return {
            "success": True,
            "scenario": {
                "id": scenario.id,
                "title": scenario.title,
                "description": scenario.description,
                "setup": scenario.setup,
                "player_characters": scenario.player_characters,
                "decision_points": scenario.decision_points,
                "expected_actions": scenario.expected_actions,
                "success_criteria": scenario.success_criteria,
                "time_limit_minutes": scenario.time_limit_minutes,
                "difficulty_level": scenario.difficulty_level
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get scenario {scenario_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get scenario")


# Health check endpoint
@router.get("/health")
async def tutorial_health_check() -> Dict[str, Any]:
    """Health check for tutorial system."""
    try:
        tutorial_service = await get_tutorial_service()
        
        return {
            "success": True,
            "service_healthy": True,
            "active_tutorials": len(tutorial_service.active_tutorials),
            "onboarding_users": len(tutorial_service.onboarding_tracking),
            "available_scenarios": len(tutorial_service.seer_scenarios),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Tutorial health check failed: {e}")
        return {
            "success": False,
            "service_healthy": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }