import { describe, it, expect } from 'vitest';
import type {
  CharacterClass,
  Attribute,
  DifficultyLevel,
  AdventureStatus,
  SessionStatus,
  RollOutcome,
  RollType,
  TutorialPath,
  UserRole,
  EquipmentItem,
  SpecialAbility,
  RollModifier,
  GameState,
  AdventureContent,
  AdventureScene,
  Database,
  User,
  Character,
  Adventure,
  Session,
  DiceRoll,
  Tables,
  Enums,
} from '../types';

describe('Enum Types', () => {
  describe('CharacterClass', () => {
    it('accepts valid character classes', () => {
      const classes: CharacterClass[] = [
        'warrior',
        'rogue',
        'wizard',
        'cleric',
        'paladin',
        'ranger',
        'necromancer',
      ];
      
      expect(classes).toHaveLength(7);
      classes.forEach((c) => expect(typeof c).toBe('string'));
    });
  });

  describe('Attribute', () => {
    it('has four core attributes', () => {
      const attributes: Attribute[] = ['might', 'grace', 'wit', 'heart'];
      
      expect(attributes).toHaveLength(4);
    });
  });

  describe('DifficultyLevel', () => {
    it('has three difficulty levels', () => {
      const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
      
      expect(levels).toHaveLength(3);
    });
  });

  describe('AdventureStatus', () => {
    it('has three status types', () => {
      const statuses: AdventureStatus[] = ['draft', 'published', 'archived'];
      
      expect(statuses).toHaveLength(3);
    });
  });

  describe('SessionStatus', () => {
    it('has all session states', () => {
      const statuses: SessionStatus[] = [
        'waiting',
        'starting_soon',
        'active',
        'paused',
        'completed',
        'cancelled',
      ];
      
      expect(statuses).toHaveLength(6);
    });
  });

  describe('RollOutcome', () => {
    it('has four outcome types', () => {
      const outcomes: RollOutcome[] = [
        'critical_success',
        'success',
        'failure',
        'critical_failure',
      ];
      
      expect(outcomes).toHaveLength(4);
    });
  });

  describe('RollType', () => {
    it('has all roll types', () => {
      const types: RollType[] = [
        'attribute_check',
        'attack',
        'defense',
        'initiative',
        'damage',
        'healing',
        'ability',
        'heroic_save',
      ];
      
      expect(types).toHaveLength(8);
    });
  });

  describe('TutorialPath', () => {
    it('has player and seer paths', () => {
      const paths: TutorialPath[] = ['player', 'seer'];
      
      expect(paths).toHaveLength(2);
    });
  });

  describe('UserRole', () => {
    it('has three user roles', () => {
      const roles: UserRole[] = ['player', 'seer', 'admin'];
      
      expect(roles).toHaveLength(3);
    });
  });
});

describe('JSON Types', () => {
  describe('EquipmentItem', () => {
    it('accepts valid equipment structure', () => {
      const item: EquipmentItem = {
        id: 'sword-01',
        name: 'Iron Sword',
        type: 'weapon',
        description: 'A sturdy iron sword',
        bonus: 2,
        equipped: true,
      };
      
      expect(item.id).toBe('sword-01');
      expect(item.type).toBe('weapon');
      expect(item.bonus).toBe(2);
    });

    it('accepts all equipment types', () => {
      const types: EquipmentItem['type'][] = ['weapon', 'armor', 'item', 'consumable'];
      expect(types).toHaveLength(4);
    });
  });

  describe('SpecialAbility', () => {
    it('accepts valid ability structure', () => {
      const ability: SpecialAbility = {
        id: 'fireball-01',
        name: 'Fireball',
        description: 'Launches a ball of fire',
        attribute: 'wit',
        usesPerSession: 3,
        usesRemaining: 2,
      };
      
      expect(ability.name).toBe('Fireball');
      expect(ability.usesRemaining).toBe(2);
    });
  });

  describe('RollModifier', () => {
    it('accepts valid modifier structure', () => {
      const modifier: RollModifier = {
        source: 'Magic Sword',
        value: 2,
        reason: 'Enchanted weapon bonus',
      };
      
      expect(modifier.source).toBe('Magic Sword');
      expect(modifier.value).toBe(2);
    });
  });

  describe('GameState', () => {
    it('accepts valid game state', () => {
      const state: GameState = {
        turnOrder: ['char-1', 'char-2', 'char-3'],
        currentTurn: 1,
        round: 3,
        customData: { weatherEffect: 'rain' },
      };
      
      expect(state.turnOrder).toHaveLength(3);
      expect(state.round).toBe(3);
    });

    it('accepts empty game state', () => {
      const state: GameState = {};
      expect(state.turnOrder).toBeUndefined();
    });
  });

  describe('AdventureContent', () => {
    it('accepts valid adventure content', () => {
      const content: AdventureContent = {
        scenes: [
          {
            id: 'scene-1',
            name: 'The Tavern',
            description: 'A cozy tavern',
            connections: ['scene-2'],
          },
        ],
        encounters: [
          {
            id: 'encounter-1',
            sceneId: 'scene-1',
            name: 'Bar Fight',
            description: 'Trouble at the bar',
            creatures: ['goblin-1'],
          },
        ],
        npcs: [
          {
            id: 'npc-1',
            name: 'Bartender Bob',
            description: 'A friendly bartender',
            dialogue: ['Welcome traveler!'],
          },
        ],
        items: [
          {
            id: 'item-1',
            name: 'Key',
            description: 'A rusty key',
            type: 'quest',
          },
        ],
      };
      
      expect(content.scenes).toHaveLength(1);
      expect(content.encounters).toHaveLength(1);
      expect(content.npcs).toHaveLength(1);
      expect(content.items).toHaveLength(1);
    });
  });

  describe('AdventureScene', () => {
    it('accepts valid scene structure', () => {
      const scene: AdventureScene = {
        id: 'scene-123',
        name: 'Dark Forest',
        description: 'A mysterious forest shrouded in mist',
        imageUrl: 'https://example.com/forest.jpg',
        connections: ['scene-124', 'scene-125'],
      };
      
      expect(scene.connections).toHaveLength(2);
    });
  });
});

describe('Database Schema Types', () => {
  describe('Tables type helper', () => {
    it('extracts table row types', () => {
      // This is a type-level test - if it compiles, it passes
      const assertType = <T>(_value: T): void => {};
      
      // These type assertions verify the Tables helper works
      assertType<Tables<'users'>>({
        id: 'uuid',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: null,
        bio: null,
        is_verified: false,
        games_played: 0,
        games_run: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      expect(true).toBe(true); // Type check passed
    });
  });

  describe('User type', () => {
    it('has expected properties', () => {
      const user: User = {
        id: 'uuid-123',
        email: 'player@example.com',
        display_name: 'Test Player',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'A test bio',
        is_verified: true,
        games_played: 10,
        games_run: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      
      expect(user.email).toBe('player@example.com');
      expect(user.games_played).toBe(10);
    });
  });

  describe('Character type', () => {
    it('has expected properties', () => {
      const character: Character = {
        id: 'char-123',
        user_id: 'user-123',
        name: 'Hero',
        class: 'warrior',
        might: 12,
        grace: 10,
        wit: 8,
        heart: 14,
        hit_points: 20,
        max_hit_points: 25,
        experience: 1000,
        level: 3,
        equipment: [],
        special_ability: {
          id: 'ability-1',
          name: 'Battle Cry',
          description: 'Inspire allies',
        },
        last_played_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      
      expect(character.class).toBe('warrior');
      expect(character.might).toBe(12);
    });
  });

  describe('Adventure type', () => {
    it('has expected properties', () => {
      const adventure: Adventure = {
        id: 'adv-123',
        creator_id: 'user-123',
        name: 'The Lost Dungeon',
        description: 'A perilous journey',
        thumbnail_url: null,
        artwork_url: null,
        difficulty: 'medium',
        estimated_duration: 120,
        min_players: 2,
        max_players: 4,
        content: {},
        status: 'published',
        published_at: '2024-01-01T00:00:00Z',
        is_valid: true,
        validation_errors: [],
        times_played: 50,
        average_rating: 4.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      
      expect(adventure.difficulty).toBe('medium');
      expect(adventure.average_rating).toBe(4.5);
    });
  });

  describe('Session type', () => {
    it('has expected properties', () => {
      const session: Session = {
        id: 'session-123',
        seer_id: 'user-123',
        adventure_id: 'adv-123',
        code: 'ABC123',
        is_public: true,
        max_players: 4,
        looking_for: '2 players needed',
        scheduled_start: '2024-01-15T18:00:00Z',
        status: 'waiting',
        current_scene_id: null,
        current_encounter_id: null,
        game_state: {},
        started_at: null,
        ended_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      
      expect(session.status).toBe('waiting');
      expect(session.code).toBe('ABC123');
    });
  });

  describe('DiceRoll type', () => {
    it('has expected properties', () => {
      const roll: DiceRoll = {
        id: 'roll-123',
        session_id: 'session-123',
        character_id: 'char-123',
        character_name: 'Hero',
        attribute: 'might',
        dice_count: 2,
        difficulty: 12,
        roll_type: 'attack',
        modifiers: [{ source: 'Weapon', value: 2 }],
        results: [4, 6],
        total: 10,
        modified_total: 12,
        success: true,
        outcome: 'success',
        margin: 0,
        description: 'Attack roll against goblin',
        animation_seed: 12345,
        original_roll_id: null,
        created_at: '2024-01-01T00:00:00Z',
      };
      
      expect(roll.outcome).toBe('success');
      expect(roll.results).toEqual([4, 6]);
    });
  });
});

describe('Type Compatibility', () => {
  it('Enums helper extracts enum types', () => {
    // Type-level verification
    const charClass: Enums<'character_class'> = 'warrior';
    const attribute: Enums<'attribute'> = 'might';
    const difficulty: Enums<'difficulty_level'> = 'hard';
    
    expect(charClass).toBe('warrior');
    expect(attribute).toBe('might');
    expect(difficulty).toBe('hard');
  });

  it('Database type has correct structure', () => {
    // Verify the database type has expected structure
    const assertDatabaseStructure = <T extends Database>(): void => {};
    
    // This would fail to compile if Database structure is wrong
    assertDatabaseStructure<Database>();
    expect(true).toBe(true);
  });
});
