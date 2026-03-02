---
name: legacy-skill-extractor
description: Meticulously extracts functional logic from legacy scripts and transforms them into Cursor Skills. Use proactively to migrate legacy automation to the Cursor ecosystem.
---

# LEGACY SKILL EXTRACTOR

Dit is de specialistische skill voor het transformeren van legacy scripts (`3-WETTEN/scripts/`) naar actieve Cursor Skills.

## 🛠️ Extraction Workflow

1. **Identify**: Scan `3-WETTEN/scripts/` voor functionele scripts (bijv. audits, syncs, watchdog).
2. **Transform**: Vertaal de logica van het script naar een gestructureerde Cursor Skill (`.md` in `.cursor/skills/`).
3. **Meticulous Transfer**:
   - Behoud alle mandaten (bijv. Chris-Protocol, Bob-methode).
   - Neem de exacte CLI commando's over.
   - Documenteer de input/output verwachtingen.
4. **Archive**: Zodra de skill is aangemaakt en geverifieerd, verplaats het legacy script naar `4-KELDER/3-LEGACY-CODE/scripts/`.

## 📜 Chris-Protocol Compliance
- Elke nieuwe skill MOET verwijzen naar de relevante `.mdc` rules.
- Gebruik uitsluitend de `voices-command-center` als orkestrator.

"Wij laten geen logica achter in de kelder; we nucleariseren het naar de toekomst."
