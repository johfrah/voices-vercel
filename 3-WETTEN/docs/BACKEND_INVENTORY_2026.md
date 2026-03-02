# 📊 Voices Backend Inventory (2026)

Dit document biedt een overzicht van alle backend-pagina's binnen het **Voices Dashboard**, hun status in het Spotlight Dock (CMD+K), en de ontbrekende schakels voor een volledige live-gang.

---

## 🎡 Spotlight Dock (Geïmplementeerd & Zichtbaar)

Deze pagina's zijn direct bereikbaar via de `SpotlightDashboard` component.

### 🏛️ Core & Operations
- **Command Center** (`/admin/dashboard`): Het centrale zenuwcentrum.
- **Workshop Dashboard** (`/admin/studio/workshops`): Beheer van workshop-edities.
- **Datamatch Monitor** (`/admin/datamatch`): Real-time data-integriteit check.
- **Voicy Chat** (`/admin/chat`): Directe interactie met de AI-assistent.
- **Analytics Hub** (`/admin/analytics`): Globale platform statistieken.
- **Klant Inzichten** (`/admin/insights`): AI-gedreven persona analyses.

### 📈 Analytics & Intelligence
- **UTM Attribution** (`/admin/marketing/utm`): Herkomst van bezoekers.
- **Visitor Intel** (`/admin/marketing/visitors`): Real-time drempelbewaking (Mat).
- **CTA AB Test** (`/admin/marketing/ab-test`): Conversie optimalisatie (Sally).
- **Trends & SWOT** (`/admin/marketing/trends`): Marktanalyses (Sherlock).

### 💰 Financieel & Commerce
- **Bestellingen** (`/admin/orders`): Overzicht van transacties.
- **Boekhouder Review** (`/admin/approvals`): Human-in-the-loop voor facturatie.
- **Yuki Dashboard** (`/admin/finance`): De boekhouding per journey.
- **Tarieven** (`/admin/rates`): Beheer van stem- en workshop prijzen.
- **Vouchers** (`/admin/vouchers`): Kortingscodes en promoties.
- **Omzet Monitor** (`/admin/finance/revenue`): Real-time inkomstenstroom.

### 🎙️ Agency & Voices
- **Voice Manager** (`/admin/voices`): Beheer van acteurs en statussen.
- **Product Catalogus** (`/admin/catalog`): Overzicht van alle audio-diensten.
- **Demo Beheer** (`/admin/demos`): Uploaden en taggen van stemdemo's.
- **Vakanties** (`/admin/vacations`): Globale en individuele afwezigheden.
- **Artist Dashboard** (`/admin/artists`): Specifieke tools voor artiesten.

### 🎨 Studio & Academy
- **Workshop Manager** (`/admin/workshops`): Algemeen workshop beheer.
- **Deelnemers** (`/admin/participants`): CRM voor cursisten.
- **Workshop Funnel** (`/admin/funnel`): Conversiepaden voor de studio.
- **Feedback** (`/admin/feedback`): Reviews en kwaliteitscontrole.
- **Meetings** (`/admin/meetings`): Planning van fysieke afspraken.
- **Academy Dashboard** (`/admin/academy`): Overzicht van het LMS.
- **Lessen Beheer** (`/admin/academy/lessons`): Content editor voor cursussen.

### ⚙️ Systems
- **Systeem Instellingen** (`/admin/settings`): Bedrijfsinfo en vakantieregels.
- **Voiceglot Registry** (`/admin/voiceglot`): Beheer van vertalingen en SEO keys.
- **OpenAI Intelligence** (`/admin/ai-settings`): Configuratie van Voicy Brain.
- **Core Locks** (`/admin/locks`): Beveiliging van kritieke database velden.
- **Media Engine** (`/admin/media`): Transcodering en asset management.
- **Vault** (`/admin/vault`): Beveiligde opslag van bronbestanden.
- **VibeCode** (`/admin/vibecode`): Real-time styling en DNA aanpassingen.
- **Security** (`/admin/security`): Audit logs en MFA instellingen.

---

## 🕵️ Geïmplementeerd (Maar niet in Spotlight)

Deze pagina's bestaan in de code, maar zijn nog niet opgenomen in het dock.

- **Navigation Editor** (`/admin/navigation`): Beheer van de Global Nav links.
- **Assignments** (`/admin/assignments`): Taakverdeling voor agents.
- **Photo Matcher** (`/admin/photo-matcher`): AI-tool voor content-beeld matching (Louis).
- **Photo Crop** (`/admin/photo-crop`): Beeldbewerking tool.
- **Database Manager** (`/admin/database`): Directe toegang tot Drizzle schema's.
- **Agent Manager** (`/admin/agents`): Beheer van de AI-agent mandaten.
- **VUME Test** (`/admin/vume`): Test-omgeving voor volume-metingen.
- **Studio Orphans** (`/admin/studio/orphans`): Deelnemers zonder gekoppelde datum.
- **Location Manager** (`/admin/studio/locations`): Beheer van workshop locaties.
- **Instructor Manager** (`/admin/studio/instructors`): Beheer van lesgevers.

---

## 🚀 Ontbrekende Schakels (Aanbevolen voor Live-gang)

Gebaseerd op de **Bob-methode** en de behoefte aan een "Nuclear Workflow", ontbreken de volgende modules nog:

1.  **Article/Blog Manager** (`/admin/articles`): Een visuele editor voor CMS-artikelen die direct de `contentArticles` tabel in Supabase voedt.
2.  **Journey Orchestrator** (`/admin/journeys`): Een visueel overzicht van alle actieve journeys (Agency, Artist, Portfolio) en hun specifieke DNA instellingen.
3.  **LLM Prompt Manager** (`/admin/prompts`): Een interface om de systeem-prompts van Voicy en de andere agents fijn te slijpen zonder code-deploys.
4.  **Translation Healing Dashboard** (`/admin/translations/heal`): Een centrale plek om ontbrekende vertalingen (Voiceglot) in bulk te laten 'healen' door de AI.
5.  **Partner Dashboard** (`/admin/partners`): Een portaal voor externe agentschappen die hun eigen acteurs en boekingen willen beheren.
6.  **Customer DNA Deep Dive** (`/admin/users/[id]/dna`): Een gedetailleerd profiel per klant met hun volledige interactie-geschiedenis en psychologische intentie.
7.  **Nuclear Content Factory** (`/admin/nuclear`): Een dashboard om grondstoffen uit de Kelder (`4-KELDER`) in bulk te transformeren naar de Etalage.

---

## 🛠️ Chris-Protocol Audit Status

| Pagina | Raleway | Natural Cap | 100ms Feedback | Voiceglot |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Voices | ✅ | ✅ | ✅ | ✅ |
| Finance | ✅ | ✅ | ✅ | ✅ |
| Studio | ✅ | ✅ | ✅ | ✅ |
| Mailbox | ✅ | ✅ | ⚠️ | ✅ |
| Orders | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

*Status: ⚠️ = In ontwikkeling / Needs Polish*

---
*Gegenereerd door Backend Bob op 18 februari 2026.*
