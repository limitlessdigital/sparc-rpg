/**
 * Official SPARC Class Definitions - Version E2
 * Based on official character cards
 */

import type { SPARCClass, SPARCAttributes } from "@sparc/ui";

export interface ClassSpecialAbility {
  name: string;
  description: string;
  shortDescription: string;
}

export interface ClassDefinition {
  id: SPARCClass;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  lore: string;
  attributes: SPARCAttributes;
  hitPoints: number;
  specialAbility: ClassSpecialAbility;
  equipment: string[];
  playstyleHint: string;
  artworkUrl?: string;
}

export const CLASS_DEFINITIONS: Record<SPARCClass, ClassDefinition> = {
  warrior: {
    id: "warrior",
    name: "Warrior",
    icon: "/assets/classes/WARRIOR/WARRIOR-WHITE.png",
    tagline: "Lead the charge, dominate the battlefield",
    description: "A master of martial combat who excels at direct confrontation. Warriors overpower enemies through sheer strength and relentless attacks.",
    lore: "Warriors are forged in the crucible of battle. Whether trained in royal academies or hardened by years of mercenary work, these fighters have honed their bodies into weapons. They stand at the front lines where the fighting is fiercest.",
    attributes: { str: 3, dex: 2, int: 0, cha: 0 },
    hitPoints: 12,
    specialAbility: {
      name: "Flurry",
      description: "You make one additional attack roll on this turn.",
      shortDescription: "Extra attack this turn"
    },
    equipment: [
      "Longsword",
      "Chainmail Armor",
      "Shield",
      "Traveler's Pack"
    ],
    playstyleHint: "Perfect for players who want to be in the thick of combat dealing heavy damage"
  },
  wizard: {
    id: "wizard",
    name: "Wizard",
    icon: "/assets/classes/WIZARD/WIZARD-WHITE.png",
    tagline: "Unleash devastating arcane power",
    description: "A scholar who has mastered the arcane arts through rigorous study. Wizards wield devastating magical attacks against multiple foes.",
    lore: "In the great libraries and hidden archives of the world, Wizards spend lifetimes deciphering texts that would drive lesser minds to madness. Their spells are the fruits of rigorous research and iron will.",
    attributes: { str: 0, dex: 2, int: 3, cha: 0 },
    hitPoints: 7,
    specialAbility: {
      name: "Meteor Swarm",
      description: "Make an INT attack roll contested against the DEX rolls of up to four enemies. These meteors can also damage nearby objects.",
      shortDescription: "INT attack vs up to 4 enemies"
    },
    equipment: [
      "Grimoire of Spells",
      "Staff",
      "Robes",
      "Component Pouch"
    ],
    playstyleHint: "Perfect for players who want to deal massive area damage from range"
  },
  cleric: {
    id: "cleric",
    name: "Cleric",
    icon: "/assets/classes/CLERIC/CLERIC-WHITE.png",
    tagline: "Divine healing and holy power",
    description: "A devoted servant of the divine who channels sacred power to heal allies and smite the unholy. Clerics keep the party alive.",
    lore: "Clerics are the chosen of the gods, granted miraculous powers through faith and devotion. They serve as healers, protectors, and conduits of divine will in the mortal realm.",
    attributes: { str: 1, dex: 0, int: 3, cha: 1 },
    hitPoints: 9,
    specialAbility: {
      name: "Heal",
      description: "Roll a number of dice equal to your INT and restore HP to a friendly creature equal to the amount rolled. If your target is at 0 HP, you restore them to life and they recover the same amount of HP.",
      shortDescription: "Heal ally with INT dice, can revive"
    },
    equipment: [
      "Holy Symbol",
      "Mace",
      "Chain Shirt",
      "Healer's Kit"
    ],
    playstyleHint: "Perfect for players who want to support the party and keep everyone alive"
  },
  rogue: {
    id: "rogue",
    name: "Rogue",
    icon: "/assets/classes/ROGUE/ROGUE-WHITE.png",
    tagline: "Strike swiftly, vanish without a trace",
    description: "A deadly operative who excels at stealth and precision strikes. Rogues exploit weaknesses and deal devastating damage from the shadows.",
    lore: "Rogues move like whispers through the night, gathering intelligence and eliminating targets with surgical precision. Some serve noble causes; others follow only gold. All are to be feared.",
    attributes: { str: 0, dex: 3, int: 1, cha: 1 },
    hitPoints: 9,
    specialAbility: {
      name: "Backstab",
      description: "You make a Melee attack using your DEX dice. Your damage is the amount you rolled on dice that successfully hit the target.",
      shortDescription: "DEX melee attack, damage = successful hits"
    },
    equipment: [
      "Twin Daggers",
      "Leather Armor",
      "Thieves' Tools",
      "Dark Cloak"
    ],
    playstyleHint: "Perfect for players who prefer precision, stealth, and high single-target damage"
  },
  ranger: {
    id: "ranger",
    name: "Ranger",
    icon: "/assets/classes/RANGER/RANGER-WHITE.png",
    tagline: "Master of ranged combat and survival",
    description: "A skilled hunter and tracker who excels at ranged combat. Rangers can strike multiple enemies from a distance with deadly accuracy.",
    lore: "Rangers walk the wild places where civilization fears to tread. They are hunters, scouts, and protectors of the borderlands. Their arrows fly true, and their knowledge of the wilderness is unmatched.",
    attributes: { str: 1, dex: 3, int: 1, cha: 0 },
    hitPoints: 11,
    specialAbility: {
      name: "Multishot",
      description: "Make a single DEX ranged attack roll against up to four enemies.",
      shortDescription: "DEX ranged attack vs up to 4 enemies"
    },
    equipment: [
      "Longbow",
      "Quiver of Arrows",
      "Hunting Knife",
      "Leather Armor",
      "Survival Kit"
    ],
    playstyleHint: "Perfect for players who want to deal damage to multiple enemies from range"
  },
  paladin: {
    id: "paladin",
    name: "Paladin",
    icon: "/assets/classes/PALADIN/PALADIN-WHITE.png",
    tagline: "Holy warrior and stalwart defender",
    description: "A blessed warrior who combines martial prowess with divine protection. Paladins defend their allies with sacred shields.",
    lore: "Paladins are holy warriors, sworn to sacred oaths and blessed by divine powers. They stand as beacons of hope, their faith manifesting as protective magic that guards the innocent.",
    attributes: { str: 3, dex: 0, int: 1, cha: 1 },
    hitPoints: 12,
    specialAbility: {
      name: "Divine Shield",
      description: "You or a friendly target roll 2 additional dice on a defensive roll. You must declare you are using this special ability before any damage is resolved.",
      shortDescription: "+2 dice on defensive roll for you or ally"
    },
    equipment: [
      "Holy Sword",
      "Tower Shield",
      "Plate Armor",
      "Holy Symbol"
    ],
    playstyleHint: "Perfect for players who want to protect allies while dealing solid damage"
  },
  necromancer: {
    id: "necromancer",
    name: "Necromancer",
    icon: "/assets/classes/NECROMANCER/NECROMANCER-WHITE.png",
    tagline: "Command the forces of death itself",
    description: "A dark spellcaster who manipulates life force. Necromancers drain enemies to heal themselves and allies.",
    lore: "Necromancers delve into forbidden knowledge, learning to manipulate the boundary between life and death. Their magic is feared and misunderstood, but in the right hands, it can sustain life as easily as end it.",
    attributes: { str: 0, dex: 1, int: 3, cha: 1 },
    hitPoints: 7,
    specialAbility: {
      name: "Transfer Life",
      description: "After dealing damage from an INT spell attack, you can restore HP equal to the damage dealt to yourself or an ally.",
      shortDescription: "Heal self or ally equal to spell damage dealt"
    },
    equipment: [
      "Skull Focus",
      "Ritual Dagger",
      "Dark Robes",
      "Book of Shadows"
    ],
    playstyleHint: "Perfect for players who want to deal damage while sustaining the party"
  }
};

// Fantasy name components for name suggestions
export const NAME_COMPONENTS = {
  prefixes: [
    "Thorn", "Shadow", "Storm", "Bright", "Iron", "Silver", "Dark", "Swift",
    "Ember", "Frost", "Ash", "Dawn", "Dusk", "Moon", "Star", "Blade",
    "Stone", "Raven", "Wolf", "Fire", "Ice", "Thunder", "Wind", "Night"
  ],
  suffixes: [
    "blade", "heart", "wind", "fire", "stone", "song", "strike", "watch",
    "walker", "bane", "born", "sworn", "ward", "fall", "forge", "blood",
    "weaver", "caller", "singer", "keeper", "breaker", "binder", "rider"
  ],
  standalone: [
    "Aldric", "Lyra", "Kael", "Mira", "Theron", "Sage", "Quinn", "Rowan",
    "Cassian", "Freya", "Gareth", "Helena", "Isolde", "Jasper", "Kira",
    "Lucian", "Nadia", "Orion", "Petra", "Rhys", "Selene", "Tobias",
    "Una", "Vex", "Wren", "Xander", "Yara", "Zephyr", "Aric", "Brynn",
    "Cora", "Drake", "Eira", "Finn", "Gwen", "Hale", "Ivy", "Jace"
  ]
};

/**
 * Generate random fantasy names
 */
export function generateNameSuggestions(count: number = 5): string[] {
  const names: string[] = [];
  const used = new Set<string>();
  
  while (names.length < count) {
    let name: string;
    const type = Math.random();
    
    if (type < 0.4) {
      name = NAME_COMPONENTS.standalone[
        Math.floor(Math.random() * NAME_COMPONENTS.standalone.length)
      ];
    } else if (type < 0.7) {
      const prefix = NAME_COMPONENTS.prefixes[
        Math.floor(Math.random() * NAME_COMPONENTS.prefixes.length)
      ];
      const suffix = NAME_COMPONENTS.suffixes[
        Math.floor(Math.random() * NAME_COMPONENTS.suffixes.length)
      ];
      name = prefix + suffix;
    } else {
      const first = NAME_COMPONENTS.standalone[
        Math.floor(Math.random() * NAME_COMPONENTS.standalone.length)
      ];
      const second = NAME_COMPONENTS.prefixes[
        Math.floor(Math.random() * NAME_COMPONENTS.prefixes.length)
      ];
      name = `${first} ${second}`;
    }
    
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      names.push(name);
    }
  }
  
  return names;
}

/**
 * Validate character name per PRD rules
 */
export function validateCharacterName(name: string): { 
  valid: boolean; 
  error?: string;
} {
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: "Name cannot exceed 50 characters" };
  }
  
  const pattern = /^[a-zA-Z][a-zA-Z\s'-]*$/;
  if (!pattern.test(trimmed)) {
    return { 
      valid: false, 
      error: "Name can only contain letters, spaces, hyphens, and apostrophes" 
    };
  }
  
  return { valid: true };
}

/**
 * Format name (auto-capitalize)
 */
export function formatCharacterName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
