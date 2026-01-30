// SPARC RPG Mobile Theme
// Adapted from PRD 19 Design System

export const colors = {
  // Primary - Arcane Purple
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // Backgrounds - Dark Theme
  background: {
    primary: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a2e',
    elevated: '#252538',
  },
  // Text
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a',
    inverse: '#0a0a0f',
  },
  // Status Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Game-specific
  game: {
    might: '#ef4444',
    grace: '#22c55e',
    wit: '#3b82f6',
    heart: '#f59e0b',
    hp: '#ef4444',
    gold: '#fbbf24',
    xp: '#a855f7',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  fontSizes,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
