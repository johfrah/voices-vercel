---
name: status-handshake
description: Synchronizes and verifies the status of all entities across the ecosystem. Based on status-handshake.ts.
---

# STATUS HANDSHAKE SKILL

Ensures all entities (actors, workshops, etc.) have a consistent status across the database and UI.

## 🛠️ Workflow
1. **Registry Sync**: Verifies status in the `slug_registry`.
2. **Entity Validation**: Checks if `status = 'live'` matches the visibility flags.
3. **Drift Detection**: Identifies entities that are live in the DB but missing from the registry.

## 🚀 Execution
Run via terminal:
```bash
npx tsx scripts/status-handshake.ts
```

## 📜 Verplichte Richtlijnen
- Managed by **CHRIS (Technical Director)**.
- Follow `200-CHRIS-PROTOCOL.mdc`.
