from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid


class CharacterClass(str, Enum):
    CLERIC = "cleric"
    NECROMANCER = "necromancer"
    PALADIN = "paladin"
    RANGER = "ranger"
    ROGUE = "rogue"
    WARRIOR = "warrior"
    WIZARD = "wizard"


class SessionStatus(str, Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class DiceRollType(str, Enum):
    ATTACK = "attack"
    DAMAGE = "damage"
    INITIATIVE = "initiative"
    SKILL_CHECK = "skill_check"
    HEROIC_SAVE = "heroic_save"


class CharacterStats(BaseModel):
    str: int = Field(..., ge=1, le=6, description="Strength stat (1-6)")
    dex: int = Field(..., ge=1, le=6, description="Dexterity stat (1-6)")
    int: int = Field(..., ge=1, le=6, description="Intelligence stat (1-6)")
    cha: int = Field(..., ge=1, le=6, description="Charisma stat (1-6)")

    @validator('str', 'dex', 'int', 'cha')
    def validate_stats(cls, v):
        if not (1 <= v <= 6):
            raise ValueError('Stats must be between 1 and 6')
        return v


class Character(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str = Field(..., min_length=1, max_length=50)
    character_class: CharacterClass
    stats: CharacterStats
    current_hp: int = Field(..., ge=0)
    max_hp: int = Field(..., ge=1)
    level: int = Field(default=1, ge=1, le=10)
    special_ability_available: bool = Field(default=True)
    heroic_saves_available: int = Field(default=3, ge=0, le=3)
    equipment: List[str] = Field(default_factory=list)
    background: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('current_hp')
    def validate_current_hp(cls, v, values):
        if 'max_hp' in values and v > values['max_hp']:
            raise ValueError('Current HP cannot exceed max HP')
        return v

    class Config:
        use_enum_values = True


class GameSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=100)
    seer_id: str
    adventure_id: Optional[str] = None
    status: SessionStatus = Field(default=SessionStatus.WAITING)
    current_node_id: Optional[str] = None
    max_players: int = Field(default=6, ge=1, le=6)
    player_characters: List[str] = Field(default_factory=list)  # character IDs
    turn_order: List[str] = Field(default_factory=list)  # character IDs in initiative order
    current_turn_index: int = Field(default=0)
    session_data: Dict[str, Any] = Field(default_factory=dict)  # Adventure-specific state
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    @validator('player_characters')
    def validate_max_players(cls, v, values):
        if 'max_players' in values and len(v) > values['max_players']:
            raise ValueError(f'Cannot exceed {values["max_players"]} players')
        return v

    class Config:
        use_enum_values = True


class Adventure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="")
    estimated_duration_minutes: int = Field(default=60, ge=15, le=180)
    difficulty_level: int = Field(default=1, ge=1, le=5)
    recommended_party_size: int = Field(default=4, ge=1, le=6)
    starting_node_id: str
    nodes: Dict[str, Any] = Field(default_factory=dict)  # Node definitions
    monsters: Dict[str, Any] = Field(default_factory=dict)  # Monster stats
    created_by: str
    is_published: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DiceRoll(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    character_id: Optional[str] = None  # None for Seer rolls
    roll_type: DiceRollType
    dice_count: int = Field(..., ge=1, le=10)
    results: List[int] = Field(..., min_items=1)  # Individual die results
    total: int = Field(..., ge=1)
    difficulty: Optional[int] = None  # Target number for success/failure
    is_success: Optional[bool] = None
    modifier: int = Field(default=0)
    context: str = Field(default="")  # What this roll was for
    rolled_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('results')
    def validate_dice_results(cls, v, values):
        # Validate each die result is 1-6
        if not all(1 <= result <= 6 for result in v):
            raise ValueError('All dice results must be between 1 and 6')
        if 'dice_count' in values and len(v) != values['dice_count']:
            raise ValueError('Number of results must match dice count')
        return v

    @validator('total')
    def validate_total(cls, v, values):
        if 'results' in values and 'modifier' in values:
            expected = sum(values['results']) + values['modifier']
            if v != expected:
                raise ValueError(f'Total {v} does not match sum of results + modifier: {expected}')
        return v

    class Config:
        use_enum_values = True


# Request/Response models for API
class CreateCharacterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    character_class: CharacterClass
    primary_stat: str = Field(..., description="The stat to emphasize (str, dex, int, or cha)")

    @validator('primary_stat')
    def validate_primary_stat(cls, v):
        if v not in ['str', 'dex', 'int', 'cha']:
            raise ValueError('Primary stat must be one of: str, dex, int, cha')
        return v


class CreateSessionRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    adventure_id: Optional[str] = None
    max_players: int = Field(default=6, ge=1, le=6)


class JoinSessionRequest(BaseModel):
    character_id: str


class RollDiceRequest(BaseModel):
    dice_count: int = Field(..., ge=1, le=10)
    roll_type: DiceRollType
    character_id: Optional[str] = None
    difficulty: Optional[int] = None
    modifier: int = Field(default=0)
    context: str = Field(default="")


class RollDiceResponse(BaseModel):
    roll: DiceRoll
    animation_duration_ms: int = Field(default=1500)


# Character creation helper models
class CharacterTemplate(BaseModel):
    character_class: CharacterClass
    base_stats: CharacterStats
    starting_hp: int
    equipment: List[str]
    background_options: List[str]
    special_ability_name: str
    special_ability_description: str

    class Config:
        use_enum_values = True


# Game state models
class SessionState(BaseModel):
    session: GameSession
    characters: List[Character]
    current_adventure: Optional[Adventure] = None
    recent_rolls: List[DiceRoll] = Field(default_factory=list)
    seer_notes: str = Field(default="")