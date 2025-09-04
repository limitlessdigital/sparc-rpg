from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from pathlib import Path

from .api_routes.sparc_characters_api import router as characters_router
from .api_routes.sparc_dice_api import router as dice_router  
from .api_routes.sparc_ai_api import router as ai_router
from .api_routes.sparc_sessions_api import router as sessions_router
from .api_routes.sparc_polling_api import router as polling_router
from .api_routes.sparc_tutorial import router as tutorial_router
from .api_routes.sparc_adventure import router as adventure_router
from .api_routes.sparc_progression import router as progression_router

# Create FastAPI app
app = FastAPI(
    title="SPARC Game Engine",
    description="Simplified Playable Adventure Role-playing Core - Gateway Fantasy RPG Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3737", "http://127.0.0.1:3737"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "SPARC Game Engine",
        "version": "1.0.0",
        "components": {
            "character_service": "operational",
            "dice_engine": "operational", 
            "ai_seer": "operational",
            "database": "not_connected"  # TODO: Add actual database connection check
        }
    }

# API Performance endpoint
@app.get("/api/performance")
async def get_api_performance():
    """Get overall API performance statistics."""
    try:
        # Import here to avoid circular imports
        from .api_routes.sparc_dice_api import dice_engine
        from .api_routes.sparc_ai_api import ai_seer
        
        dice_stats = dice_engine.get_performance_stats()
        ai_stats = ai_seer.get_performance_stats()
        
        return {
            "overall_status": "healthy",
            "services": {
                "dice_engine": {
                    "healthy": dice_stats["healthy"],
                    "avg_response_ms": dice_stats["avg_time_ms"],
                    "p95_response_ms": dice_stats["p95_time_ms"],
                    "target_ms": dice_stats["performance_target_ms"],
                    "total_requests": dice_stats["total_rolls"]
                },
                "ai_seer": {
                    "healthy": ai_stats["healthy"],
                    "avg_response_s": ai_stats["avg_time_s"],
                    "p95_response_s": ai_stats["p95_time_s"],
                    "target_s": ai_stats["performance_target_s"],
                    "total_requests": ai_stats["total_requests"]
                }
            },
            "performance_targets": {
                "dice_rolls": "<100ms P95",
                "ai_responses": "<3s P95", 
                "character_creation": "<5 minutes total",
                "session_uptime": "99.5%"
            }
        }
        
    except Exception as e:
        return {
            "overall_status": "degraded",
            "error": str(e),
            "services": {
                "dice_engine": "unknown",
                "ai_seer": "unknown"
            }
        }

# Include API routers
app.include_router(characters_router)
app.include_router(dice_router)
app.include_router(ai_router)
app.include_router(sessions_router)
app.include_router(polling_router)
app.include_router(tutorial_router)
app.include_router(adventure_router)
app.include_router(progression_router)

# Serve static files from frontend build (for production)
frontend_build_path = Path(__file__).parent.parent.parent.parent / "archon-ui-main" / "dist"
if frontend_build_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_build_path / "assets")), name="static")
    
    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_frontend(full_path: str):
        """Serve React frontend for all non-API routes."""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        index_file = frontend_build_path / "index.html"
        if index_file.exists():
            return HTMLResponse(content=index_file.read_text(), status_code=200)
        else:
            return HTMLResponse(content="Frontend not built. Run 'npm run build' in archon-ui-main/", status_code=404)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - redirects to frontend in production."""
    if frontend_build_path.exists():
        return HTMLResponse(content=(frontend_build_path / "index.html").read_text())
    else:
        return {
            "message": "SPARC Game Engine API",
            "version": "1.0.0",
            "status": "development",
            "frontend": "not built - run 'npm run build' in archon-ui-main/",
            "docs": "/docs",
            "health": "/health",
            "performance": "/api/performance"
        }

if __name__ == "__main__":
    import uvicorn
    
    # Run server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8181,
        reload=True,
        log_level="info"
    )