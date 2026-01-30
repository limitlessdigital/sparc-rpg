# PRD 27: Mobile Application

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 12 weeks  
> **Dependencies**: 16-backend-api, 18-authentication, 19-design-system

---

## Overview

The SPARC RPG Mobile Application brings the tabletop experience to iOS and Android devices. Built with React Native for cross-platform consistency, it provides offline-capable character sheets, mobile-optimized dice rolling, push notifications for session management, and quick reference access to game rules.

### Goals
- Native mobile experience on iOS and Android
- Offline character sheet access and editing
- Push notifications for session reminders and turn alerts
- Mobile-optimized dice rolling with haptic feedback
- Quick reference access to rules and class abilities
- Camera integration for character photos

### Non-Goals
- Full Seer dashboard on mobile (tablet-only consideration)
- Adventure Forge editor (web-only for v1)
- Live video/audio streaming (see PRD 30)
- Offline adventure playthrough (requires connectivity)

---

## User Stories

### US-01: App Installation
**As a** new user  
**I want to** download SPARC RPG from the app store  
**So that** I can play on my mobile device

**Acceptance Criteria:**
- [ ] App available on iOS App Store
- [ ] App available on Google Play Store
- [ ] App size under 50MB initial download
- [ ] Rating 4.5+ stars maintained
- [ ] Clear app description and screenshots
- [ ] Age rating appropriate (E for Everyone / 4+)

### US-02: Mobile Authentication
**As a** user  
**I want to** sign in with the same OAuth providers as web  
**So that** my account syncs across devices

**Acceptance Criteria:**
- [ ] Google OAuth works via native flow
- [ ] Discord OAuth works via web view
- [ ] Apple Sign-In works natively on iOS
- [ ] Session persists across app restarts
- [ ] Biometric unlock option (Face ID / Touch ID / Fingerprint)
- [ ] Sign out clears all local data

### US-03: Offline Character Sheets
**As a** player  
**I want to** view my character sheets without internet  
**So that** I can reference my character anywhere

**Acceptance Criteria:**
- [ ] Characters cached locally on device
- [ ] View all character details offline
- [ ] Edit character notes offline
- [ ] Changes sync when connection restored
- [ ] Conflict resolution for simultaneous edits
- [ ] Clear indicator of sync status

### US-04: Push Notifications
**As a** player  
**I want to** receive notifications about my games  
**So that** I never miss a session

**Acceptance Criteria:**
- [ ] Session reminder 24 hours before
- [ ] Session reminder 1 hour before
- [ ] "It's your turn" alert during combat
- [ ] Session invite notifications
- [ ] Customizable notification preferences
- [ ] Do not disturb schedule support

### US-05: Mobile Dice Rolling
**As a** player  
**I want to** roll dice optimized for touch  
**So that** rolling feels natural on my phone

**Acceptance Criteria:**
- [ ] Swipe-to-roll gesture
- [ ] Shake-to-roll option
- [ ] Haptic feedback on roll and result
- [ ] Large, readable dice results
- [ ] Portrait and landscape support
- [ ] Results sync to session in <100ms

### US-06: Quick Reference
**As a** player  
**I want to** quickly look up rules and abilities  
**So that** I don't slow down the game

**Acceptance Criteria:**
- [ ] Searchable rules database
- [ ] Class ability quick cards
- [ ] Equipment and item lookup
- [ ] Offline access to all reference material
- [ ] Bookmarkable favorite entries
- [ ] Recent lookups history

### US-07: Character Photos
**As a** player  
**I want to** use my camera for character portraits  
**So that** I can personalize my character

**Acceptance Criteria:**
- [ ] Camera access for new photos
- [ ] Photo library access for existing images
- [ ] Basic crop and adjust tools
- [ ] Photo uploads compressed for bandwidth
- [ ] Fallback to default avatars
- [ ] Photos sync across all devices

### US-08: Session Participation
**As a** player  
**I want to** participate in sessions from my phone  
**So that** I can play even without a computer

**Acceptance Criteria:**
- [ ] Join active sessions via link or code
- [ ] View current scene and narrative
- [ ] Make decisions when prompted
- [ ] Roll dice when requested
- [ ] Chat with other players
- [ ] View session map (if available)

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SPARC Mobile App                         │
├─────────────────────────────────────────────────────────────┤
│  React Native (0.73+) + TypeScript                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Screens   │ │ Components  │ │  Services   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  State Management: Zustand + React Query                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │  SQLite (Local)  │ │  AsyncStorage    │                 │
│  │  - Characters    │ │  - Preferences   │                 │
│  │  - Reference     │ │  - Auth tokens   │                 │
│  └──────────────────┘ └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  Native Modules                                             │
│  - Push Notifications (FCM/APNs)                           │
│  - Haptics                                                  │
│  - Camera/Photo Library                                     │
│  - Biometrics                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
// Local storage models
interface CachedCharacter {
  id: string;
  data: SparcCharacter;
  lastSynced: string;           // ISO timestamp
  localChanges: boolean;        // Has unsynced edits
  version: number;              // For conflict resolution
}

interface SyncQueue {
  id: string;
  type: 'character_update' | 'photo_upload';
  payload: unknown;
  createdAt: string;
  retryCount: number;
}

interface NotificationPreferences {
  sessionReminder24h: boolean;
  sessionReminder1h: boolean;
  turnAlerts: boolean;
  sessionInvites: boolean;
  dndStart: string;            // "22:00"
  dndEnd: string;              // "08:00"
  dndEnabled: boolean;
}

interface DiceRollGesture {
  type: 'swipe' | 'shake' | 'tap';
  sensitivity: 'low' | 'medium' | 'high';
  hapticEnabled: boolean;
}
```

### API Integration

```typescript
// Offline-first sync strategy
class SyncService {
  // Queue changes when offline
  async queueChange(type: string, payload: unknown): Promise<void>;
  
  // Process queue when online
  async processQueue(): Promise<SyncResult>;
  
  // Conflict resolution
  async resolveConflict(
    local: CachedCharacter,
    remote: SparcCharacter
  ): Promise<SparcCharacter>;
  
  // Background sync on app focus
  async syncOnForeground(): Promise<void>;
}

// Push notification registration
interface PushRegistration {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

// POST /api/v1/devices/register
// POST /api/v1/devices/unregister
```

### Native Module Interfaces

```typescript
// Haptics
interface HapticsModule {
  impact(style: 'light' | 'medium' | 'heavy'): void;
  notification(type: 'success' | 'warning' | 'error'): void;
  selection(): void;
}

// Dice rolling haptic sequence
const diceRollHaptics = async (results: number[]) => {
  // Rolling vibration pattern
  for (let i = 0; i < 5; i++) {
    Haptics.impact('light');
    await delay(50);
  }
  
  // Result reveal
  const isSuccess = calculateSuccess(results);
  Haptics.notification(isSuccess ? 'success' : 'error');
};

// Camera integration
interface CameraModule {
  takePhoto(options: CameraOptions): Promise<PhotoResult>;
  selectFromLibrary(options: LibraryOptions): Promise<PhotoResult>;
  cropImage(uri: string, options: CropOptions): Promise<string>;
}

interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}
```

### Screen Structure

```typescript
// Navigation structure
const AppNavigator = () => (
  <Stack.Navigator>
    {/* Auth Flow */}
    <Stack.Screen name="Login" component={LoginScreen} />
    
    {/* Main Tabs */}
    <Stack.Screen name="Main" component={MainTabs} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Characters" component={CharactersStack} />
    <Tab.Screen name="Sessions" component={SessionsStack} />
    <Tab.Screen name="Reference" component={ReferenceStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// Screen inventory
const screens = {
  // Characters
  CharacterList: 'List of user's characters',
  CharacterDetail: 'Full character sheet view',
  CharacterEdit: 'Edit character details',
  CharacterPhoto: 'Camera/photo selection',
  
  // Sessions
  SessionList: 'Active and upcoming sessions',
  SessionDetail: 'Session info and join',
  SessionLive: 'Active gameplay view',
  
  // Reference
  ReferenceHome: 'Rules categories',
  ClassReference: 'Class details and abilities',
  EquipmentReference: 'Items and equipment',
  RulesSearch: 'Search all rules',
  
  // Profile
  ProfileHome: 'User profile and settings',
  NotificationSettings: 'Push preferences',
  AppSettings: 'Dice gestures, themes, etc.',
};
```

---

## UI/UX Specifications

### Design System Adaptation

The mobile app adapts the web design system (PRD 19) for touch interfaces:

| Web Component | Mobile Adaptation |
|--------------|-------------------|
| Click targets | 44pt minimum touch targets |
| Hover states | Pressed states with haptics |
| Modal dialogs | Bottom sheets |
| Side panels | Full-screen overlays |
| Tooltips | Long-press info cards |

### Dice Rolling UI

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │    [🎲] [🎲]     │           │
│         │    [🎲] [🎲]     │           │
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│              Might Check                │
│           Difficulty: 12                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      ↑ SWIPE TO ROLL ↑         │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [📱 Shake to Roll]              │
│                                         │
└─────────────────────────────────────────┘
```

### Character Sheet Mobile Layout

```
┌─────────────────────────────────────────┐
│ ← Back              Elara        ✏️ Edit │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────────┐                          │
│    │  Photo  │   Wizard                 │
│    │  📷     │   Level 3                │
│    └─────────┘   HP: ❤️❤️❤️❤️❤️❤️       │
│                                         │
├─────────────────────────────────────────┤
│  MIGHT   GRACE   WIT    HEART          │
│    2       3      5       4             │
│   ●●○     ●●●    ●●●●●   ●●●●           │
├─────────────────────────────────────────┤
│                                         │
│  📜 Special Ability                     │
│  ┌─────────────────────────────────┐   │
│  │ Arcane Surge                    │   │
│  │ Double damage on next spell     │   │
│  │ Recharges: Double roll          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🎒 Equipment                           │
│  • Staff of the Ancients               │
│  • Spellbook                           │
│  • Healing Potion (2)                  │
│                                         │
│  📝 Notes                               │
│  ┌─────────────────────────────────┐   │
│  │ Seeking the lost tome of...     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Push Notification Templates

```
Session Reminder (24h):
┌─────────────────────────────────────────┐
│ 🎲 SPARC RPG                            │
│ Adventure awaits tomorrow!              │
│ "The Dragon's Lair" starts in 24 hours │
│ Tap to see details                      │
└─────────────────────────────────────────┘

Session Reminder (1h):
┌─────────────────────────────────────────┐
│ 🎲 SPARC RPG                            │
│ Session starting soon!                  │
│ "The Dragon's Lair" begins in 1 hour   │
│ Tap to join                             │
└─────────────────────────────────────────┘

Turn Alert:
┌─────────────────────────────────────────┐
│ ⚔️ SPARC RPG                            │
│ It's your turn!                         │
│ Elara, the combat awaits your action   │
│ Tap to roll                             │
└─────────────────────────────────────────┘

Session Invite:
┌─────────────────────────────────────────┐
│ 📨 SPARC RPG                            │
│ You've been invited!                    │
│ DarkLord99 invited you to "Tomb Raid"  │
│ Tap to respond                          │
└─────────────────────────────────────────┘
```

---

## App Store Requirements

### iOS App Store

| Requirement | Specification |
|-------------|--------------|
| Minimum iOS | 15.0 |
| Device Support | iPhone, iPad |
| App Category | Games > Role Playing |
| Content Rating | 4+ |
| Privacy Labels | Required data disclosures |
| Screenshots | 6.5" (1284x2778), 5.5" (1242x2208) |
| App Preview | 30-second gameplay video |

**Privacy Disclosures:**
- Contact Info: Email (account management)
- Identifiers: User ID, Device ID
- Usage Data: Analytics
- Linked to user: Yes (for gameplay features)

### Google Play Store

| Requirement | Specification |
|-------------|--------------|
| Minimum Android | API 26 (Android 8.0) |
| Target SDK | API 34 (Android 14) |
| App Category | Games > Role Playing |
| Content Rating | Everyone |
| Screenshots | Phone, 7" tablet, 10" tablet |
| Feature Graphic | 1024x500 |

**Data Safety:**
- Account info collected
- Device identifiers for push
- Optional crash logs
- Data encrypted in transit

### Shared Assets

```
App Icon Sizes:
├── iOS
│   ├── 1024x1024 (App Store)
│   ├── 180x180 (@3x iPhone)
│   ├── 167x167 (@2x iPad Pro)
│   └── 120x120 (@2x iPhone)
├── Android
│   ├── 512x512 (Play Store)
│   ├── 192x192 (xxxhdpi)
│   ├── 144x144 (xxhdpi)
│   └── 96x96 (xhdpi)

Splash Screen:
├── 2732x2732 (universal, scaled)
├── Brand logo centered
└── Loading indicator at bottom
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Cold start time | <2 seconds |
| Warm start time | <500ms |
| Dice roll animation | 60 FPS |
| Memory usage | <200MB active |
| Battery impact | <5% per hour active |
| Offline mode activation | <100ms |
| Sync completion | <5 seconds on reconnect |

### Offline Capabilities

| Feature | Offline Support |
|---------|----------------|
| View characters | ✅ Full |
| Edit characters | ✅ Queued sync |
| View reference | ✅ Full |
| Join session | ❌ Requires connection |
| Roll dice | ⚠️ Local only (no sync) |
| Push notifications | ✅ Received when online |

---

## Testing Requirements

### Unit Tests
- [ ] Sync queue operations
- [ ] Conflict resolution logic
- [ ] Offline detection
- [ ] Dice roll calculations
- [ ] Navigation state management

### Integration Tests
- [ ] OAuth flow on both platforms
- [ ] Push notification registration
- [ ] Camera/photo integration
- [ ] API sync operations
- [ ] Deep link handling

### E2E Tests
- [ ] Full authentication flow
- [ ] Character CRUD offline/online
- [ ] Session join and participate
- [ ] Push notification delivery
- [ ] App backgrounding/foregrounding

### Device Testing Matrix

| Device | OS Version | Priority |
|--------|------------|----------|
| iPhone 15 Pro | iOS 17 | P0 |
| iPhone SE (3rd) | iOS 16 | P0 |
| iPhone 12 | iOS 15 | P1 |
| iPad Air | iPadOS 17 | P1 |
| Pixel 8 | Android 14 | P0 |
| Samsung S23 | Android 13 | P0 |
| OnePlus 11 | Android 14 | P1 |
| Samsung A54 | Android 13 | P1 |

---

## Analytics Events

```typescript
// Key events to track
const analyticsEvents = {
  // Onboarding
  'app_first_open': {},
  'auth_started': { provider: string },
  'auth_completed': { provider: string },
  
  // Characters
  'character_viewed': { characterId: string },
  'character_edited_offline': { characterId: string },
  'character_synced': { characterId: string, hadConflict: boolean },
  'character_photo_added': { source: 'camera' | 'library' },
  
  // Sessions
  'session_joined': { sessionId: string, fromNotification: boolean },
  'dice_rolled': { gesture: 'swipe' | 'shake' | 'tap' },
  
  // Reference
  'reference_searched': { query: string },
  'reference_bookmarked': { entryId: string },
  
  // Settings
  'notifications_configured': { enabled: boolean },
  'biometrics_enabled': {},
};
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] React Native project setup
- [ ] Navigation structure
- [ ] Design system implementation
- [ ] Authentication flow
- [ ] Basic character list/detail

### Phase 2: Core Features (Weeks 5-8)
- [ ] Offline storage with SQLite
- [ ] Sync engine implementation
- [ ] Push notification integration
- [ ] Dice rolling with haptics
- [ ] Session participation

### Phase 3: Polish (Weeks 9-10)
- [ ] Camera integration
- [ ] Quick reference system
- [ ] Settings and preferences
- [ ] Performance optimization
- [ ] Accessibility audit

### Phase 4: Release (Weeks 11-12)
- [ ] App store assets creation
- [ ] Beta testing (TestFlight / Internal Track)
- [ ] Store submissions
- [ ] Launch monitoring setup
- [ ] Documentation

---

## Dependencies

- **PRD 16** (Backend API): All data endpoints
- **PRD 17** (Database Schema): Character and session models
- **PRD 18** (Authentication): OAuth integration
- **PRD 19** (Design System): Visual components

---

## Open Questions

1. Should tablet users get access to Seer features?
2. Apple Watch companion app for turn notifications?
3. Widgets for upcoming sessions on home screen?
4. Should we support older iOS/Android versions for reach?

---

## Appendix

### A. Rejected Alternatives

**Flutter instead of React Native:**
- Rejected due to existing React expertise on team
- React Native enables code sharing with web
- Hot reload experience similar between both

**Native Swift/Kotlin:**
- Rejected due to double development effort
- Would provide best performance but not needed for SPARC
- React Native performance sufficient for our use case

### B. Future Considerations

- Apple Watch / Wear OS companion apps
- AR dice rolling using device camera
- Nearby multiplayer via Bluetooth
- Widget support for iOS 17+ / Android 12+
