"""
API endpoints for SPARC Progression Tracking System.
Provides automatic progression tracking and analytics for player development.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from ..services.sparc.progression_tracker import (
    get_progression_tracker, SkillArea, ProgressionMilestone
)
from ..services.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/progression", tags=["sparc_progression"])


@router.post("/track/adventure")
async def track_adventure_completion(
    completion_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Track completion of an adventure and update player progression."""
    try:
        progression_tracker = await get_progression_tracker()
        
        adventure_data = completion_data.get("adventure_data", {})
        session_progress = completion_data.get("session_progress", {})
        
        if not adventure_data or not session_progress:
            raise HTTPException(status_code=400, detail="Adventure data and session progress are required")
        
        result = await progression_tracker.track_adventure_completion(
            user_id=user_id,
            adventure_data=adventure_data,
            session_progress=session_progress
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "progression_update": result["progression_update"],
            "adventure_summary": {
                "adventure_id": result["adventure_summary"].adventure_id,
                "title": result["adventure_summary"].title,
                "final_confidence": result["adventure_summary"].final_confidence_score,
                "progress_points": result["adventure_summary"].total_progress_points,
                "completion_time": result["adventure_summary"].total_time_minutes,
                "scenes_completed": f"{result['adventure_summary'].scenes_completed}/{result['adventure_summary'].total_scenes}"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to track adventure completion for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to track adventure completion")


@router.post("/track/scene")
async def track_scene_outcome(
    scene_data: Dict[str, Any],
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Track individual scene outcomes for granular progression analysis."""
    try:
        progression_tracker = await get_progression_tracker()
        
        scene_info = scene_data.get("scene_data", {})
        outcome_data = scene_data.get("outcome_data", {})
        
        if not scene_info or not outcome_data:
            raise HTTPException(status_code=400, detail="Scene data and outcome data are required")
        
        result = await progression_tracker.track_scene_outcome(
            user_id=user_id,
            scene_data=scene_info,
            outcome_data=outcome_data
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "skills_developed": result["skills_developed"],
            "current_skill_levels": result["current_skill_levels"]
        }
        
    except Exception as e:
        logger.error(f"Failed to track scene outcome for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to track scene outcome")


@router.get("/player/{user_id}")
async def get_player_progression(
    user_id: str,
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive progression data for a player."""
    try:
        # Allow users to view their own progression or admin to view any
        if user_id != current_user and not await _is_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied")
        
        progression_tracker = await get_progression_tracker()
        progression_data = await progression_tracker.get_player_progression(user_id)
        
        if not progression_data:
            return {
                "success": True,
                "progression": None,
                "message": "No progression data found for user"
            }
        
        return {
            "success": True,
            "progression": progression_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get player progression for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get player progression")


@router.get("/analytics")
async def get_progression_analytics(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed analytics about current user's progression."""
    try:
        progression_tracker = await get_progression_tracker()
        analytics = await progression_tracker.get_progression_analytics(user_id)
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error(f"Failed to get progression analytics for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progression analytics")


@router.get("/skills")
async def get_skill_areas() -> Dict[str, Any]:
    """Get available skill areas and their descriptions."""
    try:
        skill_descriptions = {
            "problem_solving": "Ability to analyze situations and find effective solutions",
            "social_interaction": "Skills in communicating and working with others",
            "creative_thinking": "Capacity for innovative and original approaches to challenges",
            "leadership": "Ability to guide, inspire, and coordinate group efforts",
            "investigation": "Skills in gathering information and uncovering truth",
            "empathy": "Understanding and relating to the feelings and perspectives of others",
            "strategic_thinking": "Long-term planning and tactical decision-making abilities",
            "patience": "Ability to remain calm and thoughtful under pressure",
            "communication": "Clear and effective expression of ideas and information",
            "decision_making": "Skill in evaluating options and making sound choices"
        }
        
        return {
            "success": True,
            "skill_areas": [
                {
                    "id": skill.value,
                    "name": skill.value.replace('_', ' ').title(),
                    "description": skill_descriptions.get(skill.value, "Important adventuring skill")
                }
                for skill in SkillArea
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get skill areas: {e}")
        raise HTTPException(status_code=500, detail="Failed to get skill areas")


@router.get("/milestones")
async def get_progression_milestones() -> Dict[str, Any]:
    """Get available progression milestones and their requirements."""
    try:
        milestone_descriptions = {
            "first_adventure": {
                "title": "First Adventure",
                "description": "Complete your first SPARC adventure",
                "difficulty": "automatic",
                "reward": "Welcome to the world of RPGs!"
            },
            "first_success": {
                "title": "First Success",
                "description": "Complete an adventure with high confidence (7+)",
                "difficulty": "easy",
                "reward": "Increased confidence in your abilities"
            },
            "creative_solution": {
                "title": "Creative Problem Solver",
                "description": "Develop creative thinking skills (level 5+)",
                "difficulty": "medium",
                "reward": "Recognition for innovative approaches"
            },
            "helped_others": {
                "title": "Helpful Companion",
                "description": "Develop empathy skills through helping others (level 5+)",
                "difficulty": "medium",
                "reward": "Appreciation from fellow adventurers"
            },
            "overcame_challenge": {
                "title": "Challenge Conqueror",
                "description": "Successfully overcome difficult obstacles",
                "difficulty": "medium",
                "reward": "Increased resilience and determination"
            },
            "showed_leadership": {
                "title": "Natural Leader",
                "description": "Demonstrate leadership abilities (level 6+)",
                "difficulty": "hard",
                "reward": "Recognition as a capable leader"
            },
            "asked_for_help": {
                "title": "Wise Seeker",
                "description": "Show wisdom by asking for help when needed",
                "difficulty": "easy",
                "reward": "Understanding that seeking help is strength"
            },
            "taught_someone": {
                "title": "Knowledge Sharer",
                "description": "Help teach or guide another player",
                "difficulty": "medium",
                "reward": "Satisfaction of helping others grow"
            },
            "solved_mystery": {
                "title": "Mystery Solver",
                "description": "Successfully solve complex mysteries or puzzles",
                "difficulty": "medium",
                "reward": "Recognition for analytical thinking"
            },
            "made_friend": {
                "title": "Social Connector",
                "description": "Form meaningful connections with other players",
                "difficulty": "easy",
                "reward": "Enriched gaming experience through friendship"
            }
        }
        
        return {
            "success": True,
            "milestones": [
                {
                    "id": milestone.value,
                    "title": milestone_descriptions.get(milestone.value, {}).get("title", milestone.value.replace('_', ' ').title()),
                    "description": milestone_descriptions.get(milestone.value, {}).get("description", "Achievement milestone"),
                    "difficulty": milestone_descriptions.get(milestone.value, {}).get("difficulty", "medium"),
                    "reward": milestone_descriptions.get(milestone.value, {}).get("reward", "Personal growth and recognition")
                }
                for milestone in ProgressionMilestone
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get progression milestones: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progression milestones")


@router.get("/leaderboard")
async def get_progression_leaderboard(
    skill_area: Optional[str] = None,
    limit: int = 10
) -> Dict[str, Any]:
    """Get leaderboard of top players by overall level or specific skill."""
    try:
        progression_tracker = await get_progression_tracker()
        
        # Get all player progressions
        all_progressions = []
        for user_id, player in progression_tracker.player_progressions.items():
            player_data = {
                "user_id": user_id,
                "overall_level": player.overall_level,
                "total_adventures": player.total_adventures,
                "total_play_time_hours": player.total_play_time_hours,
                "milestones_count": len(player.milestone_achievements)
            }
            
            if skill_area and skill_area in [skill.value for skill in SkillArea]:
                skill_enum = SkillArea(skill_area)
                if skill_enum in player.skill_progress:
                    player_data["skill_level"] = player.skill_progress[skill_enum].current_level
                    player_data["skill_confidence"] = player.skill_progress[skill_enum].confidence_in_skill
                else:
                    player_data["skill_level"] = 1.0
                    player_data["skill_confidence"] = 5.0
            
            all_progressions.append(player_data)
        
        # Sort by appropriate metric
        if skill_area:
            all_progressions.sort(key=lambda x: (x["skill_level"], x["skill_confidence"]), reverse=True)
            sort_metric = f"{skill_area.replace('_', ' ').title()} Level"
        else:
            all_progressions.sort(key=lambda x: (x["overall_level"], x["milestones_count"]), reverse=True)
            sort_metric = "Overall Level"
        
        # Limit results
        top_players = all_progressions[:limit]
        
        return {
            "success": True,
            "leaderboard": {
                "sort_metric": sort_metric,
                "skill_area": skill_area,
                "total_players": len(all_progressions),
                "players": [
                    {
                        "rank": idx + 1,
                        "user_id": player["user_id"][:8] + "..." if len(player["user_id"]) > 8 else player["user_id"],  # Anonymized
                        "overall_level": player["overall_level"],
                        "total_adventures": player["total_adventures"],
                        "play_time_hours": round(player["total_play_time_hours"], 1),
                        "milestones": player["milestones_count"],
                        "skill_level": player.get("skill_level"),
                        "skill_confidence": player.get("skill_confidence")
                    }
                    for idx, player in enumerate(top_players)
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get progression leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")


@router.get("/recommendations")
async def get_progression_recommendations(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get personalized recommendations for continued progression."""
    try:
        progression_tracker = await get_progression_tracker()
        
        if user_id not in progression_tracker.player_progressions:
            return {
                "success": True,
                "recommendations": [
                    {
                        "type": "getting_started",
                        "title": "Start Your Adventure Journey",
                        "description": "Begin with a newcomer-friendly adventure to start building your skills.",
                        "action": "Choose your first adventure from the Adventure page",
                        "priority": "high"
                    }
                ]
            }
        
        player = progression_tracker.player_progressions[user_id]
        recommendations = await progression_tracker._generate_recommendations(player)
        
        return {
            "success": True,
            "recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Failed to get progression recommendations for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


@router.delete("/reset")
async def reset_player_progression(
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """Reset player progression data (for testing or fresh starts)."""
    try:
        progression_tracker = await get_progression_tracker()
        
        if user_id in progression_tracker.player_progressions:
            del progression_tracker.player_progressions[user_id]
            
            return {
                "success": True,
                "message": "Player progression data reset successfully",
                "user_id": user_id
            }
        else:
            return {
                "success": True,
                "message": "No progression data found to reset",
                "user_id": user_id
            }
        
    except Exception as e:
        logger.error(f"Failed to reset progression for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset progression")


# Health check endpoint
@router.get("/health")
async def progression_health_check() -> Dict[str, Any]:
    """Health check for progression tracking system."""
    try:
        progression_tracker = await get_progression_tracker()
        
        total_players = len(progression_tracker.player_progressions)
        active_players = sum(
            1 for player in progression_tracker.player_progressions.values()
            if (datetime.now() - player.last_activity).days < 7
        )
        
        return {
            "success": True,
            "service_healthy": True,
            "total_players_tracked": total_players,
            "active_players_week": active_players,
            "skill_areas_available": len(SkillArea),
            "milestones_available": len(ProgressionMilestone),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Progression health check failed: {e}")
        return {
            "success": False,
            "service_healthy": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


async def _is_admin(user_id: str) -> bool:
    """Check if user has admin privileges (placeholder implementation)."""
    # TODO: Implement proper admin checking
    return False