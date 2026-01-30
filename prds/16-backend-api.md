# PRD 16: Backend API Design

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 5 days  
> **Dependencies**: 17-database-schema, 18-authentication

---

## Overview

The SPARC RPG backend provides a RESTful API for all client interactions. This PRD defines the complete API architecture, conventions, endpoint structure, and implementation patterns.

### Goals
- Consistent, predictable API design
- Fast response times (<100ms for reads, <500ms for writes)
- Comprehensive error handling
- Real-time capabilities via Supabase
- Secure by default (authentication, authorization, validation)

### Non-Goals
- GraphQL implementation (REST-only for v1)
- Public API for third-party developers
- Webhooks for external integrations
- Rate limiting (handled at infrastructure level)

---

## API Conventions

### Base URL
```
Production: https://api.sparc-rpg.com/v1
Staging:    https://api-staging.sparc-rpg.com/v1
Local:      http://localhost:8000/v1
```

### Request Format

```typescript
// All requests use JSON
Content-Type: application/json

// Authentication via Bearer token
Authorization: Bearer <supabase_jwt>

// Optional request ID for tracing
X-Request-ID: <uuid>
```

### Response Format

**Success Response:**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
    requestId?: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
```

**Error Response:**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // e.g., "AUTH_001"
    message: string;        // Human-readable
    details?: any;          // Additional context
    field?: string;         // For validation errors
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate, race condition) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Naming Conventions

- **Endpoints**: lowercase, kebab-case, plural nouns
- **Query params**: camelCase
- **Request/response fields**: camelCase
- **Enum values**: snake_case

---

## API Endpoint Reference

### Authentication (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout (invalidate session) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/reset-password` | Request password reset |
| POST | `/auth/verify-email` | Verify email address |
| GET | `/auth/me` | Get current user |
| PATCH | `/auth/me` | Update current user |

### Characters (`/characters`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/characters` | List user's characters |
| POST | `/characters` | Create new character |
| GET | `/characters/:id` | Get character details |
| PATCH | `/characters/:id` | Update character |
| DELETE | `/characters/:id` | Delete character |
| GET | `/characters/classes` | List available classes |
| GET | `/characters/name-suggestions` | Get random names |

### Sessions (`/sessions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions` | List user's sessions |
| POST | `/sessions` | Create new session |
| GET | `/sessions/browse` | Browse public sessions |
| GET | `/sessions/:id` | Get session details |
| PATCH | `/sessions/:id` | Update session |
| DELETE | `/sessions/:id` | Cancel session |
| POST | `/sessions/:id/join` | Join session |
| POST | `/sessions/:id/leave` | Leave session |
| POST | `/sessions/:id/start` | Start session (Seer only) |
| POST | `/sessions/:id/end` | End session (Seer only) |
| GET | `/sessions/:id/preview` | Get session preview |
| GET | `/sessions/code/:code` | Lookup by invite code |

### Dice (`/dice`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/dice/roll` | Perform dice roll |
| POST | `/dice/heroic-save` | Use heroic save |
| GET | `/dice/history/:sessionId` | Get roll history |

### Adventures (`/adventures`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adventures` | List user's adventures |
| POST | `/adventures` | Create new adventure |
| GET | `/adventures/:id` | Get adventure details |
| PATCH | `/adventures/:id` | Update adventure |
| DELETE | `/adventures/:id` | Delete adventure |
| POST | `/adventures/:id/publish` | Publish adventure |
| POST | `/adventures/:id/unpublish` | Unpublish adventure |
| GET | `/adventures/browse` | Browse public adventures |
| POST | `/adventures/:id/clone` | Clone adventure |
| GET | `/adventures/:id/validate` | Validate adventure |

### AI Seer (`/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/advice` | Get Seer advice |
| POST | `/ai/narrative` | Generate narrative text |
| GET | `/ai/shortcuts` | List available shortcuts |

### Tutorial (`/tutorial`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tutorial/progress` | Get tutorial progress |
| POST | `/tutorial/start` | Start tutorial |
| POST | `/tutorial/step/:id/complete` | Complete step |
| POST | `/tutorial/skip` | Skip tutorial |

---

## Endpoint Details

### POST /auth/signup

**Request:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
}
```

**Response (201):**
```typescript
interface SignupResponse {
  success: true;
  data: {
    user: User;
    session: Session;
  };
}
```

**Errors:**
- `400`: Invalid email format, weak password
- `409`: Email already registered

---

### POST /characters

**Request:**
```typescript
interface CreateCharacterRequest {
  name: string;             // 2-50 chars
  classId: CharacterClass;  // warrior, rogue, wizard, etc.
}
```

**Response (201):**
```typescript
interface CreateCharacterResponse {
  success: true;
  data: {
    character: Character;
  };
}
```

**Errors:**
- `400`: Invalid name or class
- `409`: Character limit reached (10)
- `422`: Name failed profanity check

---

### POST /sessions

**Request:**
```typescript
interface CreateSessionRequest {
  adventureId: string;
  isPublic: boolean;
  maxPlayers: number;       // 2-6
  scheduledStart?: string;  // ISO 8601
  lookingFor?: string;      // Party composition note
}
```

**Response (201):**
```typescript
interface CreateSessionResponse {
  success: true;
  data: {
    session: Session;
    inviteCode: string;     // 6-char alphanumeric
    inviteUrl: string;
  };
}
```

**Errors:**
- `400`: Invalid adventure or player count
- `403`: Adventure not owned by user
- `404`: Adventure not found

---

### POST /dice/roll

**Request:**
```typescript
interface DiceRollRequest {
  sessionId: string;
  characterId: string;
  attribute: 'might' | 'grace' | 'wit' | 'heart';
  difficulty: number;       // 3-18
  rollType: RollType;
  modifiers?: RollModifier[];
  description?: string;
}
```

**Response (200):**
```typescript
interface DiceRollResponse {
  success: true;
  data: {
    roll: DiceRoll;
    narrativeEffect?: string;  // AI-generated flavor
  };
}
```

**Errors:**
- `403`: Not in session or not character owner
- `404`: Session or character not found
- `422`: Session not active

---

### POST /ai/advice

**Request:**
```typescript
interface AiAdviceRequest {
  sessionId: string;
  context: string;          // Current scene description
  playerAction: string;     // What player wants to do
  difficultyHint?: 'easy' | 'medium' | 'hard';
}
```

**Response (200):**
```typescript
interface AiAdviceResponse {
  success: true;
  data: {
    suggestion: string;
    ruleClarification?: string;
    narrativeHook?: string;
    suggestedRoll?: {
      attribute: Attribute;
      difficulty: number;
    };
  };
  meta: {
    responseTimeMs: number;
    cached: boolean;
  };
}
```

**Errors:**
- `403`: Not the session Seer
- `429`: AI rate limit exceeded
- `503`: AI service unavailable

---

## Request Validation

### Validation Library

Using Pydantic for Python backend:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum

class CharacterClass(str, Enum):
    WARRIOR = "warrior"
    ROGUE = "rogue"
    WIZARD = "wizard"
    CLERIC = "cleric"
    PALADIN = "paladin"
    RANGER = "ranger"
    NECROMANCER = "necromancer"

class CreateCharacterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    class_id: CharacterClass = Field(..., alias="classId")
    
    @validator('name')
    def validate_name(cls, v):
        if not v[0].isalpha():
            raise ValueError('Name must start with a letter')
        if not all(c.isalpha() or c in " '-" for c in v):
            raise ValueError('Invalid characters in name')
        return v.strip().title()
    
    class Config:
        allow_population_by_field_name = True
```

### Common Validators

```python
# Reusable validators
def validate_uuid(value: str) -> str:
    try:
        uuid.UUID(value)
        return value
    except ValueError:
        raise ValueError('Invalid UUID format')

def validate_profanity(value: str) -> str:
    if profanity_filter.contains_profanity(value):
        raise ValueError('Inappropriate content detected')
    return value

def validate_session_code(value: str) -> str:
    if not re.match(r'^[A-Z0-9]{6}$', value):
        raise ValueError('Invalid session code format')
    return value
```

---

## Error Handling

### Error Code Registry

```python
class ErrorCode:
    # Authentication (AUTH_xxx)
    AUTH_INVALID_CREDENTIALS = "AUTH_001"
    AUTH_TOKEN_EXPIRED = "AUTH_002"
    AUTH_EMAIL_NOT_VERIFIED = "AUTH_003"
    AUTH_ACCOUNT_DISABLED = "AUTH_004"
    
    # Character (CHAR_xxx)
    CHAR_NOT_FOUND = "CHAR_001"
    CHAR_LIMIT_REACHED = "CHAR_002"
    CHAR_NAME_INVALID = "CHAR_003"
    CHAR_NAME_PROFANITY = "CHAR_004"
    CHAR_NOT_OWNER = "CHAR_005"
    
    # Session (SESS_xxx)
    SESS_NOT_FOUND = "SESS_001"
    SESS_FULL = "SESS_002"
    SESS_NOT_PUBLIC = "SESS_003"
    SESS_ALREADY_STARTED = "SESS_004"
    SESS_NOT_SEER = "SESS_005"
    SESS_ALREADY_JOINED = "SESS_006"
    
    # Dice (DICE_xxx)
    DICE_INVALID_COUNT = "DICE_001"
    DICE_INVALID_DIFFICULTY = "DICE_002"
    DICE_HEROIC_USED = "DICE_003"
    DICE_HEROIC_EXPIRED = "DICE_004"
    
    # Adventure (ADV_xxx)
    ADV_NOT_FOUND = "ADV_001"
    ADV_VALIDATION_FAILED = "ADV_002"
    ADV_NOT_OWNER = "ADV_003"
    ADV_ALREADY_PUBLISHED = "ADV_004"
    
    # AI (AI_xxx)
    AI_SERVICE_UNAVAILABLE = "AI_001"
    AI_RATE_LIMITED = "AI_002"
    AI_CONTEXT_TOO_LONG = "AI_003"
```

### Error Response Factory

```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

class APIError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict = None,
        field: str = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        self.field = field

def create_error_response(error: APIError, request_id: str = None):
    return JSONResponse(
        status_code=error.status_code,
        content={
            "success": False,
            "error": {
                "code": error.code,
                "message": error.message,
                "details": error.details,
                "field": error.field,
            },
            "meta": {
                "timestamp": datetime.utcnow().isoformat(),
                "requestId": request_id,
            }
        }
    )
```

---

## Middleware & Interceptors

### Request Pipeline

```
Request → Auth → RateLimit → Validation → Handler → Response
            ↓         ↓           ↓           ↓
         Logging  Logging     Logging     Logging
```

### Authentication Middleware

```python
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer

async def authenticate(request: Request):
    """Verify JWT and attach user to request."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={"code": "AUTH_001", "message": "Missing authentication"}
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        user = await supabase.auth.get_user(token)
        request.state.user = user
    except Exception:
        raise HTTPException(
            status_code=401,
            detail={"code": "AUTH_002", "message": "Invalid or expired token"}
        )
```

### Request Logging

```python
import time
import uuid
from fastapi import Request

async def log_request(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    
    response = await call_next(request)
    
    duration_ms = (time.time() - start_time) * 1000
    
    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "user_id": getattr(request.state, "user", {}).get("id"),
        }
    )
    
    response.headers["X-Request-ID"] = request_id
    return response
```

---

## Real-time Integration

### Supabase Realtime Channels

```typescript
// Channel naming conventions
const channels = {
  session: (sessionId: string) => `session:${sessionId}`,
  publicSessions: 'public-sessions',
  userNotifications: (userId: string) => `user:${userId}:notifications`,
};

// Event types
type RealtimeEvent = 
  | { type: 'dice_roll'; payload: DiceRoll }
  | { type: 'player_joined'; payload: SessionPlayer }
  | { type: 'player_left'; payload: { playerId: string } }
  | { type: 'session_started'; payload: { sessionId: string } }
  | { type: 'session_ended'; payload: { sessionId: string; outcome: string } }
  | { type: 'scene_changed'; payload: { sceneId: string } };
```

### Event Publishing

```python
async def publish_session_event(
    session_id: str,
    event_type: str,
    payload: dict
):
    """Publish event to session channel via Supabase."""
    
    # Insert into session_events table (triggers Realtime)
    await supabase.table("session_events").insert({
        "session_id": session_id,
        "event_type": event_type,
        "payload": payload,
        "created_at": datetime.utcnow().isoformat(),
    })
```

---

## Performance Optimization

### Caching Strategy

```python
from functools import lru_cache
from redis import Redis

redis = Redis.from_url(settings.REDIS_URL)

# Cache adventure metadata (5 minute TTL)
async def get_adventure_cached(adventure_id: str):
    cache_key = f"adventure:{adventure_id}"
    
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    adventure = await db.adventures.find_one({"id": adventure_id})
    
    redis.setex(cache_key, 300, json.dumps(adventure))
    return adventure

# Invalidate on update
async def invalidate_adventure_cache(adventure_id: str):
    redis.delete(f"adventure:{adventure_id}")
```

### Query Optimization

```python
# Use select() to limit returned fields
async def list_sessions_optimized(user_id: str):
    return await supabase.table("sessions").select(
        "id, code, status, created_at, "
        "adventures(id, name, thumbnail_url), "
        "session_players(count)"
    ).eq("seer_id", user_id).execute()

# Use RPC for complex queries
async def get_session_with_players(session_id: str):
    return await supabase.rpc(
        "get_session_details",
        {"p_session_id": session_id}
    ).execute()
```

---

## Testing Requirements

### API Test Patterns

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_character_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/v1/characters",
            json={"name": "Thorn", "classId": "warrior"},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["character"]["name"] == "Thorn"
        assert data["data"]["character"]["classId"] == "warrior"

@pytest.mark.asyncio
async def test_create_character_invalid_name():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/v1/characters",
            json={"name": "A", "classId": "warrior"},  # Too short
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "CHAR_003"
        assert data["error"]["field"] == "name"

@pytest.mark.asyncio
async def test_create_character_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/v1/characters",
            json={"name": "Thorn", "classId": "warrior"}
            # No auth header
        )
        
        assert response.status_code == 401
```

### Load Testing

```yaml
# k6 load test config
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up
    { duration: '1m', target: 50 },    // Stay at 50
    { duration: '30s', target: 100 },  // Ramp to 100
    { duration: '1m', target: 100 },   // Stay at 100
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% under 200ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:8000/v1/sessions/browse');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

## Implementation Checklist

### Core Infrastructure
- [ ] Set up FastAPI application structure
- [ ] Configure Pydantic models
- [ ] Set up authentication middleware
- [ ] Set up request logging middleware
- [ ] Set up error handling middleware
- [ ] Configure CORS
- [ ] Set up Redis for caching

### Endpoints
- [ ] Implement `/auth/*` endpoints
- [ ] Implement `/characters/*` endpoints
- [ ] Implement `/sessions/*` endpoints
- [ ] Implement `/dice/*` endpoints
- [ ] Implement `/adventures/*` endpoints
- [ ] Implement `/ai/*` endpoints
- [ ] Implement `/tutorial/*` endpoints

### Real-time
- [ ] Configure Supabase Realtime
- [ ] Implement event publishing
- [ ] Test real-time subscriptions

### Testing
- [ ] Write unit tests for all endpoints
- [ ] Write integration tests
- [ ] Set up load testing
- [ ] Document API with OpenAPI/Swagger

### Documentation
- [ ] Generate OpenAPI spec
- [ ] Write API documentation
- [ ] Create Postman collection
