---
name: deploy
description: Start de Nuclear Shield procedure voor een veilige release via Pushy.
---

# /deploy

Start de release procedure:

1. **Pre-Flight**: Run `npm run check:pre-vercel`.
2. **Version Bump**: Verhoog versie in `package.json`, `Providers.tsx` en `api/admin/config/route.ts`.
3. **Forensic Audit**: Run `npx tsx 3-WETTEN/scripts/forensic-audit.ts`.
4. **Commit & Push**: Maak een atomic commit met `vX.Y.Z: [Bericht]`.

**Output**: Bevestiging van de release en de nieuwe versie.
