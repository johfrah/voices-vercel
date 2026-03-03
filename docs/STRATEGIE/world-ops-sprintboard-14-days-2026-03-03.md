# World Ops Sprintboard (14 dagen)

## Gebruik
- Update dagelijks status en blokkades.
- Update KPI cijfers op dinsdag en vrijdag.
- Houd exact 1 topinitiatief per World actief.

## Sprintboard

| world_id | world | owner | mode | north_star_kpi | week_target | top_initiative | top_risk | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Agency | Voicy | growth | aanvraag_to_order_ratio | +10% | world-foyer contact flow verbeteren | trage offerte-opvolging | active |
| 2 | Studio | Berny | stabilize | workshop_interest_to_booking | +8% | studio funnel wrijving reduceren | mismatch landingscontext | active |
| 3 | Academy | Berny | growth | day7_lesson_completion | +12% | onboarding van les 0 naar les 1 versnellen | uitval na eerste pagina | active |
| 5 | Portfolio | Laya | maintain | commission_request_ratio | +5% | kern-CTA op portfolio routes aanscherpen | lage intent bij verkeer | queued |
| 6 | Ademing | Mat | growth | day30_retention | +10% | first-session flow vereenvoudigen | drop-off na accountstart | active |
| 7 | Freelance | Chris | maintain | lead_response_time_hours | -20% | intake en opvolgritme verscherpen | handmatige opvolging | queued |
| 8 | Partner | Sally | stabilize | partner_revenue_ex_vat | +7% | partner intake stappen helderder maken | teveel keuzestress | active |
| 10 | Johfrai | Voicy | maintain | session_to_brief_ratio | +5% | briefingflow eenvoudiger maken | lage sessie-intent | queued |
| 25 | Artist | Laya | maintain | fan_to_action_ratio | +5% | release-route met 1 duidelijke actie | te brede paginafocus | queued |

## KPI definities
- `aanvraag_to_order_ratio`: orders / aanvragen.
- `workshop_interest_to_booking`: bookings / workshop interest leads.
- `day7_lesson_completion`: gebruikers met lesson-complete binnen 7 dagen / nieuwe starters.
- `commission_request_ratio`: commissie-aanvragen / unieke portfolio bezoekers.
- `day30_retention`: actieve gebruikers op dag 30 / nieuwe gebruikers.
- `lead_response_time_hours`: mediane responstijd in uren.
- `partner_revenue_ex_vat`: partner omzet exclusief btw.
- `session_to_brief_ratio`: briefs / geboekte sessies.
- `fan_to_action_ratio`: doelactie events / unieke artist bezoekers.

## Werkafspraken
- Elke wijziging krijgt labels: `world_id`, `market_code`, `journey_id`, `intent`.
- Geen release zonder groene release gate.
- Elke World owner rapporteert 1 winst, 1 risico, 1 beslissing per review.

## Beslisregels voor herprioritering
- Topinitiatief mislukt 2 weken: vervang binnen 24 uur.
- KPI onder doel en risico hoog: verplaats World naar stabilize mode.
- KPI boven doel 2 reviews op rij: schaal naar tweede initiatief.
