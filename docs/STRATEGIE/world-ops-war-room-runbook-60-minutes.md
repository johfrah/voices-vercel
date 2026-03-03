# World Ops War Room Runbook (60 minuten)

## Doel
Binnen 60 minuten van losse backlog naar uitvoerbaar sprintboard met eigenaarschap en KPI targets.

## Voorbereiding (5 minuten voor start)
- Open huidige backlog.
- Open sprintboard template.
- Bevestig aanwezige World owners.

## Tijdschema

### T+00 tot T+05: opening en scope lock
- Herhaal doel: 1 topinitiatief per World.
- Activeer regel: zonder 4 contextlabels geen uitvoering.
- Leg beslisregel uit: priority score bepaalt volgorde.

### T+05 tot T+15: labelen en zuiveren
- Label tickets met:
  - `world_id`
  - `market_code`
  - `journey_id`
  - `intent`
- Verplaats onduidelijke tickets naar intake.

### T+15 tot T+30: scoring
- Score elk kandidaat ticket op:
  - revenue impact
  - speed to value
  - strategic fit
  - risk reduction
  - effort
- Bereken `priority_score`.

### T+30 tot T+45: selectie
- Kies per World het ticket met hoogste score.
- Koppel owner, weekdoel en risico.
- Beperk WIP tot exact 1 actief initiatief per World.

### T+45 tot T+55: risico en dependency check
- Check routing risico:
  - registry-first
  - ID-first
  - world-context blijft correct
- Check release-risico:
  - preflight check gepland
  - versie-sync gepland
  - audit gepland

### T+55 tot T+60: afsluiting
- Bevestig definitief sprintboard.
- Plan reviewmomenten op dinsdag en vrijdag.
- Publiceer actielijst voor de eerste 24 uur.

## Rollen in de war room
- Facilitator: bewaakt tijd en beslisregels.
- Scribe: vult sprintboard live aan.
- World owners: nemen finale keuze voor eigen World.
- Tech gatekeeper: borgt release-gate discipline.

## Definitie van done voor de sessie
- Elke World heeft:
  - 1 owner
  - 1 north star KPI
  - 1 topinitiatief
  - 1 hoofd risico
- Alle actieve tickets hebben de 4 contextlabels.
