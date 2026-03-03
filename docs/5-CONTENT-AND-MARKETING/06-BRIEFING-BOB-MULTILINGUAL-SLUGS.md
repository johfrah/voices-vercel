# ☢️ NUCLEAR BRIEFING: MULTILINGUAL SLUG ARCHITECTURE (2026)

**Aan: Bob (Orchestrator)**
**Van: Mark (Digital Architect)**
**Status: CRITICAL / ARCHITECTURAL SHIFT**

## 1. De Situatie
De "Nuclear Workflow" voor vertalingen via Voiceglot werkt uitstekend voor content, maar we lopen nu tegen de grenzen van de URL-architectuur aan. Momenteel zijn de slugs (bijv. `/fr/studio/perfect-spreken/`) nog in het Nederlands, wat de psychologische conversie en SEO-waarde in buitenlandse markten verzwakt.

## 2. De Uitdaging (Root Causes)
*   **Data Fragmentatie**: Slugs staan hardcoded in de `workshops` tabel (Source of Truth), maar moeten per taal variëren.
*   **Routing Collision**: Next.js moet weten dat `/fr/studio/parler-parfaitement/` naar dezelfde workshop ID wijst als `/nl/studio/perfect-spreken/`.
*   **Database Limieten**: We raken momenteel de "Max client connections" op de Supabase Pooler bij bulk-operaties.

## 3. Het Masterplan (De Bob-Methode)

### Fase 1: Database Verrijking (The Registry)
We gaan niet de `workshops` tabel vervuilen met taal-kolommen. In plaats daarvan gebruiken we de bestaande `translations` tabel als **Slug Registry**.
*   **Key Format**: `slug.workshop.[ID]`
*   **Value**: De vertaalde, URL-vriendelijke slug.

### Fase 2: Intelligent Routing (The Resolver)
De `StudioDataBridge` moet uitgebreid worden met een `getWorkshopBySlugAndLang` methode.
1.  Zoek in `translations` naar de key `slug.workshop.%` waar de `translated_text` matcht met de gevraagde URL-slug.
2.  Indien gevonden: haal de workshop op via het ID uit de key.
3.  Indien niet gevonden: fallback naar de originele slug in de `workshops` tabel.

### Fase 3: Bulk Healing (The Agents)
Ik heb een `translate_slugs.ts` script klaargezet. Bob moet dit script orkestreren over alle agents:
*   **Agent 1 (Cleanup)**: Sluit alle openstaande database connecties om de "Max connections" error te verhelpen.
*   **Agent 2 (Translation)**: Draai het script om voor alle 14+ workshops Franse, Engelse en Duitse slugs te genereren via OpenAI.
*   **Agent 3 (Validation)**: Controleer op slug-collisions (twee workshops die per ongeluk dezelfde vertaalde slug krijgen).

## 4. Chris-Protocol Mandaten
*   **Raleway Mandate**: Alle foutmeldingen bij routing moeten in font-light Raleway.
*   **100ms Feedback**: De slug-resolver moet binnen 100ms de juiste workshop ID teruggeven.
*   **Zero-Slop UI**: Geen 404's tijdens de transitie; behoud de NL-slugs als permanente redirect/fallback.

**Bob, neem de leiding. Transformeer de URL-structuur naar een internationaal visitekaartje.**

---
*Gegenereerd door Mark - Voices OS 2026*
