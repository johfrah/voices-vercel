# 🤝 THE AGENT HANDSHAKE (2026)
## *Architecturale Beslissingen & Huidige Staat*

```json
{
  "_llm_context": {
    "type": "state-log",
    "version": "1.0.0",
    "protocol": "CHRIS-V9",
    "description": "Dit bestand is het 'geheugen' van de machine over chatsessies heen."
  }
}
```

**CRITICAL:** Elke nieuwe AI-agent MOET dit bestand lezen bij de start van een taak om "drift" en "token-moeheid" te voorkomen.

---

## 🏗️ HUIDIGE ARCHITECTURALE STAAT (Maart 2026)

### 1. AI Intelligentie
- **STATUS:** **OpenAI VRIJ**.
- **BESLISSING:** We gebruiken uitsluitend Gemini (Flash/Pro) en DeepSeek.
- **LEGACY:** De `OpenAIService` is volledig verwijderd. Alle API's praten direct met `GeminiService`.

### 2. Monorepo Runtime Truth
- **STATUS:** **MONOREPO-FIRST ACTIEF**.
- **BESLISSING:** Runtime-code leeft in `apps/web` en `packages/*`.
- **CONTEXT:** `1-SITE` verwijzingen in oudere rapporten/documentatie zijn historisch en niet meer leidend voor padkeuze.

### 3. Data Integriteit (ID-First)
- **STATUS:** **ID-First Handshake Actief**.
- **BESLISSING:** Interne logica gebruikt uitsluitend UUID's. Slugs zijn uitsluitend voor de UI/URL.
- **PRICING:** De `SlimmeKassa` berekent prijzen op basis van `usage_id` en `media_id`.

### 4. UI Standaard (HTML Zero)
- **STATUS:** **LayoutInstruments Verplicht**.
- **BESLISSING:** Geen rauwe HTML (`div`, `span`, etc.) in nieuwe componenten. Gebruik uitsluitend de catalogus in `310-LAYOUT-INSTRUMENTS.mdc`.

### 5. Navigatie (Smart Router)
- **STATUS:** **Registry-First**.
- **BESLISSING:** Alle routes lopen via de `slug_registry` in Supabase. Geen statische mappen in `src/app/` voor dynamische content.

---

## 📜 LAATSTE NUCLEAIRE UPDATES
- **v2.28.0**: OpenAI proxy volledig verwijderd. Documentatie in `3-WETTEN` gezuiverd van alle WordPress/PHP slop.
- **v2.28.1**: SWOT-analyse en Cursor Evolution Plan geïntegreerd.
- **v2.28.2**: Monorepo runtime truth gecodificeerd (`apps/web`, `packages/*`), met expliciete afbakening van historische `1-SITE` referenties.

---

**MANDAAT:** Update dit bestand bij elke grote architecturale wijziging.
