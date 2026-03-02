---
name: log-explorer
description: Advanced log explorer combining forensic audits and live database logs. Based on the legacy log-explorer.ts.
---

# LOG EXPLORER SKILL

Deze skill biedt een gecombineerd overzicht van systeem-integriteit en live events.

## 🛠️ Workflow
1. **Audit View**: Toont de resultaten van de laatste Forensic Audit.
2. **Error View**: Haalt de laatste 20 kritieke database errors op uit `system_events`.
3. **Live Stream**: Start een realtime watchdog stream van systeem-events.
4. **Digest Search**: Zoekt naar specifieke event digests.

## 🚀 Execution
Run via terminal:
```bash
npx tsx 3-WETTEN/scripts/log-explorer.ts [live|audit|errors|digest <hash>]
```

## 📜 Verplichte Richtlijnen
- Gebruik uitsluitend voor debugging en monitoring.
- Delegeer kritieke errors direct naar `voices-felix`.
