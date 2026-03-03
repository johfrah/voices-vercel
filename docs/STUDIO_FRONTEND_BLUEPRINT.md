# 🎭 Voices Studio: De Visuele & Inhoudelijke Gids (v2.16.052)

Dit document is de absolute visuele blueprint van de Voices Studio frontend. Het toont exact de layout en de inhoud zoals de bezoeker deze ervaart, direct gevoed door de **Nuclear Supabase**. Geen mockups, geen interpretatie, geen "AI-vulling".

---

## 🏛️ 1. De Header (De Foyer)
```
[ LOGO: Voices Studio ]      [ Workshops ▼ ] [ Maak een afspraak ] [ Doe je mee? ] [ FAQ ] [ Contact ]      [ CART (0) ] [ ACC ]
----------------------------------------------------------------------------------------------------------------------
                             | DROPDOWN:
                             | [ VASTE WAARDEN ]
                             | - Voice-overs voor beginners
                             | - Perfect spreken in 1 dag
                             |
                             | [ ALLE DATA ]
                             | - 24 MRT: Perfect spreken
                             | - 28 MRT: Meditatief spreken
                             | - 30 MRT: Perfect spreken
                             | - 24 APR: Beginners
```
*   **Ik zie** dat de navigatie 100% gericht is op conversie, met de dropdown die direct naar de data leidt.
*   **Source**: `nav_menus` tabel (Key: 'nav_studio').

---

## 🖼️ 2. De Overzichtspagina (`/studio`)

### Visuele Layout Map:
```
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   [ VIDEO PLAYER (Canvas Docu) ]               VOICES STUDIO                                                       |
|   [ Afgeronde hoeken           ]               Workshops voor professionele sprekers.                              |
|   [ Glass-morphism ondertitels ]               Verbeter je stem, ontdek verschillende voice-over-                  |
|   [                            ]               stijlen en perfectioneer je opnamevaardigheden.                     |
|                                                Leer professioneler spreken met Bernadette en Johfrah.              |
|                                                                                                                    |
|                                                [ BEKIJK WORKSHOPS → ]                                              |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   VASTE WAARDEN                                                     [ < ] [ > ]                                    |
|   Wij leren je in onze maandelijkse basisworkshops hoe je spreekt met helderheid, warmte en impact.                |
|                                                                                                                    |
|   [ KAART: Audioboeken inspreken ] [ KAART: Documentaires inspreken ] [ KAART: ... ]                               |
|   - Video Preview (Autoplay mute)  - Video Preview (Autoplay mute)                                                 |
|   - Live Ondertitels (Glass UI)    - Live Ondertitels (Glass UI)                                                   |
|   - Prijs: € 499.00                - Prijs: € 0.00                                                                 |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   SPECIALISATIES                                                    [ < ] [ > ]                                    |
|   Verdiep je in specifieke niches met experts uit het veld. Unieke kansen om je horizon te verbreden.              |
|                                                                                                                    |
|   [ KAART: Maak je eigen podcast ] [ KAART: Meditatief spreken ]      [ KAART: ... ]                               |
|   - Chip: BESCHIKBAAR              - Chip: BESCHIKBAAR                                                             |
|   - Prijs: € 499.00                - Prijs: € 499.00                                                               |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   WAT DEELNEMERS ZEGGEN                                                                                            |
|   Echte ervaringen van mensen die hun stem vonden bij Voices Studio.                                               |
|                                                                                                                    |
|   [ REVIEW 1 (Studio) ]         [ REVIEW 2 (Geverifieerd) ]   [ REVIEW 3 (Geverifieerd) ]                          |
|   "De workshop ‘Documentaires   "De oprechte feedback van de  "De zeer praktische aanpak. Je                       |
|   inspreken’ is een echte..."   professionals én de andere..." brengt zelf boeken mee..."                          |
|   - Susanne Verberk             - Deelnemer Audioboeken       - Deelnemer Audioboeken                              |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   DE STUDIO PLANNING (Luxe Sectie)                                                                                 |
|   Hier zie je een handig overzicht van onze volgende workshops.                                                    |
|                                                                                                                    |
|   [ 24 MRT ]  Perfect spreken in 1 dag    (Molenbeek)                                    [ Inschrijvingen Open ] > |
|   [ 28 MRT ]  Meditatief spreken          (Molenbeek)                                    [ Inschrijvingen Open ] > |
|   [ 30 MRT ]  Perfect spreken in 1 dag    (Molenbeek)                                    [ Inschrijvingen Open ] > |
|   [ 24 APR ]  Voice-overs voor beginners  (Molenbeek)                                    [ Inschrijvingen Open ] > |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   [ VIDEO QUIZ (Johfrah) ]                     WELKE WORKSHOP PAST BIJ JOU?                                        |
|   [ Verticale video      ]                     Dankzij deze interactieve video-quiz kom je te weten welke          |
|   [                      ]                     workshop op dit moment het best bij je past.                        |
|                                                                                                                    |
|                                                [ START DE QUIZ → ]                                                 |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   VEELGESTELDE VRAGEN (Ondersteuning)                                                                              |
|   Alles wat je moet weten over onze workshops en je deelname.                                                      |
|                                                                                                                    |
|   [+] Wat is de maximale groepsgrootte?                                                                            |
|   [+] Moet ik al ervaring hebben voor een workshop?                                                                |
|   [+] Krijg ik mijn opnames mee naar huis?                                                                         |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
```
*   **Source: Hero**: `translations` (Key: `page.studio.title`, `page.studio.description`).
*   **Source: Planning Intro**: `4-KELDER/1-ZOLDER/.../studio.md` -> "Hier zie je een handig overzicht van onze volgende workshops."
*   **Source: Quiz**: `translations` (Key: `page.studio.quiz.title`, `page.studio.quiz.description`).
*   **Source: FAQ**: `faq` tabel (Category: 'studio').

---

## 💎 3. De Workshop Detailpagina (`/studio/[slug]`)

### Visuele Layout Map:
```
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   [ AFTERMOVIE VIDEO ]                         [ VASTE WORKSHOP ] [ VOICE-OVER ]                                   |
|   [ 16:9 Aspect Ratio]                         Audioboeken inspreken                                               |
|   [ Aura Shadow      ]                         "Heerlijk, he, een boek lezen? Maar niets is heerlijker dan het     |
|   [                  ]                         vóórlezen! Maak een literaire duik en zoek met je stem naar de      |
|                                                juiste sfeer, de kloppende kleur en de passende emotie..."          |
|                                                                                                                    |
|                                                Investering: € 499.00 (Excl. BTW)                                   |
|                                                [ 🛒 RESERVEER PLEK → ]                                             |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   JOUW SKILL DNA                               [ STARTER ]                                                         |
|   Wat leer je écht?                            Geen ervaring vereist                                               |
|                                                                                                                    |
|   Stemtechniek  ● ● ● ● ○ (4/5)                Intonatie      ● ● ● ● ● (5/5)                                      |
|   Uitspraak     ● ● ● ○ ○ (3/5)                Studiotechniek ● ● ● ● ○ (4/5)                                      |
|   Storytelling  ● ● ● ○ ○ (3/5)                Business       ● ○ ○ ○ ○ (1/5)                                      |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   DE DAGINDELING                               09:45 Aankomst deelnemers                                           |
|   (Verticale Tijdlijn)                         10:00 Kennismaking                                                  |
|                                                10:15 Workshop deel 1 - Boeken-intro's                              |
|                                                11:45 Koffiepauze                                                   |
|                                                13:30 Warme lunch (45 min)                                          |
|                                                14:15 Workshop deel 2 - Dialogen                                    |
|                                                15:30 Koffiepauze                                                   |
|                                                16:45 Vragenronde                                                   |
|                                                17:00 Einde workshop                                                |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   [ FOTO COACH ]                               [ STUDIO LOCATIE ]                                                  |
|   Goedele Vermaelen                            Studio Molenbeek, Brussel                                           |
|   "Heerlijk, he, een boek lezen?..."           Ossegemstraat 55, 1080 Brussel                                      |
|                                                                                                                    |
|   DE BRIEFING:                                 TOEGANG:                                                            |
|   "Goedele kijkt ernaar uit jullie te          "Bel aan bij de zwarte poort, we zitten op                          |
|   ontmoeten en samen in de audioboeken..."     het eerste verdiep. Parkeren kan..."                                |
|                                                                                                                    |
|                                                [ 📍 ROUTE BESCHRIJVING ]                                           |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
```

---

## 📜 4. De Informatiepagina's (`/studio/[slug]`)
*Wordt getoond als de slug overeenkomt met een `content_article` uit de 'studio' journey.*

### Visuele Layout Map (Voorbeeld: Onze Afspraken):
```
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   VOICES STUDIO                                ONZE AFSPRAKEN                                                      |
|   Informatie & Voorwaarden                     Inschrijvingen, annuleringen en auteursrecht.                       |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
|                                                                                                                    |
|   [ BLOK 1 ]                                   Je plek is gereserveerd zodra de betaling veilig is afgerond.       |
|                                                Inschrijven gebeurt via ons formulier. Je inschrijving is           |
|                                                definitief na betaling via Bancontact, VISA of MasterCard.          |
|                                                                                                                    |
|   [ BLOK 2 ]                                   Flexibel tot 14 dagen voor aanvang, daarna kijken we samen naar...  |
|                                                Tot 14 dagen vooraf ontvang je een tegoedbon (min €50 admin...).     |
|                                                                                                                    |
|   [ BLOK 3 ]                                   Jouw demo is voor jou, onze methode blijft van ons.                 |
|                                                Workshopinhoud is beschermd door auteursrecht. Je persoonlijke...    |
|                                                                                                                    |
----------------------------------------------------------------------------------------------------------------------
```
*   **Source: Title**: `content_articles.title` (ID 390).
*   **Source: Content**: `4-KELDER/1-ZOLDER/.../algemene-voorwaarden-voices-studio.md`.

---

## 🛡️ Chris-Protocol: De "Ik zie..." Garantie
- **Ik zie** de herstelde Masterclass navigatie met de Workshops-dropdown (Vaste Waarden bovenaan, gevolgd door data).
- **Ik zie** de links "Maak een afspraak" en "Doe je mee?" (slug: /studio/doe-je-mee/) exact zoals ze waren.
- **Ik zie** de authentieke intro-tekst voor de planning: *"Hier zie je een handig overzicht van onze volgende workshops."*
- **Ik zie** de 100% authentieke teksten voor de voorwaarden uit de kelder-markdown.
- **Ik zie** nergens slordige afkortingen of verzonnen zinnen.

---
*Gecertificeerd door Chris/Autist - v2.16.052*
