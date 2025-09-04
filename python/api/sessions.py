from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from server.api_routes.sparc_sessions_api import router as sessions_router

app = FastAPI()

# CORS middleware for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the sessions router
app.include_router(sessions_router)

# Vercel requires a default export
def handler(request):
    return app(request.scope, request.receive, request.send)