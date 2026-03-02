# Voices Headless - De Wet (2026)

Dit project volgt een strikte "Unified Headless" architectuur. Niets mag buiten deze structuur vallen.

## 📂 De Onverwoestbare Structuur

### 📱 apps/
- **web/**: De Next.js motor (voorheen next-experience).
  - `src/content/`: **DE GOUDEN BRON**. Alle Markdown artikelen & fragmenten.
  - `src/app/`: De routes (agency, portfolio, johfrai).
  - `public/`: Alleen web-specifieke zaken (favicons, manifest).

### 📦 packages/
- **database/**: Drizzle schema's & migraties. Eén bron voor de DB.
- **config/**: Domein-instellingen (BE, NL, ES, PT, EU, Ademing).

### 🛠️ scripts/
- **nuclear-sync/**: Cloud synchronisatie scripts.
- **maintenance/**: Database opschonen, link checks.
- **imports/**: Eenmalige import-scripts.

### 📄 docs/
- **roadmaps/**: Strategische plannen.
- **progress-tracker.md**: De status van de bouw.

### 🗄️ data/
- **exports/**: CSV, JSON en TXT dumps.
- **backups/**: Database snapshots.

## 📜 Workflow Wetten (IAP & NUCLEAR PROTOCOL)

1. **Geen Rommel in de Root**: Alleen `package.json`, `.cursorrules`, en `tsconfig.json` mogen hier staan.
2. **Content First (Voiceglot)**: Hardcoded tekst in UI is VERBODEN. Gebruik ALTIJD `<VoiceglotText translationKey="..." defaultText="..." />`.
3. **Zero AI Slop**: Vermijd vage termen als "eenvoudig", "uniek" of "impact". Gebruik de taal van vakmanschap: **retentie**, **autoriteit**, **merkwaarde**, **48kHz**.
4. **Zero Ego / Founder Soul**: Schrijf direct en vakkundig. Wij bouwen **instrumenten**, geen "oplossingen".
5. **IAP Awareness**: Elke route moet de `_llm_context` (Journey, Persona, Intent) injecteren voor de Intelligence Layer.
6. **God Mode (Internal Only)**: Gebruik termen als "Freedom Machine" of "Nuclear" uitsluitend in interne documentatie/scripts, NOOIT in de frontend.
7. **Zero Laws**: Wees 100% transparant over prijzen en data. Geen vage "vanaf" prijzen.
8. **Linter-First**: Elke edit wordt getoetst aan `npm run lint`. Fouten in de beheer-omgeving zijn fataal voor de deploy.

## 🚀 PIPELINE-SAFE CODING (COMBELL MANDATE)

1. **Linter-First Mandate**: Voer ALTIJD `npm run lint` uit in `apps/web` na het wijzigen van imports of componenten. Fouten in de linter = gegarandeerde fail in de pipeline.
2. **Centralized Imports Only**: Importeer UI-instrumenten (Container, Button, Heading, Text, PageWrapper, etc.) UITSLUITEND vanuit `@/components/ui/LayoutInstruments`. Individuele bestandsimports voor deze componenten zijn STRIKT VERBODEN.
3. **Dependency Check**: Voordat je een nieuwe library gebruikt, verifieer of deze in `apps/web/package.json` staat. Zo niet: installeer deze eerst lokaal.
4. **Clean JSX/TSX**: Houd JSX-structuren simpel en leesbaar. Vermijd complexe TypeScript types binnen JSX die de Next.js compiler in een strikte CI-omgeving kunnen verwarren.
5. **Workspace Awareness**: Begrijp dat dit een monorepo is. Wijzigingen in de root `package.json` beïnvloeden alle apps.

## ⚠️ CRITICAL SAFETY PROTOCOL

1. **SYMLINK AWARENESS**: Verwijder NOOIT een bronmap (`assets/`) voordat je 100% hebt geverifieerd dat de doelmap (`public/assets/`) GEEN symlink is. 
2. **NO DESTRUCTIVE CONSOLIDATION**: Gebruik `mv` (verplaatsen) in plaats van `rm` voor media en unieke data.
3. **ZERO-DELETE POLICY (SERVER)**: Op Combell wordt NOOIT een `delete` uitgevoerd. Alles gaat naar `/ARCHIVE/`.
