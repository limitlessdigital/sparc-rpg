from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import random
import time

# Create the FastAPI app for Vercel
app = FastAPI(
    title="SPARC Game Engine",
    description="Simplified Playable Adventure Role-playing Core - Gateway Fantasy RPG Platform",
    version="1.0.0"
)

# Add CORS for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demo
CHARACTER_CLASSES = {
    "Fighter": {
        "description": "Master of weapons and armor, excel in combat",
        "base_stats": {"strength": 16, "constitution": 15, "dexterity": 13},
        "equipment": ["Longsword", "Shield", "Chain Mail", "Healing Potion"]
    },
    "Wizard": {
        "description": "Wielder of arcane magic and ancient knowledge", 
        "base_stats": {"intelligence": 16, "wisdom": 14, "constitution": 12},
        "equipment": ["Spellbook", "Staff", "Robes", "Component Pouch"]
    },
    "Rogue": {
        "description": "Stealthy scout skilled in deception and precision",
        "base_stats": {"dexterity": 16, "intelligence": 14, "charisma": 13},
        "equipment": ["Daggers", "Thieves' Tools", "Leather Armor", "Rope"]
    }
}

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SPARC Game Engine",
        "version": "1.0.0",
        "deployment": "vercel"
    }

# Character endpoints
@app.get("/sparc/characters/templates")
async def get_character_templates():
    return CHARACTER_CLASSES

@app.post("/sparc/characters")
async def create_character(request: Dict[str, Any]):
    character_class = request.get("character_class")
    name = request.get("name")
    
    if not character_class or character_class not in CHARACTER_CLASSES:
        raise HTTPException(status_code=400, detail="Invalid character class")
    
    template = CHARACTER_CLASSES[character_class]
    
    return {
        "id": f"char_{random.randint(1000, 9999)}",
        "name": name,
        "character_class": character_class,
        "level": 1,
        "stats": template["base_stats"],
        "equipment": template["equipment"],
        "creation_time": time.time()
    }

# Dice rolling endpoint  
@app.post("/sparc/dice/roll")
async def roll_dice(request: Dict[str, Any]):
    dice_count = request.get("dice_count", 1)
    dice_sides = request.get("dice_sides", 20)
    modifier = request.get("modifier", 0)
    
    # Generate rolls
    rolls = [random.randint(1, dice_sides) for _ in range(dice_count)]
    base_total = sum(rolls)
    total = base_total + modifier
    
    return {
        "dice_results": rolls,
        "base_total": base_total, 
        "modifier": modifier,
        "total": total,
        "dice_notation": f"{dice_count}d{dice_sides}{'+' if modifier >= 0 else ''}{modifier if modifier != 0 else ''}",
        "timestamp": time.time()
    }

# AI Seer endpoint
@app.post("/sparc/ai/seer-advice")  
async def get_seer_advice(request: Dict[str, Any]):
    query = request.get("query", "")
    
    # Simple responses for demo
    responses = [
        f"The mystical energies reveal... '{query}' requires careful consideration. Roll for wisdom!",
        f"I sense great potential in your query about '{query}'. The dice will guide your fate.",
        f"Ancient knowledge whispers that '{query}' is best approached with courage and strategy.",
        f"The stars align favorably for your question about '{query}'. Trust in your abilities.",
        f"Magic flows strongly here. Regarding '{query}', remember that heroes are forged in challenge."
    ]
    
    return {
        "advice": random.choice(responses),
        "response": random.choice(responses),  # Fallback
        "confidence": random.uniform(0.7, 1.0),
        "timestamp": time.time()
    }