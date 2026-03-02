---
name: voices-command-center
description: Orchestrates the Voices Headless ecosystem by coordinating specialized agents (Bob, Chris, Laya, Consuela). Use when starting new tasks, performing deployments, auditing code, or managing repository structure.
---

# VOICES COMMAND CENTER SKILL

Dit is de centrale skill voor het orkestreren van de Voices-agents en het uitvoeren van complexe workflows.

## 🎭 Agent Orchestration
Gebruik deze skill om de juiste specialist in te schakelen:
- **Strategie/Visie**: Roep `voices-bob` of `voices-mark` aan.
- **Code/Database**: Roep `voices-chris` of `voices-cody` aan.
- **UI/Aesthetics**: Roep `voices-laya` of `voices-moby` aan.
- **Ops/Cleanliness**: Roep `voices-consuela` of `voices-pushy` aan.

## 🛠️ Core Workflows

### 1. Forensic Audit Workflow
Voer een volledige systeem-audit uit:
1. Gebruik de `forensic-audit` skill (`/audit`).
2. Analyseer de output op "Splinters" (protocol-schendingen).
3. Delegeer herstel naar `voices-felix` of `voices-consuela`.

### 2. Nuclear Deployment Workflow
Voer een veilige release uit:
1. Gebruik de `pre-vercel-check` skill (`/deploy`).
2. Verhoog de versie in `package.json`, `Providers.tsx` en `api/admin/config/route.ts`.
3. Commit met `vX.Y.Z: [Bericht]` en push naar GitHub.

### 3. Asset Sync Workflow
Houd Dropbox en Supabase synchroon:
1. Gebruik de `asset-watchdog` skill.

### 4. Cleanliness Workflow
Houd de repo Masterclass Clean:
1. Gebruik het `/clean` commando.
2. Scan op underscores in root folders.
3. Verplaats zwerfbestanden naar `4-KELDER`.
4. Dwing het `Instrument` suffix af op alle UI componenten.

### 5. Legacy Extraction Workflow
Migreer legacy logica naar Cursor:
1. Gebruik de `legacy-skill-extractor` skill.

## 🚀 Command Catalog
- `/start`: Start dev server (Anna)
- `/stop`: Kill processes (Consuela)
- `/log`: Live watchdog stream (Felix)
- `/anna`: Lint check (Anna)
- `/bob-fix`: Orchestrator fix (Bob)
- `/chris`: Technical audit (Chris)
- `/laya`: Aesthetic audit (Laya)
- `/suzy`: SEO audit (Suzy)
- `/moby`: Mobile audit (Moby)
- `/health-check`: Full system check (Chris)

## 🧰 Skill Catalog
- `voices-command-center`: Orchestrates all agents and workflows.
- `actor-management`: Comprehensive voice actor & visual management (Voicy).
- `world-alignment`: Entity and content synchronization across Worlds (Bob).
- `database-diagnostics`: Deep integrity and connection checks (Chris/Bassie).
- `forensic-audit`: Code-integrity and protocol violation detection (Chris).
- `asset-watchdog`: Dropbox ↔ Supabase asset synchronization (Consuela).
- `pre-vercel-check`: Deployment gatekeeper and build validator (Pushy).
- `log-explorer`: Advanced live and database log viewing (Felix).
- `auto-heal-languages`: Actor language relation migration (Lanny).
- `status-handshake`: Entity status synchronization (Chris).
- `guest-intelligence`: Visitor footprint analytics (Mat).
- `orchestrator`: Master control for complex multi-agent tasks (Bob).
- `legacy-skill-extractor`: Autonomous migration of legacy scripts.

## 📜 Chris-Protocol V9 Compliance
Elke actie via deze skill MOET voldoen aan:
- **ID-First Handshake**: Gebruik uitsluitend UUID's voor interne logica.
- **HTML Zero**: Gebruik uitsluitend `LayoutInstruments`.
- **ISO-First**: Gebruik uitsluitend ISO-codes voor talen en markten.

"Vakmanschap is de afwezigheid van splinters."
