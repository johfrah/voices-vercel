---
name: database-diagnostics
description: Deep diagnostics and integrity checks for the Supabase/Drizzle database. Consolidates test, integrity, and handshake scripts.
---

# DATABASE DIAGNOSTICS SUPER-SKILL

Deze skill bewaakt de gezondheid en integriteit van de "Nuclear Truth" (de database).

## 🧪 Core Workflows

### 1. Connection & Direct Test
Test de verbinding met de Pooler en de directe DB toegang:
- **DB Test**: `npx tsx 3-WETTEN/scripts/core/diagnostics/test-db.ts`
- **Direct Test**: `npx tsx 3-WETTEN/scripts/core/diagnostics/test-db-direct.ts`

### 2. Integrity & Handshake
Valideer de ID-First Handshake en de integriteit van de registry:
- **Integrity Handshake**: `npx tsx 3-WETTEN/scripts/integrity-handshake.ts`
- **Lexicon Handshake**: `npx tsx 3-WETTEN/scripts/lexicon-handshake.ts`
- **Atomic Truth Scan**: `npx tsx 3-WETTEN/scripts/forensic-atomic-truth-scan.ts`

### 3. Data Audit & Cleanup
Spoor inconsistenties op en ruim vervuilde data op:
- **Data Audit**: `npx tsx 3-WETTEN/scripts/forensic-data-audit.ts`
- **Visitor Cleanup**: `npx tsx 3-WETTEN/scripts/core/maintenance/cleanup-visitor-data.ts`

## 📜 Verplichte Richtlijnen
- **Bassie-Protocol**: Gebruik poort 6543 bij timeouts.
- **Snake Case**: Geen camelCase in de database.
- Managed by **CHRIS (Technical Director)** and **BASSY (Connectivity)**.
