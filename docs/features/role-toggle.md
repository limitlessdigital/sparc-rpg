# Feature: Role Toggle (Seer/Player Mode)

## Overview
Allow users to switch between Seer (GM) and Player modes within a single account. No need for separate accounts or re-registration.

## Problem
- Currently, users pick a role during onboarding and are locked in
- A user might GM one game but play in another
- Forcing two accounts is bad UX

## Solution
Single account with role toggle. User can switch context anytime.

## UI/UX

### Role Switcher Location
- Header or sidebar (persistent, always accessible)
- Simple toggle: `[Seer] | [Player]`
- Current mode highlighted

### Mode Differences

**Seer Mode:**
- Dashboard shows: My Campaigns, Session Management, Player Invites
- Can create/edit adventures
- Access to GM tools (Seer Dashboard, combat controls)
- "Create Campaign" CTA prominent

**Player Mode:**
- Dashboard shows: Games I've Joined, My Characters
- Can browse/join sessions
- Character creation and management
- "Find Game" or "Join Session" CTA prominent

### Switching Behavior
- Instant switch, no page reload needed (React state)
- Persist last-used mode in user preferences
- Deep links respect current mode

## Data Model

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN active_role TEXT DEFAULT 'player' CHECK (active_role IN ('seer', 'player'));
ALTER TABLE users ADD COLUMN is_seer_enabled BOOLEAN DEFAULT false;
```

**Note:** `is_seer_enabled` unlocks Seer mode. Could be:
- Auto-enabled for all users
- Enabled after completing Seer onboarding
- Enabled after first campaign creation

## API Changes

```typescript
// PATCH /api/users/me
{ active_role: 'seer' | 'player' }
```

## Components

### RoleSwitcher.tsx
```tsx
const RoleSwitcher = () => {
  const { user, setActiveRole } = useAuth();
  
  return (
    <ToggleGroup value={user.activeRole} onValueChange={setActiveRole}>
      <ToggleItem value="player">Player</ToggleItem>
      <ToggleItem value="seer" disabled={!user.isSeerEnabled}>
        Seer
      </ToggleItem>
    </ToggleGroup>
  );
};
```

## Migration Path
1. Add `active_role` column to users table
2. Default existing users to their onboarding choice
3. Add toggle to header
4. Update dashboard to filter by active role

## Priority
**P1** - Core UX improvement, affects all users

## Estimate
- Backend: 2 hours
- Frontend: 4 hours
- Testing: 2 hours
- **Total: ~1 day**

---
*Created: 2026-01-31*
