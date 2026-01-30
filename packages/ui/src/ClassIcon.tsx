import * as React from "react";
import { cn } from "./lib/utils";

/**
 * SPARC Character Classes
 */
export type CharacterClass =
  | "warrior"
  | "wizard"
  | "rogue"
  | "cleric"
  | "necromancer"
  | "paladin"
  | "ranger";

/**
 * Class metadata with display names and descriptions
 */
export const CLASS_INFO: Record<CharacterClass, { name: string; description: string }> = {
  warrior: {
    name: "Warrior",
    description: "Masters of combat who rely on strength and martial prowess",
  },
  wizard: {
    name: "Wizard",
    description: "Arcane scholars who command powerful magical forces",
  },
  rogue: {
    name: "Rogue",
    description: "Stealthy operatives skilled in deception and precision strikes",
  },
  cleric: {
    name: "Cleric",
    description: "Divine servants who channel holy power to heal and protect",
  },
  necromancer: {
    name: "Necromancer",
    description: "Dark mages who command the powers of death and undeath",
  },
  paladin: {
    name: "Paladin",
    description: "Holy warriors who combine martial skill with divine magic",
  },
  ranger: {
    name: "Ranger",
    description: "Skilled hunters and trackers at home in the wilderness",
  },
};

/**
 * All available character classes
 */
export const CHARACTER_CLASSES: CharacterClass[] = [
  "warrior",
  "wizard",
  "rogue",
  "cleric",
  "necromancer",
  "paladin",
  "ranger",
];

export interface ClassIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The character class to display */
  characterClass: CharacterClass;
  /** 
   * Color variant - 'dark' uses white icons (for dark backgrounds),
   * 'light' uses black icons (for light backgrounds).
   * Defaults to 'dark' for SPARC's dark theme.
   */
  variant?: "dark" | "light";
  /** Size preset */
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

/**
 * ClassIcon component displays the icon for a character class.
 * Automatically selects light/dark variant based on the theme.
 * 
 * @example
 * ```tsx
 * <ClassIcon characterClass="warrior" size="lg" />
 * <ClassIcon characterClass="wizard" variant="light" />
 * ```
 */
export function ClassIcon({
  characterClass,
  variant = "dark",
  size = "md",
  className,
  alt,
  ...props
}: ClassIconProps) {
  const classInfo = CLASS_INFO[characterClass];
  
  // Path to the class icon
  // In production, these would be served from the public folder or CDN
  const iconPath = `/assets/classes/${variant}/${characterClass}.png`;
  
  return (
    <img
      src={iconPath}
      alt={alt || `${classInfo.name} class icon`}
      className={cn(SIZES[size], "object-contain", className)}
      {...props}
    />
  );
}

/**
 * Hook to get class information
 */
export function useClassInfo(characterClass: CharacterClass) {
  return CLASS_INFO[characterClass];
}
