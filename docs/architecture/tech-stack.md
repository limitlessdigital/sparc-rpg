# SPARC Technology Stack

## Architecture Overview

SPARC RPG is a microservices-based RPG adventure creation platform with real-time collaboration capabilities:

### Core Services
- **Frontend (port 3737)**: React + TypeScript + Vite + TailwindCSS
- **Main Server (port 8181)**: FastAPI with HTTP polling for updates
- **MCP Server (port 8051)**: Lightweight HTTP-based MCP protocol server
- **Agents Service (port 8052)**: PydanticAI agents for AI/ML operations
- **Database**: Supabase (PostgreSQL + pgvector for embeddings)

## Frontend Stack

### Core Framework
- **React 18** - Component-based UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tooling and development server
- **TailwindCSS** - Utility-first CSS framework

### UI Libraries
- **React Router** - Client-side routing
- **React Hook Form** - Form state management
- **Headless UI** - Unstyled accessible components
- **Lucide React** - Icon library

### State Management
- **React Context** - Component state sharing
- **Custom Hooks** - Reusable state logic
- **HTTP Polling** - Real-time data synchronization (replaced Socket.IO)

### Testing & Quality
- **Vitest** - Unit and integration testing
- **Cypress** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Backend Stack

### Core Framework
- **FastAPI** - High-performance async Python web framework
- **Python 3.12** - Latest Python with performance improvements
- **Pydantic** - Data validation and serialization
- **SQLAlchemy** - Database ORM

### Database & Storage
- **Supabase/PostgreSQL** - Primary database with real-time features
- **pgvector** - Vector embeddings for AI/RAG functionality
- **Redis** - Session management and real-time collaboration caching
- **AWS S3/CloudFront** - Image storage and CDN

### AI & ML
- **OpenAI API** - Language model integration
- **PydanticAI** - AI agent framework
- **Embeddings** - Vector search for knowledge management

### Development Tools
- **uv** - Fast Python package manager
- **Ruff** - Python linting and formatting
- **Mypy** - Static type checking
- **pytest** - Testing framework

## Infrastructure & Deployment

### Development Environment
- **Docker Compose** - Service orchestration
- **Local Development** - All services run locally
- **Hot Reload** - Fast development feedback

### Production Deployment
- **Kubernetes** - Container orchestration
- **NGINX** - Load balancing and SSL termination
- **PostgreSQL with Read Replicas** - Database scaling
- **Redis Cluster** - Session management scaling

## Adventure Forge Specific Tech

### Canvas & Node System
- **Custom WebGL/Canvas** - High-performance node rendering
- **Fabric.js** - Canvas manipulation library (alternative)
- **Bezier Curves** - Smart connection routing
- **Touch Gestures** - Mobile-optimized interactions

### Real-Time Collaboration
- **WebSocket Connections** - Real-time event propagation
- **Operational Transform** - Conflict resolution
- **Event Sourcing** - Complete audit trails
- **CQRS Pattern** - Read/write optimization

### Validation System
- **Rule Engine** - Pluggable validation rules
- **Real-Time Validation** - As-you-type error detection
- **Schema Validation** - Pydantic-based data validation

## Mobile Optimization

### Touch & Gestures
- **React Use Gesture** - Advanced gesture recognition
- **Touch Targets** - Minimum 60px for accessibility
- **Gesture Feedback** - Visual indicators for active gestures

### Performance
- **Virtual Rendering** - Only render viewport nodes
- **Debounced Operations** - Reduce excessive API calls
- **Optimized Connections** - Path memoization for rendering

## Security Stack

### Authentication & Authorization
- **JWT Tokens** - Stateless authentication
- **Role-Based Access Control** - Adventure permissions
- **Session Management** - Secure session handling

### Data Protection
- **AES-256 Encryption** - Data encryption at rest
- **TLS 1.3** - Network security
- **Input Validation** - Comprehensive sanitization
- **Rate Limiting** - API protection
- **Audit Logging** - Complete modification trails

## API Architecture

### Communication Patterns
- **REST API** - Standard HTTP endpoints
- **HTTP Polling** - Real-time updates (1-2s intervals)
- **ETag Caching** - Bandwidth optimization (~70% reduction)
- **WebSocket Events** - Collaboration updates

### Data Flow
- **Command Query Responsibility Segregation (CQRS)**
- **Event-Driven Architecture** - Real-time updates
- **Microservices** - Independent scaling
- **Circuit Breaker Pattern** - Fault tolerance

## Development Workflow

### Package Management
- **Frontend**: `npm` with `package.json`
- **Backend**: `uv` with `pyproject.toml`
- **Docker**: Multi-stage builds for optimization

### Quality Assurance
- **Automated Testing** - Unit, integration, e2e
- **Type Checking** - TypeScript + Mypy
- **Linting** - ESLint + Ruff
- **Pre-commit Hooks** - Quality gates

### Monitoring & Observability
- **Logfire** - Application monitoring (optional)
- **Error Tracking** - Comprehensive error reporting
- **Performance Metrics** - API latency, database performance
- **Business Metrics** - Adventure creation, collaboration usage