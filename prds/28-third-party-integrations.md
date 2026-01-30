# PRD 28: Third-Party Integrations

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 8 weeks  
> **Dependencies**: 16-backend-api, 18-authentication

---

## Overview

Third-Party Integrations extend SPARC RPG's reach by connecting with popular platforms and enabling developer ecosystem growth. This includes a Discord bot for community engagement, Twitch integration for streamers, a public REST API for developers, and an integration marketplace.

### Goals
- Discord bot for session notifications, dice rolling, and LFG
- Twitch integration for stream overlays and viewer interaction
- Public REST API for third-party developers
- OAuth provider for secure third-party app access
- Webhook system for real-time event notifications
- Integration marketplace for community-built tools

### Non-Goals
- Supporting every chat platform (focus on Discord/Twitch first)
- Building integrations ourselves (enable ecosystem)
- Real-time game mirroring to external platforms
- Custom bot hosting (developers host their own)

---

## User Stories

### Discord Integration

### US-01: Discord Bot Installation
**As a** server admin  
**I want to** add the SPARC bot to my Discord server  
**So that** my community can use SPARC features

**Acceptance Criteria:**
- [ ] OAuth install flow via Discord
- [ ] Minimal permissions requested
- [ ] Bot responds to /sparc commands
- [ ] Setup wizard for server configuration
- [ ] Permissions clearly documented

### US-02: Session Notifications
**As a** Seer  
**I want to** post session announcements to Discord  
**So that** my players are notified where they hang out

**Acceptance Criteria:**
- [ ] Link SPARC sessions to Discord channels
- [ ] Automatic session reminder posts
- [ ] RSVP reactions on announcements
- [ ] Customizable notification templates
- [ ] Time zone aware scheduling

### US-03: Discord Dice Rolling
**As a** player  
**I want to** roll SPARC dice in Discord  
**So that** I can play without leaving the chat

**Acceptance Criteria:**
- [ ] `/sparc roll <attribute> <difficulty>` command
- [ ] Visual dice result embed
- [ ] Supports all SPARC mechanics (criticals, etc.)
- [ ] Optional character linking for accurate pools
- [ ] Roll history in channel

### US-04: Looking for Group (LFG)
**As a** player  
**I want to** find games via Discord  
**So that** I can join sessions with new groups

**Acceptance Criteria:**
- [ ] `/sparc lfg` posts to designated LFG channel
- [ ] Searchable game listings
- [ ] Player/Seer filtering
- [ ] Time zone matching
- [ ] Direct message requests

### Twitch Integration

### US-05: Stream Overlay
**As a** streaming Seer  
**I want to** display SPARC overlays on my stream  
**So that** viewers can follow the action

**Acceptance Criteria:**
- [ ] Browser source overlay URL generation
- [ ] Current scene display
- [ ] Dice roll animations in overlay
- [ ] Character HP and status bars
- [ ] Customizable overlay themes

### US-06: Viewer Interaction
**As a** streaming Seer  
**I want to** let viewers influence the game  
**So that** my stream is interactive

**Acceptance Criteria:**
- [ ] Twitch polls for decision points
- [ ] Channel point redemptions trigger events
- [ ] Chat commands for dice betting/predictions
- [ ] Viewer suggestion queue
- [ ] Moderator controls

### Public API

### US-07: API Key Management
**As a** developer  
**I want to** get API keys for my application  
**So that** I can build on SPARC

**Acceptance Criteria:**
- [ ] Developer portal registration
- [ ] API key generation and rotation
- [ ] Usage dashboard and analytics
- [ ] Rate limit visibility
- [ ] Key revocation

### US-08: OAuth for Third-Party Apps
**As a** user  
**I want to** authorize third-party apps safely  
**So that** I control what data apps access

**Acceptance Criteria:**
- [ ] OAuth 2.0 authorization code flow
- [ ] Granular scope permissions
- [ ] Token refresh mechanism
- [ ] Easy revocation from settings
- [ ] Clear consent screen

### US-09: Webhooks
**As a** developer  
**I want to** receive real-time event notifications  
**So that** my app can react to SPARC events

**Acceptance Criteria:**
- [ ] Webhook endpoint configuration
- [ ] Event type subscriptions
- [ ] Signature verification for security
- [ ] Retry on failure with backoff
- [ ] Webhook logs and debugging

### US-10: Developer Documentation
**As a** developer  
**I want to** comprehensive API documentation  
**So that** I can build integrations quickly

**Acceptance Criteria:**
- [ ] OpenAPI/Swagger specification
- [ ] Interactive API explorer
- [ ] Code examples in multiple languages
- [ ] Quick start guides
- [ ] Changelog and versioning info

---

## Technical Specification

### Discord Bot Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Discord Bot Service                      │
├─────────────────────────────────────────────────────────────┤
│  discord.js (Node.js) / Discord Gateway                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Commands   │ │   Events    │ │  Scheduled  │           │
│  │  Handler    │ │   Handler   │ │    Tasks    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐           │
│  │           SPARC API Client                   │           │
│  │  - Session queries                           │           │
│  │  - Dice roll execution                       │           │
│  │  - User/character linking                    │           │
│  └─────────────────────────────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Redis (Command state, rate limiting, caching)             │
└─────────────────────────────────────────────────────────────┘
```

### Discord Bot Commands

```typescript
// Slash command definitions
const commands = [
  {
    name: 'sparc',
    description: 'SPARC RPG commands',
    options: [
      {
        name: 'roll',
        description: 'Roll dice for an attribute check',
        options: [
          { name: 'attribute', type: 'STRING', choices: ['might', 'grace', 'wit', 'heart'] },
          { name: 'difficulty', type: 'INTEGER', min: 3, max: 18 },
          { name: 'modifier', type: 'INTEGER', required: false },
        ],
      },
      {
        name: 'character',
        description: 'Link or view your SPARC character',
        options: [
          { name: 'action', type: 'STRING', choices: ['link', 'view', 'unlink'] },
        ],
      },
      {
        name: 'session',
        description: 'Session management',
        options: [
          { name: 'action', type: 'STRING', choices: ['create', 'announce', 'remind'] },
        ],
      },
      {
        name: 'lfg',
        description: 'Looking for group',
        options: [
          { name: 'role', type: 'STRING', choices: ['player', 'seer'] },
          { name: 'timezone', type: 'STRING' },
        ],
      },
      {
        name: 'setup',
        description: 'Configure SPARC for this server (admin only)',
      },
    ],
  },
];

// Roll result embed
interface RollEmbed {
  title: string;           // "Elara rolls Wit!"
  description: string;     // "Difficulty: 12"
  fields: [
    { name: 'Dice', value: '🎲 4 🎲 6 🎲 2 🎲 5', inline: true },
    { name: 'Total', value: '17', inline: true },
    { name: 'Result', value: '✅ SUCCESS (+5)', inline: true },
  ];
  color: number;           // Green for success, red for failure
  thumbnail: string;       // Character avatar
}
```

### Twitch Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Twitch Integration                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Overlay Server  │    │  EventSub Webhooks│              │
│  │  (Browser Source)│    │  (Chat, Points)   │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       │                                     │
│           ┌───────────▼───────────┐                         │
│           │    State Sync Layer   │                         │
│           │   (WebSocket to SPARC)│                         │
│           └───────────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Overlay Data Model

```typescript
interface OverlayConfig {
  streamerId: string;
  sessionId: string;
  theme: 'dark' | 'light' | 'custom';
  components: {
    currentScene: boolean;
    diceRolls: boolean;
    characterBars: boolean;
    turnOrder: boolean;
  };
  position: {
    x: number;
    y: number;
  };
  customCss?: string;
}

interface OverlayState {
  scene: {
    title: string;
    description: string;
  };
  characters: Array<{
    name: string;
    hp: number;
    maxHp: number;
    avatar: string;
    isActive: boolean;
  }>;
  lastRoll?: {
    character: string;
    type: string;
    result: number[];
    success: boolean;
    timestamp: string;
  };
}
```

### Public API Specification

```yaml
# OpenAPI 3.0 excerpt
openapi: 3.0.3
info:
  title: SPARC RPG Public API
  version: 1.0.0
  description: |
    Build integrations with SPARC RPG.
    
    ## Authentication
    All requests require an API key via `X-API-Key` header,
    or OAuth 2.0 bearer token for user-specific actions.
    
    ## Rate Limits
    - 100 requests/minute for free tier
    - 1000 requests/minute for registered apps
    - Rate limit headers included in responses

servers:
  - url: https://api.sparc-rpg.com/v1

paths:
  /characters:
    get:
      summary: List user's characters
      security:
        - oauth2: [characters:read]
      responses:
        200:
          description: Character list
          
  /characters/{id}:
    get:
      summary: Get character details
      security:
        - oauth2: [characters:read]
        
  /sessions:
    get:
      summary: List available sessions
      security:
        - oauth2: [sessions:read]
        
  /sessions/{id}/rolls:
    post:
      summary: Execute a dice roll
      security:
        - oauth2: [sessions:write]
        
  /webhooks:
    post:
      summary: Register a webhook endpoint
      security:
        - apiKey: []
```

### OAuth Scopes

| Scope | Description |
|-------|-------------|
| `profile:read` | Read user profile info |
| `characters:read` | Read user's characters |
| `characters:write` | Create/edit characters |
| `sessions:read` | View sessions user participates in |
| `sessions:write` | Join sessions, make actions |
| `adventures:read` | Read published adventures |

### Webhook Events

```typescript
// Webhook payload structure
interface WebhookPayload {
  id: string;              // Unique event ID
  type: WebhookEventType;
  timestamp: string;
  data: unknown;           // Event-specific payload
  signature: string;       // HMAC-SHA256 for verification
}

type WebhookEventType = 
  | 'session.created'
  | 'session.started'
  | 'session.ended'
  | 'session.player_joined'
  | 'session.player_left'
  | 'dice.rolled'
  | 'combat.started'
  | 'combat.ended'
  | 'character.created'
  | 'character.updated';

// Example: dice.rolled event
interface DiceRolledEvent {
  sessionId: string;
  characterId: string;
  characterName: string;
  attribute: string;
  diceCount: number;
  results: number[];
  total: number;
  difficulty: number;
  success: boolean;
  outcome: string;
}

// Webhook configuration
interface WebhookConfig {
  id: string;
  url: string;
  secret: string;           // For signature verification
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  failureCount: number;
  lastSuccess?: string;
}
```

### Rate Limiting

```typescript
// Rate limit tiers
const rateLimits = {
  free: {
    requestsPerMinute: 100,
    requestsPerDay: 10000,
  },
  registered: {
    requestsPerMinute: 1000,
    requestsPerDay: 100000,
  },
  partner: {
    requestsPerMinute: 5000,
    requestsPerDay: 500000,
  },
};

// Response headers
interface RateLimitHeaders {
  'X-RateLimit-Limit': number;       // Max requests in window
  'X-RateLimit-Remaining': number;   // Requests left
  'X-RateLimit-Reset': number;       // Unix timestamp of reset
  'Retry-After'?: number;            // Seconds until retry (if limited)
}
```

### Developer Portal

```typescript
// Developer application registration
interface DeveloperApp {
  id: string;
  name: string;
  description: string;
  developerId: string;
  
  // OAuth settings
  clientId: string;
  clientSecretHash: string;    // Never stored in plain text
  redirectUris: string[];
  scopes: string[];
  
  // API key
  apiKeyHash: string;
  
  // Metadata
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  
  // Status
  status: 'development' | 'review' | 'approved' | 'suspended';
  tier: 'free' | 'registered' | 'partner';
  
  // Analytics
  totalRequests: number;
  activeUsers: number;
  lastRequestAt: string;
}

// API key structure (JWT-like for self-contained validation)
interface ApiKey {
  kid: string;          // Key ID
  iat: number;          // Issued at
  app: string;          // App ID
  tier: string;         // Rate limit tier
  sig: string;          // Signature
}
```

---

## Integration Marketplace

### Overview

The Integration Marketplace allows developers to list their SPARC integrations for users to discover and install.

### Listing Model

```typescript
interface MarketplaceListing {
  id: string;
  appId: string;
  
  // Display
  name: string;
  tagline: string;
  description: string;      // Markdown supported
  logoUrl: string;
  screenshots: string[];
  
  // Categorization
  category: 'bot' | 'overlay' | 'tool' | 'companion' | 'other';
  tags: string[];
  
  // Links
  installUrl?: string;       // OAuth install flow
  websiteUrl: string;
  supportUrl: string;
  
  // Stats
  installs: number;
  rating: number;            // 1-5
  reviewCount: number;
  
  // Pricing
  pricing: 'free' | 'freemium' | 'paid';
  priceDescription?: string;
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'featured' | 'removed';
  approvedAt?: string;
  featuredUntil?: string;
}

interface MarketplaceReview {
  id: string;
  listingId: string;
  userId: string;
  rating: number;           // 1-5
  title: string;
  body: string;
  helpful: number;          // Upvotes
  createdAt: string;
}
```

### Marketplace UI

```
┌─────────────────────────────────────────────────────────────┐
│  SPARC Integration Marketplace                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🔍 Search integrations...]                                │
│                                                             │
│  Categories: [All] [Bots] [Overlays] [Tools] [Companions]   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⭐ Featured                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🤖 SPARC Discord Bot                                │   │
│  │ Official Discord integration for SPARC RPG          │   │
│  │ ⭐⭐⭐⭐⭐ (4.8) • 15,234 installs • Free            │   │
│  │ [Install]                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📺 Stream Overlays                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ RPG Overlay  │ │ DiceStream   │ │ PartyTracker │        │
│  │ ⭐ 4.5       │ │ ⭐ 4.2       │ │ ⭐ 4.7       │        │
│  │ Free         │ │ $2.99/mo     │ │ Free         │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  🛠️ Popular Tools                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ InitTracker  │ │ LootGen      │ │ NPCMaker     │        │
│  │ ⭐ 4.6       │ │ ⭐ 4.1       │ │ ⭐ 4.4       │        │
│  │ Free         │ │ Free         │ │ $0.99        │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### OAuth Security

```typescript
// PKCE flow for public clients
interface AuthorizationRequest {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;                    // CSRF protection
  code_challenge: string;           // PKCE
  code_challenge_method: 'S256';
}

// Token exchange
interface TokenRequest {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;            // PKCE verification
}

// Token response
interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;               // 3600 (1 hour)
  refresh_token: string;
  scope: string;
}
```

### Webhook Security

```typescript
// Signature verification
const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
};

// Replay protection
interface WebhookPayload {
  id: string;           // Unique, store to prevent replays
  timestamp: string;    // Reject if >5 minutes old
  // ...
}
```

### API Key Security

- Keys hashed before storage (bcrypt)
- Rotate keys without downtime (multiple active keys)
- Key prefixes for identification (sparc_live_, sparc_test_)
- Automatic suspension on abuse detection

---

## Testing Requirements

### Discord Bot Tests
- [ ] Command parsing and validation
- [ ] Embed generation
- [ ] Rate limit handling
- [ ] Error responses
- [ ] Permission checks

### Twitch Integration Tests
- [ ] EventSub webhook verification
- [ ] Overlay state synchronization
- [ ] Browser source rendering
- [ ] Chat command parsing

### API Tests
- [ ] OAuth flow (authorization, token exchange, refresh)
- [ ] Rate limiting headers and enforcement
- [ ] Webhook delivery and retries
- [ ] Signature verification
- [ ] All endpoint authentication

### Integration Tests
- [ ] Discord bot ↔ SPARC API
- [ ] Twitch overlay ↔ WebSocket
- [ ] Third-party app OAuth flow
- [ ] Webhook delivery end-to-end

---

## Implementation Phases

### Phase 1: API Foundation (Weeks 1-3)
- [ ] Public API endpoints
- [ ] API key generation and validation
- [ ] Rate limiting infrastructure
- [ ] Developer portal MVP

### Phase 2: OAuth & Webhooks (Weeks 3-5)
- [ ] OAuth 2.0 implementation
- [ ] Scope system
- [ ] Webhook infrastructure
- [ ] Event dispatching

### Phase 3: Discord Bot (Weeks 5-7)
- [ ] Bot infrastructure
- [ ] Slash commands
- [ ] Session notifications
- [ ] LFG system

### Phase 4: Twitch & Marketplace (Weeks 7-8)
- [ ] Stream overlay system
- [ ] Twitch EventSub integration
- [ ] Marketplace MVP
- [ ] Documentation completion

---

## Dependencies

- **PRD 16** (Backend API): Core API infrastructure
- **PRD 18** (Authentication): OAuth foundation

---

## Open Questions

1. Should we partner with existing Discord bot services?
2. Twitch drops integration for promotional events?
3. Monetization for marketplace listings (cut of paid integrations)?
4. API versioning strategy (URL path vs. header)?

---

## Appendix

### A. Discord Bot Permissions

Required permissions for SPARC bot:
- Send Messages
- Embed Links
- Use Slash Commands
- Add Reactions
- Read Message History (for context)

### B. Twitch Scopes

Required Twitch scopes:
- `channel:read:redemptions` (channel points)
- `channel:manage:polls` (create polls)
- `chat:read` (read chat)
- `chat:edit` (send messages)

### C. Example Code Snippets

```python
# Python SDK example
from sparc_sdk import SparcClient

client = SparcClient(api_key="sparc_live_xxx")

# Get characters
characters = client.characters.list()

# Execute roll
roll = client.sessions.roll(
    session_id="sess_123",
    character_id="char_456",
    attribute="wit",
    difficulty=12
)

print(f"Rolled {roll.total}: {'Success!' if roll.success else 'Failed'}")
```

```javascript
// JavaScript SDK example
import { SparcClient } from '@sparc-rpg/sdk';

const client = new SparcClient({ apiKey: 'sparc_live_xxx' });

// Webhook handler (Express)
app.post('/webhooks/sparc', (req, res) => {
  const valid = client.webhooks.verify(
    req.body,
    req.headers['x-sparc-signature']
  );
  
  if (!valid) return res.status(401).send();
  
  const event = req.body;
  if (event.type === 'dice.rolled') {
    console.log(`${event.data.characterName} rolled ${event.data.total}!`);
  }
  
  res.status(200).send();
});
```
