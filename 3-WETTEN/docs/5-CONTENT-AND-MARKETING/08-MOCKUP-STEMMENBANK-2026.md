# 🏗️ MOCKUP: DE NIEUWE STEMMENBANK (2026)
## *De "Tone of Voice" in actie: Airbnb-flow, Apple-luxe, Stripe-kracht*

Dit document beschrijft de visuele en interactieve opbouw van de nieuwe Stemmenbank op `voices.be`. Het is de eerste volledige implementatie van onze nieuwe psychologische wetten.

---

## 1. DE EERSTE INDRUK (ABOVE-THE-FOLD)
*Doel: "Mooie Stemmen" direct bewijzen.*

*   **The Hero Focus:** Geen zijbalken of kleine tekstjes. Eén grote kop in `Raleway-800`: "Vind de perfecte <span class="hred">Stem</span> voor jouw verhaal."
*   **The Floating Search Hub (Airbnb-style):** Een compacte, witte balk die in het midden zweeft met een zachte `va-shadow-large`. 
    *   **Interactie:** Zodra je erop klikt, "ontvouwt" de balk zich vloeiend tot een volledig filter-paneel (Taal, Geslacht, Gebruik). De achtergrond wordt wazig (`backdrop-blur`).
*   **Living Background:** De achtergrond van de hele pagina ademt heel traag met de mesh-gradient (Water/Lucht op 5% opacity).

---

## 2. DE STEMMENLIST (BENTO GRID)
*Doel: Overzichtelijkheid en luxe presentatie.*

*   **Bento Cards:** Elke stemacteur staat in een luxe kaart (`va-radius-xl`).
    *   **Visual:** Een haarscherpe foto met een subtiele YouTube-aura die de kleuren van de foto reflecteert op de kaart.
    *   **Micro-interactie:** Bij hover schaalt de kaart heel lichtjes op (`scale(1.02)`) en krijgt de foto een "Ambient Glow".
    *   **Sonic DNA:** Bij het klikken op de play-knop hoor je de "Soft Tick".
*   **Optimistic Filtering:** Als je een filter aanpast (bijv. "Vrouw"), schuiven de kaarten niet weg, maar herpositioneren ze zich vloeiend met een "Spring" animatie. De lege plekken worden direct opgevuld door **Skeletons** van de nieuwe resultaten.

---

## 3. DE "INSTANT-APP" TRANSITIE
*Doel: "Gemakkelijk Online Besteld" zonder wrijving.*

*   **The Morphing Switch:** Wanneer de klant op de naam van een stem klikt, verlaat hij de lijst niet.
    *   **De Fysica:** De kaart van de stem groeit uit tot een **Full-screen Tool**. De rest van de lijst schaalt naar `scale(0.98)` en verdwijnt in een diepe blur.
    *   **Het Gevoel:** De klant zit binnen 300ms "in de tool" (de briefing-omgeving). Het voelt als een app-switch op een iPhone.

---

## 4. DE BRIEFING TOOL (TRANSPARANTE SERVICE)
*Doel: Vertrouwen bouwen door eerlijkheid.*

*   **Sticky Decision Box:** Aan de rechterkant zweeft een compacte kaart met de prijs.
    *   **Live Pricing (Stripe-style):** Terwijl de klant opties kiest (bijv. 'Online Media'), zie je de prijs karakter-voor-karakter verspringen (`render_price`).
*   **Bento Options:** Gebruikstypes en extra's worden gepresenteerd in kleine Bento-vakjes met grote iconen. Geen dropdown-lijsten, maar visuele keuzes.
*   **The Pro Action:** De finale knop "Bevestig Briefing" is een **zwarte `va-btn-pro`** met een subtiele `.hmagic` shimmer. Bij de klik hoor je de solide "Pro Thud".

---

## 5. PERSOONLIJKE FINISH
*Doel: De "Prettige Service" afronden.*

*   **Voicy Nudge:** Rechtsonder verschijnt Voicy met een `.hmagic` tekstje: *"Hoi! Ik heb je briefing alvast klaargezet op basis van je vorige bestelling. Klopt dit zo?"*
*   **Success Pop:** Na de bestelling volgt geen saaie bedankpagina, maar een explosie van confetti-achtige gradients en een persoonlijke videoboodschap van de stemacteur in een kleine, zwevende cirkel.

---

### 🚀 Implementatie-opdracht voor de Agent:
> "Bouw de Stemmenbank volgens het script in `MOCKUP-STEMMENBANK-2026.md`. Focus op de **fysica van de transities** en de **Bento-grid structuur**. Gebruik uitsluitend de **Tone of Voice** gids voor de styling. De techniek moet 100% **Next.js ready** zijn."

**Dit is de blauwdruk voor de nieuwe standaard.** Zal ik deze mockup nu direct omzetten in een technische taak voor de `voices-be-core` React-app, zodat we de eerste "Bento-kaarten" kunnen gaan bouwen?
