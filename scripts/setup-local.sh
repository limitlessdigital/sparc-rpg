#!/bin/bash
#
# SPARC RPG Local Development Setup
# This script sets up the local Supabase development environment
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║               SPARC RPG Local Development Setup               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$PROJECT_ROOT"

# ============================================
# Check Prerequisites
# ============================================

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo ""
    echo "Please install Docker Desktop:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  Linux: https://docs.docker.com/desktop/install/linux-install/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed!${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Or see: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI is installed${NC}"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found, checking for npm...${NC}"
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Neither pnpm nor npm found!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Package manager available${NC}"
echo ""

# ============================================
# Start Supabase
# ============================================

echo -e "${YELLOW}🚀 Starting Supabase local development stack...${NC}"
echo "   (This may take a few minutes on first run)"
echo ""

# Stop any existing instance first
supabase stop --no-backup 2>/dev/null || true

# Start Supabase
if supabase start; then
    echo ""
    echo -e "${GREEN}✅ Supabase is running!${NC}"
else
    echo -e "${RED}❌ Failed to start Supabase${NC}"
    echo ""
    echo "Try running 'supabase start' manually to see detailed errors."
    exit 1
fi

# ============================================
# Link Migrations (if they exist elsewhere)
# ============================================

# Check if migrations need to be linked from packages/db/migrations
if [ -d "$PROJECT_ROOT/packages/db/migrations" ] && [ ! -d "$PROJECT_ROOT/supabase/migrations" ]; then
    echo ""
    echo -e "${YELLOW}📁 Linking migrations from packages/db/migrations...${NC}"
    mkdir -p "$PROJECT_ROOT/supabase/migrations"
    
    # Copy migrations (excluding rollback)
    for f in "$PROJECT_ROOT/packages/db/migrations/"*.sql; do
        if [[ ! $(basename "$f") =~ ^000_ ]]; then
            cp "$f" "$PROJECT_ROOT/supabase/migrations/"
        fi
    done
    echo -e "${GREEN}✅ Migrations linked${NC}"
fi

# ============================================
# Apply Migrations
# ============================================

echo ""
echo -e "${YELLOW}📦 Applying database migrations...${NC}"

if supabase db reset --no-seed; then
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${RED}❌ Failed to apply migrations${NC}"
    exit 1
fi

# ============================================
# Seed Database
# ============================================

echo ""
echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"

if [ -f "$PROJECT_ROOT/supabase/seed.sql" ]; then
    if supabase db reset; then
        echo -e "${GREEN}✅ Database seeded${NC}"
    else
        echo -e "${YELLOW}⚠️  Seed failed, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No seed.sql found, skipping...${NC}"
fi

# ============================================
# Create .env.local if needed
# ============================================

if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    echo ""
    echo -e "${YELLOW}📝 Creating .env.local from .env.example...${NC}"
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.local"
    echo -e "${GREEN}✅ .env.local created${NC}"
fi

# ============================================
# Output Connection Info
# ============================================

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗"
echo -e "║                    🎮 SPARC RPG is Ready!                     ║"
echo -e "╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Local Services:${NC}"
echo "  📊 Supabase Studio:  http://127.0.0.1:54323"
echo "  🔌 API URL:          http://127.0.0.1:54321"
echo "  📬 Inbucket (email): http://127.0.0.1:54324"
echo "  🗄️  Database:         postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo -e "${GREEN}Test Accounts:${NC} (password: password123)"
echo "  🎭 Seer:    seer@sparc.local"
echo "  ⚔️  Player:  player1@sparc.local"
echo "  ⚔️  Player:  player2@sparc.local"
echo "  ⚔️  Player:  player3@sparc.local"
echo ""
echo -e "${GREEN}Quick Commands:${NC}"
echo "  pnpm dev           Start the web app"
echo "  supabase status    Check Supabase status"
echo "  supabase stop      Stop Supabase"
echo "  supabase db reset  Reset & reseed database"
echo ""
echo -e "${YELLOW}📖 View sample adventure 'The Goblin Caves' in Supabase Studio!${NC}"
echo ""
