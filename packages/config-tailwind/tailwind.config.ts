import type { Config } from "tailwindcss";

/**
 * SPARC RPG Design System - Tailwind Configuration
 * Based on PRD 19: Design System specifications
 * 
 * Visual Theme: Dark slate with blue accents - matching character cards
 */

const sparcColors = {
  // Primary brand colors - Blue/Slate palette (matching character cards)
  bronze: {
    DEFAULT: "#E67E22",  // Orange accent (stat dots, buttons)
    50: "#FEF5E7",
    100: "#FCE4C4",
    200: "#F9C98A",
    300: "#F5A94D",
    400: "#E67E22",
    500: "#D35400", // Primary
    600: "#A04000", // Dark/Hover
    700: "#7D3200",
    800: "#5A2400",
    900: "#371600",
  },
  gold: {
    DEFAULT: "#F39C12",
    light: "#F1C40F",
    dark: "#D68910",
  },
  amber: {
    DEFAULT: "#E67E22",
  },

  // Background colors - Dark slate theme (matching character cards)
  surface: {
    DEFAULT: "#1a1f2e",
    base: "#0d1117",     // Page background (dark slate)
    card: "#1a1f2e",     // Cards, panels
    elevated: "#252d3d", // Modals, dropdowns
    divider: "#3d4554",  // Borders, separators
  },
  
  // Blue accent colors (for panels, icons - matching character cards)
  sparc: {
    blue: "#2a5a8a",       // Icon background circles
    blueLight: "#3a7ab0",  // Hover states
    blueDark: "#1e3a5f",   // Ability panels
    panel: "#1e3a5f",      // Special ability boxes
  },

  // Text colors
  text: {
    primary: "#FFFFFF",
    secondary: "#B3B3B3",
    muted: "#808080",
    disabled: "#666666",
  },

  // Semantic colors
  success: {
    DEFAULT: "#4CAF50",
    light: "#81C784",
    dark: "#388E3C",
  },
  warning: {
    DEFAULT: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
  },
  error: {
    DEFAULT: "#F44336",
    light: "#E57373",
    dark: "#D32F2F",
  },
  info: {
    DEFAULT: "#2196F3",
    light: "#64B5F6",
    dark: "#1976D2",
  },

  // SPARC Attribute colors (STR, DEX, INT, CHA - Version E2)
  str: {
    DEFAULT: "#E53935",
    gradient: "linear-gradient(135deg, #E53935, #C62828)",
  },
  dex: {
    DEFAULT: "#43A047",
    gradient: "linear-gradient(135deg, #43A047, #2E7D32)",
  },
  int: {
    DEFAULT: "#1E88E5",
    gradient: "linear-gradient(135deg, #1E88E5, #1565C0)",
  },
  cha: {
    DEFAULT: "#AB47BC",
    gradient: "linear-gradient(135deg, #AB47BC, #7B1FA2)",
  },

  // Node type colors (Adventure Forge)
  node: {
    story: "#2196F3",
    decision: "#9C27B0",
    challenge: "#FFC107",
    combat: "#F44336",
    check: "#4CAF50",
  },
};

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors
        bronze: sparcColors.bronze,
        gold: sparcColors.gold,
        amber: sparcColors.amber,

        // Background system
        surface: sparcColors.surface,
        
        // Semantic colors
        success: sparcColors.success,
        warning: sparcColors.warning,
        error: sparcColors.error,
        info: sparcColors.info,

        // Attribute colors (STR, DEX, INT, CHA)
        str: sparcColors.str,
        dex: sparcColors.dex,
        int: sparcColors.int,
        cha: sparcColors.cha,

        // SPARC blue accent colors (matching character cards)
        sparc: sparcColors.sparc,

        // Node colors
        node: sparcColors.node,

        // Convenience aliases
        primary: sparcColors.bronze,
        background: sparcColors.surface.base,
        foreground: sparcColors.text.primary,
        muted: {
          DEFAULT: sparcColors.text.muted,
          foreground: sparcColors.text.secondary,
        },
        border: sparcColors.surface.divider,
        input: sparcColors.surface.divider,
        ring: sparcColors.bronze.DEFAULT,
        
        // Card component colors
        card: {
          DEFAULT: sparcColors.surface.card,
          foreground: sparcColors.text.primary,
        },
        
        // Popover/Modal colors
        popover: {
          DEFAULT: sparcColors.surface.elevated,
          foreground: sparcColors.text.primary,
        },

        // Destructive (for danger buttons)
        destructive: {
          DEFAULT: sparcColors.error.DEFAULT,
          foreground: "#FFFFFF",
        },

        // Accent
        accent: {
          DEFAULT: sparcColors.gold.DEFAULT,
          foreground: "#1A1A1A",
        },
      },

      fontFamily: {
        // Primary - Display/Headlines (Friz Quadrata - classic fantasy RPG font)
        display: ["var(--font-friz)", "Cinzel", "Times New Roman", "serif"],
        // Also use for headings
        heading: ["var(--font-friz)", "Cinzel", "serif"],
        // Secondary - Body text  
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        // Monospace - Code, dice results
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        // Fantasy/RPG font alias
        fantasy: ["var(--font-friz)", "Cinzel", "serif"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],    // 12px
        sm: ["0.875rem", { lineHeight: "1.5" }],   // 14px
        base: ["1rem", { lineHeight: "1.5" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.6" }],   // 18px
        xl: ["1.375rem", { lineHeight: "1.4" }],   // 22px
        "2xl": ["1.75rem", { lineHeight: "1.3" }], // 28px
        "3xl": ["2.25rem", { lineHeight: "1.2" }], // 36px
        "4xl": ["3rem", { lineHeight: "1.1" }],    // 48px
      },

      spacing: {
        // 4px grid system
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },

      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
        DEFAULT: "0 4px 6px rgba(0, 0, 0, 0.4)",
        md: "0 4px 6px rgba(0, 0, 0, 0.4)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(204, 122, 0, 0.3)",
        "glow-success": "0 0 24px rgba(76, 175, 80, 0.5)",
        "glow-error": "0 0 24px rgba(244, 67, 54, 0.5)",
        "glow-gold": "0 0 16px rgba(255, 179, 71, 0.5)",
      },

      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "dice-roll": "diceRoll 0.5s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        diceRoll: {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "25%": { transform: "rotate(90deg) scale(1.1)" },
          "50%": { transform: "rotate(180deg) scale(1)" },
          "75%": { transform: "rotate(270deg) scale(1.1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(204, 122, 0, 0)" },
          "50%": { boxShadow: "0 0 20px rgba(204, 122, 0, 0.4)" },
        },
      },

      transitionDuration: {
        instant: "50ms",
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      zIndex: {
        dropdown: "10",
        sticky: "20",
        modal: "50",
        toast: "60",
        tooltip: "70",
      },
    },
  },
  plugins: [],
};

export default config;
