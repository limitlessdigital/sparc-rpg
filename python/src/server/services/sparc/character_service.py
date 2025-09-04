from typing import List, Dict, Optional
import random
from datetime import datetime

from .models import (
    Character, CharacterClass, CharacterStats, CharacterTemplate,
    CreateCharacterRequest
)


class CharacterCreationService:
    """Service for creating and managing SPARC characters with 5-minute wizard."""
    
    # Character class templates with balanced stats and thematic equipment
    CHARACTER_TEMPLATES: Dict[CharacterClass, CharacterTemplate] = {
        CharacterClass.CLERIC: CharacterTemplate(
            character_class=CharacterClass.CLERIC,
            base_stats=CharacterStats(str=3, dex=2, int=4, cha=5),
            starting_hp=14,
            equipment=["Holy Symbol", "Chain Mail", "Shield", "Mace", "Healing Potion"],
            background_options=[
                "Temple Acolyte who joined to help others",
                "Former healer who found divine calling", 
                "Village priest seeking to protect people",
                "Monastery-trained scholar with healing gifts"
            ],
            special_ability_name="Divine Healing",
            special_ability_description="Restore 1d6+2 HP to any character within speaking distance"
        ),
        
        CharacterClass.NECROMANCER: CharacterTemplate(
            character_class=CharacterClass.NECROMANCER,
            base_stats=CharacterStats(str=2, dex=3, int=6, cha=3),
            starting_hp=10,
            equipment=["Grimoire", "Black Robes", "Component Pouch", "Dagger", "Bone Wand"],
            background_options=[
                "Academic who studied forbidden knowledge",
                "Grieving person who sought to speak with the dead",
                "Former healer who embraced darker arts",
                "Outcast scholar shunned by traditional mages"
            ],
            special_ability_name="Drain Life",
            special_ability_description="Deal 1d6 damage and heal yourself for the same amount"
        ),
        
        CharacterClass.PALADIN: CharacterTemplate(
            character_class=CharacterClass.PALADIN,
            base_stats=CharacterStats(str=5, dex=2, int=3, cha=4),
            starting_hp=16,
            equipment=["Holy Sword", "Plate Armor", "Shield", "Holy Symbol", "Rope (50ft)"],
            background_options=[
                "Knight sworn to protect the innocent",
                "Reformed criminal seeking redemption",
                "Noble's child dedicated to justice",
                "Temple guard called to greater service"
            ],
            special_ability_name="Righteous Strike",
            special_ability_description="Next attack deals double damage if target is evil or undead"
        ),
        
        CharacterClass.RANGER: CharacterTemplate(
            character_class=CharacterClass.RANGER,
            base_stats=CharacterStats(str=4, dex=5, int=3, cha=2),
            starting_hp=12,
            equipment=["Longbow", "Arrows (30)", "Leather Armor", "Short Sword", "Survival Kit"],
            background_options=[
                "Forest guide who knows the wild paths",
                "Hunter who protects villages from beasts",
                "Scout from a frontier settlement",
                "Wanderer who learned to live off the land"
            ],
            special_ability_name="Perfect Shot",
            special_ability_description="Next ranged attack automatically hits and deals maximum damage"
        ),
        
        CharacterClass.ROGUE: CharacterTemplate(
            character_class=CharacterClass.ROGUE,
            base_stats=CharacterStats(str=3, dex=6, int=4, cha=3),
            starting_hp=10,
            equipment=["Daggers (2)", "Leather Armor", "Thieves' Tools", "Rope (50ft)", "Lock Picks"],
            background_options=[
                "Former street thief seeking honest work",
                "Guild spy working undercover",
                "Acrobat from a traveling circus",
                "Scout who learned stealth from necessity"
            ],
            special_ability_name="Sneak Attack",
            special_ability_description="Deal +2d6 damage when attacking an unaware enemy"
        ),
        
        CharacterClass.WARRIOR: CharacterTemplate(
            character_class=CharacterClass.WARRIOR,
            base_stats=CharacterStats(str=6, dex=4, int=2, cha=3),
            starting_hp=18,
            equipment=["Battle Axe", "Chain Mail", "Shield", "Javelin", "Adventurer's Pack"],
            background_options=[
                "Soldier from the local garrison",
                "Mercenary seeking steady employment",
                "Blacksmith's apprentice with martial training",
                "Village defender who took up arms"
            ],
            special_ability_name="Battle Fury",
            special_ability_description="Make an additional attack this turn with +1 damage"
        ),
        
        CharacterClass.WIZARD: CharacterTemplate(
            character_class=CharacterClass.WIZARD,
            base_stats=CharacterStats(str=2, dex=3, int=6, cha=4),
            starting_hp=8,
            equipment=["Spellbook", "Wizard Robes", "Staff", "Component Pouch", "Scroll Case"],
            background_options=[
                "Academy student eager for real adventure",
                "Self-taught mage with natural talent",
                "Librarian who discovered ancient knowledge",
                "Apprentice whose master mysteriously vanished"
            ],
            special_ability_name="Arcane Blast",
            special_ability_description="Deal 2d6 damage to target within line of sight, ignores armor"
        )
    }
    
    def __init__(self):
        """Initialize character creation service."""
        pass
    
    def get_character_templates(self) -> Dict[CharacterClass, CharacterTemplate]:
        """Get all available character class templates."""
        return self.CHARACTER_TEMPLATES.copy()
    
    def get_template(self, character_class: CharacterClass) -> CharacterTemplate:
        """Get template for specific character class."""
        return self.CHARACTER_TEMPLATES[character_class]
    
    def create_character(self, user_id: str, request: CreateCharacterRequest) -> Character:
        """
        Create a character using the 3-step wizard process.
        
        This follows SPARC's 5-minute character creation philosophy:
        1. Choose name and class
        2. Select primary stat emphasis  
        3. Auto-generate equipment and background
        
        Args:
            user_id: ID of the user creating the character
            request: Character creation request with name, class, and primary stat
            
        Returns:
            Fully created Character with all stats and equipment
            
        Raises:
            ValueError: If invalid class or primary stat provided
        """
        if request.character_class not in self.CHARACTER_TEMPLATES:
            raise ValueError(f"Invalid character class: {request.character_class}")
        
        if request.primary_stat not in ['str', 'dex', 'int', 'cha']:
            raise ValueError(f"Invalid primary stat: {request.primary_stat}")
        
        # Get base template
        template = self.CHARACTER_TEMPLATES[request.character_class]
        
        # Adjust stats based on primary stat emphasis
        adjusted_stats = self._adjust_stats_for_primary(
            template.base_stats, 
            request.primary_stat
        )
        
        # Randomly select background from options
        background = random.choice(template.background_options)
        
        # Create character
        character = Character(
            user_id=user_id,
            name=request.name,
            character_class=request.character_class,
            stats=adjusted_stats,
            current_hp=template.starting_hp,
            max_hp=template.starting_hp,
            level=1,
            special_ability_available=True,
            heroic_saves_available=3,
            equipment=template.equipment.copy(),
            background=background,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        return character
    
    def _adjust_stats_for_primary(
        self, 
        base_stats: CharacterStats, 
        primary_stat: str
    ) -> CharacterStats:
        """
        Adjust base stats to emphasize the chosen primary stat.
        
        Gives +1 to primary stat and redistributes to maintain balance.
        All stats remain in 1-6 range per SPARC rules.
        
        Args:
            base_stats: Base stats from character template
            primary_stat: The stat to emphasize ('str', 'dex', 'int', 'cha')
            
        Returns:
            Adjusted stats with primary stat emphasized
        """
        stats_dict = base_stats.dict()
        
        # Boost primary stat by 1 (max 6)
        current_primary = stats_dict[primary_stat]
        if current_primary < 6:
            stats_dict[primary_stat] = min(6, current_primary + 1)
            
            # Find lowest non-primary stat to reduce by 1 (min 1)
            other_stats = {k: v for k, v in stats_dict.items() if k != primary_stat}
            lowest_stat = min(other_stats, key=other_stats.get)
            
            if stats_dict[lowest_stat] > 1:
                stats_dict[lowest_stat] = max(1, stats_dict[lowest_stat] - 1)
        
        return CharacterStats(**stats_dict)
    
    def validate_character_name(self, name: str) -> bool:
        """
        Validate character name meets requirements.
        
        Args:
            name: Proposed character name
            
        Returns:
            True if valid, False otherwise
        """
        if not name or len(name.strip()) == 0:
            return False
        
        if len(name) > 50:
            return False
        
        # Allow letters, spaces, apostrophes, hyphens
        allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'-() ")
        return all(c in allowed_chars for c in name)
    
    def get_character_preview(self, request: CreateCharacterRequest) -> Dict:
        """
        Generate a preview of what the character will look like.
        
        Used by the frontend to show character details before final creation.
        
        Args:
            request: Character creation request
            
        Returns:
            Dictionary with character preview data
        """
        template = self.CHARACTER_TEMPLATES[request.character_class]
        adjusted_stats = self._adjust_stats_for_primary(
            template.base_stats, 
            request.primary_stat
        )
        
        return {
            "name": request.name,
            "character_class": request.character_class,
            "stats": adjusted_stats.dict(),
            "starting_hp": template.starting_hp,
            "equipment": template.equipment,
            "special_ability": {
                "name": template.special_ability_name,
                "description": template.special_ability_description
            },
            "background_options": template.background_options,
            "primary_stat_bonus": f"+1 to {request.primary_stat.upper()}"
        }
    
    def update_character_hp(
        self, 
        character: Character, 
        new_current_hp: int
    ) -> Character:
        """
        Update character's current HP with validation.
        
        Args:
            character: Character to update
            new_current_hp: New current HP value
            
        Returns:
            Updated character
            
        Raises:
            ValueError: If HP invalid
        """
        if new_current_hp < 0:
            raise ValueError("HP cannot be negative")
        
        if new_current_hp > character.max_hp:
            raise ValueError(f"HP cannot exceed maximum of {character.max_hp}")
        
        character.current_hp = new_current_hp
        character.updated_at = datetime.utcnow()
        
        return character
    
    def use_special_ability(self, character: Character) -> Character:
        """
        Mark character's special ability as used.
        
        Args:
            character: Character using special ability
            
        Returns:
            Updated character
            
        Raises:
            ValueError: If ability not available
        """
        if not character.special_ability_available:
            raise ValueError("Special ability is not available")
        
        character.special_ability_available = False
        character.updated_at = datetime.utcnow()
        
        return character
    
    def use_heroic_save(self, character: Character) -> Character:
        """
        Use one of character's heroic saves.
        
        Args:
            character: Character using heroic save
            
        Returns:
            Updated character
            
        Raises:
            ValueError: If no heroic saves available
        """
        if character.heroic_saves_available <= 0:
            raise ValueError("No heroic saves available")
        
        character.heroic_saves_available -= 1
        character.updated_at = datetime.utcnow()
        
        return character
    
    def rest_character(self, character: Character) -> Character:
        """
        Apply rest benefits: restore special ability and heroic saves.
        
        Args:
            character: Character to rest
            
        Returns:
            Updated character
        """
        character.special_ability_available = True
        character.heroic_saves_available = 3
        character.updated_at = datetime.utcnow()
        
        return character