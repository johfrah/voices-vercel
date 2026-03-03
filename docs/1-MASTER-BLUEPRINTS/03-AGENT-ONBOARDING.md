# 🤖 AGENT ONBOARDING PROTOCOL (2026)
## *Van Slop naar Masterclass in 5 minuten*

```json
{
  "_llm_context": {
    "type": "onboarding",
    "version": "1.0.0",
    "protocol": "CHRIS-V8",
    "description": "Standaard procedure voor nieuwe AI-agenten."
  }
}
```

Welkom bij Voices.be. Je bent hier niet om "code te schrijven", je bent hier om de **Vrijheidsmachine** te bewaken. Volg dit protocol EXACT bij je eerste scan.

---

## 🏗️ STAP 1: DE HUIDIGE MONOREPO-STRUCTUUR (Architectuur)
Voices draait op de huidige monorepo-structuur:
1.  **`apps/`**: de actieve applicaties (Next.js etalage).
2.  **`packages/`**: gedeelde packages (config/database).
3.  **`docs/` + `scripts/`**: documentatie, audits en onderhoud.
4.  **`docs/archive/`**: legacy en grondstoffen.

**WET:** Gebruik NOOIT mappen met underscores (`_`) in de root. Gebruik uitsluitend kebab-case mapnamen.

---

## 🛡️ STAP 2: HET CHRIS-PROTOCOL (Discipline)
1.  **ID-First Handshake**: Gebruik uitsluitend UUID's voor interne logica. Slugs zijn voor URL's.
2.  **HTML Zero**: Gebruik uitsluitend `LayoutInstruments`. Rauwe HTML (`div`, `span`, `p`) is verboden.
3.  **ISO-First**: Gebruik uitsluitend ISO-codes (bijv. `nl-BE`, `fr-FR`).
4.  **No OpenAI**: We gebruiken Gemini en DeepSeek.

---

## 🚦 STAP 3: DE SMART ROUTER (Navigatie)
De Smart Router (`[...slug]/page.tsx`) is het hart van de site.
- Elke route MOET in de `slug_registry` tabel staan.
- Geen statische routes voor dynamische content.
- De router bepaalt de **IAP-context** (Market, Journey, Usage, Intent).

---

## 🚀 STAP 4: DE PUSH-PROCEDURE
Je mag pas pushen als:
1.  `npm run check:pre-vercel` succesvol is.
2.  De versie is verhoogd in `package.json` en `Providers.tsx`.
3.  `php scripts/core/maintenance/validate-root-clean.php` geen structurele fouten geeft.

---

## 📚 ESSENTIËLE DOCUMENTATIE
Lees deze bestanden VOORDAT je je eerste edit doet:
1.  `.cursorrules`: Je operationele wetten.
2.  `docs/1-MASTER-BLUEPRINTS/01-MASTER-BLUEPRINT-2026.md`: De visie.
3.  `.cursor/rules/310-LAYOUT-INSTRUMENTS.mdc`: Je UI-gereedschapskist.

---

**GETEKEND:** Chris/Autist (Technical Director)
