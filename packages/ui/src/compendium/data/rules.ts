/**
 * SPARC Rules Data
 * 
 * Core rules and mechanics for SPARC RPG.
 */

import type { RuleEntry } from "../types";

export const RULES: RuleEntry[] = [
  // CORE RULES
  {
    id: "rule-dice-rolling",
    slug: "dice-rolling",
    title: "Dice Rolling",
    type: "rule",
    category: "Rules",
    subcategory: "Core Mechanics",
    summary: "How to roll dice and determine success in SPARC.",
    content: `# Dice Rolling

SPARC uses six-sided dice (d6) for all rolls.

## Basic Roll
Roll a number of d6 equal to your relevant attribute. Count the number of dice showing 4, 5, or 6 as **successes**.

## Difficulty
The Seer sets a difficulty for each roll:
- **Easy:** 1 success needed
- **Medium:** 2 successes needed
- **Hard:** 3 successes needed
- **Very Hard:** 4 successes needed

## Rolling Doubles
If you roll two or more of the same number (any number), your class ability recharges!

## Example
A Champion with Might 4 rolls to break down a door (Medium difficulty).
Rolling 4d6: [2, 4, 5, 3] = 2 successes. Success!`,
    stats: {
      category: "core",
      complexity: "basic"
    },
    tags: ["core", "dice", "mechanics", "basics"],
    relatedEntries: ["rule-advantage", "ability-heroic-save"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-advantage",
    slug: "advantage-disadvantage",
    title: "Advantage & Disadvantage",
    type: "rule",
    category: "Rules",
    subcategory: "Core Mechanics",
    summary: "How advantage and disadvantage affect your rolls.",
    content: `# Advantage & Disadvantage

Sometimes circumstances give you an edge—or put you at a hindrance.

## Advantage
When you have advantage, roll one extra die and count all successes.

**Example:** A Grace 3 character attacking a prone enemy rolls 4d6 instead of 3d6.

## Disadvantage
When you have disadvantage, roll one fewer die (minimum 1d6).

**Example:** A blinded character with Might 3 attacks with only 2d6.

## Stacking
Multiple sources of advantage/disadvantage don't stack. They cancel out:
- Advantage + Disadvantage = Normal roll
- Multiple Advantages = Still just Advantage

## Common Sources

**Advantage:**
- Attacking a prone target (melee)
- Attacking an unaware target
- Flanking with an ally
- Well-prepared for the situation

**Disadvantage:**
- Blinded
- Poisoned
- Attacking a prone target (ranged)
- Difficult circumstances`,
    stats: {
      category: "core",
      complexity: "basic"
    },
    tags: ["core", "dice", "mechanics", "advantage"],
    relatedEntries: ["rule-dice-rolling", "condition-blinded", "condition-prone"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-attributes",
    slug: "attributes",
    title: "Attributes",
    type: "rule",
    category: "Rules",
    subcategory: "Character",
    summary: "The four core attributes that define your character.",
    content: `# Attributes

Every character has four attributes that determine their capabilities.

## Might
Physical strength and toughness. Used for:
- Melee attack rolls
- Breaking objects
- Resisting physical effects
- Feats of strength

## Grace
Agility, reflexes, and coordination. Used for:
- Ranged attack rolls
- Dodging attacks
- Stealth and acrobatics
- Initiative rolls

## Wit
Intelligence, perception, and magical aptitude. Used for:
- Spellcasting
- Noticing details
- Knowledge checks
- Puzzle solving

## Heart
Charisma, willpower, and social ability. Used for:
- Persuasion and intimidation
- Resisting mental effects
- Healing magic
- Leadership

## Starting Attributes
Each class has different starting attribute distributions totaling 9 points.`,
    stats: {
      category: "core",
      complexity: "basic"
    },
    tags: ["core", "character", "attributes", "basics"],
    relatedEntries: ["rule-dice-rolling", "class-champion", "class-sage"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // COMBAT RULES
  {
    id: "rule-combat-initiative",
    slug: "combat-initiative",
    title: "Initiative",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "How turn order is determined at the start of combat.",
    content: `# Initiative

When combat begins, each participant rolls initiative to determine turn order.

## Rolling Initiative
Roll 1d6 and add your Grace modifier.

## Turn Order
Combat proceeds from highest to lowest initiative. Ties are broken by Grace score, then by the Seer's choice.

## The Round
A round represents roughly 6 seconds of in-game time. Each participant gets one turn per round.

## Surprise
If one side is unaware of the other:
- Surprised creatures cannot act in the first round
- They can react normally after their (skipped) first turn`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "initiative", "turns"],
    relatedEntries: ["rule-combat-actions", "rule-combat-melee"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-combat-actions",
    slug: "combat-actions",
    title: "Actions in Combat",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "What you can do on your turn in combat.",
    content: `# Actions in Combat

On your turn, you can take one action, one bonus action, and move.

## Movement
Move up to your speed (typically 30 feet). You can split movement before and after your action.

## Actions
- **Attack:** Make one weapon attack
- **Cast Spell:** Cast a spell with casting time of 1 action
- **Dash:** Double your movement for this turn
- **Dodge:** Attacks against you have disadvantage until your next turn
- **Help:** Give an ally advantage on their next roll
- **Hide:** Make a stealth check to become hidden
- **Use Object:** Interact with an object (drink potion, open door)

## Bonus Actions
Some abilities grant bonus actions. You can only take one bonus action per turn.

## Reactions
Reactions happen on other creatures' turns. You get one reaction per round.
- **Opportunity Attack:** Attack an enemy that leaves your reach`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "actions", "turns", "movement"],
    relatedEntries: ["rule-combat-initiative", "rule-combat-melee", "rule-combat-ranged"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-combat-melee",
    slug: "combat-melee",
    title: "Melee Combat",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "How close-range combat works.",
    content: `# Melee Combat

Melee attacks are made against targets within your reach (usually 5 feet).

## Making an Attack
1. Roll your Might in d6 (or Grace for Finesse weapons)
2. Count successes (4, 5, or 6)
3. Compare to target's defense
4. If successes ≥ defense, you hit!

## Defense
Defense = Armor + Grace (minimum 1)

## Damage
On a hit, roll your weapon's damage die and subtract the target's armor value.

## Melee Engagement
When you're within 5 feet of an enemy:
- Making ranged attacks has disadvantage
- Moving away provokes opportunity attacks

## Two-Weapon Fighting
If you wield two light weapons, you can make a bonus action attack with your off-hand weapon (no attribute bonus to damage).`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "melee", "attack", "damage"],
    relatedEntries: ["rule-combat-actions", "rule-defense", "item-longsword"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-combat-ranged",
    slug: "combat-ranged",
    title: "Ranged Combat",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "How ranged attacks and spells work.",
    content: `# Ranged Combat

Ranged attacks hit targets at a distance using bows, thrown weapons, or spells.

## Making a Ranged Attack
1. Roll your Grace in d6 (or Wit for spells)
2. Count successes
3. Compare to target's defense
4. If successes ≥ defense, you hit!

## Range
Each ranged weapon has a range. Attacking beyond this range has disadvantage.

## Cover
Targets behind cover are harder to hit:
- **Half Cover:** +1 to defense
- **Three-Quarters Cover:** +2 to defense
- **Full Cover:** Cannot be targeted

## Melee Range
Making ranged attacks while an enemy is within 5 feet gives disadvantage.

## Ammunition
Most ranged weapons require ammunition. Track arrows/bolts during adventures.`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "ranged", "attack", "cover"],
    relatedEntries: ["rule-combat-actions", "rule-defense", "item-shortbow"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-defense",
    slug: "defense",
    title: "Defense",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "How armor and defense protect you from attacks.",
    content: `# Defense

Your defense determines how hard you are to hit.

## Calculating Defense
**Defense = Armor Value + Grace (minimum 1)**

## Armor Values
| Armor | Defense Bonus |
|-------|---------------|
| No Armor | 0 |
| Leather | 1 |
| Chain Mail | 2 |
| Plate | 3 |
| Shield | +1 |

## Being Hit
When an attacker's successes meet or exceed your defense, you're hit.

## Damage Reduction
Armor also reduces damage taken:
- Light Armor: -1 damage
- Medium Armor: -2 damage
- Heavy Armor: -3 damage

## Shields
Shields add +1 to defense and can be used to block one attack per round completely (uses reaction).`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "defense", "armor", "protection"],
    relatedEntries: ["item-chainmail", "item-shield", "item-leather-armor"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-healing",
    slug: "healing",
    title: "Healing",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "How to recover lost hit points.",
    content: `# Healing

Characters can recover lost hit points through several methods.

## Healing Sources
- **Healing Potions:** Restore 2d6 HP when consumed
- **Divine Healing:** Mystic ability restores half max HP
- **Short Rest:** 1 hour rest restores 1d6 HP
- **Long Rest:** 8 hour rest restores all HP

## Maximum HP
You can never heal above your maximum HP.

## Healing Others
Some abilities can heal allies:
- Must be within range (usually touch)
- Cannot heal an unconscious character above 1 HP (they wake up)

## First Aid
A character can stabilize a dying ally with a Wit check (difficulty 2).`,
    stats: {
      category: "combat",
      complexity: "basic"
    },
    tags: ["combat", "healing", "recovery", "rest"],
    relatedEntries: ["item-healing-potion", "ability-divine-healing", "rule-dying"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-dying",
    slug: "dying",
    title: "Dying & Death",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "What happens when you reach 0 HP.",
    content: `# Dying & Death

When your HP reaches 0, you're not dead yet—but you're in danger.

## Falling Unconscious
At 0 HP, you fall unconscious (see condition). You're dying but not dead.

## Death Saves
At the start of each of your turns while at 0 HP, roll 1d6:
- **4-6:** Success
- **1-3:** Failure

**Three successes:** You stabilize at 0 HP.
**Three failures:** You die.

## Massive Damage
If damage reduces you below negative your max HP, you die instantly.

## Stabilizing
A stabilized character remains at 0 HP but stops making death saves. They wake up with 1 HP after 1d4 hours or when healed.

## Taking Damage While Dying
Taking damage at 0 HP counts as one death save failure. Critical hits count as two failures.`,
    stats: {
      category: "combat",
      complexity: "intermediate"
    },
    tags: ["combat", "dying", "death", "saves"],
    relatedEntries: ["condition-unconscious", "rule-healing", "ability-heroic-save"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-boss-encounters",
    slug: "boss-encounters",
    title: "Boss Encounters",
    type: "rule",
    category: "Rules",
    subcategory: "Combat",
    summary: "Special rules for fighting powerful boss creatures.",
    content: `# Boss Encounters

Boss monsters are significantly more powerful than standard enemies.

## Boss Traits
- **High HP:** Bosses have 40+ HP typically
- **Legendary Resistance:** Can auto-succeed on saves (usually 3/day)
- **Multiattack:** Make multiple attacks per turn
- **Special Abilities:** Unique, powerful abilities

## Lair Actions
In their lair, bosses may take special actions:
- Happen at initiative 20 (loses ties)
- Represent the environment itself attacking

## Legendary Actions
Some bosses can act outside their turn:
- Take actions at the end of other creatures' turns
- Usually 3 legendary actions per round
- Recharge at the start of the boss's turn

## Phases
Some bosses have multiple phases:
- At certain HP thresholds, abilities change
- May heal or transform
- Often signals increased danger`,
    stats: {
      category: "combat",
      complexity: "advanced"
    },
    tags: ["combat", "boss", "encounter", "advanced"],
    relatedEntries: ["monster-dragon-young", "monster-lich"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // EXPLORATION RULES
  {
    id: "rule-exploration",
    slug: "exploration",
    title: "Exploration",
    type: "rule",
    category: "Rules",
    subcategory: "Exploration",
    summary: "Rules for exploring dungeons and wilderness.",
    content: `# Exploration

Between combat encounters, adventurers explore their environment.

## Light
- **Bright Light:** Normal vision
- **Dim Light:** Disadvantage on Wit (perception) checks
- **Darkness:** Cannot see, effectively Blinded

## Common Actions
- **Search:** Wit check to find hidden items or secrets
- **Listen:** Wit check to hear sounds through doors/walls
- **Detect Traps:** Wit check, difficulty set by trap
- **Disable Traps:** Grace check, failure may trigger trap

## Travel Pace
| Pace | Speed | Effect |
|------|-------|--------|
| Fast | 4 mph | -2 to perception |
| Normal | 3 mph | — |
| Slow | 2 mph | Can use stealth |

## Marching Order
Establish who leads and who follows—the first person triggers traps and is targeted by ambushes.`,
    stats: {
      category: "exploration",
      complexity: "basic"
    },
    tags: ["exploration", "travel", "light", "traps"],
    relatedEntries: ["item-torch", "item-rope", "condition-blinded"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "rule-stealth",
    slug: "stealth",
    title: "Stealth",
    type: "rule",
    category: "Rules",
    subcategory: "Exploration",
    summary: "How to move unseen and attack from hiding.",
    content: `# Stealth

Moving silently and remaining unseen is key to survival.

## Hiding
To hide, make a Grace (stealth) check. Enemies must beat your successes with a Wit (perception) check to spot you.

## Requirements
- Must have cover or heavy obscurement
- Cannot hide from a creature that can see you clearly

## Stealth Attacks
Attacking from stealth:
- Attack has advantage
- Shadowblades can use Backstab ability
- After attacking, you're no longer hidden

## Moving Silently
Move at slow pace to remain hidden while moving.

## Passive Perception
Creatures have passive awareness = Wit score. Use this for general awareness without active searching.`,
    stats: {
      category: "exploration",
      complexity: "basic"
    },
    tags: ["exploration", "stealth", "sneaking", "perception"],
    relatedEntries: ["class-shadowblade", "ability-backstab", "rule-advantage"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // MAGIC RULES
  {
    id: "rule-magic",
    slug: "magic",
    title: "Magic",
    type: "rule",
    category: "Rules",
    subcategory: "Magic",
    summary: "How spellcasting works in SPARC.",
    content: `# Magic

Certain classes can wield magical power to affect the world.

## Spellcasting
To cast a spell:
1. Declare your spell and target
2. Roll your Wit in d6
3. Count successes
4. Compare to spell difficulty or target's defense

## Spell Types
- **Attack Spells:** Target defense, deal damage
- **Utility Spells:** Set difficulty, create effects
- **Healing Spells:** Restore HP to allies

## Components
Most spells require:
- **Verbal:** Speaking words of power
- **Somatic:** Hand gestures
- **Focus:** Staff, wand, or holy symbol

## Concentration
Some spells require concentration:
- Can only concentrate on one spell at a time
- Taking damage may break concentration (Heart check)

## Spell List
Spellcasters have access to spells appropriate to their class and level. Ask your Seer for options.`,
    stats: {
      category: "magic",
      complexity: "intermediate"
    },
    tags: ["magic", "spellcasting", "arcane", "divine"],
    relatedEntries: ["class-sage", "class-mystic", "ability-arcane-surge"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // SOCIAL RULES
  {
    id: "rule-social-encounters",
    slug: "social-encounters",
    title: "Social Encounters",
    type: "rule",
    category: "Rules",
    subcategory: "Social",
    summary: "How to handle negotiations and social interactions.",
    content: `# Social Encounters

Not every encounter is solved with swords. Sometimes words are mightier.

## Social Checks
Roll Heart for most social interactions:
- **Persuasion:** Convince someone to help
- **Intimidation:** Threaten or coerce
- **Deception:** Lie convincingly
- **Performance:** Entertain or distract

## NPC Attitudes
NPCs have starting attitudes:
- **Hostile:** Will actively oppose
- **Unfriendly:** Won't help, may hinder
- **Neutral:** Will help for fair compensation
- **Friendly:** Willing to help
- **Helpful:** Goes out of their way to assist

## Shifting Attitudes
Good roleplay and successful checks can shift attitudes one step. Critical success may shift two steps.

## Failure Consequences
Failed social checks may:
- End the conversation
- Make things worse
- Result in combat
- Close off options`,
    stats: {
      category: "social",
      complexity: "basic"
    },
    tags: ["social", "roleplay", "negotiation", "persuasion"],
    relatedEntries: ["class-herald", "rule-attributes"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  }
];
