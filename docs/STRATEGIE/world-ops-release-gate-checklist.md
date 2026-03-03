# World Ops Release Gate Checklist

## Doel
Eenzelfde releasekwaliteit over alle Worlds. Geen uitzonderingen.

## Gate 1: context integrity
- [ ] Ticket bevat `world_id`.
- [ ] Ticket bevat `market_code`.
- [ ] Ticket bevat `journey_id`.
- [ ] Ticket bevat `intent`.
- [ ] Geen hardcoded host of slug logica toegevoegd.

## Gate 2: technische preflight
Voer uit in `apps/web`:

1. `npm run type-check`
2. `npm run check:pre-vercel`
3. `npx tsx ../../../3-WETTEN/scripts/forensic-audit.ts`

Alle 3 moeten slagen.

## Gate 3: versie sync
- [ ] `apps/web/package.json` bijgewerkt.
- [ ] `apps/web/src/app/Providers.tsx` bijgewerkt.
- [ ] `apps/web/src/app/api/admin/config/route.ts` bijgewerkt.
- [ ] Drie versies exact gelijk.

## Gate 4: functionele validatie
- [ ] Gewijzigde flow manueel getest.
- [ ] World context correct bij navigatie.
- [ ] Geen regressie in hoofdnavigatie.
- [ ] Geen regressie in checkout of kernactie.

## Gate 5: audit evidence
- [ ] Console blijft schoon tijdens flow.
- [ ] Forensic audit output opgeslagen.
- [ ] Release note bevat proof of life.

## Fail policy
- Elke failed gate blokkeert merge.
- Twee failed gates op rij in een sprint activeert feature freeze voor dat World team.

## Release note format
- Versie:
- World:
- Wijziging:
- KPI impact verwacht:
- Audit bewijs:
- Functioneel bewijs:
