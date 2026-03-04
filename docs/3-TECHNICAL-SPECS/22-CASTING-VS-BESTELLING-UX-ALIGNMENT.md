# Casting vs bestelling — vorm en uiting

**Datum**: 2026-03
**Doel**: Inzicht dat proefopname (casting) en bestelling qua vorm en uiting dicht bij elkaar liggen; nu voelen ze als uiteenlopende zaken.

---

## 1. Diff-tabel: proefopname vs bestelling

| Aspect | **Proefopname (casting)** | **Bestelling (checkout)** |
|--------|---------------------------|----------------------------|
| **Route** | `/casting` | `/checkout`, configurator, cart |
| **Pagina-titel** | "Gratis Proefopname" | (context: configurator/checkout) |
| **Stap 1** | **Project** — "Wat gaan we maken?", projectnaam, kanalen, spots, woorden | **Kies Stem** (agency) of **Workshop** (studio) — `order_steps.voice` / `order_steps.studio_workshop` |
| **Stap 2** | **Selectie** — "Jouw selectie", stemmen bevestigen, "+ Voeg meer toe" | **Script** (agency) of **Inschrijving** (studio) — `order_steps.script` / `order_steps.studio_registration` |
| **Stap 3** | **Briefing** — "Het Script", script + vibe, upload | **Overzicht** — cart — `order_steps.cart` |
| **Stap 4** | — (eindactie in stap 3) | **Afrekenen** — betaling/offerte — `order_steps.checkout` |
| **Step-UI** | 01 / 02 / 03, ronde pills, motion, check bij completed | Bolletjes + lijn, label per stap, groen vinkje bij past |
| **Component** | `StudioLaunchpadInstrument` (eigen step-bar) | `OrderStepsInstrument` (andere layout) |
| **Eindknop** | "Ontvang gratis proefopnames" | "Afrekenen" / "Offerte aanvragen" |
| **Na submit** | Redirect `/proefopname/{hash}` (overzicht selectie) | Mollie / offerte / `/account/orders` |
| **State** | Lokaal (useState in launchpad) | `CheckoutContext` (cart, items, customer) |

---

## 2. De twee flows naast elkaar (samenvatting)

| Aspect | **Proefopname (casting)** | **Bestelling (checkout)** |
|--------|---------------------------|----------------------------|
| **Ingang** | /casting, "Gratis Proefopname" | /checkout, configurator, cart |
| **Stappen** | 01 Project → 02 Selectie → 03 Briefing | Kies Stem → Script → Overzicht → Afrekenen |
| **Eindactie** | "Ontvang gratis proefopnames" (submit, geen betaling) | "Afrekenen" / "Offerte aanvragen" (betaling of offerte) |
| **Na submit** | Redirect naar /proefopname/{hash} (overzicht selectie) | Redirect naar betaling/offerte/account/orders |

Conceptueel is het **dezelfde keten**: project/doel → stem(men) kiezen → briefing/script → overzicht → **dan pas vertakking** (zie diff-tabel hierboven):  
- óf "aanvraag proefopname" (geen geld),  
- óf "bestelling/offerte" (wel geld/commitment).

---

## 3. Waarom het nu uiteenlopend voelt

- **Andere stapnamen**: Launchpad gebruikt "Project", "Selectie", "Briefing"; OrderSteps gebruikt "Kies Stem", "Script", "Overzicht", "Afrekenen". Geen gedeelde taal.
- **Andere UI voor stappen**: Launchpad heeft eigen step-bar (01, 02, 03 met motion); checkout gebruikt `OrderStepsInstrument` met andere layout. Niet hetzelfde "ritme".
- **Andere context**: Proefopname voelt als "formulier aanvraag"; bestelling als "winkelmand + betaalflow". Terwijl de eerste stappen (stem + script) bijna identiek zijn.
- **Geen duidelijke verbinding**: Gebruiker ziet niet: "dit is hetzelfde pad, alleen het eind is anders (gratis proef vs. betalen)".

---

## 4. Aanbeveling: één vorm, twee uitkomsten

Casting en bestelling **niet** als twee aparte producten tonen, maar als **één herkenbare journey** met twee uitkomsten:

1. **Zelfde stappenstructuur** (waar mogelijk):
   - Stap 1: Project / wat wil je maken (type, media, …)
   - Stap 2: Stem(men) kiezen
   - Stap 3: Script & briefing
   - Stap 4a (proefopname): Overzicht → "Aanvraag versturen" (geen betaling)
   - Stap 4b (bestelling): Overzicht → "Afrekenen" of "Offerte aanvragen"

2. **Zelfde stap-indicator**: Eén herbruikbaar step-component (zelfde nummering,zelfde stijl) voor beide flows.

3. **Zelfde copy-tone**: Eenduidige termen (bijv. "Overzicht" voor de stap vóór de eindactie, "Script" i.p.v. de ene keer "Briefing" en de andere "Script").

4. **Expliciete keuze in de flow**: Na stem + script: "Wat wil je doen? → Gratis proefopname aanvragen | Direct bestellen / Offerte". Dan voelt het als één pad met twee deuren, niet als twee losse werelden.

---

## 5. Technische implicatie (richting)

- **Geen big bang**: Eerst stapnamen en copy alignen (launchpad + OrderSteps + vertalingen), daarna eventueel één gedeeld step-component.
- **CheckoutContext vs. launchpad-state**: Beide flows kunnen hun eigen state houden; de *presentatie* (stappen, labels, volgorde) kan wel dezelfde "vorm" krijgen.
- **Routing**: /casting en /checkout kunnen blijven; de *beleving* wordt: "zelfde soort stappen, ander eindpunt".

---

**Kort**: Casting en bestelling liggen qua vorm en uiting inderdaad heel dicht bij elkaar. Ze nu bewust als één journey met twee uitkomsten (proefopname vs. bestelling) vormgeven maakt de UX consistenter en duidelijker.
