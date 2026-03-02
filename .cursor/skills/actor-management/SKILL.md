---
name: actor-management
description: Comprehensive management of voice actors, including rate audits, photo matching, demo syncing, and profile beautification. Consolidates 15+ legacy scripts.
---

# ACTOR MANAGEMENT SUPER-SKILL

Deze skill orkestreert het volledige beheer van stemacteurs binnen de Agency World.

## 🎙️ Core Workflows

### 1. Rate & Data Audit
Controleer of alle acteurs de juiste prijzen en metadata hebben:
- **Audit Rates**: `npx tsx 3-WETTEN/scripts/maintenance/check-actor-rates.ts`
- **JSON Rates**: `npx tsx 3-WETTEN/scripts/maintenance/check-json-rates.ts`

### 2. Visual & Photo Matching
Zorg dat elke acteur de juiste (geoptimaliseerde) foto heeft:
- **Audit Photos**: `npx tsx 3-WETTEN/scripts/maintenance/audit-active-photos.ts`
- **Fuzzy Finder**: `npx tsx 3-WETTEN/scripts/maintenance/fuzzy-photo-finder.ts`
- **Optimize**: `npx tsx 3-WETTEN/scripts/maintenance/optimize-active-photos.ts`
- **Forensic Fix**: `npx tsx 3-WETTEN/scripts/forensic-photo-fix.ts`

### 3. Demo & Review Sync
Synchroniseer audio demo's en reviews:
- **Demo Sync**: `npx tsx 3-WETTEN/scripts/maintenance/atomic-demo-sync.ts`
- **Review Scan**: `npx tsx 3-WETTEN/scripts/atomic-review-scan.ts`
- **Actor Review**: `npx tsx 3-WETTEN/scripts/atomic-review-actor-scan.ts`

### 4. Profile Beautification
Maak de profielen klaar voor de etalage:
- **Beautify MD**: `npx tsx 3-WETTEN/scripts/beautify-actor-md.ts`

## 📜 Verplichte Richtlijnen
- **Actor Visibility**: Toon uitsluitend acteurs met `status = 'live'` EN `is_public = true`.
- **Snake Case**: Gebruik uitsluitend `snake_case` voor database updates.
- Managed by **VOICY (Agency Lead)**.
