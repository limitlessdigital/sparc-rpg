from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import time
from datetime import datetime

from ..services.sparc.models import GameSession, Character, Adventure, DiceRoll
from ..services.sparc.enhanced_ai_seer import get_enhanced_ai_seer

router = APIRouter(prefix="/api/sparc/ai", tags=["SPARC AI Seer"])

# AI Seer will be initialized per request


class SeerAdviceRequest(BaseModel):
    """Request model for Seer advice."""
    session_id: str
    current_situation: str
    additional_context: Optional[str] = None


class RuleClarificationRequest(BaseModel):
    """Request model for rule clarification."""
    rule_question: str
    session_context: Optional[str] = None


@router.post("/seer-advice", response_model=Dict[str, Any])
async def get_seer_advice(
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Get AI Seer advice for current game situation.
    
    Provides contextual GM guidance with <3 second response time guarantee.
    """
    start_time = time.perf_counter()
    max_response_time_ms = request.get("max_response_time_ms", 3000)
    
    try:
        query = request.get("query", "")
        context = request.get("context", {})
        request_type = request.get("request_type", "general")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # Generate AI advice based on request type and context
        ai_seer = await get_enhanced_ai_seer()
        advice = await ai_seer.generate_contextual_advice(
            query=query,
            context=context,
            request_type=request_type,
            max_time_ms=max_response_time_ms
        )
        
        # Track API performance
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        advice["response_time_ms"] = elapsed_ms
        
        # Log warning if approaching performance limit
        if elapsed_ms > (max_response_time_ms * 0.8):
            print(f"WARNING: AI Seer API took {elapsed_ms}ms (approaching {max_response_time_ms}ms limit)")
        
        return {
            "success": True,
            "advice": advice
        }
        
    except Exception as e:
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        print(f"ERROR: AI Seer advice failed after {elapsed_ms}ms: {str(e)}")
        
        # Return fallback advice
        return {
            "success": False,
            "error": str(e),
            "advice": {
                "type": "general",
                "title": "General GM Guidance",
                "content": "Keep the story moving and ask players what they want to do.",
                "context": "Fallback advice",
                "confidence": 0.5,
                "response_time_ms": elapsed_ms,
                "fallback": True
            }
        }


@router.post("/contextual-suggestions", response_model=Dict[str, Any])
async def get_contextual_suggestions(request: Dict[str, Any]) -> Dict[str, Any]:
    """Get contextual suggestions based on current game state."""
    try:
        context = request.get("context", {})
        suggestion_types = request.get("suggestion_types", ["scene_guidance", "player_help"])
        max_suggestions = request.get("max_suggestions", 4)
        
        ai_seer = await get_enhanced_ai_seer()
        suggestions = await ai_seer.generate_contextual_suggestions(
            context=context,
            suggestion_types=suggestion_types,
            max_suggestions=max_suggestions
        )
        
        return {
            "success": True,
            "suggestions": suggestions
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "suggestions": []
        }


@router.post("/rule-clarification", response_model=Dict[str, Any])
async def get_rule_clarification(request: Dict[str, Any]) -> Dict[str, Any]:
    """Get clarification on SPARC game rules."""
    try:
        query = request.get("query", "")
        context = request.get("context", {})
        category = request.get("category")
        max_response_time_ms = request.get("max_response_time_ms", 3000)
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        ai_seer = await get_enhanced_ai_seer()
        clarification = await ai_seer.get_rule_clarification(
            query=query,
            context=context,
            category=category,
            max_time_ms=max_response_time_ms
        )
        
        return {
            "success": True,
            "clarification": clarification
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "clarification": {
                "answer": "When in doubt, use simple d6 rolls",
                "rules": [],
                "context": "Fallback guidance",
                "clarity_score": 0.5
            }
        }


@router.post("/quick-rules", response_model=Dict[str, Any])
async def get_quick_rules(request: Dict[str, Any]) -> Dict[str, Any]:
    """Get quick reference rules by category."""
    try:
        category = request.get("category", "all")
        limit = request.get("limit", 6)
        
        ai_seer = await get_enhanced_ai_seer()
        rules = await ai_seer.get_quick_rules(category=category, limit=limit)
        
        return {
            "success": True,
            "rules": rules
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "rules": []
        }


@router.get("/suggestions/{situation_type}")
async def get_situation_suggestions(situation_type: str):
    """
    Get pre-built suggestions for common game situations.
    
    Provides instant advice for typical GM scenarios:
    - combat_start: Beginning combat encounters
    - skill_check: Setting up skill challenges  
    - story_stall: When players seem stuck
    - player_confused: When players need guidance
    
    Args:
        situation_type: Type of situation needing advice
        
    Returns:
        Specific suggestions and actions for the situation
    """
    try:
        situation_suggestions = {
            "combat_start": {
                "advice": "Roll initiative and describe the scene clearly",
                "suggestions": [
                    "Have each character roll 1d6 for initiative",
                    "Describe what each character sees",
                    "Ask highest initiative what they want to do",
                    "Keep turns under 30 seconds each"
                ],
                "quick_actions": ["Roll Initiative", "Describe Scene", "Start Combat"],
                "timing": "Use at start of any combat encounter"
            },
            "skill_check": {
                "advice": "Choose relevant stat and set appropriate difficulty",
                "suggestions": [
                    "Pick the most logical stat (STR/DEX/INT/CHA)",
                    "Set difficulty: Easy 8, Medium 12, Hard 16, Very Hard 20",
                    "Let player describe their approach first",
                    "Make failure interesting, not just 'no'"
                ],
                "quick_actions": ["Set Difficulty", "Roll Dice", "Describe Outcome"],
                "timing": "When outcome is uncertain and interesting"
            },
            "story_stall": {
                "advice": "Add energy with NPCs, complications, or time pressure",
                "suggestions": [
                    "Have an NPC arrive or react",
                    "Introduce a complication or urgency",
                    "Ask each character what they're doing right now",
                    "Move to a new scene or location"
                ],
                "quick_actions": ["Add NPC", "Create Complication", "Change Scene"],
                "timing": "When players seem unsure what to do next"
            },
            "player_confused": {
                "advice": "Offer specific, class-based action options",
                "suggestions": [
                    "Ask what their character wants to accomplish",
                    "Offer 2-3 specific actions based on their class",
                    "Remind them of special abilities and equipment",
                    "Let them ask questions about the scene"
                ],
                "quick_actions": ["Show Options", "List Abilities", "Describe Scene"],
                "timing": "When a player asks 'what can I do?'"
            }
        }
        
        if situation_type not in situation_suggestions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown situation type: {situation_type}. Available: {list(situation_suggestions.keys())}"
            )
        
        return situation_suggestions[situation_type]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get situation suggestions: {str(e)}"
        )


@router.get("/quick-actions")
async def get_quick_actions():
    """
    Get list of quick actions available to Seers during gameplay.
    
    These are common actions that can be triggered with single clicks
    to keep game flow smooth and reduce cognitive load on new GMs.
    
    Returns:
        Dictionary of action categories with specific actions
    """
    try:
        quick_actions = {
            "dice_rolling": [
                {"name": "Roll Initiative", "description": "Roll 1d6 for all characters"},
                {"name": "Skill Check", "description": "Roll stat + 1d6 vs difficulty"},
                {"name": "Attack Roll", "description": "Roll attack vs defense"},
                {"name": "Damage Roll", "description": "Roll 1d6 damage"}
            ],
            "scene_management": [
                {"name": "Next Scene", "description": "Move to next adventure scene"},
                {"name": "Describe Scene", "description": "Get scene description prompts"},
                {"name": "Add Complication", "description": "Introduce story complication"},
                {"name": "Time Pressure", "description": "Add urgency to current situation"}
            ],
            "player_support": [
                {"name": "Show Options", "description": "Display action options to confused player"},
                {"name": "Rule Lookup", "description": "Quick reference for game rules"},
                {"name": "Character Abilities", "description": "Show character's special abilities"},
                {"name": "Equipment List", "description": "Display character's equipment"}
            ],
            "adventure_flow": [
                {"name": "Save Progress", "description": "Create checkpoint save"},
                {"name": "Rest Characters", "description": "Apply rest benefits to party"},
                {"name": "Level Check", "description": "Check if characters should level up"},
                {"name": "Adventure Complete", "description": "Mark adventure as finished"}
            ]
        }
        
        return quick_actions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quick actions: {str(e)}"
        )


@router.get("/performance")
async def get_ai_performance():
    """
    Get AI Seer performance statistics.
    
    Returns metrics on response times to monitor the <3 second requirement.
    Used for system health monitoring and optimization.
    
    Returns:
        Performance statistics and health status
    """
    try:
        ai_seer = await get_enhanced_ai_seer()
        stats = await ai_seer.get_performance_stats()  # Now async
        
        # Add additional health metrics
        stats.update({
            "status": "healthy" if stats["healthy"] else "degraded",
            "target_response_time_s": 3.0,
            "current_load": "normal",  # TODO: Calculate based on active sessions
            "features_available": {
                "quick_responses": True,
                "rule_clarification": True,
                "contextual_advice": True,
                "performance_monitoring": True,
                "openai_integration": stats.get("openai_api_available", False)
            }
        })
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI performance stats: {str(e)}"
        )


@router.get("/health")
async def get_ai_health():
    """
    Get AI Seer health status.
    
    Quick health check for all AI services including OpenAI integration.
    Returns status and availability of different AI features.
    
    Returns:
        Health status for monitoring and diagnostics
    """
    try:
        from ..services.sparc.openai_client import get_openai_client
        
        # Check enhanced AI Seer service
        ai_seer = await get_enhanced_ai_seer()
        stats = await ai_seer.get_performance_stats()
        
        # Check OpenAI client directly
        openai_client = await get_openai_client()
        openai_health = await openai_client.health_check()
        
        overall_healthy = (
            stats["healthy"] and 
            (openai_health["status"] in ["healthy", "degraded"])  # Degraded is acceptable with fallbacks
        )
        
        return {
            "status": "healthy" if overall_healthy else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "enhanced_ai_seer": {
                    "status": "healthy" if stats["healthy"] else "unhealthy",
                    "response_time_p95_ms": stats.get("average_response_time_ms", 0),
                    "success_rate": stats.get("sub_3_second_rate", 0),
                    "cache_size": stats.get("cache_size", 0)
                },
                "openai_integration": {
                    "status": openai_health["status"],
                    "api_available": openai_health.get("api_responsive", False),
                    "fallback_available": openai_health.get("fallback_available", True),
                    "reason": openai_health.get("reason", "")
                }
            },
            "features": {
                "contextual_advice": True,
                "rule_clarification": True,
                "quick_responses": True,
                "performance_monitoring": True,
                "caching": True,
                "fallback_strategies": True
            },
            "performance_target_ms": 3000,
            "meets_performance_target": overall_healthy
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "services": {
                "enhanced_ai_seer": {"status": "unknown"},
                "openai_integration": {"status": "unknown"}
            }
        }


@router.post("/feedback")
async def submit_seer_feedback(
    session_id: str,
    advice_helpful: bool,
    feedback_text: Optional[str] = None,
    user_id: str = "temp_user"
):
    """
    Submit feedback on AI Seer advice quality.
    
    Helps improve AI suggestions over time and identifies
    areas where the assistant needs better guidance.
    
    Args:
        session_id: Session where advice was given
        advice_helpful: Whether the advice was helpful
        feedback_text: Optional detailed feedback
        user_id: ID of the Seer providing feedback
        
    Returns:
        Confirmation of feedback submission
    """
    try:
        # TODO: Store feedback in database for analysis
        # TODO: Use feedback to improve AI suggestions
        
        feedback_entry = {
            "session_id": session_id,
            "user_id": user_id,
            "helpful": advice_helpful,
            "feedback": feedback_text,
            "timestamp": time.time()
        }
        
        # For now, just log the feedback
        print(f"AI Seer Feedback: {feedback_entry}")
        
        return {
            "message": "Feedback received successfully",
            "helpful_count": 1 if advice_helpful else 0,
            "total_feedback": 1,
            "thank_you": "Your feedback helps improve the AI Seer Assistant!"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )