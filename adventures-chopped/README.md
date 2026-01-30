# Adventures - Chopped Node Structures

This folder contains adventure content converted to SPARC's node-based format, ready for import into Adventure Forge.

## Folder Structure

```
adventures-chopped/
├── CHOPPING-TEMPLATE.md    # Template for converting new adventures
├── README.md               # This file
├── city/                   # City Quest Hub adventures
│   └── thief-chase-nodes.md ✅
├── forest/                 # Forest Quest Hub adventures
│   └── (pending)
└── mountain/               # Mountain Quest Hub adventures
    └── (pending)
```

## Conversion Status

| Adventure | Hub | Status | Nodes |
|-----------|-----|--------|-------|
| Thief Chase | City | ✅ Done | 29 |
| Wizard's Errands | City | ⏳ Pending | - |
| What Lies Beneath | Mountain | ⏳ Pending | - |
| Infested Mines | Mountain | ⏳ Pending | - |
| Dragon's Lair | Mountain | ⏳ Pending | - |
| Big Game Hunt | Forest | ⏳ Pending | - |
| Elf Camp Siege | Forest | ⏳ Pending | - |
| Lost Forest | Forest | ⏳ Pending | - |

## File Format

Each `-nodes.md` file contains:
- Adventure metadata (title, duration, difficulty)
- Quest summary (hook, objective, reward)
- All nodes in YAML format with connections
- State tracking (flags, items)
- Node count summary

## How to Use

1. Reference `CHOPPING-TEMPLATE.md` for node types and properties
2. Follow the checklist when converting new adventures
3. Save as `{adventure-name}-nodes.md` in the appropriate hub folder
4. Update this README with conversion status

## Import to Adventure Forge

*(Future)* These files will be parseable by the Adventure Forge import system to generate visual node graphs.
