# Naigonn Chapel Adventure - Structured Adventure Example

## Adventure Overview
- **Title:** Below the City - Naigonn Chapel
- **Duration:** Approximately 1 hour
- **Party Size:** 3-5 players (optimal 4)
- **Difficulty:** Beginner-friendly
- **Theme:** Dungeon exploration with puzzles and combat

## Quest Summary
A dwarven sage named Benenthir asks the party to reclaim a lost family heirloom (silver sword hilt) from the depths of Naigonn Chapel. Reward: A magical shield crafted by dwarven blacksmiths (+1 die to defense rolls).

---

## Node Structure Analysis

### Node Types Present:
- **Story Nodes:** Narrative exposition and scene setting
- **Decision Nodes:** Player choice points with multiple paths
- **Encounter Nodes:** Combat encounters with monsters
- **Puzzle Nodes:** Problem-solving challenges (Medusa statue puzzle)
- **Skill Check Nodes:** Stat-based challenges (STR, CHA rolls)
- **Branching Logic Nodes:** Conditional paths based on player actions
- **Item/Reward Nodes:** Treasure and quest completion

---

## Adventure Flow Map

### 1. Quest Start (Story Node)
**Content:** Benenthir introduces the quest
**Connections:**
- → Ask Benenthir Questions (Decision Node)
- → Head to Chapel (Story Node)

### 2. Ask Benenthir Questions (Decision Node)
**Options:**
- "What might we find in Naigonn Chapel?" → Quest Info (Story Node)
- "What are we looking for?" → Quest Reminder (Story Node)
- "Nevermind" → Head to Chapel (Story Node)

### 3. Below the City (Story Node)
**Content:** Journey to the mausoleum and tunnel entrance
**Connection:** → Approach Naigonn Chapel (Story Node)

### 4. Approach Naigonn Chapel (Story Node)
**Content:** Large cavern with pools, stalagmites, grotesque gateway
**Connections:**
- → Try the Door (Skill Check Node)
- → Look Around (Skill Check Node)

### 5. Try the Door (Skill Check Node)
**Mechanic:** STR roll 4+ (or automatic with multiple players)
**Success:** Door opens, alerts troglodytes
**Connection:** → Troglodyte Encounter (Encounter Node)

### 6. Look Around (Skill Check Node)
**Mechanic:** Perception check reveals movement in pools
**Connections:**
- → Try the Door (Skill Check Node)
- → Investigate Pool (Skill Check Node)

### 7. Investigate Pool (Skill Check Node)
**Content:** Player investigation triggers troglodyte encounter
**Connection:** → Troglodyte Encounter (Encounter Node)

### 8. Troglodyte Encounter (Encounter Node)
**Enemies:** 1 + number of players
**Special:** Last troglodyte attempts to flee
**Connections:**
- → Try Diplomacy (Skill Check Node)
- → Fight Troglodytes (Combat Resolution)

### 9. Try Diplomacy (Skill Check Node)
**Mechanic:** CHA roll 6+ (reduced if offering food/weapons)
**Success:** Peaceful resolution + optional side quest
**Failure:** → Fight Troglodytes (Combat Resolution)
**Connection:** → Enter Chapel (Story Node)

### 10. Enter Naigonn Chapel - Entrance (Story Node)
**Content:** Dark hall with eye carving, emerald, inscriptions, two doors
**Special Feature:** Optional emerald retrieval (bonus XP)
**Connections:**
- → Take Emerald (Skill Check Node)
- → Go through Lion Door (Story Node)
- → Go through Snake Door (Story Node)

### 11. Take Emerald (Skill Check Node)
**Mechanic:** Player creativity + potential stat rolls
**Success:** Alternate beholder encounter trigger + bonus XP
**Connection:** → Choose Door (Decision Node)

## Left Path: Lion Door Route

### 12. Manticore Lair (Encounter Node)
**Enemy:** Manticore (with key)
**Environment:** Columns for cover, bones on floor
**Special:** Manticore flies if threatened by melee
**Loot:** Key from collar
**Connection:** → Manticore Antechamber (conditional on key)

### 13. Manticore Antechamber (Story Node)
**Access:** Requires key OR STR 14+ to break door
**Feature:** Healing fountain (cures poison)
**Connection:** → Beholder Chamber Stairs (Story Node)

## Right Path: Snake Door Route

### 14. Medusa Statue Puzzle Room (Puzzle Node)
**Challenge:** Rotate 4 medusa statues to face each other
**Mechanic:** STR 3+ to rotate (automatic with multiple players)
**Hazard:** Petrification if caught in statue gaze
**NPC:** Petrified troglodyte with fish bag
**Solution:** X-pattern facing or destroy troglodyte statue
**Connection:** → Medusa Antechamber (conditional on puzzle solution)

### 15. Medusa Antechamber (Story Node)
**Feature:** Fountain with revival water (cures petrification)
**Special:** Can revive troglodyte statue
**Connections:**
- → Beholder Chamber Stairs (Story Node)
- → Revive Troglodyte (Branching Logic Node)

### 16. Revive Troglodyte (Branching Logic Node)
**Condition:** If troglodyte statue not destroyed
**Connections:**
- → Fight Troglodyte (Encounter Node)
- → Return to Tribe (Skill Check Node)
- → Recruit Troglodyte (Skill Check Node)

### 17. Recruit Troglodyte (Skill Check Node)
**Mechanic:** CHA 4+
**Success:** Troglodyte joins party as NPC ally
**Failure:** → Troglodyte Flees (Story Node)

## Final Chamber: Both Paths Converge

### 18. Beholder Chamber (Encounter Node)
**Enemy:** Sethrix (Beholder) + Floating Eyes (equal to party size)
**Special Mechanics:**
- Multiple initiative rolls for different monster types
- Eyestalks can be severed (2 damage each)
- Different intro if troglodyte flees here
- Alternate dialogue if players have emerald
**Allies:** Recruited troglodyte (if present)
**Connection:** → Treasure Chest (Story Node)

### 19. Treasure Chest (Story Node)
**Content:** Silver sword hilt + additional items
**Connection:** → Quest Completion (Story Node)

### 20. Quest Completion (Story Node)
**Reward:** Magical shield (+1 defense die)
**Bonus:** Extra XP if emerald obtained
**End:** Adventure conclusion with player feedback

---

## Side Quest: Missing Troglodyte
**Trigger:** Successful diplomacy with troglodytes
**Objective:** Find missing troglodyte thief
**Reward:** Healing potion (1d6 HP recovery)
**Completion:** Show body/rescued thief to troglodyte outside

---

## Key Game Mechanics Demonstrated

### Skill Checks
- **STR Rolls:** Door opening, statue rotation, breaking down doors
- **CHA Rolls:** Diplomacy with troglodytes, recruitment
- **Perception:** Environmental awareness

### Combat Encounters
- **Troglodytes:** Basic encounter with fleeing mechanic
- **Manticore:** Flying enemy with environmental considerations
- **Beholder + Minions:** Boss fight with multiple enemy types

### Environmental Challenges
- **Medusa Puzzle:** Logic puzzle with petrification hazard
- **Healing Fountains:** Resource management and status effects
- **Cover System:** Tactical positioning in combat

### Branching Narratives
- **Multiple Paths:** Lion vs Snake door choices
- **Convergent Design:** Both paths lead to same final encounter
- **Optional Content:** Emerald collection, troglodyte side quest
- **Consequence System:** Actions affect later encounters

### Resource Management
- **Key Collection:** Required for certain areas
- **Status Effects:** Poison, petrification, healing
- **Ally Recruitment:** Optional NPC support

---

## Technical Implementation Notes

### Node Connection Types
- **Linear:** Story progression nodes
- **Branch:** Decision points with multiple exits
- **Convergent:** Multiple paths leading to single node
- **Conditional:** Access based on player state/items
- **Loop Back:** Return to previous areas

### State Tracking Requirements
- **Inventory:** Keys, emerald, healing potions
- **Party Status:** HP, conditions, recruited allies
- **Quest Progress:** Completed objectives, side quests
- **Environmental:** Puzzle solutions, door status

### AI Seer Guidance Points
- **Stuck Players:** Puzzle hints, alternative approaches
- **Creative Solutions:** Adjudicating unexpected player actions
- **Combat Tactics:** Environmental usage, tactical suggestions
- **Story Continuity:** Maintaining narrative flow

This adventure demonstrates the full range of SPARC's node-based system and showcases how complex, interconnected narratives can be built using the engine's core components.