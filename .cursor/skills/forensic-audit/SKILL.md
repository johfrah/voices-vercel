---
name: forensic-audit
description: Executes a full forensic audit of the ecosystem to detect 'Slop' and protocol violations. Based on the legacy forensic-audit.ts.
---

# FORENSIC AUDIT SKILL

Deze skill belichaamt de onverbiddelijke bewaker van de code-integriteit.

## 🛠️ Workflow
1. **Structural Scan**: Controleer op underscores in root mappen en recursieve root mappen.
2. **Stray File Scan**: Identificeer losse bestanden in `docs/` of `src/root`.
3. **Protocol Audit**: Scan op verboden patronen (hardcoded contactinfo, rauwe HTML, zware instrumenten zonder `ssr: false`).
4. **Reporting**: Genereer een rapport in `docs/reports/forensic-audit-[date].md`.

## 🚀 Execution
Run via terminal:
```bash
npx tsx scripts/forensic-audit.ts
```

## 📜 Verplichte Richtlijnen
- Volg strikt `200-CHRIS-PROTOCOL.mdc`.
- Delegeer herstel naar `voices-felix` of `voices-consuela`.
