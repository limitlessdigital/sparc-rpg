# PRD 19: Design System

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 5 days  
> **Dependencies**: None (foundational)

---

## Overview

The SPARC RPG Design System defines the visual language, component library, and interaction patterns used throughout the application. Based on the SPARC brand guidelines, it creates a cohesive fantasy RPG aesthetic while maintaining accessibility and usability.

### Goals
- Establish consistent visual language across all screens
- Provide reusable component library
- Ensure accessibility (WCAG 2.1 AA compliance)
- Enable rapid UI development with design tokens

### Non-Goals
- Theming/customization (single theme for v1)
- Design tool integration (Figma sync)
- Animated illustrations (static assets only)

---

## Brand Identity

### Visual Theme
SPARC evokes a **warm, inviting fantasy world** with:
- Rich earth tones and metallic accents
- Parchment and leather textures
- Celtic/medieval-inspired ornamental elements
- Warm lighting with amber glows

### Design Philosophy
- **Approachable**: Gateway RPG, not intimidating
- **Warm**: Cozy tavern, not dark dungeon
- **Clear**: Information hierarchy above decoration
- **Responsive**: Touch-first, works everywhere

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Bronze Primary** | `#CC7A00` | 204, 122, 0 | Primary actions, links |
| **Bronze Dark** | `#8B4513` | 139, 69, 19 | Hover states, emphasis |
| **Gold Accent** | `#FFB347` | 255, 179, 71 | Highlights, success |
| **Amber Glow** | `#FFA500` | 255, 165, 0 | Active states |

### Background Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Dark Base** | `#121212` | 18, 18, 18 | Page background |
| **Card Surface** | `#1E1E1E` | 30, 30, 30 | Cards, panels |
| **Elevated Surface** | `#2A2A2A` | 42, 42, 42 | Modals, dropdowns |
| **Divider** | `#3A3A3A` | 58, 58, 58 | Borders, separators |

### Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Text Primary** | `#FFFFFF` | 255, 255, 255 | Headlines, emphasis |
| **Text Secondary** | `#B3B3B3` | 179, 179, 179 | Body text |
| **Text Muted** | `#808080` | 128, 128, 128 | Captions, hints |
| **Text Disabled** | `#666666` | 102, 102, 102 | Disabled states |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#4CAF50` | Successful rolls, completion |
| **Warning** | `#FF9800` | Warnings, attention needed |
| **Error** | `#F44336` | Failures, errors |
| **Info** | `#2196F3` | Information, tips |

### Attribute Colors

| Attribute | Hex | Gradient |
|-----------|-----|----------|
| **Might (STR)** | `#E53935` | `linear-gradient(135deg, #E53935, #C62828)` |
| **Grace (DEX)** | `#43A047` | `linear-gradient(135deg, #43A047, #2E7D32)` |
| **Wit (INT)** | `#1E88E5` | `linear-gradient(135deg, #1E88E5, #1565C0)` |
| **Heart (CHA)** | `#AB47BC` | `linear-gradient(135deg, #AB47BC, #7B1FA2)` |

### Node Type Colors (Adventure Forge)

| Node Type | Hex | Usage |
|-----------|-----|-------|
| **Story** | `#2196F3` | Narrative nodes |
| **Decision** | `#9C27B0` | Choice nodes |
| **Challenge** | `#FFC107` | Skill check nodes |
| **Combat** | `#F44336` | Encounter nodes |
| **Check** | `#4CAF50` | Pass/fail nodes |

---

## Typography

### Font Stack

```css
/* Primary font - Display/Headlines */
--font-display: 'Cinzel', 'Times New Roman', serif;

/* Secondary font - Body text */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Code, dice results */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 48px / 3rem | 700 | 1.1 | Hero sections |
| **H1** | 36px / 2.25rem | 700 | 1.2 | Page titles |
| **H2** | 28px / 1.75rem | 600 | 1.3 | Section headers |
| **H3** | 22px / 1.375rem | 600 | 1.4 | Subsections |
| **H4** | 18px / 1.125rem | 600 | 1.4 | Card titles |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | Lead paragraphs |
| **Body** | 16px / 1rem | 400 | 1.5 | Default text |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | Secondary text |
| **Caption** | 12px / 0.75rem | 400 | 1.4 | Labels, hints |

### Typography Tokens

```css
:root {
  /* Font families */
  --font-display: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.375rem;   /* 22px */
  --text-2xl: 1.75rem;   /* 28px */
  --text-3xl: 2.25rem;   /* 36px */
  --text-4xl: 3rem;      /* 48px */

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
}
```

---

## Spacing Scale

Based on 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 | Reset |
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Icon gaps |
| `--space-3` | 12px | Small gaps |
| `--space-4` | 16px | Default padding |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large gaps |
| `--space-10` | 40px | XL gaps |
| `--space-12` | 48px | Section padding |
| `--space-16` | 64px | Page sections |

---

## Responsive Breakpoints

```css
:root {
  /* Mobile-first breakpoints */
  --breakpoint-sm: 640px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large screens */
}

/* Tailwind classes */
/* sm:  @media (min-width: 640px) */
/* md:  @media (min-width: 768px) */
/* lg:  @media (min-width: 1024px) */
/* xl:  @media (min-width: 1280px) */
/* 2xl: @media (min-width: 1536px) */
```

### Responsive Patterns

| Screen | Behavior |
|--------|----------|
| **Mobile (< 640px)** | Single column, bottom nav, full-width cards |
| **Tablet (640-1024px)** | 2-column grids, side drawer nav |
| **Desktop (> 1024px)** | Multi-column, sidebar nav, hover states |

---

## Component Library

### Buttons

```tsx
// Button variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Danger Action</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Button states
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

#### Button Styles

```css
.btn {
  /* Base */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: var(--font-semibold);
  border-radius: 8px;
  transition: all 150ms ease;
  cursor: pointer;

  /* Sizes */
  &.btn-sm { padding: 8px 16px; font-size: 14px; }
  &.btn-md { padding: 12px 24px; font-size: 16px; }
  &.btn-lg { padding: 16px 32px; font-size: 18px; }
}

.btn-primary {
  background: linear-gradient(135deg, #CC7A00, #8B4513);
  color: white;
  border: none;

  &:hover { filter: brightness(1.1); }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-secondary {
  background: transparent;
  color: var(--color-bronze);
  border: 2px solid var(--color-bronze);

  &:hover { background: rgba(204, 122, 0, 0.1); }
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;

  &:hover { color: var(--color-text-primary); }
}
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Character Name</CardTitle>
    <CardDescription>Level 1 Warrior</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Card Styles

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-divider);
}

.card-content {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-divider);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

### Form Inputs

```tsx
<Input label="Character Name" placeholder="Enter name..." />
<Input label="Email" type="email" error="Invalid email" />
<Select label="Class" options={classes} />
<Textarea label="Background" rows={4} />
<Checkbox label="Remember me" />
<Radio label="Option A" name="choice" value="a" />
```

#### Input Styles

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: var(--text-base);
  transition: border-color 150ms ease;

  &::placeholder { color: var(--color-text-muted); }
  &:focus { 
    outline: none;
    border-color: var(--color-bronze);
    box-shadow: 0 0 0 3px rgba(204, 122, 0, 0.1);
  }
  &:disabled { 
    opacity: 0.5;
    cursor: not-allowed;
  }
  &.error { border-color: var(--color-error); }
}

.label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.error-text {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-error);
}
```

### Modals

```tsx
<Modal open={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Confirm Action</ModalTitle>
    <ModalClose />
  </ModalHeader>
  <ModalBody>
    Are you sure you want to proceed?
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

#### Modal Styles

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
}

.modal {
  background: var(--color-elevated);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-divider);
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-divider);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

### Dice Components

```tsx
<Die value={6} size="lg" rolling={false} />
<DicePool dice={[4, 2, 6, 1]} difficulty={12} />
<DiceRollResult 
  dice={[6, 4, 3]} 
  total={13} 
  difficulty={10} 
  success={true}
/>
```

#### Dice Styles

```css
.die {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2A2A2A, #1E1E1E);
  border: 2px solid var(--color-bronze);
  border-radius: 8px;
  color: var(--color-gold);
  font-family: var(--font-mono);
  font-weight: var(--font-bold);

  /* Sizes */
  &.die-sm { width: 32px; height: 32px; font-size: 16px; }
  &.die-md { width: 48px; height: 48px; font-size: 24px; }
  &.die-lg { width: 64px; height: 64px; font-size: 32px; }

  /* States */
  &.rolling {
    animation: roll 0.5s ease-in-out infinite;
  }
  &.critical { 
    border-color: var(--color-gold);
    box-shadow: 0 0 16px var(--color-gold);
  }
}

@keyframes roll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}
```

### Avatar

```tsx
<Avatar src={user.avatarUrl} alt={user.name} size="md" />
<Avatar fallback="JD" size="lg" />
<AvatarGroup users={players} max={4} />
```

### Badge

```tsx
<Badge>Player</Badge>
<Badge variant="success">Online</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="attribute" attribute="might">Might +2</Badge>
```

### Tooltip

```tsx
<Tooltip content="Click to roll dice">
  <Button>Roll</Button>
</Tooltip>
```

---

## Animation & Motion

### Timing Functions

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Duration Scale

```css
:root {
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### Animation Patterns

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}
```

#### Slide Up
```css
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(16px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

#### Scale In
```css
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.9);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn var(--duration-fast) var(--ease-out);
}
```

#### Dice Roll
```css
@keyframes diceRoll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

.dice-rolling {
  animation: diceRoll 0.5s ease-in-out infinite;
}
```

#### Success/Failure Flash
```css
@keyframes successFlash {
  0%, 100% { box-shadow: 0 0 0 rgba(76, 175, 80, 0); }
  50% { box-shadow: 0 0 24px rgba(76, 175, 80, 0.5); }
}

@keyframes failureFlash {
  0%, 100% { box-shadow: 0 0 0 rgba(244, 67, 54, 0); }
  50% { box-shadow: 0 0 24px rgba(244, 67, 54, 0.5); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

### Icon System

Using **Lucide React** icons for consistency:

```tsx
import { 
  Sword,      // Combat
  Shield,     // Defense
  Heart,      // Health
  Sparkles,   // Magic
  Dice6,      // Dice rolling
  Users,      // Party
  Map,        // Adventure
  Settings,   // Configuration
} from 'lucide-react';

<Sword className="icon-md text-bronze" />
```

### Icon Sizes

```css
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }
```

### Custom Icons

For SPARC-specific elements, use custom SVG icons:
- Attribute symbols (Might, Grace, Wit, Heart)
- Class icons (Warrior, Wizard, Rogue, etc.)
- D6 dice variants
- SPARC logo mark

---

## UI Patterns

### Navigation

#### Desktop Sidebar
```
┌────────────────────────────────────────────────┐
│ [SPARC Logo]                                   │
├────────────────────────────────────────────────┤
│ ⚔️  Dashboard                                  │
│ 👤  Characters                                 │
│ 🎲  Sessions                                   │
│ 📖  Adventures                                 │
├────────────────────────────────────────────────┤
│ [User Avatar]                                  │
│ Username                                       │
│ ⚙️  Settings                                   │
└────────────────────────────────────────────────┘
```

#### Mobile Bottom Nav
```
┌──────────────────────────────────┐
│          [Page Content]          │
├────┬────┬────┬────┬────┬────────┤
│ 🏠 │ 👤 │ 🎲 │ 📖 │ ⚙️ │        │
└────┴────┴────┴────┴────┴────────┘
```

### Empty States

```tsx
<EmptyState
  icon={<Dice6 />}
  title="No sessions yet"
  description="Create your first session to start playing"
  action={<Button>Create Session</Button>}
/>
```

### Loading States

```tsx
<Skeleton width="100%" height={200} />
<Spinner size="lg" />
<LoadingDots />
```

### Error States

```tsx
<ErrorState
  icon={<AlertTriangle />}
  title="Something went wrong"
  description="We couldn't load your characters"
  action={<Button onClick={retry}>Try Again</Button>}
/>
```

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors - Primary */
  --color-bronze: #CC7A00;
  --color-bronze-dark: #8B4513;
  --color-gold: #FFB347;
  --color-amber: #FFA500;

  /* Colors - Background */
  --color-bg: #121212;
  --color-surface: #1E1E1E;
  --color-elevated: #2A2A2A;
  --color-divider: #3A3A3A;

  /* Colors - Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B3B3B3;
  --color-text-muted: #808080;
  --color-text-disabled: #666666;

  /* Colors - Semantic */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;

  /* Colors - Attributes */
  --color-might: #E53935;
  --color-grace: #43A047;
  --color-wit: #1E88E5;
  --color-heart: #AB47BC;

  /* Typography */
  --font-display: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(204, 122, 0, 0.3);

  /* Z-Index */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal: 50;
  --z-toast: 60;
  --z-tooltip: 70;
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bronze: {
          DEFAULT: '#CC7A00',
          dark: '#8B4513',
        },
        gold: '#FFB347',
        amber: '#FFA500',
        surface: '#1E1E1E',
        elevated: '#2A2A2A',
        divider: '#3A3A3A',
        might: '#E53935',
        grace: '#43A047',
        wit: '#1E88E5',
        heart: '#AB47BC',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
```

---

## Accessibility

### Color Contrast

All text meets WCAG 2.1 AA requirements:
- Primary text (#FFFFFF) on surface (#1E1E1E): 13.9:1 ✓
- Secondary text (#B3B3B3) on surface (#1E1E1E): 8.5:1 ✓
- Bronze (#CC7A00) on dark (#121212): 5.2:1 ✓

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-bronze);
  outline-offset: 2px;
}
```

### Screen Reader Support

- All images have alt text
- Interactive elements have aria-labels
- Dice results announced via aria-live regions
- Form errors linked via aria-describedby

### Keyboard Navigation

- All interactive elements focusable
- Tab order follows visual order
- Escape closes modals/dropdowns
- Enter/Space activates buttons

---

## Implementation Checklist

### P0 - Must Have
- [ ] Design tokens defined in CSS variables
- [ ] Tailwind configuration complete
- [ ] Button component with all variants
- [ ] Card component
- [ ] Input/Form components
- [ ] Modal component
- [ ] Basic responsive layouts

### P1 - Should Have
- [ ] Dice components styled
- [ ] Animation system implemented
- [ ] Empty/loading/error states
- [ ] Full icon set integrated
- [ ] Attribute color system

### P2 - Nice to Have
- [ ] Custom SPARC icons
- [ ] Texture overlays
- [ ] Advanced animations
- [ ] Component documentation (Storybook)

---

## Dependencies

### Upstream
- Brand guidelines (Sparc-StyleGuide 2.pdf)
- UI mockups (Sparc UI comps.pdf)

### Downstream
- All UI PRDs reference this design system
- Component implementations follow these specs

---

## Appendix

### Font Loading

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Asset References

- Logo: `/assets/sparc-logo.png`
- Style guide: `/docs/Sparc-StyleGuide 2.pdf`
- UI mockups: `/docs/Sparc UI comps.pdf`
- Extracted assets: `/assets/ui-comps/`, `/assets/ui-pages/`

---

# Standard Dashboard UX Patterns

> The following sections define standard user dashboard UX best practices—the foundational features every great app needs regardless of domain. These patterns ensure SPARC RPG feels polished and professional.

---

## User Account & Profile

### Profile Management

Users need a central place to manage their identity across the platform.

#### Profile Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| **Avatar** | Image | No | Max 5MB, JPG/PNG/GIF, 1:1 ratio |
| **Display Name** | Text | Yes | 2-32 chars, no special chars |
| **Username** | Text | Yes | 3-20 chars, alphanumeric + underscore |
| **Bio** | Textarea | No | Max 500 chars |
| **Pronouns** | Select | No | Predefined options + custom |
| **Location** | Text | No | Max 100 chars, optional |

#### Avatar Component

```tsx
<AvatarUpload
  currentAvatar={user.avatarUrl}
  onUpload={handleAvatarUpload}
  onRemove={handleAvatarRemove}
  maxSizeMB={5}
  allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
/>

// Avatar with fallback
<Avatar 
  src={user.avatarUrl}
  fallback={getInitials(user.displayName)}
  size="lg"
  status="online" // optional presence indicator
/>
```

#### Avatar Styles

```css
.avatar-upload {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  
  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 3px solid var(--color-surface);
  
  &.online { background: var(--color-success); }
  &.away { background: var(--color-warning); }
  &.offline { background: var(--color-text-muted); }
}
```

### Account Settings

```tsx
<SettingsSection title="Account">
  <SettingsRow 
    label="Email" 
    value={user.email}
    action={<Button variant="ghost" size="sm">Change</Button>}
  />
  <SettingsRow 
    label="Password" 
    value="••••••••••"
    action={<Button variant="ghost" size="sm">Update</Button>}
  />
  <SettingsRow 
    label="Linked Accounts"
    value={linkedAccounts.map(a => a.provider).join(', ')}
    action={<Button variant="ghost" size="sm">Manage</Button>}
  />
</SettingsSection>
```

#### Linked Accounts

| Provider | Icon | Color |
|----------|------|-------|
| Google | `<GoogleIcon />` | `#4285F4` |
| Discord | `<DiscordIcon />` | `#5865F2` |
| Apple | `<AppleIcon />` | `#000000` (light mode) / `#FFFFFF` (dark mode) |

```tsx
<LinkedAccountsList>
  <LinkedAccount 
    provider="google"
    email="user@gmail.com"
    connected={true}
    onDisconnect={handleDisconnect}
  />
  <LinkedAccount 
    provider="discord"
    connected={false}
    onConnect={handleConnect}
  />
</LinkedAccountsList>
```

### Privacy Settings

```tsx
<SettingsSection title="Privacy">
  <ToggleSetting
    label="Show Online Status"
    description="Let others see when you're active"
    value={settings.showOnlineStatus}
    onChange={handleToggle('showOnlineStatus')}
  />
  <ToggleSetting
    label="Public Profile"
    description="Allow anyone to view your profile and characters"
    value={settings.publicProfile}
    onChange={handleToggle('publicProfile')}
  />
  <ToggleSetting
    label="Allow Friend Requests"
    description="Receive friend requests from other players"
    value={settings.allowFriendRequests}
    onChange={handleToggle('allowFriendRequests')}
  />
  <SelectSetting
    label="Who Can Invite Me"
    options={['Anyone', 'Friends Only', 'Nobody']}
    value={settings.invitePermission}
    onChange={handleSelect('invitePermission')}
  />
</SettingsSection>
```

### Notification Preferences

```tsx
<SettingsSection title="Notifications">
  <SettingsSubsection title="Email Notifications">
    <ToggleSetting label="Session Invitations" value={true} />
    <ToggleSetting label="Session Reminders" value={true} />
    <ToggleSetting label="Friend Requests" value={true} />
    <ToggleSetting label="Marketing & Updates" value={false} />
  </SettingsSubsection>
  
  <SettingsSubsection title="Push Notifications">
    <ToggleSetting label="Session Starting Soon" value={true} />
    <ToggleSetting label="Your Turn in Combat" value={true} />
    <ToggleSetting label="Direct Messages" value={true} />
  </SettingsSubsection>
  
  <SettingsSubsection title="In-App Notifications">
    <ToggleSetting label="All Activity" value={true} />
    <SelectSetting 
      label="Sound" 
      options={['Default', 'Subtle', 'Off']} 
      value="Default"
    />
  </SettingsSubsection>
</SettingsSection>
```

---

## Navigation & Layout

### Responsive Layout System

```
Desktop (≥1024px)
┌────────┬─────────────────────────────────────────────────┐
│        │  Header (breadcrumbs, search, user menu)       │
│  Side  ├─────────────────────────────────────────────────┤
│  bar   │                                                 │
│  Nav   │               Main Content Area                 │
│        │                                                 │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘

Tablet (768px - 1023px)
┌─────────────────────────────────────────────────────────┐
│  ☰  │  Header (logo, search, user menu)                │
├─────┴───────────────────────────────────────────────────┤
│                                                         │
│                 Main Content Area                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
      ↓ (hamburger opens drawer)

Mobile (<768px)
┌─────────────────────────────────────────────────────────┐
│  Header (logo, notifications, user avatar)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 Main Content Area                       │
│                                                         │
├────┬────┬────┬────┬────────────────────────────────────┤
│ 🏠 │ 👤 │ 🎲 │ 📖 │              ⚙️                    │
└────┴────┴────┴────┴────────────────────────────────────┘
```

### Sidebar Navigation (Desktop)

```tsx
<Sidebar collapsed={isCollapsed}>
  <SidebarHeader>
    <Logo size={isCollapsed ? 'icon' : 'full'} />
  </SidebarHeader>
  
  <SidebarNav>
    <NavItem icon={<Home />} label="Dashboard" href="/" active />
    <NavItem icon={<Users />} label="Characters" href="/characters" badge={3} />
    <NavItem icon={<Dice6 />} label="Sessions" href="/sessions" />
    <NavItem icon={<BookOpen />} label="Adventures" href="/adventures" />
    
    <NavDivider />
    <NavLabel>Tools</NavLabel>
    
    <NavItem icon={<Sparkles />} label="Adventure Forge" href="/forge" />
    <NavItem icon={<Map />} label="World Builder" href="/world" />
  </SidebarNav>
  
  <SidebarFooter>
    <UserMenu user={currentUser} />
    <CollapseButton onClick={toggleCollapse} />
  </SidebarFooter>
</Sidebar>
```

#### Sidebar Styles

```css
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-divider);
  transition: width var(--duration-normal) var(--ease-default);
  
  &.collapsed {
    width: 72px;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  margin: var(--space-1) var(--space-2);
  transition: all var(--duration-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-primary);
  }
  
  &.active {
    background: rgba(204, 122, 0, 0.15);
    color: var(--color-bronze);
  }
}

.nav-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-bronze);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Mobile Bottom Navigation

```tsx
<BottomNav>
  <BottomNavItem 
    icon={<Home />} 
    label="Home" 
    href="/" 
    active={pathname === '/'} 
  />
  <BottomNavItem 
    icon={<Users />} 
    label="Characters" 
    href="/characters" 
    badge={3}
  />
  <BottomNavItem 
    icon={<Dice6 />} 
    label="Play" 
    href="/play" 
    featured // center action button
  />
  <BottomNavItem 
    icon={<BookOpen />} 
    label="Adventures" 
    href="/adventures" 
  />
  <BottomNavItem 
    icon={<User />} 
    label="Profile" 
    href="/profile" 
  />
</BottomNav>
```

#### Bottom Nav Styles

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: var(--z-sticky);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  color: var(--color-text-muted);
  
  &.active {
    color: var(--color-bronze);
  }
  
  &.featured {
    position: relative;
    top: -12px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--color-bronze), var(--color-bronze-dark));
    border-radius: var(--radius-full);
    color: white;
    box-shadow: var(--shadow-lg);
  }
}
```

### Breadcrumbs

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/adventures">Adventures</BreadcrumbItem>
  <BreadcrumbItem href="/adventures/what-lies-beneath">What Lies Beneath</BreadcrumbItem>
  <BreadcrumbItem current>Chapter 1</BreadcrumbItem>
</Breadcrumbs>
```

#### Breadcrumb Styles

```css
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.breadcrumb-item {
  color: var(--color-text-muted);
  
  &:hover:not(.current) {
    color: var(--color-bronze);
  }
  
  &.current {
    color: var(--color-text-primary);
    font-weight: var(--font-medium);
  }
}

.breadcrumb-separator {
  color: var(--color-text-muted);
  opacity: 0.5;
}
```

### Tab Navigation

```tsx
<Tabs value={activeTab} onChange={setActiveTab}>
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="characters">Characters (4)</Tab>
    <Tab value="sessions">Sessions</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
  
  <TabPanel value="overview">
    {/* Overview content */}
  </TabPanel>
  <TabPanel value="characters">
    {/* Characters content */}
  </TabPanel>
</Tabs>
```

#### Tab Styles

```css
.tab-list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-divider);
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar { display: none; }
}

.tab {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all var(--duration-fast);
  
  &:hover {
    color: var(--color-text-primary);
  }
  
  &[data-state="active"] {
    color: var(--color-bronze);
    border-bottom-color: var(--color-bronze);
  }
}
```

### Search Patterns

#### Global Search (Command Palette)

```tsx
<CommandPalette 
  open={isOpen} 
  onOpenChange={setIsOpen}
  placeholder="Search characters, adventures, sessions..."
>
  <CommandGroup heading="Recent">
    <CommandItem icon={<Clock />}>Brave Sir Robbin (Character)</CommandItem>
    <CommandItem icon={<Clock />}>What Lies Beneath (Adventure)</CommandItem>
  </CommandGroup>
  
  <CommandGroup heading="Characters">
    {searchResults.characters.map(char => (
      <CommandItem 
        key={char.id}
        icon={<User />}
        onSelect={() => navigate(`/characters/${char.id}`)}
      >
        {char.name}
      </CommandItem>
    ))}
  </CommandGroup>
  
  <CommandGroup heading="Actions">
    <CommandItem icon={<Plus />}>Create New Character</CommandItem>
    <CommandItem icon={<Dice6 />}>Start Quick Session</CommandItem>
    <CommandItem icon={<Settings />}>Open Settings</CommandItem>
  </CommandGroup>
</CommandPalette>
```

#### Search Input

```tsx
<SearchInput
  placeholder="Search..."
  value={query}
  onChange={setQuery}
  onClear={() => setQuery('')}
  shortcut="⌘K" // shows keyboard shortcut hint
/>
```

#### Search Styles

```css
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: var(--space-10); /* space for icon */
  padding-right: var(--space-12); /* space for shortcut hint */
  background: var(--color-elevated);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  
  &:focus {
    border-color: var(--color-bronze);
    box-shadow: 0 0 0 3px rgba(204, 122, 0, 0.1);
  }
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
}

.search-shortcut {
  position: absolute;
  right: var(--space-3);
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

---

## Notification System

### In-App Notifications Architecture

```
Notification Types:
├── Transient (Toasts)
│   ├── Success: Action completed
│   ├── Error: Action failed
│   ├── Warning: Attention needed
│   └── Info: General information
│
├── Persistent (Notification Center)
│   ├── Session Invitations
│   ├── Friend Requests
│   ├── Character Updates
│   ├── Adventure Alerts
│   └── System Announcements
│
└── Interactive (Action Required)
    ├── Join Session
    ├── Accept Invitation
    └── Respond to Request
```

### Toast/Snackbar Component

```tsx
// Usage via hook
const { toast } = useToast();

// Success toast
toast.success('Character saved successfully!');

// Error toast with action
toast.error('Failed to save character', {
  action: { label: 'Retry', onClick: handleRetry }
});

// Custom toast
toast({
  title: 'Session starting in 5 minutes',
  description: 'What Lies Beneath with @GameMaster',
  icon: <Dice6 />,
  duration: 10000,
  action: { label: 'Join Now', onClick: joinSession }
});
```

#### Toast Component

```tsx
<Toast variant="success">
  <ToastIcon />
  <ToastContent>
    <ToastTitle>Character Created!</ToastTitle>
    <ToastDescription>Brave Sir Robbin is ready for adventure</ToastDescription>
  </ToastContent>
  <ToastAction altText="View character">View</ToastAction>
  <ToastClose />
</Toast>
```

#### Toast Styles

```css
.toast-viewport {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 420px;
  z-index: var(--z-toast);
  
  /* Mobile: full width at bottom */
  @media (max-width: 640px) {
    bottom: calc(64px + var(--space-4)); /* above bottom nav */
    left: var(--space-4);
    right: var(--space-4);
    max-width: none;
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-elevated);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slideIn var(--duration-normal) var(--ease-out);
  
  &.success { border-left: 4px solid var(--color-success); }
  &.error { border-left: 4px solid var(--color-error); }
  &.warning { border-left: 4px solid var(--color-warning); }
  &.info { border-left: 4px solid var(--color-info); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Notification Center

```tsx
<NotificationCenter>
  <NotificationTrigger>
    <Button variant="ghost" size="icon">
      <Bell />
      {unreadCount > 0 && (
        <NotificationBadge count={unreadCount} />
      )}
    </Button>
  </NotificationTrigger>
  
  <NotificationPanel>
    <NotificationHeader>
      <h3>Notifications</h3>
      <Button variant="ghost" size="sm" onClick={markAllRead}>
        Mark all read
      </Button>
    </NotificationHeader>
    
    <NotificationTabs>
      <Tab value="all">All</Tab>
      <Tab value="unread">Unread ({unreadCount})</Tab>
    </NotificationTabs>
    
    <NotificationList>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          icon={getNotificationIcon(notification.type)}
          title={notification.title}
          description={notification.description}
          timestamp={notification.createdAt}
          read={notification.read}
          action={notification.action}
          onDismiss={() => dismiss(notification.id)}
        />
      ))}
    </NotificationList>
    
    {notifications.length === 0 && (
      <EmptyState
        icon={<BellOff />}
        title="All caught up!"
        description="No new notifications"
      />
    )}
  </NotificationPanel>
</NotificationCenter>
```

#### Notification Item Styles

```css
.notification-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  cursor: pointer;
  transition: background var(--duration-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  
  &.unread {
    background: rgba(204, 122, 0, 0.05);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--color-bronze);
    }
  }
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-error);
  color: white;
  font-size: 11px;
  font-weight: var(--font-bold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Unread Indicators

| Context | Indicator Style |
|---------|-----------------|
| **Icon badge** | Red dot or count (top-right) |
| **List item** | Bronze left border + subtle background |
| **Tab badge** | Count in parentheses or pill |
| **Nav item** | Dot indicator or count badge |

---

## Settings & Preferences

### Theme Toggle

```tsx
<ThemeToggle>
  <ToggleOption value="light" icon={<Sun />}>Light</ToggleOption>
  <ToggleOption value="dark" icon={<Moon />}>Dark</ToggleOption>
  <ToggleOption value="system" icon={<Monitor />}>System</ToggleOption>
</ThemeToggle>

// Or as a simple switch
<SettingRow
  icon={<Moon />}
  label="Dark Mode"
  description="Use dark theme"
>
  <Switch checked={theme === 'dark'} onChange={toggleTheme} />
</SettingRow>
```

### Theme Tokens (Light Mode Future Support)

```css
/* Light mode tokens (future expansion) */
:root[data-theme="light"] {
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-elevated: #FFFFFF;
  --color-divider: #E0E0E0;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  /* Brand colors remain the same */
}
```

### Language/Locale Settings

```tsx
<SettingRow
  icon={<Globe />}
  label="Language"
  description="Choose your preferred language"
>
  <Select value={locale} onChange={setLocale}>
    <SelectOption value="en-US">English (US)</SelectOption>
    <SelectOption value="en-GB">English (UK)</SelectOption>
    <SelectOption value="es">Español</SelectOption>
    <SelectOption value="de">Deutsch</SelectOption>
    <SelectOption value="fr">Français</SelectOption>
    <SelectOption value="pt-BR">Português (Brasil)</SelectOption>
    <SelectOption value="ja">日本語</SelectOption>
  </Select>
</SettingRow>

<SettingRow
  icon={<Clock />}
  label="Time Zone"
  description="Used for session scheduling"
>
  <TimeZoneSelect value={timezone} onChange={setTimezone} />
</SettingRow>

<SettingRow
  icon={<Calendar />}
  label="Date Format"
>
  <Select value={dateFormat} onChange={setDateFormat}>
    <SelectOption value="MM/DD/YYYY">MM/DD/YYYY</SelectOption>
    <SelectOption value="DD/MM/YYYY">DD/MM/YYYY</SelectOption>
    <SelectOption value="YYYY-MM-DD">YYYY-MM-DD</SelectOption>
  </Select>
</SettingRow>
```

### Accessibility Options

```tsx
<SettingsSection title="Accessibility">
  <ToggleSetting
    icon={<Volume2 />}
    label="Sound Effects"
    description="Play sounds for dice rolls and notifications"
    value={settings.soundEffects}
    onChange={handleToggle('soundEffects')}
  />
  
  <ToggleSetting
    icon={<Sparkles />}
    label="Reduce Motion"
    description="Minimize animations throughout the app"
    value={settings.reduceMotion}
    onChange={handleToggle('reduceMotion')}
  />
  
  <ToggleSetting
    icon={<Type />}
    label="High Contrast"
    description="Increase contrast for better readability"
    value={settings.highContrast}
    onChange={handleToggle('highContrast')}
  />
  
  <SliderSetting
    icon={<ZoomIn />}
    label="Text Size"
    description="Adjust base font size"
    min={12}
    max={20}
    step={1}
    value={settings.fontSize}
    onChange={handleChange('fontSize')}
    unit="px"
  />
  
  <ToggleSetting
    icon={<Keyboard />}
    label="Keyboard Navigation Hints"
    description="Show keyboard shortcut hints in tooltips"
    value={settings.keyboardHints}
    onChange={handleToggle('keyboardHints')}
  />
</SettingsSection>
```

### Data Export

```tsx
<SettingsSection title="Your Data">
  <SettingRow
    icon={<Download />}
    label="Export Data"
    description="Download all your characters, adventures, and settings"
  >
    <Button variant="secondary" onClick={handleExport}>
      <Download className="icon-sm" />
      Export
    </Button>
  </SettingRow>
  
  <ExportOptions>
    <Checkbox label="Characters" checked />
    <Checkbox label="Custom Adventures" checked />
    <Checkbox label="Session History" checked />
    <Checkbox label="Settings & Preferences" checked />
  </ExportOptions>
  
  <SettingRow
    icon={<Upload />}
    label="Import Data"
    description="Import data from a previous export"
  >
    <Button variant="secondary" onClick={handleImport}>
      <Upload className="icon-sm" />
      Import
    </Button>
  </SettingRow>
  
  <Divider />
  
  <SettingRow
    icon={<Trash2 />}
    label="Delete Account"
    description="Permanently delete your account and all data"
    variant="danger"
  >
    <Button variant="danger">Delete Account</Button>
  </SettingRow>
</SettingsSection>
```

---

## Standard UX Patterns

### Empty States

Empty states should guide users toward action, not dead ends.

```tsx
<EmptyState
  icon={<Sword />}
  title="No characters yet"
  description="Create your first character to begin your adventure"
  action={
    <Button variant="primary">
      <Plus className="icon-sm" />
      Create Character
    </Button>
  }
  secondaryAction={
    <Button variant="ghost">Learn More</Button>
  }
/>

// Contextual empty states
<EmptyState
  illustration={<EmptyQuestIllustration />}
  title="No sessions found"
  description="Try adjusting your filters or search terms"
  action={<Button variant="secondary">Clear Filters</Button>}
/>
```

#### Empty State Styles

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  max-width: 400px;
  margin: 0 auto;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-6);
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.empty-state-actions {
  display: flex;
  gap: var(--space-3);
}
```

### Loading Skeletons

```tsx
// Skeleton primitives
<Skeleton width={200} height={24} />
<Skeleton width="100%" height={16} />
<Skeleton variant="circular" size={48} />

// Composed skeletons
<CharacterCardSkeleton />
<AdventureListSkeleton count={5} />

// Character card skeleton
<Card>
  <CardContent className="flex gap-4">
    <Skeleton variant="circular" size={64} />
    <div className="flex-1">
      <Skeleton width="60%" height={24} className="mb-2" />
      <Skeleton width="40%" height={16} />
    </div>
  </CardContent>
</Card>
```

#### Skeleton Styles

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-elevated) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

.skeleton-circular {
  border-radius: var(--radius-full);
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
  
  &:last-child { width: 80%; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Error States

```tsx
// Full page error
<ErrorState
  icon={<AlertTriangle />}
  title="Something went wrong"
  description="We couldn't load your characters. Please try again."
  action={
    <Button variant="primary" onClick={retry}>
      <RefreshCw className="icon-sm" />
      Try Again
    </Button>
  }
  technical={error.message} // collapsible for developers
/>

// Inline error
<InlineError
  message="Failed to save changes"
  action={{ label: 'Retry', onClick: retry }}
/>

// Error boundary fallback
<ErrorBoundary
  fallback={({ error, resetErrorBoundary }) => (
    <ErrorState
      title="Oops! Something broke"
      description="This part of the app crashed. Your data is safe."
      action={
        <Button onClick={resetErrorBoundary}>Reload Section</Button>
      }
    />
  )}
>
  <ChildComponents />
</ErrorBoundary>
```

### Confirmation Dialogs

```tsx
// Destructive action confirmation
<ConfirmDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  variant="danger"
  title="Delete Character?"
  description="This will permanently delete Brave Sir Robbin and all associated data. This action cannot be undone."
  confirmLabel="Delete Character"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
/>

// Standard confirmation
<ConfirmDialog
  open={isLeaveOpen}
  onOpenChange={setIsLeaveOpen}
  title="Leave Session?"
  description="You have unsaved changes. Are you sure you want to leave?"
  confirmLabel="Leave"
  cancelLabel="Stay"
  onConfirm={handleLeave}
/>

// With input confirmation (for critical actions)
<ConfirmDialog
  open={isAccountDeleteOpen}
  onOpenChange={setIsAccountDeleteOpen}
  variant="danger"
  title="Delete Account"
  description="This will permanently delete your account and all data."
  confirmationText="DELETE" // user must type this
  confirmLabel="Delete My Account"
  onConfirm={handleAccountDelete}
/>
```

#### Dialog Styles

```css
.confirm-dialog {
  max-width: 440px;
}

.confirm-dialog-danger {
  .confirm-dialog-icon {
    color: var(--color-error);
    background: rgba(244, 67, 54, 0.1);
  }
  
  .confirm-dialog-confirm-btn {
    background: var(--color-error);
    
    &:hover {
      background: #D32F2F;
    }
  }
}

.confirm-dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}
```

### Form Validation Patterns

```tsx
// Real-time validation
<FormField
  label="Display Name"
  error={errors.displayName?.message}
  required
>
  <Input
    {...register('displayName', {
      required: 'Display name is required',
      minLength: { value: 2, message: 'At least 2 characters' },
      maxLength: { value: 32, message: 'Max 32 characters' },
    })}
    placeholder="Enter display name"
    aria-invalid={!!errors.displayName}
  />
</FormField>

// Field states
<Input state="error" />  // red border
<Input state="success" />  // green border (validated)
<Input state="loading" />  // spinner in input
```

#### Validation Styles

```css
.form-field {
  margin-bottom: var(--space-4);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.form-label-required::after {
  content: '*';
  color: var(--color-error);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-error);
}

.form-hint {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.input-success {
  border-color: var(--color-success);
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
}
```

### Pagination & Infinite Scroll

```tsx
// Traditional pagination
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showFirstLast={true}
  siblingCount={1}
/>

// Infinite scroll
<InfiniteScrollList
  items={characters}
  hasMore={hasNextPage}
  loadMore={fetchNextPage}
  loader={<CharacterCardSkeleton />}
  endMessage="You've seen all characters!"
>
  {(character) => (
    <CharacterCard key={character.id} character={character} />
  )}
</InfiniteScrollList>

// Load more button (hybrid approach)
<LoadMoreList
  items={sessions}
  hasMore={hasNextPage}
  loadMore={fetchNextPage}
  loadingMore={isFetchingNextPage}
/>
```

#### Pagination Styles

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.pagination-button {
  min-width: 36px;
  height: 36px;
  padding: 0 var(--space-2);
  background: transparent;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  
  &:hover:not(:disabled) {
    background: var(--color-elevated);
    color: var(--color-text-primary);
  }
  
  &.active {
    background: var(--color-bronze);
    border-color: var(--color-bronze);
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.load-more-button {
  display: block;
  width: 100%;
  padding: var(--space-4);
  margin-top: var(--space-4);
}
```

### Keyboard Shortcuts

```tsx
// Global shortcuts config
const KEYBOARD_SHORTCUTS = {
  'mod+k': { action: 'openSearch', label: 'Search' },
  'mod+n': { action: 'createCharacter', label: 'New Character' },
  'mod+/': { action: 'openShortcuts', label: 'Shortcuts' },
  'g h': { action: 'goHome', label: 'Go to Home' },
  'g c': { action: 'goCharacters', label: 'Go to Characters' },
  'g s': { action: 'goSessions', label: 'Go to Sessions' },
  'Escape': { action: 'closeModal', label: 'Close' },
};

// Keyboard shortcuts dialog
<KeyboardShortcutsDialog open={isOpen} onOpenChange={setIsOpen}>
  <ShortcutSection title="Navigation">
    <ShortcutItem keys={['G', 'H']} description="Go to Home" />
    <ShortcutItem keys={['G', 'C']} description="Go to Characters" />
    <ShortcutItem keys={['G', 'S']} description="Go to Sessions" />
  </ShortcutSection>
  
  <ShortcutSection title="Actions">
    <ShortcutItem keys={['⌘', 'K']} description="Open search" />
    <ShortcutItem keys={['⌘', 'N']} description="New character" />
    <ShortcutItem keys={['?']} description="Show shortcuts" />
  </ShortcutSection>
</KeyboardShortcutsDialog>

// Keyboard shortcut hook
const useKeyboardShortcut = (keys, callback, deps = []) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (matchesShortcut(e, keys)) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
};
```

### Help/Support Access

```tsx
// Floating help button
<HelpButton>
  <HelpMenu>
    <HelpMenuItem icon={<BookOpen />} href="/docs">
      Documentation
    </HelpMenuItem>
    <HelpMenuItem icon={<MessageCircle />} onClick={openChat}>
      Contact Support
    </HelpMenuItem>
    <HelpMenuItem icon={<Video />} href="/tutorials">
      Video Tutorials
    </HelpMenuItem>
    <HelpMenuItem icon={<Bug />} onClick={openBugReport}>
      Report a Bug
    </HelpMenuItem>
    <Divider />
    <HelpMenuItem icon={<Keyboard />} onClick={openShortcuts}>
      Keyboard Shortcuts
    </HelpMenuItem>
  </HelpMenu>
</HelpButton>

// Contextual help tooltip
<HelpTooltip content="Your character's primary attribute determines their starting abilities">
  <HelpCircle className="icon-sm text-muted" />
</HelpTooltip>
```

---

## Onboarding

### First-Run Experience

```tsx
<OnboardingFlow
  steps={[
    {
      id: 'welcome',
      component: WelcomeStep,
      canSkip: false,
    },
    {
      id: 'profile',
      component: ProfileSetupStep,
      canSkip: false,
    },
    {
      id: 'character',
      component: FirstCharacterStep,
      canSkip: true,
    },
    {
      id: 'tutorial',
      component: TutorialStep,
      canSkip: true,
    },
  ]}
  onComplete={handleOnboardingComplete}
/>

// Welcome step
<OnboardingStep>
  <OnboardingIllustration src="/images/onboarding/welcome.png" />
  <OnboardingTitle>Welcome to SPARC RPG!</OnboardingTitle>
  <OnboardingDescription>
    Your gateway to epic tabletop adventures. Let's get you set up in just a few steps.
  </OnboardingDescription>
  <OnboardingProgress current={1} total={4} />
  <Button variant="primary" onClick={nextStep}>Get Started</Button>
</OnboardingStep>
```

#### Onboarding Styles

```css
.onboarding-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg);
}

.onboarding-card {
  width: 100%;
  max-width: 480px;
  padding: var(--space-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  text-align: center;
}

.onboarding-progress {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-6);
}

.onboarding-progress-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-divider);
  
  &.active { background: var(--color-bronze); }
  &.completed { background: var(--color-success); }
}
```

### Feature Tooltips

```tsx
// Spotlight tooltip for new features
<FeatureSpotlight
  id="adventure-forge-v2"
  title="Adventure Forge 2.0"
  description="Create branching adventures with our new visual editor!"
  placement="bottom"
  showOnce={true}
>
  <NavItem icon={<Sparkles />} label="Adventure Forge" />
</FeatureSpotlight>

// Tour-style tooltips
<FeatureTour
  steps={[
    {
      target: '#character-stats',
      title: 'Character Attributes',
      content: 'Your four core attributes determine your abilities.',
    },
    {
      target: '#dice-pool',
      title: 'Dice Pool',
      content: 'Click to roll dice. Higher attributes = more dice!',
    },
    {
      target: '#inventory',
      title: 'Inventory',
      content: 'Manage your equipment and items here.',
    },
  ]}
  onComplete={markTourComplete}
/>
```

#### Feature Tooltip Styles

```css
.feature-spotlight {
  position: relative;
  z-index: var(--z-tooltip);
}

.feature-spotlight-content {
  position: absolute;
  padding: var(--space-4);
  background: var(--color-elevated);
  border: 1px solid var(--color-bronze);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  max-width: 280px;
  
  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--color-elevated);
    border: 1px solid var(--color-bronze);
    border-right: none;
    border-bottom: none;
    transform: rotate(45deg);
  }
}

.feature-spotlight-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-tooltip) - 1);
}

.feature-spotlight-highlight {
  position: relative;
  z-index: var(--z-tooltip);
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 4px var(--color-bronze), 0 0 0 9999px rgba(0, 0, 0, 0.5);
}
```

### Progressive Disclosure

```tsx
// Collapsible advanced options
<Collapsible>
  <CollapsibleTrigger>
    <ChevronRight className="icon-sm" />
    Advanced Options
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Advanced form fields */}
  </CollapsibleContent>
</Collapsible>

// "Learn more" expansion
<Card>
  <CardContent>
    <p>Basic information visible by default...</p>
    <ExpandableText maxLines={3}>
      Extended description that can be expanded to show more detail.
      This pattern is useful for tooltips, card descriptions, and
      any content that might overwhelm users if shown all at once.
    </ExpandableText>
  </CardContent>
</Card>

// Staged form (wizard)
<StagedForm
  stages={[
    { id: 'basics', label: 'Basics', component: BasicsForm },
    { id: 'attributes', label: 'Attributes', component: AttributesForm },
    { id: 'background', label: 'Background', component: BackgroundForm },
    { id: 'review', label: 'Review', component: ReviewForm },
  ]}
  onComplete={handleSubmit}
/>
```

---

## Security

### Session Management

```tsx
<SettingsSection title="Active Sessions">
  <SessionList>
    {sessions.map(session => (
      <SessionItem
        key={session.id}
        device={session.device}
        browser={session.browser}
        location={session.location}
        lastActive={session.lastActive}
        current={session.id === currentSessionId}
        onRevoke={() => revokeSession(session.id)}
      />
    ))}
  </SessionList>
  
  <Button variant="danger" onClick={revokeAllOtherSessions}>
    Sign Out All Other Devices
  </Button>
</SettingsSection>
```

#### Session Item

```
┌─────────────────────────────────────────────────────────────────┐
│ 💻  Chrome on MacOS                              [Current]      │
│     Denver, CO, USA                                            │
│     Last active: Just now                          [Revoke]    │
├─────────────────────────────────────────────────────────────────┤
│ 📱  Safari on iPhone                                           │
│     Denver, CO, USA                                            │
│     Last active: 2 hours ago                       [Revoke]    │
├─────────────────────────────────────────────────────────────────┤
│ 💻  Firefox on Windows                                         │
│     Unknown location                                           │
│     Last active: 3 days ago                        [Revoke]    │
└─────────────────────────────────────────────────────────────────┘
```

### Two-Factor Authentication UI

```tsx
<SettingsSection title="Two-Factor Authentication">
  {!twoFactorEnabled ? (
    <TwoFactorSetup
      onEnable={handleEnableTwoFactor}
      steps={[
        { id: 'download', label: 'Download App' },
        { id: 'scan', label: 'Scan QR Code' },
        { id: 'verify', label: 'Verify Code' },
        { id: 'backup', label: 'Save Backup Codes' },
      ]}
    />
  ) : (
    <TwoFactorEnabled
      methods={[
        { type: 'authenticator', enabled: true },
        { type: 'sms', enabled: false },
      ]}
      backupCodesRemaining={8}
      onDisable={handleDisableTwoFactor}
      onRegenerateBackupCodes={handleRegenerateCodes}
    />
  )}
</SettingsSection>

// 2FA verification modal
<TwoFactorVerifyModal
  open={needs2FA}
  onVerify={handleVerify}
  onCancel={handleCancel}
  allowBackupCode={true}
/>
```

#### Two-Factor Setup Flow

```
Step 1: Download App
┌─────────────────────────────────────────────────────────────────┐
│  Install an authenticator app on your phone:                    │
│                                                                 │
│  [Google Authenticator]  [Authy]  [1Password]                  │
│                                                                 │
│                                        [Next →]                │
└─────────────────────────────────────────────────────────────────┘

Step 2: Scan QR Code
┌─────────────────────────────────────────────────────────────────┐
│  Scan this QR code with your authenticator app:                │
│                                                                 │
│       ┌───────────────┐                                        │
│       │   [QR CODE]   │                                        │
│       └───────────────┘                                        │
│                                                                 │
│  Can't scan? Enter this code manually:                         │
│  ABCD EFGH IJKL MNOP                                           │
│                                                                 │
│                                        [Next →]                │
└─────────────────────────────────────────────────────────────────┘

Step 3: Verify Code
┌─────────────────────────────────────────────────────────────────┐
│  Enter the 6-digit code from your authenticator app:           │
│                                                                 │
│       ┌───┬───┬───┬───┬───┬───┐                               │
│       │ _ │ _ │ _ │ _ │ _ │ _ │                               │
│       └───┴───┴───┴───┴───┴───┘                               │
│                                                                 │
│                                        [Verify]                │
└─────────────────────────────────────────────────────────────────┘

Step 4: Backup Codes
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  Save these backup codes!                                   │
│                                                                 │
│  Use these if you lose access to your authenticator app.       │
│  Each code can only be used once.                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  XXXX-XXXX-XXXX    YYYY-YYYY-YYYY    ZZZZ-ZZZZ-ZZZZ   │   │
│  │  AAAA-AAAA-AAAA    BBBB-BBBB-BBBB    CCCC-CCCC-CCCC   │   │
│  │  DDDD-DDDD-DDDD    EEEE-EEEE-EEEE    FFFF-FFFF-FFFF   │   │
│  │  GGGG-GGGG-GGGG                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [📋 Copy]  [⬇ Download]                                       │
│                                                                 │
│  [ ] I have saved my backup codes                              │
│                                        [Done]                   │
└─────────────────────────────────────────────────────────────────┘
```

### Activity Log

```tsx
<SettingsSection title="Security Activity">
  <ActivityLog>
    {activities.map(activity => (
      <ActivityItem
        key={activity.id}
        icon={getActivityIcon(activity.type)}
        title={activity.title}
        description={activity.description}
        timestamp={activity.createdAt}
        location={activity.location}
        status={activity.status}
      />
    ))}
  </ActivityLog>
  
  <Button variant="ghost" onClick={loadMore}>
    View More Activity
  </Button>
</SettingsSection>
```

#### Activity Types

| Type | Icon | Example |
|------|------|---------|
| `login` | `LogIn` | Signed in from Chrome on MacOS |
| `logout` | `LogOut` | Signed out |
| `password_change` | `Key` | Password changed |
| `email_change` | `Mail` | Email changed to new@example.com |
| `2fa_enabled` | `Shield` | Two-factor authentication enabled |
| `2fa_disabled` | `ShieldOff` | Two-factor authentication disabled |
| `session_revoked` | `XCircle` | Session revoked (Firefox on Windows) |
| `failed_login` | `AlertTriangle` | Failed login attempt |
| `api_key_created` | `Key` | API key created |

#### Activity Log Styles

```css
.activity-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  
  &:last-child { border-bottom: none; }
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  
  &.warning {
    background: rgba(255, 152, 0, 0.1);
    color: var(--color-warning);
  }
  
  &.danger {
    background: rgba(244, 67, 54, 0.1);
    color: var(--color-error);
  }
}

.activity-timestamp {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.activity-location {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

---

## Component Checklist Expansion

### P0 - Must Have (Standard Dashboard)
- [ ] User profile page with avatar upload
- [ ] Account settings page
- [ ] Responsive sidebar navigation
- [ ] Mobile bottom navigation
- [ ] Toast notification system
- [ ] Basic empty states
- [ ] Loading skeletons
- [ ] Error states with retry
- [ ] Form validation patterns
- [ ] Confirmation dialogs

### P1 - Should Have (Standard Dashboard)
- [ ] Notification center with unread indicators
- [ ] Breadcrumb navigation
- [ ] Tab navigation component
- [ ] Global search / command palette
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Pagination component
- [ ] Keyboard shortcuts system

### P2 - Nice to Have (Standard Dashboard)
- [ ] First-run onboarding flow
- [ ] Feature spotlights / tooltips
- [ ] Progressive disclosure patterns
- [ ] Theme toggle (light mode)
- [ ] Language/locale selection
- [ ] Accessibility options
- [ ] Data export functionality
- [ ] Session management UI
- [ ] Two-factor authentication UI
- [ ] Activity log
