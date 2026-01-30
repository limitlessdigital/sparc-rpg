# SPARC RPG - Adventure Content Manifest

> Last Updated: 2026-01-29
> Purpose: Reference for Adventure Forge, Publishing, and AI systems

## Quest Hubs Overview

SPARC adventures are organized into regional Quest Hubs. Each hub contains multiple connected adventures suitable for 1-hour play sessions.

---

## 🏔️ Mountain Quest Hub

### 01. What Lies Beneath
- **File:** `01_What Lies Beneath/What Lies Beneath JUNE 11 2021.pdf`
- **Art:** `medus-room-illustration.png`
- **Status:** Complete
- **Theme:** Dungeon delve, mystery
- **Notes:** Flagship introductory adventure

### 02. Infested Mines
- **File:** `02_Infested Mines/2 Infested Mine.pdf`
- **Source Doc:** `Mine Infestation.docx`
- **Art:** `IMG_1085.jpg`
- **Status:** Complete
- **Theme:** Monster extermination, exploration

### 03. Dragon's Lair
- **Folder:** `03_Dragon_s Lair/`
- **Status:** In development
- **Theme:** Boss encounter, treasure

---

## 🏙️ City Quest Hub

### Thief Chase
- **File:** `City_ Thief Chase.docx`
- **Status:** Complete
- **Theme:** Urban pursuit, stealth, social

### Wizard's Errands
- **File:** `City_ Wizard_s Errands.docx`
- **Status:** Complete
- **Theme:** Fetch quests, magical mishaps, comedy

---

## 🌲 Forest Quest Hub

### Big Game Hunt
- **File:** `Forest_ Big Game Hunt.docx`
- **Status:** Complete
- **Theme:** Tracking, survival, hunting

### Elf Camp Siege
- **File:** `Forest_ Elf camp siege.docx`
- **Status:** Complete
- **Theme:** Defense, tactics, alliance

### Lost Forest
- **File:** `Forest_ Lost Forest.docx`
- **Status:** Complete
- **Theme:** Navigation, mystery, fey creatures

### Haunted (working title)
- **Files:** `Haunted.numbers`, `Haunted.xlsx`
- **Status:** In development
- **Theme:** Horror, undead

---

## 🗺️ Maps & Assets

| File | Description |
|------|-------------|
| `Sparc HF Map.jpeg` | High fantasy world map |
| `Sparc-Map-v1-Aug13.jpg` | World map v1 |
| `Screenshots/` | UI/gameplay screenshots |
| `IMG_1118-1121.HEIC` | Photo references |

---

## 📊 Planning Documents

| File | Description |
|------|-------------|
| `Adventure Tracker_.xlsx` | Master tracking spreadsheet |
| `Sparc Milestones and process.pdf` | Development roadmap |
| `Sparc Notes.docx` | Design notes |
| `Tutorial Story Outline.docx` | Onboarding adventure outline |

---

## Content Guidelines for Builders

### Adventure Forge Integration
- Each adventure should be importable as a node graph
- Parse PDF/DOCX to extract: scenes, NPCs, encounters, items
- Map to SPARC node types: Story, Decision, Combat, Challenge

### Publishing System
- Adventures can be published to Marketplace
- Required metadata: title, description, hub, difficulty, duration
- Optional: cover art, preview images, audio ambiance

### AI Seer Assistant
- Use adventure content for context-aware suggestions
- Extract NPC dialogue patterns for AI generation
- Reference encounter designs for balanced combat

---

## Adventure Node Types (from PRD)

| Type | Purpose | Example |
|------|---------|---------|
| Story | Narrative exposition | "You enter the dark cave..." |
| Decision | Player choice branch | "Go left or right?" |
| Combat | Battle encounter | "3 goblins attack!" |
| Challenge | Skill check | "Roll Wit to decipher runes" |
| Reward | Loot/XP distribution | "You find 50 gold" |
| Rest | Recovery point | "Short rest at camp" |

---

*This manifest should be updated as new content is added.*
