# 🧠 SMART ROUTER DEEP-DIVE (2026)
## *Het Hart van de Voices Navigatie*

```json
{
  "_llm_context": {
    "type": "technical",
    "version": "1.0.0",
    "protocol": "CHRIS-V8",
    "description": "Diepgaande uitleg over de Smart Router en de Slug Registry."
  }
}
```

De **Smart Router** (`1-SITE/apps/web/src/app/[...slug]/page.tsx`) is de centrale verkeerstoren van Voices.be. In plaats van statische mappen voor elke pagina, gebruikt Voices een dynamisch systeem dat routes koppelt aan database-entiteiten.

---

## 🏗️ 1. DE SLUG REGISTRY (`slug_registry`)
Elke publieke URL op de site (behalve gereserveerde systeem-routes) MOET geregistreerd zijn in de `slug_registry` tabel in Supabase.

### Kernvelden:
- `slug`: De volledige URL-path (bijv. `johfrah` of `studio/workshop-naam`).
- `entity_id`: De UUID of ID van de gekoppelde entiteit (Actor, Article, Workshop, etc.).
- `entity_type_id`: Koppeling naar de `entity_types` tabel (1=actor, 3=article, 5=workshop, etc.).
- `market_code`: De markt waarvoor deze slug geldig is (`BE`, `NL`, `ALL`).
- `journey`: De IAP-journey (`agency`, `studio`, `academy`, `artist`, `ademing`).
- `world_id`: De visuele wereld (1=Agency, 2=Studio, 3=Academy, 4=Ademing).

---

## 🚦 2. HET RESOLUTION PROCES
Wanneer een gebruiker een URL bezoekt, doorloopt de Smart Router deze stappen:

1.  **System Protection**: Controleert of de slug een gereserveerd woord is (bijv. `admin`, `api`, `checkout`). Zo ja, dan wordt de Smart Router overgeslagen.
2.  **Registry Lookup**: Zoekt de slug op in de `slug_registry`.
3.  **Lazy Discovery (Auto-Healing)**: Als de slug niet in de registry staat, probeert de router de entiteit te vinden in de bron-tabellen (`actors`, `content_articles`, `workshops`). Als hij daar gevonden wordt, registreert hij de slug AUTOMATISCH in de registry.
4.  **Handshake**: Bepaalt het `routing_type` en de `world_id`.
5.  **Rendering**: Rendert de juiste Client of Server component op basis van het type.

---

## 🌍 3. MEERTALIGHEID & CANONICALS
De Smart Router ondersteunt meertalige slugs via de `slug_registry`.
- `over-ons` (NL) en `about-us` (EN) kunnen naar dezelfde `entity_id` wijzen.
- De router handelt automatische redirects af als een `canonical_slug` is ingesteld, wat cruciaal is voor SEO-integriteit.

---

## 🛠️ 4. BEST PRACTICES VOOR AGENTEN
- **No Static Folders**: Maak nooit een nieuwe map aan in `src/app/` voor een nieuwe pagina. Voeg de pagina toe aan de `content_articles` tabel en de `slug_registry`.
- **Registry First**: Controleer bij routing-fouten altijd eerst de `slug_registry` tabel in Supabase.
- **IAP Context**: Gebruik de `world_id` en `journey` uit de registry om de juiste UI-instrumenten te laden.

---

**WET:** De Smart Router is de enige bron van waarheid voor publieke navigatie. Wie de registry negeert, creëert een doolhof.
