---
name: guest-intelligence
description: Analyzes visitor footprints and UTM parameters to build guest profiles. Based on guest-intelligence.ts.
---

# GUEST INTELLIGENCE SKILL

Transforms raw visitor data into actionable intelligence.

## 🛠️ Workflow
1. **Footprint Scan**: Analyzes UTMS, referrers, and page paths from `system_events`.
2. **Profile Building**: Groups events by `visitor_hash` to understand intent.
3. **Reporting**: Generates insights for the Admin Dashboard.

## 🚀 Execution
Run via terminal:
```bash
npx tsx scripts/guest-intelligence.ts
```

## 📜 Verplichte Richtlijnen
- Managed by **MAT (Visitor Intelligence)**.
- Follow `100-ATOMIC-TRINITY.mdc`.
