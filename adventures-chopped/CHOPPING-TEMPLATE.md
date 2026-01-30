# Adventure Chopping Template

> Use this template to convert raw adventure content into SPARC node structure.
> Reference: `what-lies-beneath.md` for a complete example.

---

## Adventure Metadata

```yaml
title: "Adventure Title"
hub: "Mountain | City | Forest"
duration: 60  # minutes
difficulty: "beginner | intermediate | advanced"
party_size: "3-5"
theme: "dungeon delve, mystery, combat"
```

---

## Quest Summary

**Hook:** [How players receive the quest]
**Objective:** [What players must accomplish]
**Reward:** [What players get for completion]

---

## Node Definitions

### Node ID Format
Use: `{area}_{sequence}` (e.g., `entrance_01`, `combat_03`, `boss_01`)

### Node Template

```yaml
node_id: "unique_id"
type: "story | decision | skill_check | combat | puzzle | reward | rest"
title: "Short Title"
content: |
  The narrative text players see/hear.
  Can be multiple paragraphs.
connections:
  - target: "next_node_id"
    condition: null  # or "has_key", "success", "failure"
    label: null  # or "Go left", "Attack", etc.
properties:
  # Type-specific properties (see below)
```

---

## Node Type Properties

### Story Node
```yaml
properties:
  read_aloud: true  # Seer reads this to players
  ambient: "cave_drip"  # optional audio
  image: "cavern.jpg"  # optional visual
```

### Decision Node
```yaml
properties:
  prompt: "What do you do?"
  options:
    - text: "Open the door"
      target: "door_open"
    - text: "Search the room"
      target: "search_room"
    - text: "Go back"
      target: "previous_room"
```

### Skill Check Node
```yaml
properties:
  stat: "STR | DEX | INT | CHA"  # SPARC uses Might/Grace/Wit/Heart
  difficulty: 4  # target number on d6
  auto_success: "multiple_players"  # optional
  success_target: "success_node"
  failure_target: "failure_node"
  description: "Push open the heavy stone door"
```

### Combat Node
```yaml
properties:
  enemies:
    - name: "Goblin"
      count: 3
      hp: 4
      attack: 2
      defense: 1
      special: null
    - name: "Goblin Chief"
      count: 1
      hp: 8
      attack: 3
      defense: 2
      special: "Rally: +1 to all goblin attacks"
  environment:
    - "Columns provide cover"
    - "Brazier can be knocked over"
  flee_option: true
  victory_target: "post_combat"
  defeat_target: "game_over"
```

### Puzzle Node
```yaml
properties:
  description: "Four statues face outward. Strange markings on the floor."
  solution: "Rotate statues to face center"
  hints:
    - "The markings show arrows pointing inward"
    - "Each statue can be rotated with STR 3+"
  hazard: "Caught in gaze = petrified"
  success_target: "puzzle_solved"
  failure_target: null  # puzzle doesn't fail, just retry
```

### Reward Node
```yaml
properties:
  items:
    - name: "Gold"
      quantity: 50
    - name: "Healing Potion"
      quantity: 1
      effect: "Restore 1d6 HP"
  xp: 100
  story: "The chest creaks open revealing glittering treasure."
```

### Rest Node
```yaml
properties:
  type: "short | long"
  healing: "1d6"  # or "full"
  safe: true  # false = possible random encounter
  story: "You find a quiet alcove to catch your breath."
```

---

## State Tracking

### Inventory Flags
```yaml
state:
  items:
    - key_manticore
    - emerald_eye
  flags:
    - troglodyte_ally
    - puzzle_solved
```

### Conditions for Connections
```yaml
connections:
  - target: "secret_room"
    condition: "has:key_manticore"
  - target: "ally_help"
    condition: "flag:troglodyte_ally"
  - target: "alternate_dialogue"
    condition: "has:emerald_eye"
```

---

## Chopping Checklist

- [ ] Read full adventure, identify major scenes
- [ ] Mark each scene as a node type
- [ ] Identify all decision points (branches)
- [ ] Identify all skill checks with stats/difficulty
- [ ] Identify all combat encounters with enemy stats
- [ ] Identify all puzzles with solutions
- [ ] Map connections between nodes
- [ ] Note required items/flags for conditional paths
- [ ] Add convergence points (multiple paths → same node)
- [ ] Verify no dead ends (every path leads somewhere)
- [ ] Add ambient/visual suggestions

---

## Visual Graph Tips

1. **Start node** at top or left
2. **Linear flow** goes down or right
3. **Branches** spread horizontally
4. **Convergence** brings paths back together
5. **Boss/finale** near bottom or right
6. **Color code** by node type

---

## Example: Simple Adventure Structure

```
[Quest Start] → [Travel] → [Approach]
                              ↓
                    ┌────[Decision]────┐
                    ↓                  ↓
              [Left Path]        [Right Path]
                    ↓                  ↓
              [Combat A]         [Puzzle B]
                    ↓                  ↓
                    └────[Converge]────┘
                              ↓
                        [Boss Fight]
                              ↓
                         [Reward]
                              ↓
                          [End]
```

---

*Use this template for all adventure conversions. Save completed chops as `{adventure-name}-nodes.yaml` or `{adventure-name}-nodes.md`*
