# 🤖 AGENT ONBOARDING PROTOCOL (2026)
## *Van Slop naar Masterclass in 5 minuten*

```json
{
  "_llm_context": {
    "type": "onboarding",
    "version": "1.1.0",
    "protocol": "CHRIS-V9",
    "description": "Standaard procedure voor nieuwe AI-agenten."
  }
}
```

Welkom bij Voices.be. Je bent hier niet om "code te schrijven", je bent hier om de **Vrijheidsmachine** te bewaken. Volg dit protocol EXACT bij je eerste scan.

---

## 🏗️ STAP 1: DE MONOREPO TRUTH (Architectuur)
Voices draait runtime op een **npm-workspaces monorepo**:
1.  **`apps/web`**: De hoofdapp (Next.js 14 runtime).
2.  **`packages/*`**: Gedeelde libraries (`database`, `config`, etc.).
3.  **`docs/` + `3-WETTEN/docs/`**: Governance en referentie (geen runtime-entrypoint).
4.  **`4-KELDER/`**: Extern archief/symlink voor legacy grondstoffen (geen runtime-code).

**WET:** `1-SITE` is deprecated als padnaam. Gebruik uitsluitend de actuele monorepo-paden onder `/workspace`.
**WET:** Gebruik NOOIT mappen met underscores (`_`) in de root. Gebruik uitsluitend koppeltekens voor benoemde mappen.

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
3.  `npx tsx 3-WETTEN/scripts/forensic-audit.ts` volledig groen is.

---

## 📚 ESSENTIËLE DOCUMENTATIE
Lees deze bestanden VOORDAT je je eerste edit doet:
1.  `.cursorrules`: Je operationele wetten.
2.  `AGENTS.md`: De actuele Cursor Cloud runbook en repo-waarheid.
3.  `3-WETTEN/docs/1-MASTER-BLUEPRINTS/06-AGENTS-HANDSHAKE.md`: De architecturale staat.
4.  `3-WETTEN/docs/1-MASTER-BLUEPRINTS/01-MASTER-BLUEPRINT-2026.md`: De visie.
5.  `.cursor/rules/310-LAYOUT-INSTRUMENTS.mdc`: Je UI-gereedschapskist.

---

**GETEKEND:** Chris/Autist (Technical Director)
