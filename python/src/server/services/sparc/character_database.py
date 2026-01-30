"""
Character Database Service for SPARC RPG.
Handles persistent storage of characters with performance tracking.
"""

import asyncpg
import json
import time
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4

from .models import Character, CharacterClass, CharacterStats, CreateCharacterRequest

logger = logging.getLogger(__name__)


class CharacterDatabaseService:
    """
    Database service for SPARC character persistence.
    
    Tracks character creation performance to ensure <5 minute requirement is met.
    """
    
    def __init__(self, connection_string: str):
        """Initialize database service."""
        self.connection_string = connection_string
        self._pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Initialize database connection pool."""
        try:
            self._pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            logger.info("Character database service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize character database: {e}")
            raise
    
    async def close(self):
        """Close database connections."""
        if self._pool:
            await self._pool.close()
    
    async def create_character(
        self,
        user_id: str,
        character: Character,
        creation_duration_ms: int,
        wizard_step_timings: Optional[Dict[str, int]] = None
    ) -> Character:
        """
        Store a new character in the database with performance tracking.
        
        Args:
            user_id: ID of the user creating the character
            character: Character object to store
            creation_duration_ms: Total time taken for character creation
            wizard_step_timings: Optional step-by-step timing data
            
        Returns:
            Character with assigned database ID
            
        Raises:
            ValueError: If character data is invalid
            RuntimeError: If database operation fails
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                try:
                    # Insert character
                    character_id = uuid4()
                    await conn.execute("""
                        INSERT INTO characters (
                            id, user_id, name, character_class,
                            str_stat, dex_stat, int_stat, cha_stat, primary_stat,
                            current_hp, max_hp, level,
                            special_ability_available, heroic_saves_available,
                            background, equipment,
                            created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
                        )
                    """,
                        character_id,
                        user_id,
                        character.name,
                        character.character_class.value,
                        character.stats.str,
                        character.stats.dex,
                        character.stats.int,
                        character.stats.cha,
                        getattr(character, 'primary_stat', 'str'),  # Default fallback
                        character.current_hp,
                        character.max_hp,
                        character.level,
                        character.special_ability_available,
                        character.heroic_saves_available,
                        character.background,
                        json.dumps(character.equipment),
                        character.created_at,
                        character.updated_at
                    )
                    
                    # Track creation performance
                    await conn.execute("""
                        INSERT INTO character_creation_metrics (
                            user_id, character_id, creation_duration_ms, wizard_step_timings
                        ) VALUES ($1, $2, $3, $4)
                    """,
                        user_id,
                        character_id,
                        creation_duration_ms,
                        json.dumps(wizard_step_timings) if wizard_step_timings else None
                    )
                    
                    # Update character with database ID
                    character.id = str(character_id)
                    character.user_id = user_id
                    
                    logger.info(f"Created character {character.name} ({character_id}) in {creation_duration_ms}ms")
                    return character
                    
                except Exception as e:
                    logger.error(f"Failed to create character: {e}")
                    raise RuntimeError(f"Database error: {e}")
    
    async def get_character(self, user_id: str, character_id: str) -> Optional[Character]:
        """
        Get a character by ID with RLS security.
        
        Args:
            user_id: ID of the user requesting the character
            character_id: ID of the character to retrieve
            
        Returns:
            Character if found and owned by user, None otherwise
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            # Set RLS context
            await conn.execute("SELECT set_config('app.current_user_id', $1, true)", user_id)
            
            row = await conn.fetchrow("""
                SELECT 
                    id, user_id, name, character_class,
                    str_stat, dex_stat, int_stat, cha_stat, primary_stat,
                    current_hp, max_hp, level,
                    special_ability_available, heroic_saves_available,
                    background, equipment,
                    created_at, updated_at
                FROM characters 
                WHERE id = $1
            """, UUID(character_id))
            
            if row:
                return self._row_to_character(row)
            return None
    
    async def get_user_characters(self, user_id: str, limit: int = 50) -> List[Character]:
        """
        Get all characters belonging to a user.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of characters to return
            
        Returns:
            List of user's characters, ordered by creation date (newest first)
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            # Set RLS context
            await conn.execute("SELECT set_config('app.current_user_id', $1, true)", user_id)
            
            rows = await conn.fetch("""
                SELECT 
                    id, user_id, name, character_class,
                    str_stat, dex_stat, int_stat, cha_stat, primary_stat,
                    current_hp, max_hp, level,
                    special_ability_available, heroic_saves_available,
                    background, equipment,
                    created_at, updated_at
                FROM characters 
                ORDER BY created_at DESC
                LIMIT $1
            """, limit)
            
            return [self._row_to_character(row) for row in rows]
    
    async def update_character(self, user_id: str, character: Character) -> Character:
        """
        Update an existing character.
        
        Args:
            user_id: ID of the user updating the character
            character: Updated character data
            
        Returns:
            Updated character
            
        Raises:
            ValueError: If character not found or not owned by user
            RuntimeError: If database operation fails
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        if not character.id:
            raise ValueError("Character ID is required for updates")
        
        async with self._pool.acquire() as conn:
            # Set RLS context
            await conn.execute("SELECT set_config('app.current_user_id', $1, true)", user_id)
            
            result = await conn.execute("""
                UPDATE characters SET
                    name = $2,
                    current_hp = $3,
                    special_ability_available = $4,
                    heroic_saves_available = $5,
                    equipment = $6,
                    updated_at = NOW()
                WHERE id = $1
            """,
                UUID(character.id),
                character.name,
                character.current_hp,
                character.special_ability_available,
                character.heroic_saves_available,
                json.dumps(character.equipment)
            )
            
            if result == "UPDATE 0":
                raise ValueError("Character not found or access denied")
            
            character.updated_at = datetime.utcnow()
            return character
    
    async def delete_character(self, user_id: str, character_id: str) -> bool:
        """
        Delete a character (soft delete recommended for audit).
        
        Args:
            user_id: ID of the user deleting the character
            character_id: ID of the character to delete
            
        Returns:
            True if character was deleted, False if not found
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            # Set RLS context
            await conn.execute("SELECT set_config('app.current_user_id', $1, true)", user_id)
            
            # For now, hard delete - could implement soft delete later
            result = await conn.execute("""
                DELETE FROM characters WHERE id = $1
            """, UUID(character_id))
            
            return result == "DELETE 1"
    
    async def get_creation_performance_stats(self) -> Dict[str, Any]:
        """
        Get character creation performance statistics.
        
        Returns:
            Performance stats for monitoring 5-minute requirement
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM character_creation_performance
            """)
            
            if row:
                return dict(row)
            else:
                return {
                    "total_characters_created": 0,
                    "avg_creation_time_ms": 0,
                    "median_creation_time_ms": 0,
                    "p95_creation_time_ms": 0,
                    "under_5_minutes_rate": 100.0,
                    "last_character_created": None
                }
    
    async def get_character_templates(self) -> Dict[str, Dict[str, Any]]:
        """
        Get character templates from database.
        
        Returns:
            Dictionary of character class templates
        """
        if not self._pool:
            raise RuntimeError("Database not initialized")
        
        async with self._pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    character_class, base_str, base_dex, base_int, base_cha,
                    starting_hp, equipment, background_options,
                    special_ability_name, special_ability_description
                FROM character_templates
                ORDER BY character_class
            """)
            
            templates = {}
            for row in rows:
                templates[row['character_class']] = {
                    'base_stats': {
                        'str': row['base_str'],
                        'dex': row['base_dex'],
                        'int': row['base_int'],
                        'cha': row['base_cha']
                    },
                    'starting_hp': row['starting_hp'],
                    'equipment': json.loads(row['equipment']),
                    'background_options': json.loads(row['background_options']),
                    'special_ability_name': row['special_ability_name'],
                    'special_ability_description': row['special_ability_description']
                }
            
            return templates
    
    def _row_to_character(self, row) -> Character:
        """Convert database row to Character object."""
        return Character(
            id=str(row['id']),
            user_id=row['user_id'],
            name=row['name'],
            character_class=CharacterClass(row['character_class']),
            stats=CharacterStats(
                str=row['str_stat'],
                dex=row['dex_stat'],
                int=row['int_stat'],
                cha=row['cha_stat']
            ),
            current_hp=row['current_hp'],
            max_hp=row['max_hp'],
            level=row['level'],
            special_ability_available=row['special_ability_available'],
            heroic_saves_available=row['heroic_saves_available'],
            background=row['background'],
            equipment=json.loads(row['equipment']),
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )


# Global database service instance
_character_db: Optional[CharacterDatabaseService] = None


async def get_character_database() -> CharacterDatabaseService:
    """Get the global character database service."""
    global _character_db
    if _character_db is None:
        # In production, get from environment variables
        connection_string = "postgresql://user:password@localhost/sparc_db"
        _character_db = CharacterDatabaseService(connection_string)
        await _character_db.initialize()
    return _character_db