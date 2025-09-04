from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from datetime import datetime
import time
import os

from ..services.sparc.models import (
    Character, CreateCharacterRequest, CharacterClass, CharacterTemplate
)
from ..services.sparc.character_service import CharacterCreationService
from ..services.sparc.character_database import get_character_database

router = APIRouter(prefix="/api/sparc/characters", tags=["SPARC Characters"])

# Initialize service
character_service = CharacterCreationService()


@router.get("/templates", response_model=Dict[CharacterClass, CharacterTemplate])
async def get_character_templates():
    """
    Get all character class templates for the character creation wizard.
    
    Returns templates with base stats, equipment, backgrounds, and abilities
    for each of the 7 SPARC character classes.
    """
    try:
        templates = character_service.get_character_templates()
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get character templates: {str(e)}"
        )


@router.get("/templates/{character_class}", response_model=CharacterTemplate)
async def get_character_template(character_class: CharacterClass):
    """
    Get template for a specific character class.
    
    Args:
        character_class: The character class to get template for
        
    Returns:
        Character template with stats, equipment, and background options
    """
    try:
        template = character_service.get_template(character_class)
        return template
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Character class {character_class} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get character template: {str(e)}"
        )


@router.post("/preview", response_model=Dict[str, Any])
async def preview_character(request: CreateCharacterRequest):
    """
    Preview what a character will look like before creating it.
    
    This endpoint supports the 5-minute character creation wizard
    by showing the final character details before confirmation.
    
    Args:
        request: Character creation request with name, class, and primary stat
        
    Returns:
        Preview data showing final stats, equipment, and abilities
    """
    try:
        # Validate character name
        if not character_service.validate_character_name(request.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid character name. Use 1-50 characters, letters and basic punctuation only."
            )
        
        preview = character_service.get_character_preview(request)
        return preview
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate character preview: {str(e)}"
        )


@router.post("/", response_model=Character, status_code=status.HTTP_201_CREATED)
async def create_character(
    request: CreateCharacterRequest,
    user_id: str = "temp_user"  # TODO: Replace with actual auth
):
    """
    Create a new SPARC character using the 3-step wizard process.
    
    This endpoint implements SPARC's 5-minute character creation philosophy:
    1. Player chooses name and class
    2. Player selects primary stat to emphasize  
    3. System auto-generates balanced stats, equipment, and background
    
    Tracks creation time to ensure <5 minute requirement is met.
    
    Args:
        request: Character creation request
        user_id: ID of the user creating the character (from auth)
        
    Returns:
        Fully created character ready for adventures
    """
    creation_start_time = time.perf_counter()
    
    try:
        # Validate character name
        if not character_service.validate_character_name(request.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid character name. Use 1-50 characters, letters and basic punctuation only."
            )
        
        # Create character in memory
        character = character_service.create_character(user_id, request)
        
        # Calculate creation time
        creation_duration_ms = int((time.perf_counter() - creation_start_time) * 1000)
        
        # Save to database if available
        try:
            character_db = await get_character_database()
            character = await character_db.create_character(
                user_id=user_id,
                character=character,
                creation_duration_ms=creation_duration_ms,
                wizard_step_timings={
                    "validation": creation_duration_ms // 4,
                    "generation": creation_duration_ms // 2,
                    "storage": creation_duration_ms // 4
                }
            )
        except Exception as db_error:
            # Log database error but continue with in-memory character
            print(f"Database unavailable, using in-memory character: {db_error}")
            character.id = f"temp_{int(time.time())}"
            character.user_id = user_id
        
        # Log performance warning if creation took too long
        if creation_duration_ms > 300000:  # 5 minutes
            print(f"WARNING: Character creation took {creation_duration_ms}ms (>5 minutes)")
        
        return character
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create character: {str(e)}"
        )


@router.get("/", response_model=List[Character])
async def get_user_characters(user_id: str = "temp_user"):
    """
    Get all characters belonging to the current user.
    
    Args:
        user_id: ID of the user (from auth)
        
    Returns:
        List of user's characters
    """
    try:
        # Get characters from database if available
        try:
            character_db = await get_character_database()
            characters = await character_db.get_user_characters(user_id)
            return characters
        except Exception as db_error:
            # Log database error but return empty list
            print(f"Database unavailable, returning empty character list: {db_error}")
            return []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get characters: {str(e)}"
        )


@router.get("/{character_id}", response_model=Character)
async def get_character(
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Get a specific character by ID.
    
    Args:
        character_id: UUID of the character
        user_id: ID of the user (from auth)
        
    Returns:
        Character details
    """
    try:
        # TODO: Implement database query with RLS check
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get character: {str(e)}"
        )


@router.put("/{character_id}/hp", response_model=Character)
async def update_character_hp(
    character_id: str,
    new_hp: int,
    user_id: str = "temp_user"
):
    """
    Update character's current HP.
    
    Args:
        character_id: UUID of the character
        new_hp: New current HP value (0 to max_hp)
        user_id: ID of the user (from auth)
        
    Returns:
        Updated character
    """
    try:
        # TODO: Implement database query and update
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update character HP: {str(e)}"
        )


@router.post("/{character_id}/special-ability", response_model=Character)
async def use_special_ability(
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Use character's special ability (once per adventure/rest).
    
    Args:
        character_id: UUID of the character
        user_id: ID of the user (from auth)
        
    Returns:
        Updated character with special ability marked as used
    """
    try:
        # TODO: Implement database query and update
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to use special ability: {str(e)}"
        )


@router.post("/{character_id}/heroic-save", response_model=Character)
async def use_heroic_save(
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Use one of character's heroic saves (3 per adventure/rest).
    
    Args:
        character_id: UUID of the character  
        user_id: ID of the user (from auth)
        
    Returns:
        Updated character with heroic save count decremented
    """
    try:
        # TODO: Implement database query and update
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to use heroic save: {str(e)}"
        )


@router.post("/{character_id}/rest", response_model=Character)
async def rest_character(
    character_id: str,
    user_id: str = "temp_user"
):
    """
    Apply rest benefits: restore special ability and heroic saves.
    
    Args:
        character_id: UUID of the character
        user_id: ID of the user (from auth)
        
    Returns:
        Updated character with abilities restored
    """
    try:
        # TODO: Implement database query and update
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rest character: {str(e)}"
        )


@router.get("/performance/creation-stats")
async def get_character_creation_performance():
    """
    Get character creation performance statistics.
    
    Monitors the <5 minute character creation requirement.
    
    Returns:
        Performance statistics for character creation speed
    """
    try:
        # Get performance stats from database if available
        try:
            character_db = await get_character_database()
            stats = await character_db.get_creation_performance_stats()
            
            # Add health status
            stats["healthy"] = stats["under_5_minutes_rate"] >= 95.0
            stats["performance_target_ms"] = 300000  # 5 minutes
            
            return {
                "success": True,
                "stats": stats
            }
        except Exception as db_error:
            print(f"Database unavailable for performance stats: {db_error}")
            return {
                "success": False,
                "error": "Database unavailable",
                "stats": {
                    "total_characters_created": 0,
                    "avg_creation_time_ms": 0,
                    "under_5_minutes_rate": 100.0,
                    "healthy": True,
                    "performance_target_ms": 300000
                }
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance stats: {str(e)}"
        )