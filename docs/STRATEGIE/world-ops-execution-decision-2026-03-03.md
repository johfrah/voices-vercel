# World Ops Execution Decision (2026-03-03)

## Doel
Direct uitvoerbare prioriteiten voor de 9 Worlds, met harde ownership en focus op meetbare waarde binnen 14 dagen.

## Portfolioverdeling voor deze sprint

### Groei
- World 1 Agency
- World 3 Academy
- World 6 Ademing

### Stabilisatie
- World 2 Studio
- World 8 Partner

### Onderhoud met impact
- World 5 Portfolio
- World 7 Freelance
- World 10 Johfrai
- World 25 Artist

## Ownership per World
- World 1 Agency: Voicy
- World 2 Studio: Berny
- World 3 Academy: Berny
- World 5 Portfolio: Laya
- World 6 Ademing: Mat
- World 7 Freelance: Chris
- World 8 Partner: Sally
- World 10 Johfrai: Voicy
- World 25 Artist: Laya
- World 0 Foyer: Mat

## Verplichte ticket labels
Elk ticket moet deze velden bevatten voordat uitvoering start:
- `world_id`
- `market_code`
- `journey_id`
- `intent`

Tickets zonder deze 4 velden blijven in intake en krijgen geen sprintslot.

## Prioriteringsregel
Gebruik deze score in refinement:

`priority_score = (revenue_impact * 3) + (speed_to_value * 2) + (strategic_fit * 2) + (risk_reduction * 1) - effort`

Schaal per factor: 1 tot 5.

## Niet-onderhandelbare architectuurregels
- Registry-first routing via `slug_registry`.
- ID-first interne logica via `entity_id`.
- Geen hardcoded host of slug logica in componenten.
- World-afhankelijke funnel moet naar world-specifieke foyer routes sturen.

## Deliveryregels voor elk team
- Geen merge zonder succesvolle preflight check.
- Versie-sync in deze 3 bestanden bij release:
  - `apps/web/package.json`
  - `apps/web/src/app/Providers.tsx`
  - `apps/web/src/app/api/admin/config/route.ts`

## Kill-criteria
- Geen KPI-beweging na 2 sprints: scope direct halveren.
- 2 release-gate failures in 1 sprint: feature freeze voor dat World team.
- Routing incident met verkeerde World context: directe hotfix lane.

## 72-uurs actielijst
1. Label alle open tickets met de 4 verplichte contextvelden.
2. Selecteer per World 1 topprioriteit op basis van priority score.
3. Koppel owner en weekdoel aan elke topprioriteit.
4. Start weekritme met vaste KPI review op dinsdag en vrijdag.
