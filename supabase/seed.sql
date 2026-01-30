-- SPARC RPG Seed Data
-- This file seeds the local development database with sample data

-- ============================================
-- SAMPLE USERS (via auth.users)
-- ============================================
-- Note: In Supabase, we insert into auth.users which triggers the handle_new_user() function
-- to create corresponding public.users records

-- Create test users with known UUIDs for easy reference
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  aud,
  role
) VALUES 
  -- Seer (Game Master) user
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'seer@sparc.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"display_name": "The Chronicler"}',
    NOW(),
    NOW(),
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Player 1
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'player1@sparc.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"display_name": "Adventurer One"}',
    NOW(),
    NOW(),
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Player 2
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'player2@sparc.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"display_name": "Adventurer Two"}',
    NOW(),
    NOW(),
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Player 3
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'player3@sparc.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"display_name": "Adventurer Three"}',
    NOW(),
    NOW(),
    '',
    '',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Grant Seer role to the seer user
INSERT INTO user_roles (user_id, role, granted_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'seer', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- SAMPLE CHARACTERS (one for each class)
-- ============================================
INSERT INTO characters (
  id, user_id, name, class, might, grace, wit, heart,
  hit_points, max_hit_points, experience, level,
  equipment, special_ability
) VALUES
  -- Warrior (Player 1)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Kira Ironheart',
    'warrior',
    5, 3, 2, 2,
    6, 6, 0, 1,
    '["Longsword", "Shield", "Chainmail", "Healing Potion"]',
    '{"name": "Battle Cry", "description": "Intimidate enemies, granting advantage on next attack", "uses_per_session": 2}'
  ),
  -- Rogue (Player 1)
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Shadow Vex',
    'rogue',
    2, 5, 3, 2,
    5, 5, 150, 2,
    '["Twin Daggers", "Lockpicks", "Smoke Bombs", "Grappling Hook"]',
    '{"name": "Backstab", "description": "Deal double damage when attacking from stealth", "uses_per_session": 3}'
  ),
  -- Wizard (Player 2)
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Eldara Starweaver',
    'wizard',
    1, 2, 5, 4,
    4, 4, 0, 1,
    '["Staff of Sparks", "Spellbook", "Mana Potion", "Component Pouch"]',
    '{"name": "Arcane Surge", "description": "Cast two spells in one turn", "uses_per_session": 1}'
  ),
  -- Cleric (Player 2)
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'Brother Aldric',
    'cleric',
    2, 2, 3, 5,
    5, 5, 0, 1,
    '["Holy Mace", "Sacred Shield", "Prayer Beads", "Bandages"]',
    '{"name": "Divine Light", "description": "Heal an ally for 2 HP or damage undead", "uses_per_session": 3}'
  ),
  -- Paladin (Player 3)
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'Sir Galahad the Brave',
    'paladin',
    4, 2, 2, 4,
    6, 6, 0, 1,
    '["Holy Sword", "Plate Armor", "Shield of Faith", "Oath Token"]',
    '{"name": "Smite Evil", "description": "Extra damage against undead and demons", "uses_per_session": 2}'
  ),
  -- Ranger (Player 3)
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '44444444-4444-4444-4444-444444444444',
    'Willow Thornwood',
    'ranger',
    3, 4, 3, 2,
    5, 5, 0, 1,
    '["Longbow", "Hunting Knife", "Rope", "Animal Companion (Wolf)"]',
    '{"name": "Called Shot", "description": "Target specific body parts for tactical effects", "uses_per_session": 2}'
  ),
  -- Necromancer (Player 1)
  (
    '99999999-9999-9999-9999-999999999999',
    '22222222-2222-2222-2222-222222222222',
    'Mortis the Pale',
    'necromancer',
    1, 2, 5, 4,
    4, 4, 0, 1,
    '["Bone Staff", "Grimoire of Shadows", "Skull Charm", "Dark Robes"]',
    '{"name": "Raise Dead", "description": "Temporarily animate a fallen enemy to fight for you", "uses_per_session": 1}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE ADVENTURE
-- ============================================
INSERT INTO adventures (
  id, creator_id, name, description, thumbnail_url,
  difficulty, estimated_duration, min_players, max_players,
  content, status, is_valid, published_at
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  '11111111-1111-1111-1111-111111111111',
  'The Goblin Caves',
  'A classic adventure for new players! Local farmers have reported missing livestock and strange noises from the old mining caves. Investigate the disturbances and discover what lurks within.',
  NULL,
  'easy',
  90,
  2,
  4,
  '{
    "version": "1.0",
    "scenes": [
      {
        "id": "scene_1",
        "name": "Village of Millbrook",
        "description": "The party arrives at the small farming village of Millbrook. Worried villagers gather around, eager to share their troubles.",
        "encounters": [],
        "npcs": ["elder_martha", "farmer_tom"],
        "choices": [
          {"text": "Ask about the missing livestock", "next": "scene_2"},
          {"text": "Head directly to the caves", "next": "scene_3"}
        ]
      },
      {
        "id": "scene_2", 
        "name": "Gathering Information",
        "description": "The villagers share what they know. The attacks started a fortnight ago, always at night.",
        "encounters": [],
        "npcs": ["elder_martha"],
        "choices": [
          {"text": "Set a trap at night", "next": "scene_trap"},
          {"text": "Track the creatures", "next": "scene_3"}
        ]
      },
      {
        "id": "scene_3",
        "name": "Cave Entrance",
        "description": "A dark cave mouth yawns before you. Fresh tracks lead inside, and you hear faint chittering echoes.",
        "encounters": ["goblin_scouts"],
        "npcs": [],
        "choices": [
          {"text": "Sneak inside", "next": "scene_4", "check": {"attribute": "grace", "difficulty": 3}},
          {"text": "Charge in boldly", "next": "scene_4_combat"}
        ]
      },
      {
        "id": "scene_4",
        "name": "Goblin Lair",
        "description": "The caves open into a large chamber lit by crude torches. A dozen goblins mill about, and in the center sits their chieftain on a throne of bones.",
        "encounters": ["goblin_chieftain", "goblin_minions"],
        "npcs": ["goblin_chieftain_npc"],
        "choices": [
          {"text": "Attack!", "next": "boss_fight"},
          {"text": "Attempt to negotiate", "next": "negotiate", "check": {"attribute": "heart", "difficulty": 4}}
        ]
      }
    ],
    "npcs": [
      {"id": "elder_martha", "name": "Elder Martha", "description": "The village elder, worried but wise"},
      {"id": "farmer_tom", "name": "Farmer Tom", "description": "Lost three sheep this week alone"},
      {"id": "goblin_chieftain_npc", "name": "Grix the Goblin King", "description": "Cunning and cruel, but cowardly"}
    ],
    "encounters": [
      {"id": "goblin_scouts", "name": "Goblin Scouts", "creatures": ["goblin", "goblin"], "difficulty": "easy"},
      {"id": "goblin_chieftain", "name": "Grix the Goblin King", "creatures": ["goblin_chieftain"], "difficulty": "medium"},
      {"id": "goblin_minions", "name": "Goblin Minions", "creatures": ["goblin", "goblin", "goblin", "goblin"], "difficulty": "easy"}
    ]
  }',
  'published',
  true,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE CREATURES (for the adventure)
-- ============================================
INSERT INTO creatures (
  id, adventure_id, name, description,
  stats, abilities, hit_points, armor
) VALUES 
  (
    'c1111111-1111-1111-1111-111111111111',
    '12345678-1234-1234-1234-123456789012',
    'Goblin',
    'Small, green-skinned troublemakers with sharp teeth and sharper daggers.',
    '{"might": 2, "grace": 3, "wit": 1, "heart": 1}',
    '["Pack Tactics: +1 to attacks when ally is adjacent"]',
    2,
    0
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    '12345678-1234-1234-1234-123456789012',
    'Goblin Chieftain',
    'Larger and meaner than regular goblins, adorned with stolen jewelry and a rusty crown.',
    '{"might": 3, "grace": 3, "wit": 2, "heart": 1}',
    '["War Cry: Goblins gain +1 to attacks for one round", "Dirty Fighting: Can throw sand to blind enemies"]',
    5,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE SESSION (in waiting state)
-- ============================================
INSERT INTO sessions (
  id, seer_id, adventure_id, code, is_public,
  max_players, looking_for, status, game_state
) VALUES (
  '55551111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '12345678-1234-1234-1234-123456789012',
  'SPARC1',
  true,
  4,
  'Looking for 2-3 players for a beginner-friendly adventure!',
  'waiting',
  '{"currentTurn": null, "roundNumber": 0}'
)
ON CONFLICT (id) DO NOTHING;

-- Add one player to the session
INSERT INTO session_players (session_id, user_id, character_id)
VALUES (
  '55551111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
)
ON CONFLICT (session_id, user_id) DO NOTHING;

-- ============================================
-- OUTPUT SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Test Accounts (password: password123):';
  RAISE NOTICE '   • seer@sparc.local (Seer/GM role)';
  RAISE NOTICE '   • player1@sparc.local';
  RAISE NOTICE '   • player2@sparc.local';
  RAISE NOTICE '   • player3@sparc.local';
  RAISE NOTICE '';
  RAISE NOTICE '🎭 Characters: 7 (one of each class + extra rogue)';
  RAISE NOTICE '📜 Adventures: 1 (The Goblin Caves)';
  RAISE NOTICE '🎮 Sessions: 1 (Code: SPARC1, waiting for players)';
END $$;
