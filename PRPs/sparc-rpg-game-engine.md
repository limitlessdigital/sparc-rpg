name: "SPARC RPG Game Engine - Gateway Fantasy RPG Platform"
description: |
  Web-based tabletop RPG system designed as the definitive gateway RPG for newcomers. Features D6-only mechanics, 1-hour adventures, AI Seer Assistant, and comprehensive digital tools for zero-prep game mastering.

---

## Goal
Build SPARC (Simplified Playable Adventure Role-playing Core) - a complete web-based fantasy RPG platform that eliminates barriers for newcomers through cognitive offloading, intelligent AI assistance, and streamlined mechanics while maintaining engaging collaborative storytelling.

## Why
- **Market Gap**: 73% of interested potential RPG players never complete their first session due to complexity barriers
- **Accessibility Crisis**: Traditional RPGs create insurmountable barriers through complex character creation, rule panic, and GM preparation requirements  
- **Streaming Influence**: 300%+ RPG market growth driven by streaming, but existing tools don't serve newcomers
- **Business Opportunity**: Freemium model with premium adventures, AI features, and corporate team building packages
- **Technical Innovation**: AI-assisted gameplay that handles complexity transparently rather than just simplifying rules

## What
A comprehensive web-based RPG platform featuring:

1. **5-minute character creation** with single primary attribute selection
2. **Real-time multiplayer sessions** with synchronized dice rolls and scene transitions
3. **Sub-100ms dice rolling engine** with D6-only mechanics and visual feedback
4. **AI Seer Assistant** providing contextual GM guidance in under 3 seconds
5. **Episode-based adventures** with structured 1-hour scenarios
6. **Zero-prep game mastering** through intelligent digital tools
7. **Newcomer-focused onboarding** that gets players into their first adventure within 75 minutes

### Success Criteria
- [ ] 85%+ first-session completion rate
- [ ] 90%+ users engage within 5 minutes of signup  
- [ ] 80%+ new GMs report confidence running games
- [ ] <100ms P95 dice roll response time
- [ ] <3 second AI Assistant response time
- [ ] 95%+ sessions complete within 75 minutes
- [ ] 4.5/5.0+ user satisfaction rating
- [ ] <3 rule panic moments per session

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.fastapi.tiangolo.com/tutorial/websockets/
  why: Real-time game sessions implementation patterns

- url: https://docs.pydantic.dev/latest/concepts/validators/
  why: Game rule validation and character creation constraints

- url: https://platform.openai.com/docs/guides/function-calling
  why: AI Seer Assistant integration patterns

- url: https://supabase.com/docs/guides/realtime/postgres-changes
  why: Real-time game state synchronization via database triggers

- url: https://socket.io/docs/v4/
  why: Alternative real-time approach if HTTP polling insufficient

- file: archon-ui-main/src/hooks/usePolling.tsx
  why: Existing HTTP polling patterns for real-time updates

- file: python/src/server/services/projects/task_service.py
  why: Service layer patterns for game session management

- file: archon-ui-main/src/services/projectService.ts
  why: Frontend service patterns for API communication

- file: python/src/server/api_routes/projects_api.py
  why: API endpoint patterns for RESTful game operations

- docfile: CLAUDE.md
  why: Current Archon architecture using HTTP polling instead of WebSockets
```

### Current Codebase Structure (Archon Architecture)
```bash
archon-ui-main/                         # React + TypeScript + Vite + TailwindCSS
├── src/components/                     # Reusable UI components 
├── src/pages/                          # Application pages
├── src/services/                       # API communication layer
├── src/hooks/                          # React hooks (including usePolling)
└── src/contexts/                       # React context providers

python/                                 # FastAPI backend with HTTP polling
├── src/server/                         
│   ├── main.py                         # FastAPI application entry
│   ├── api_routes/                     # REST API endpoints
│   └── services/                       # Business logic services
├── src/mcp/                            # MCP server for AI integration
└── src/agents/                         # PydanticAI agent implementations

Database: Supabase (PostgreSQL + pgvector + Row Level Security)
Real-time: HTTP polling with ETag caching (NOT WebSockets)
```

### Desired SPARC Architecture Integration
```bash
# Extend existing Archon architecture for SPARC
python/src/server/
├── api_routes/
│   ├── sparc_sessions_api.py           # Game session management
│   ├── sparc_characters_api.py         # Character creation/management
│   ├── sparc_adventures_api.py         # Adventure content management
│   └── sparc_dice_api.py               # Dice rolling engine
├── services/sparc/
│   ├── session_service.py              # Game session business logic
│   ├── character_service.py            # Character creation/validation
│   ├── adventure_service.py            # Adventure content & progression
│   ├── dice_service.py                 # Dice mechanics & probability
│   ├── ai_seer_service.py              # AI GM assistance integration
│   └── tutorial_service.py             # Onboarding flow management

archon-ui-main/src/
├── pages/sparc/                        
│   ├── GameSessionPage.tsx             # Main game interface
│   ├── CharacterCreationPage.tsx       # Character wizard
│   ├── SessionBrowserPage.tsx          # Find/join games
│   └── SeerTutorialPage.tsx            # GM onboarding
├── components/sparc/
│   ├── dice/                           # Dice rolling UI components
│   ├── character/                      # Character sheet components  
│   ├── session/                        # Game session UI
│   └── ai-assistant/                   # AI Seer integration
└── services/
    └── sparcService.ts                 # SPARC API client

# Database schema additions to existing Supabase
CREATE TABLE sparc_characters (...)
CREATE TABLE sparc_sessions (...)  
CREATE TABLE sparc_adventures (...)
CREATE TABLE sparc_dice_rolls (...)
```

### Known Gotchas & Technology Constraints
```python
# CRITICAL: Archon uses HTTP polling, not WebSockets as specified in PRD
# Adapt real-time requirements to use existing polling infrastructure

# CRITICAL: Performance requirements
# <100ms dice rolls - may need WebSocket upgrade or optimized polling
# <3s AI responses - OpenAI API has variable latency, need fallback strategies

# CRITICAL: Supabase Row Level Security  
# All game data must respect RLS policies for session isolation

# CRITICAL: React + TypeScript patterns
# Follow existing Archon component patterns, not Next.js as in PRD

# GOTCHA: AI rate limiting
# OpenAI API has rate limits, need queue management for AI Seer Assistant

# GOTCHA: Session state management
# Complex game state needs careful synchronization across players

# GOTCHA: Database session isolation  
# Multiple concurrent games need proper data separation

# GOTCHA: Frontend real-time updates
# HTTP polling may not meet <100ms dice roll requirement - consider WebSocket upgrade
```

## Implementation Blueprint

### Data Models and Structure

Core game data models following existing Archon patterns:

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid

# Character System
class CharacterAttribute(BaseModel):
    name: Literal["Might", "Grace", "Wit", "Heart"]
    value: int = Field(ge=1, le=6, description="D6 attribute value")
    
class SparcCharacter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str = Field(min_length=1, max_length=50)
    primary_attribute: CharacterAttribute
    equipment: List[str] = Field(default_factory=list)
    background: str
    hit_points: int = Field(default=6, ge=1, le=6)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
# Session Management  
class SessionStatus(str, Enum):
    WAITING = "waiting"
    ACTIVE = "active" 
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SparcSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seer_id: str  # GM user ID
    adventure_id: str
    status: SessionStatus = SessionStatus.WAITING
    players: List[str] = Field(max_items=6)  # Max 6 players per PRD
    current_scene: int = Field(default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
# Dice System
class DiceRoll(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    character_id: str
    dice_count: int = Field(ge=1, le=10)
    results: List[int] = Field(min_items=1, max_items=10)
    difficulty: int = Field(ge=3, le=18) 
    success: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('results')
    def validate_dice_results(cls, v):
        if any(die < 1 or die > 6 for die in v):
            raise ValueError('All dice must be 1-6')
        return v

# AI Assistant  
class SeerAssistantRequest(BaseModel):
    session_id: str
    scene_context: str
    player_action: str
    difficulty_level: Literal["easy", "medium", "hard"]
    
class SeerAssistantResponse(BaseModel):
    suggestion: str
    rule_clarification: Optional[str] = None
    narrative_hook: Optional[str] = None
    response_time_ms: int
    
# Adventure Content
class AdventureScene(BaseModel):
    id: int
    title: str
    description: str
    objectives: List[str]
    outcomes: Dict[str, str]  # success/failure/partial outcomes
    estimated_duration_minutes: int
    
class SparcAdventure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    difficulty: Literal["newcomer", "casual", "experienced"]
    estimated_duration: int = Field(default=60)  # minutes
    scenes: List[AdventureScene]
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### List of tasks to be completed to fulfill the PRP in order

```yaml
Task 1: Database Schema & Core Models
CREATE python/src/server/services/sparc/models.py:
  - IMPLEMENT: All Pydantic models above with validation
  - CREATE: SQL migration for Supabase tables
  - IMPLEMENT: Row Level Security policies for session isolation
  - PRESERVE: Existing Supabase connection patterns

Task 2: Character Creation Service & API
CREATE python/src/server/services/sparc/character_service.py:
  - PATTERN: Mirror existing service structure from task_service.py
  - IMPLEMENT: create_character() with 3-choice wizard logic
  - IMPLEMENT: Auto-assignment of equipment and background
  - IMPLEMENT: Character validation and storage
CREATE python/src/server/api_routes/sparc_characters_api.py:
  - PATTERN: Copy structure from projects_api.py
  - IMPLEMENT: POST /api/sparc/characters endpoint
  - IMPLEMENT: GET /api/sparc/characters/{user_id} endpoint

Task 3: Dice Rolling Engine (Performance Critical)
CREATE python/src/server/services/sparc/dice_service.py:
  - IMPLEMENT: roll_dice() with <100ms target response time
  - IMPLEMENT: Difficulty calculation and success determination
  - IMPLEMENT: Dice roll history and statistics
  - IMPLEMENT: Batch rolling for multiple dice
CREATE python/src/server/api_routes/sparc_dice_api.py:
  - IMPLEMENT: POST /api/sparc/dice/roll endpoint
  - IMPLEMENT: WebSocket consideration for <100ms requirement
  - IMPLEMENT: Real-time roll broadcasting via HTTP polling

Task 4: AI Seer Assistant Integration  
CREATE python/src/server/services/sparc/ai_seer_service.py:
  - PATTERN: Use existing OpenAI integration patterns from agents/
  - IMPLEMENT: get_seer_advice() with <3s response requirement
  - IMPLEMENT: Context-aware prompting based on game state
  - IMPLEMENT: Fallback strategies for API failures/rate limits
  - IMPLEMENT: Response caching for common scenarios
CREATE python/src/server/api_routes/sparc_ai_api.py:
  - IMPLEMENT: POST /api/sparc/ai/advice endpoint
  - IMPLEMENT: Streaming responses for better perceived performance

Task 5: Game Session Management
CREATE python/src/server/services/sparc/session_service.py:
  - IMPLEMENT: create_session(), join_session(), start_session()
  - IMPLEMENT: Real-time state synchronization logic
  - IMPLEMENT: Session progression and scene management
  - IMPLEMENT: Player management (join/leave/kick)
CREATE python/src/server/api_routes/sparc_sessions_api.py:
  - IMPLEMENT: Complete CRUD operations for sessions
  - IMPLEMENT: Real-time updates via HTTP polling integration

Task 6: Adventure Content System
CREATE python/src/server/services/sparc/adventure_service.py:
  - IMPLEMENT: Adventure loading and progression tracking
  - IMPLEMENT: Scene transitions and outcome processing
  - IMPLEMENT: Dynamic content generation hooks
CREATE python/src/server/api_routes/sparc_adventures_api.py:
  - IMPLEMENT: Adventure catalog and content delivery
  - IMPLEMENT: Progress tracking endpoints

Task 7: Frontend Character Creation Wizard  
CREATE archon-ui-main/src/pages/sparc/CharacterCreationPage.tsx:
  - PATTERN: Follow existing page structure from ProjectPage.tsx
  - IMPLEMENT: 3-step wizard UI completing in <5 minutes
  - IMPLEMENT: Single primary attribute selection
  - IMPLEMENT: Auto-generated equipment and background display
  - IMPLEMENT: Visual character sheet preview
CREATE archon-ui-main/src/components/sparc/character/:
  - CharacterWizard.tsx, AttributeSelector.tsx, CharacterPreview.tsx

Task 8: Frontend Game Session Interface
CREATE archon-ui-main/src/pages/sparc/GameSessionPage.tsx:
  - IMPLEMENT: Main game interface with character sheets
  - IMPLEMENT: Dice rolling UI with <100ms feedback
  - IMPLEMENT: Chat/communication system
  - IMPLEMENT: Scene progression display
CREATE archon-ui-main/src/components/sparc/session/:
  - GameBoard.tsx, PlayerList.tsx, DiceRoller.tsx, ChatPanel.tsx

Task 9: Frontend AI Seer Assistant  
CREATE archon-ui-main/src/components/sparc/ai-assistant/:
  - SeerPanel.tsx for GM advice interface
  - AdviceDisplay.tsx for contextual suggestions
  - RuleClarification.tsx for rule lookups
  - IMPLEMENT: Real-time advice requests with loading states

Task 10: Real-time Integration & Polling
MODIFY archon-ui-main/src/hooks/usePolling.tsx:
  - ENHANCE: Game-specific polling for session state
  - IMPLEMENT: Optimized polling intervals for dice rolls
  - IMPLEMENT: Smart pausing for inactive game tabs
CREATE archon-ui-main/src/services/sparcService.ts:
  - PATTERN: Mirror projectService.ts structure  
  - IMPLEMENT: Complete API client for all SPARC endpoints
  - IMPLEMENT: Real-time state management integration

Task 11: Tutorial & Onboarding System
CREATE python/src/server/services/sparc/tutorial_service.py:
  - IMPLEMENT: 10-minute Seer tutorial flow
  - IMPLEMENT: New player onboarding tracking
  - IMPLEMENT: Progress checkpoints and completion metrics
CREATE archon-ui-main/src/pages/sparc/SeerTutorialPage.tsx:
  - IMPLEMENT: Interactive GM tutorial interface
  - IMPLEMENT: Practice scenarios and feedback

Task 12: Performance Optimization & Caching
MODIFY python/src/server/services/sparc/:
  - IMPLEMENT: Redis caching for frequently accessed game data
  - IMPLEMENT: Database query optimization for session data
  - IMPLEMENT: AI response caching for common scenarios
  - IMPLEMENT: Dice roll result streaming optimization
```

### Task Implementation Pseudocode

```python
# Task 3: Dice Rolling Engine Core Logic (Performance Critical)
class DiceService:
    def __init__(self, redis_client=None):
        self.redis = redis_client  # For caching frequent rolls
        
    async def roll_dice(
        self, 
        session_id: str,
        character_id: str, 
        dice_count: int,
        difficulty: int,
        attribute_bonus: int = 0
    ) -> DiceRoll:
        """
        CRITICAL: Must complete in <100ms for 95% of requests
        PATTERN: Use existing FastAPI async patterns
        GOTCHA: Random number generation must be cryptographically secure
        """
        import secrets
        import time
        
        start_time = time.perf_counter()
        
        # Generate dice results - use secrets for fairness
        results = [secrets.randbelow(6) + 1 for _ in range(dice_count)]
        
        # Calculate success/failure  
        total = sum(results) + attribute_bonus
        success = total >= difficulty
        
        # Store in database (async, non-blocking)
        dice_roll = DiceRoll(
            session_id=session_id,
            character_id=character_id,
            dice_count=dice_count,
            results=results,
            difficulty=difficulty, 
            success=success
        )
        
        # CRITICAL: Database insert must not delay response
        asyncio.create_task(self._store_roll_async(dice_roll))
        
        # CRITICAL: Broadcast to session via HTTP polling system
        asyncio.create_task(self._broadcast_roll(session_id, dice_roll))
        
        end_time = time.perf_counter()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # CRITICAL: Log if response time exceeds target
        if response_time_ms > 100:
            logger.warning(f"Dice roll exceeded 100ms: {response_time_ms}ms")
            
        return dice_roll

# Task 4: AI Seer Assistant Core Logic
class AISeerService:
    def __init__(self, openai_client, redis_client=None):
        self.openai = openai_client
        self.redis = redis_client
        self.response_cache = {}  # In-memory cache for session
        
    async def get_seer_advice(
        self, 
        request: SeerAssistantRequest
    ) -> SeerAssistantResponse:
        """
        CRITICAL: Must respond in <3 seconds
        PATTERN: Use existing OpenAI integration from agents/
        GOTCHA: Rate limiting requires queue management
        """
        start_time = time.perf_counter()
        
        # Check cache first for common scenarios
        cache_key = self._generate_cache_key(request)
        if cached_response := self.response_cache.get(cache_key):
            logger.info(f"Cache hit for seer advice: {cache_key}")
            return cached_response
            
        try:
            # CRITICAL: Use timeout to enforce <3s requirement
            response = await asyncio.wait_for(
                self._generate_ai_response(request),
                timeout=2.5  # Leave 0.5s buffer
            )
            
            end_time = time.perf_counter()
            response_time_ms = int((end_time - start_time) * 1000)
            
            seer_response = SeerAssistantResponse(
                suggestion=response.suggestion,
                rule_clarification=response.rule_clarification,
                narrative_hook=response.narrative_hook,
                response_time_ms=response_time_ms
            )
            
            # Cache successful responses
            self.response_cache[cache_key] = seer_response
            
            return seer_response
            
        except asyncio.TimeoutError:
            # CRITICAL: Graceful fallback for timeout
            logger.warning(f"AI Seer timeout for session {request.session_id}")
            return SeerAssistantResponse(
                suggestion="Continue with the scene as you see fit - your instincts are good!",
                response_time_ms=3000
            )
        except Exception as e:
            # CRITICAL: Never fail - always provide fallback
            logger.error(f"AI Seer error: {e}")
            return self._get_fallback_response(request)
```

### Integration Points
```yaml
DATABASE (Supabase):
  - tables: sparc_characters, sparc_sessions, sparc_adventures, sparc_dice_rolls
  - rls: Row Level Security for session isolation
  - triggers: Real-time notifications for game state changes
  - indexes: Optimized queries for session lookups and dice roll history

API ROUTES:
  - pattern: app.include_router(sparc_router, prefix="/api/sparc")  
  - endpoints: Complete REST API for all game operations
  - polling: Integration with existing HTTP polling system

SERVICES:
  - integration: Extend existing service patterns
  - caching: Redis for performance-critical operations  
  - ai: OpenAI integration for Seer Assistant

FRONTEND:
  - routing: Extend existing React Router configuration
  - polling: Use existing usePolling hooks for real-time updates
  - styling: Consistent TailwindCSS patterns
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding  
cd python
uv run ruff check src/server/services/sparc/ --fix
uv run mypy src/server/services/sparc/
uv run ruff check src/server/api_routes/sparc_* --fix
uv run mypy src/server/api_routes/sparc_*

cd ../archon-ui-main  
npm run lint
npm run typecheck

# Expected: No errors. Fix any issues before continuing.
```

### Level 2: Unit Tests
```python
# CREATE tests/test_sparc_integration.py with critical test cases:
def test_character_creation_wizard():
    """Test 5-minute character creation flow"""
    service = CharacterService()
    character_data = {
        "name": "Test Hero", 
        "primary_attribute": {"name": "Might", "value": 4}
    }
    character = await service.create_character("user123", character_data)
    assert character.name == "Test Hero"
    assert character.primary_attribute.value == 4
    assert len(character.equipment) > 0  # Auto-assigned
    assert character.background  # Auto-assigned

def test_dice_roll_performance():
    """Test dice rolling meets <100ms requirement"""
    service = DiceService()
    start_time = time.perf_counter()
    
    roll = await service.roll_dice(
        session_id="test", 
        character_id="char123",
        dice_count=3,
        difficulty=12
    )
    
    end_time = time.perf_counter()
    response_time_ms = (end_time - start_time) * 1000
    
    assert response_time_ms < 100, f"Dice roll took {response_time_ms}ms"
    assert len(roll.results) == 3
    assert all(1 <= die <= 6 for die in roll.results)

def test_ai_seer_assistant_performance():
    """Test AI responses meet <3s requirement with fallback"""
    service = AISeerService(mock_openai_client)
    
    request = SeerAssistantRequest(
        session_id="test",
        scene_context="Players entering a dark forest",
        player_action="I want to search for tracks",
        difficulty_level="medium"
    )
    
    start_time = time.perf_counter()
    response = await service.get_seer_advice(request)
    end_time = time.perf_counter()
    
    response_time_ms = (end_time - start_time) * 1000
    assert response_time_ms < 3000, f"AI response took {response_time_ms}ms" 
    assert len(response.suggestion) > 0
    assert response.response_time_ms > 0

def test_session_real_time_updates():
    """Test session state synchronization via HTTP polling"""
    service = SessionService()
    session = await service.create_session("seer123", "adventure456")
    
    # Simulate player joining
    await service.join_session(session.id, "player789")
    
    # Verify session state updated
    updated_session = await service.get_session(session.id)
    assert "player789" in updated_session.players
    
    # Verify polling endpoint returns updated data
    # This tests integration with HTTP polling system

def test_newcomer_onboarding_flow():
    """Test complete newcomer experience under 75 minutes"""
    # This would be an integration test covering:
    # 1. Account creation (social login)
    # 2. Character creation wizard (5 minutes)
    # 3. Tutorial completion (10 minutes) 
    # 4. Joining first session (60 minutes gameplay)
    # Total: 75 minutes max
    pass
```

```bash
# Run and iterate until passing:
cd python
uv run pytest tests/test_sparc_integration.py -v
uv run pytest tests/test_performance.py -v  # Performance-specific tests

cd ../archon-ui-main
npm run test -- sparc
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test  
```bash
# Start all services
cd python  
uv run python -m src.server.main

# Test character creation flow
curl -X POST http://localhost:8181/api/sparc/characters \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "name": "Test Hero", 
    "primary_attribute": {"name": "Might", "value": 4}
  }'

# Test dice rolling performance
time curl -X POST http://localhost:8181/api/sparc/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "character_id": "test-char",
    "dice_count": 3,
    "difficulty": 12
  }'
# Expected: Response time <100ms

# Test AI Seer Assistant
time curl -X POST http://localhost:8181/api/sparc/ai/advice \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "scene_context": "Players entering dark forest",
    "player_action": "Search for tracks",
    "difficulty_level": "medium"
  }'
# Expected: Response time <3000ms

# Test session creation and joining  
curl -X POST http://localhost:8181/api/sparc/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "seer_id": "test-seer",
    "adventure_id": "intro-forest"
  }'

# Test real-time polling integration
# Frontend should show updates within 1-2 seconds
```

### Level 4: End-to-End User Experience
```bash
# Complete newcomer flow test:
1. Start development server: npm run dev (port 3737)
2. Navigate to http://localhost:3737/sparc/character-creation
3. Complete character creation in <5 minutes
4. Join tutorial session
5. Complete Seer tutorial in <10 minutes  
6. Create or join first adventure session
7. Play complete adventure in ~60 minutes
8. Verify all performance targets met:
   - Dice rolls feel instant (<100ms)
   - AI advice appears quickly (<3s) 
   - No rule panic moments
   - Session completes satisfactorily

# Performance monitoring:
- Monitor dice roll latency distribution
- Track AI response time percentiles  
- Measure session completion rates
- Monitor user drop-off points
```

## Final Validation Checklist
- [ ] All tests pass: `uv run pytest tests/test_sparc_integration.py -v`
- [ ] Performance tests pass: `uv run pytest tests/test_performance.py -v` 
- [ ] No linting errors: `uv run ruff check src/server/services/sparc/`
- [ ] No type errors: `uv run mypy src/server/services/sparc/`
- [ ] Frontend tests pass: `npm run test -- sparc`
- [ ] Character creation completes in <5 minutes
- [ ] Dice rolls respond in <100ms P95
- [ ] AI Seer Assistant responds in <3 seconds
- [ ] Sessions support 6 concurrent players
- [ ] Real-time updates via HTTP polling work smoothly
- [ ] Newcomer onboarding flow completes in <75 minutes
- [ ] Database RLS policies properly isolate sessions
- [ ] All API endpoints return proper error handling
- [ ] Performance monitoring and logging in place

---

## Anti-Patterns to Avoid
- ❌ Don't use WebSockets initially - work with existing HTTP polling first
- ❌ Don't over-engineer dice mechanics - keep D6-only simplicity
- ❌ Don't skip performance requirements - <100ms dice, <3s AI are critical
- ❌ Don't ignore newcomer focus - every UI decision should serve beginners
- ❌ Don't create complex RPG rules - cognitive offloading is the goal
- ❌ Don't assume OpenAI API availability - always have fallbacks
- ❌ Don't break existing Archon patterns - extend, don't replace
- ❌ Don't skip RLS policies - session isolation is security critical
- ❌ Don't ignore caching - performance requires strategic caching
- ❌ Don't overcomplicate real-time - HTTP polling should work for MVP

## PRP Quality Score: 9/10
**Confidence Level**: Very High - Comprehensive implementation plan with clear architecture adaptation, performance requirements, and extensive validation strategy.

**Deduction reasons**: 
- -1 Real-time performance (<100ms dice) may require WebSocket upgrade from HTTP polling

**Strengths**:
+ Complete architecture adaptation from Next.js/tRPC to FastAPI/React
+ Detailed performance requirements with fallback strategies
+ Comprehensive data models with proper validation
+ Extensive testing strategy covering user experience goals
+ Clear integration with existing Archon infrastructure
+ Focus on newcomer experience throughout implementation
+ Detailed anti-patterns to avoid common mistakes
+ Business success metrics clearly mapped to technical implementation