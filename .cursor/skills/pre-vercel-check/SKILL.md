---
name: pre-vercel-check
description: Ultimate gatekeeper for deployments. Performs build checks and Nuclear Law scans. Based on the legacy pre-vercel-check.ts.
---

# PRE-VERCEL CHECK SKILL

Deze skill is de ultieme bewaker van de drempel voor elke release.

## 🛠️ Workflow
1. **Build Check**: Voert `npm run build` uit voor type-checks en chunk validatie.
2. **Handshake Check**: Valideert de `integrity-handshake.ts`.
3. **Law Scan**: Scant op dynamic imports zonder loading fallbacks en hardcoded domeinen.
4. **Asset Audit**: Controleert op ongeldige karakters in asset namen.

## 🚀 Execution
Run via terminal:
```bash
npm run check:pre-vercel
```

## 📜 Verplichte Richtlijnen
- Volg strikt `200-CHRIS-PROTOCOL.mdc` voor de release procedure.
- Stop de release bij ELKE error.
