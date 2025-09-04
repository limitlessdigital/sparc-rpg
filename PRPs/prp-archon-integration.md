name: "PRP-Archon Integration - Automated Project Workflow"
description: |
  Simple integration feature that automatically saves PRPs to Archon projects and creates corresponding tasks from implementation blueprints.

---

## Goal
Build a streamlined integration that automatically saves PRP documents to specified Archon projects and creates corresponding tasks from the PRP's implementation blueprint, eliminating manual project setup overhead.

## Why
- **Workflow Automation**: Remove manual steps between PRP creation and project execution
- **Consistency**: Ensure all PRP tasks are properly tracked in the project management system
- **Simplicity**: Keep the developer focused on implementation, not project setup
- **Integration**: Bridge the gap between planning (PRPs) and execution (Archon projects)

## What
A simple integration feature that:
1. Accepts a PRP document and target project ID
2. Saves the PRP as a project document in Archon
3. Parses the implementation tasks from the PRP
4. Creates corresponding Archon tasks with proper linking
5. Returns confirmation with created task IDs

### Success Criteria
- [x] PRP documents are automatically saved to specified Archon projects
- [x] Implementation tasks from PRPs are created as Archon tasks
- [x] Tasks maintain proper ordering and relationships
- [x] Process completes in under 10 seconds for typical PRPs
- [x] Error handling gracefully manages malformed PRPs or invalid project IDs

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: archon-ui-main/src/services/projectService.ts
  why: Existing patterns for creating documents and tasks via API

- file: archon-ui-main/src/components/project-tasks/DocsTab.tsx  
  why: How documents are currently saved to projects, PRP templates structure

- file: python/src/mcp_server/features/tasks/task_tools.py
  why: MCP task creation patterns and parameters

- file: python/src/mcp_server/features/documents/document_tools.py
  why: Document creation patterns and PRP document types

- file: python/src/server/api_routes/projects_api.py
  why: API endpoints for project operations (create_task, document creation)

- file: PRPs/templates/prp_base.md
  why: Standard PRP structure with implementation blueprint format
```

### Current Codebase Structure
```bash
archon-ui-main/
├── src/services/
│   └── projectService.ts        # Document & task creation methods
└── src/components/project-tasks/
    └── DocsTab.tsx             # PRP template system

python/
├── src/mcp_server/features/
│   ├── tasks/task_tools.py     # MCP task creation tools
│   └── documents/document_tools.py  # Document creation tools
├── src/server/api_routes/
│   └── projects_api.py         # REST API for projects/tasks
└── src/server/services/projects/
    ├── task_service.py         # Core task business logic  
    └── project_service.py      # Core project business logic
```

### Desired Integration Points
```bash
# Add new utility functions - keep simple
python/
├── src/server/services/
│   └── prp_integration_service.py  # New: PRP parsing & integration logic
└── src/server/api_routes/
    └── prp_api.py                   # New: Simple POST /api/prp/integrate endpoint

# No frontend changes needed - use existing MCP tools or direct API calls
```

### Known Gotchas & Library Quirks
```python
# CRITICAL: Archon uses specific task status values
# Must use: "todo", "doing", "review", "done" (not "pending", "in-progress", etc.)

# CRITICAL: Document types in Archon
# Use document_type: "prp" for PRP documents

# CRITICAL: Task ordering
# Use task_order field for sequence (0-100, higher = more priority)

# CRITICAL: Project ID validation
# Always validate project exists before creating documents/tasks

# GOTCHA: PRP task parsing
# PRPs use YAML format in "list of tasks" section, need robust parsing

# GOTCHA: Task relationships
# Use feature field to group related tasks from same PRP
```

## Implementation Blueprint

### Data Models and Structure
```python
# Simple data models for integration
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PRPTaskSpec(BaseModel):
    """Parsed task from PRP implementation blueprint"""
    title: str
    description: str = ""
    order: int
    files: List[str] = []
    dependencies: List[str] = []

class PRPIntegrationRequest(BaseModel):
    """Request to integrate PRP with Archon project"""
    project_id: str = Field(..., description="Target Archon project ID")
    prp_content: Dict[str, Any] = Field(..., description="Full PRP document content")
    prp_title: str = Field(..., description="PRP document title")
    
class PRPIntegrationResponse(BaseModel):
    """Response from PRP integration"""
    document_id: str
    created_tasks: List[str]
    message: str
    status: str = "success"
```

### List of tasks to be completed to fulfill the PRP in order

```yaml
Task 1: Create PRP Integration Service
CREATE python/src/server/services/prp_integration_service.py:
  - PATTERN: Mirror structure from existing services in same directory
  - IMPLEMENT: parse_prp_tasks() method to extract tasks from PRP blueprint
  - IMPLEMENT: create_prp_document() method using existing document patterns
  - IMPLEMENT: create_prp_tasks() method using existing task creation patterns
  - PRESERVE: All existing error handling patterns from projectService

Task 2: Create PRP API Endpoint  
CREATE python/src/server/api_routes/prp_api.py:
  - PATTERN: Copy structure from projects_api.py
  - IMPLEMENT: POST /api/prp/integrate endpoint
  - INJECT: PRPIntegrationService dependency
  - PRESERVE: Same error handling and validation patterns as other APIs

Task 3: Register PRP API Routes
MODIFY python/src/server/main.py:
  - FIND: Other router includes around line 50-60
  - INJECT: prp_router import and include after existing routers  
  - PRESERVE: Existing router pattern and prefix structure

Task 4: Add Integration Tests
CREATE python/tests/test_prp_integration.py:
  - PATTERN: Mirror test structure from test_api_essentials.py
  - IMPLEMENT: Test PRP parsing with various formats
  - IMPLEMENT: Test document creation integration
  - IMPLEMENT: Test task creation with proper ordering
  - IMPLEMENT: Test error cases (invalid project, malformed PRP)

Task 5: Add Simple Validation
MODIFY python/src/server/services/prp_integration_service.py:
  - IMPLEMENT: Basic PRP structure validation
  - IMPLEMENT: Project ID existence check
  - IMPLEMENT: Graceful handling of missing task blueprint sections
  - PRESERVE: Service layer error handling patterns
```

### Task Implementation Pseudocode

```python
# Task 1: PRP Integration Service Core Logic
class PRPIntegrationService:
    def parse_prp_tasks(self, prp_content: Dict[str, Any]) -> List[PRPTaskSpec]:
        """Extract tasks from PRP implementation blueprint section"""
        # PATTERN: Look for 'implementation_blueprint' or 'list of tasks' section
        # GOTCHA: Handle both YAML and markdown task formats
        # CRITICAL: Maintain task ordering from PRP
        tasks = []
        blueprint = prp_content.get('implementation_blueprint', {})
        
        # Extract from different PRP template formats
        if 'phase_1_foundation' in blueprint:
            # Handle phased approach PRP template
            for phase_key, phase_data in blueprint.items():
                if isinstance(phase_data, dict) and 'tasks' in phase_data:
                    for i, task in enumerate(phase_data['tasks']):
                        tasks.append(PRPTaskSpec(
                            title=task['title'],
                            description=task.get('details', ''),
                            order=len(tasks) + 1,
                            files=task.get('files', [])
                        ))
        
        return tasks

    async def integrate_prp_with_project(
        self, 
        project_id: str, 
        prp_content: Dict[str, Any],
        prp_title: str
    ) -> PRPIntegrationResponse:
        """Main integration method - creates document and tasks"""
        # PATTERN: Validate project exists first (see existing project services)
        # PATTERN: Use existing document creation service
        # PATTERN: Use existing task creation service with proper ordering
        # CRITICAL: Use 'prp' as document_type
        # CRITICAL: Use 'todo' as default task status
        # CRITICAL: Group tasks with feature='prp-' + document_id
        
        # Step 1: Validate project exists
        # Step 2: Create PRP document  
        # Step 3: Parse tasks from PRP
        # Step 4: Create tasks with proper ordering
        # Step 5: Return integration results
        pass
```

### Integration Points
```yaml
DATABASE:
  - No schema changes needed - uses existing projects, tasks, documents tables
  
API ROUTES:
  - add to: python/src/server/main.py
  - pattern: app.include_router(prp_router, prefix="/api/prp")
  
SERVICES:
  - integrate with: TaskService for task creation
  - integrate with: ProjectService for document creation
  - pattern: Inject dependencies like other services
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
cd python
uv run ruff check src/server/services/prp_integration_service.py --fix
uv run mypy src/server/services/prp_integration_service.py

# Expected: No errors. If errors exist, fix them before continuing.
```

### Level 2: Unit Tests  
```python
# CREATE test_prp_integration.py with these key test cases:
def test_parse_prp_tasks_phased_format():
    """Test parsing tasks from phased PRP format"""
    prp_content = {
        'implementation_blueprint': {
            'phase_1_foundation': {
                'tasks': [
                    {'title': 'Create models', 'details': 'Set up data models'}
                ]
            }
        }
    }
    service = PRPIntegrationService()
    tasks = service.parse_prp_tasks(prp_content)
    assert len(tasks) == 1
    assert tasks[0].title == 'Create models'

def test_integration_with_valid_project():
    """Test full integration with existing project"""
    # Test with real project ID and well-formed PRP
    # Verify document creation and task creation
    pass

def test_integration_with_invalid_project():
    """Test graceful handling of invalid project ID"""
    with pytest.raises(ValidationError):
        # Test with non-existent project ID
        pass
```

```bash
# Run and iterate until passing:
cd python
uv run pytest tests/test_prp_integration.py -v
# If failing: Read error, fix code, re-run (don't mock core functionality)
```

### Level 3: Integration Test
```bash
# Start the service
cd python
uv run python -m src.server.main

# Test the endpoint with sample PRP
curl -X POST http://localhost:8181/api/prp/integrate \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "cc737569-c79d-437f-9465-5e2552310627",
    "prp_title": "Test Integration",
    "prp_content": {
      "goal": "Test PRP integration",
      "implementation_blueprint": {
        "phase_1_foundation": {
          "tasks": [
            {"title": "Create test models", "details": "Set up test data models"}
          ]
        }
      }
    }
  }'

# Expected: {"status": "success", "document_id": "...", "created_tasks": ["..."], "message": "PRP integrated successfully"}
```

## Final Validation Checklist
- [ ] All tests pass: `uv run pytest tests/test_prp_integration.py -v`
- [ ] No linting errors: `uv run ruff check src/server/services/prp_integration_service.py`
- [ ] No type errors: `uv run mypy src/server/services/prp_integration_service.py`
- [ ] Integration test successful with sample PRP
- [ ] Document created with correct type 'prp' in target project
- [ ] Tasks created with proper ordering and status 'todo'
- [ ] Error cases handled gracefully (invalid project, malformed PRP)
- [ ] Tasks grouped by feature for easy management

---

## Anti-Patterns to Avoid
- ❌ Don't create complex PRP parsing - keep it simple and robust
- ❌ Don't skip project validation - always verify project exists
- ❌ Don't hardcode task status - use existing constants
- ❌ Don't create new database tables - use existing schema
- ❌ Don't overcomplicate the API - single endpoint for integration
- ❌ Don't ignore task ordering - preserve PRP sequence

## PRP Quality Score: 8/10
**Confidence Level**: High - leverages existing patterns, clear implementation path, comprehensive validation, and focuses on simplicity as requested.

**Deduction reasons**: 
- -1 PRP parsing might need iteration for different PRP formats
- -1 Task relationship modeling could be more sophisticated

**Strengths**:
+ Clear implementation blueprint with existing patterns
+ Comprehensive error handling strategy  
+ Simple, focused feature scope
+ Leverages all existing Archon infrastructure
+ Thorough validation loops