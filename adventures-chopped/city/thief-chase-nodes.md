# Thief Chase - Node Structure

## Adventure Metadata

```yaml
title: "Thief Chase"
hub: "City"
duration: 45
difficulty: "beginner"
party_size: "3-5"
theme: "urban pursuit, stealth, mystery"
recurring_npc: "Ernesh (disguised evil wizard Landis Zar)"
```

## Quest Summary

**Hook:** Track down bandits from the tutorial in the city of Therofall
**Objective:** Chase and apprehend the bandits without using deadly force
**Reward:** Story progression, vampire/Coil plot hook
**Fail Condition:** Using deadly force = arrested by guards = game over

---

## Nodes

### START_01: City Gates
```yaml
node_id: "start_01"
type: "story"
title: "Enter Therofall"
content: |
  You pass through the grand gates of Therofall. The city sprawls before you - 
  towering spires, bustling markets, and countless alleyways. Somewhere in this 
  maze, the bandits who escaped you are hiding.
connections:
  - target: "decision_01"
properties:
  read_aloud: true
  ambient: "city_bustle"
```

### DECISION_01: Where to Search
```yaml
node_id: "decision_01"
type: "decision"
title: "Where to Look?"
content: |
  The city is vast. Where do you want to start your search?
connections:
  - target: "search_bandits"
    label: "Search the streets for bandits"
  - target: "tavern_01"
    label: "Head to a tavern for information"
  - target: "authorities_01"
    label: "Ask the city guards"
properties:
  prompt: "Where do you want to search?"
```

### SEARCH_BANDITS: Street Search
```yaml
node_id: "search_bandits"
type: "skill_check"
title: "Searching the Streets"
content: |
  You scan the crowds, looking for familiar faces.
connections:
  - target: "chase_01"
    condition: "success"
  - target: "chase_01"
    condition: "failure"
    delay: true
properties:
  stat: "Wit"
  difficulty: 3
  description: "Search stealthily or ask around thoroughly"
  success_text: "You spot the bandits lurking near the market square!"
  failure_text: "After some searching, you eventually spot them near the market."
```

### TAVERN_01: The Cozy Tavern
```yaml
node_id: "tavern_01"
type: "story"
title: "The Midday Tavern"
content: |
  You enter a cozy, busy tavern. It's midday - lively but not yet rowdy. 
  
  A humble-looking seer with one eye shut notices your group. He waves you over.
  
  "You look like adventurers! I am Ernesh. What brings you to Therofall?"
connections:
  - target: "ernesh_talk"
properties:
  read_aloud: true
  npc_intro: "Ernesh"
  secret: "Ernesh is actually the evil wizard Landis Zar. His shut eye glows purple."
```

### ERNESH_TALK: Talking to Ernesh
```yaml
node_id: "ernesh_talk"
type: "decision"
title: "Conversation with Ernesh"
content: |
  Ernesh listens intently as you explain your quest to find the bandits.
  
  "Ah, bandits you say? If such scoundrels are hiding in Therofall, I know 
  just where to look. But it's dangerous... a seedy area called Southatch."
connections:
  - target: "chase_01"
    label: "Head to Southatch"
  - target: "decision_01"
    label: "Try somewhere else first"
properties:
  sets_flag: "met_ernesh"
```

### AUTHORITIES_01: City Guards
```yaml
node_id: "authorities_01"
type: "skill_check"
title: "Asking the Guards"
content: |
  You approach a patrol of city guards. They eye you suspiciously.
connections:
  - target: "guards_helpful"
    condition: "success"
  - target: "guards_unhelpful"
    condition: "failure"
properties:
  stat: "Heart"
  difficulty: 4
  description: "Convince the guards to help"
```

### GUARDS_HELPFUL: Guards Give Info
```yaml
node_id: "guards_helpful"
type: "story"
title: "Helpful Guards"
content: |
  The guard captain nods. "We've had reports of suspicious activity near the 
  market square. But frankly, we're stretched thin. If you want to play hero, 
  be my guest - just don't cause trouble."
connections:
  - target: "chase_01"
```

### GUARDS_UNHELPFUL: Guards Dismiss You
```yaml
node_id: "guards_unhelpful"
type: "story"
title: "Unhelpful Guards"
content: |
  The guards scoff. "Bandits? That's our job, not yours. Say, you look capable - 
  ever thought about joining the city guard? We're always recruiting."
  
  They're clearly not going to help.
connections:
  - target: "decision_01"
    label: "Try somewhere else"
  - target: "chase_01"
    label: "Search on your own"
```

---

## Chase Sequence

### CHASE_01: Market Square Spotted
```yaml
node_id: "chase_01"
type: "story"
title: "Bandits Spotted!"
content: |
  There! In the market square - you spot the two bandits from before, lurking 
  near a vegetable stall. They see you at the same moment and bolt!
  
  ⚠️ WARNING: Using deadly force in public will bring the guards down on you!
connections:
  - target: "chase_01_obstacle"
properties:
  read_aloud: true
  sets_flag: "chase_started"
  ambient: "crowd_panic"
```

### CHASE_01_OBSTACLE: Cabbage Cart
```yaml
node_id: "chase_01_obstacle"
type: "skill_check"
title: "The Cabbage Salesman"
content: |
  A cabbage salesman's cart blocks your path! The merchant is wheeling his 
  precious produce right into your way.
  
  "MY CABBAGES!" he screams as the bandits knock into his cart.
connections:
  - target: "chase_02"
    condition: "success"
  - target: "chase_02"
    condition: "failure"
    penalty: true
properties:
  stat: "Grace"
  difficulty: 3
  description: "Vault over or dodge around the cart"
  success_text: "You leap gracefully over the cart!"
  failure_text: "You crash through the cabbages, losing precious seconds!"
  easter_egg: "Avatar: The Last Airbender reference"
```

### CHASE_02: Party District
```yaml
node_id: "chase_02"
type: "story"
title: "Through the Party District"
content: |
  The bandits dash through the party district, knocking over a table of gamblers 
  playing cards on the sidewalk. Coins scatter everywhere!
  
  The angry gamblers turn on YOU, blocking your path!
connections:
  - target: "chase_02_decision"
```

### CHASE_02_DECISION: Gamblers
```yaml
node_id: "chase_02_decision"
type: "decision"
title: "Deal with Gamblers"
content: |
  The gamblers are furious, blaming you for their disrupted game.
connections:
  - target: "chase_02_fight"
    label: "Stop and deal with them"
  - target: "chase_02_run"
    label: "Push through without stopping"
properties:
  warning: "Deadly force = guards called!"
```

### CHASE_02_FIGHT: Talk Down Gamblers
```yaml
node_id: "chase_02_fight"
type: "skill_check"
title: "Calming the Gamblers"
content: |
  You try to calm the angry gamblers while keeping sight of the fleeing bandits.
connections:
  - target: "chase_03_lost"
    condition: "success"
  - target: "chase_03_lost"
    condition: "failure"
properties:
  stat: "Heart"
  difficulty: 4
  description: "Talk them down quickly"
  success_text: "You apologize and promise to return their coins. They let you pass."
  failure_text: "They delay you with complaints. The bandits get further ahead."
  consequence: "Bandits gain distance"
```

### CHASE_02_RUN: Push Through
```yaml
node_id: "chase_02_run"
type: "skill_check"
title: "Running Through"
content: |
  You barrel through the angry gamblers!
connections:
  - target: "chase_03"
    condition: "success"
  - target: "chase_03"
    condition: "failure"
    penalty: true
properties:
  stat: "Grace"
  difficulty: 3
  description: "Dodge their grabbing hands"
  success_text: "You weave through without getting caught!"
  failure_text: "Someone trips you, and another gets a punch in. Take 1 damage."
```

### CHASE_03: Magic Quarter
```yaml
node_id: "chase_03"
type: "story"
title: "Magic Quarter"
content: |
  You burst into the Magic Quarter, filled with mystical shops and floating 
  orbs. You've lost sight of the bandits among the dazzling displays!
  
  Then you spot a familiar face - Ernesh the seer, standing calmly nearby.
  How did he get here so fast?
connections:
  - target: "ernesh_help_check"
    condition: "!flag:met_ernesh"
  - target: "ernesh_helps"
    condition: "flag:met_ernesh"
```

### CHASE_03_LOST: Lost Trail (Delayed)
```yaml
node_id: "chase_03_lost"
type: "story"
title: "Trail Goes Cold"
content: |
  The delay cost you - you've completely lost the bandits in the Magic Quarter.
  
  But wait - there's Ernesh the seer, standing among the crystal ball displays!
connections:
  - target: "ernesh_help_check"
    condition: "!flag:met_ernesh"
  - target: "ernesh_helps"
    condition: "flag:met_ernesh"
```

### ERNESH_HELP_CHECK: Persuade Ernesh
```yaml
node_id: "ernesh_help_check"
type: "skill_check"
title: "Asking a Stranger"
content: |
  The one-eyed seer regards you curiously. "In a hurry, are we?"
connections:
  - target: "ernesh_helps"
    condition: "success"
  - target: "ernesh_refuses"
    condition: "failure"
properties:
  stat: "Heart"
  difficulty: 3
  description: "Persuade Ernesh to help"
```

### ERNESH_HELPS: Ernesh Reveals Bandits
```yaml
node_id: "ernesh_helps"
type: "story"
title: "Ernesh's Magic"
content: |
  Ernesh smiles knowingly. "Looking for someone? Let me help."
  
  He waves his hand, and the large crystal balls nearby transform into 
  shimmering bubbles. They float upward and POP - revealing the bandits 
  who were hiding behind them!
  
  "There they are! The chase is on!"
connections:
  - target: "chase_04"
properties:
  sets_flag: "ernesh_helped"
```

### ERNESH_REFUSES: Search Alone
```yaml
node_id: "ernesh_refuses"
type: "skill_check"
title: "Finding Them Yourself"
content: |
  The seer shrugs. "Good luck with that."
  You'll have to find the bandits yourself.
connections:
  - target: "chase_04"
    condition: "success"
  - target: "chase_04"
    condition: "failure"
    delay: true
properties:
  stat: "Wit"
  difficulty: 4
  description: "Search the Magic Quarter"
```

### CHASE_04: Southatch Slums
```yaml
node_id: "chase_04"
type: "skill_check"
title: "Through Southatch"
content: |
  The bandits flee into Southatch, the city's slums. Narrow alleys and 
  rickety buildings make it hard to keep them in sight!
connections:
  - target: "sewer_entrance"
    condition: "success"
  - target: "sewer_search"
    condition: "failure"
properties:
  stat: "Grace"
  difficulty: 4
  description: "Keep up with the fleeing bandits"
  success_text: "You see them disappear down an open manhole!"
  failure_text: "You lose sight of them in the maze of alleys..."
```

### SEWER_SEARCH: Find the Manhole
```yaml
node_id: "sewer_search"
type: "story"
title: "Searching for the Trail"
content: |
  After a frantic search, you spot an open manhole with fresh muddy 
  footprints leading down. They went into the sewers!
connections:
  - target: "sewer_entrance"
```

### SEWER_ENTRANCE: Into the Sewers
```yaml
node_id: "sewer_entrance"
type: "story"
title: "The Sewers"
content: |
  The stench hits you like a wall. It's dark down here, with only faint 
  light filtering through grates above. You'll need light to proceed.
  
  The sewer tunnel splits - left or right.
connections:
  - target: "sewer_decision"
properties:
  ambient: "sewer_drip"
  requires: "light source (torch or magic)"
```

### SEWER_DECISION: Left or Right
```yaml
node_id: "sewer_decision"
type: "decision"
title: "Which Way?"
content: |
  The tunnel branches. Which way did the bandits go?
connections:
  - target: "sewer_int_check"
    label: "Try to figure out which way they went"
  - target: "sewer_left"
    label: "Go left"
  - target: "sewer_right"
    label: "Go right"
```

### SEWER_INT_CHECK: Track Bandits
```yaml
node_id: "sewer_int_check"
type: "skill_check"
title: "Tracking"
content: |
  You examine the muddy floor for signs of passage.
connections:
  - target: "sewer_right"
    condition: "success"
    label: "Clue points right"
  - target: "sewer_decision"
    condition: "failure"
properties:
  stat: "Wit"
  difficulty: 4
  description: "Look for tracks or clues"
  success_text: "Fresh footprints head right, and you hear distant voices!"
  failure_text: "The muck obscures any trail. You'll have to guess."
```

---

## Sewer Branches

### SEWER_LEFT: Vampire Encounter
```yaml
node_id: "sewer_left"
type: "story"
title: "A Grisly Scene"
content: |
  You round the corner and freeze. A pale figure in dark robes stands over 
  a cluster of twitchy minions. They're offering him... a corpse.
  
  "This one's too old," the vampire hisses. "I need fresher blood."
  
  One minion whines, "But master, we brought it from near the mausoleum, 
  just like you asked—" 
  
  "SILENCE!"
  
  The vampire notices you. His eyes narrow.
connections:
  - target: "vampire_fight"
properties:
  read_aloud: true
  reveals: "Vampire's lair is below the mausoleum"
  sets_flag: "vampire_discovered"
```

### VAMPIRE_FIGHT: Fight the Minions
```yaml
node_id: "vampire_fight"
type: "combat"
title: "Vampire Minions"
content: |
  The vampire hisses and transforms into a swarm of rats, fleeing into 
  the darkness! But his minions surge toward you, fangs bared!
connections:
  - target: "sewer_left_aftermath"
    condition: "victory"
properties:
  enemies:
    - name: "Vampire Familiar"
      count: 3
      hp: 3
      attack: 2
      defense: 1
      special: "Bite: Heals 1 HP on hit"
  notes: "The master vampire escapes - future plot hook"
```

### SEWER_LEFT_AFTERMATH: After the Fight
```yaml
node_id: "sewer_left_aftermath"
type: "story"
title: "Examining the Scene"
content: |
  The minions dispatched, you examine the corpse they were offering. 
  Two tiny puncture marks on the throat. A vampire victim.
  
  The bandits aren't down here, but you've uncovered something darker...
connections:
  - target: "ending_01"
properties:
  clue: "Vampire activity in Therofall, lair near mausoleum"
```

### SEWER_RIGHT: Bandit Ambush
```yaml
node_id: "sewer_right"
type: "combat"
title: "Ambush!"
content: |
  The tunnel opens into a crude hideout. The bandits you've been chasing 
  stand alongside MORE bandits - and a hulking thug with unnaturally pale 
  skin and sharp teeth. You've walked into a trap!
  
  Graffiti on the walls shows a coiled serpent symbol - the mark of THE COIL.
connections:
  - target: "ending_02"
    condition: "victory"
properties:
  enemies:
    - name: "Bandit"
      count: 4
      hp: 4
      attack: 2
      defense: 1
    - name: "Vampiric Thug"
      count: 1
      hp: 10
      attack: 3
      defense: 2
      special: "Vampiric Strike: Heals 1 HP on hit"
  environment:
    - "Coil symbol graffiti"
    - "Crates for cover"
  sets_flag: "coil_discovered"
```

---

## Endings

### ENDING_01: Return from Vampire Path
```yaml
node_id: "ending_01"
type: "story"
title: "Back to the Surface"
content: |
  You climb out of the sewers to find Ernesh waiting nearby.
  
  "Pee-yoo!" He waves his hand in front of his nose. "Find those hooligans?"
connections:
  - target: "ernesh_debrief"
```

### ENDING_02: Return from Bandit Path
```yaml
node_id: "ending_02"
type: "story"
title: "Bandits Defeated"
content: |
  With the bandits defeated, you climb out of the sewers. Ernesh is waiting.
  
  "Pee-yoo! I trust you found what you were looking for?"
connections:
  - target: "ernesh_debrief"
```

### ERNESH_DEBRIEF: Final Conversation
```yaml
node_id: "ernesh_debrief"
type: "story"
title: "Ernesh's Concern"
content: |
  You tell Ernesh what you found - the vampires, the Coil symbol, or both.
  
  His expression grows serious. "This is troubling news. The Coil... and 
  vampires in Therofall. These are dark portents indeed."
  
  He places a hand on your shoulder. "Come, let us return to the tavern. 
  Evil was not vanquished in a day, and we have much to discuss."
connections:
  - target: "quest_complete"
properties:
  plot_hooks:
    - "Vampire lair below mausoleum"
    - "The Coil organization"
    - "Ernesh's true identity (Landis Zar)"
```

### QUEST_COMPLETE: Adventure End
```yaml
node_id: "quest_complete"
type: "reward"
title: "Quest Complete"
content: |
  You return to the tavern with Ernesh. Though the bandits are dealt with, 
  you've uncovered hints of something much darker lurking in Therofall...
connections: []
properties:
  xp: 150
  items: []
  story_flags:
    - "thief_chase_complete"
    - "vampire_plot_started"
    - "coil_plot_started"
  next_adventure: "To be continued..."
```

---

## State Summary

### Flags Set
- `met_ernesh` - Met Ernesh in tavern
- `chase_started` - Chase sequence began
- `ernesh_helped` - Ernesh used magic to help
- `vampire_discovered` - Found vampire in sewers
- `coil_discovered` - Found Coil hideout

### Items/Clues Gained
- Knowledge of vampire lair location (mausoleum)
- Knowledge of The Coil organization
- Relationship with Ernesh (secretly Landis Zar)

---

## Node Count Summary
- Story Nodes: 14
- Decision Nodes: 3
- Skill Check Nodes: 9
- Combat Nodes: 2
- Reward Nodes: 1

**Total: 29 nodes**
