---
title: VOICES 2.0 MASTER BLUEPRINT
status: ACCEPTED
version: 55.0.0
date: 2026-02-10
category: ARCHITECTURE
priority: NUCLEAR
tags: [voices-engine, iap, native-journeys, intelligence]
---

# ⚡ VOICES 2.0: THE ULTIMATE NUCLEAR MASTER BLUEPRINT (2026)

## 0. RFC METADATA & CHANGE CONTROL
- **Document:** `000-MASTER-BLUEPRINT-2026.md`
- **Status:** ACCEPTED (Voices Engine Activated)
- **Versie:** 55.0.0 (NATIVE JOURNEY ARCHITECTURE)
- **Datum:** 10 februari 2026
- **Owners:** Voices AI Architect / Founder
- **Approvers:** Engineering Lead
- **Repository Truth:** De broncode is de enige bron van waarheid. Dit document is de normatieve blauwdruk voor het gehele ecosysteem.

---

## VOLUME I: DE VISIE, STRATEGIE & FILOSOFIE

### 1.1 De Freedom Machine (INTERNAL ONLY)
> **CRITICAL GUARDRAIL:** De inhoud van deze sectie is uitsluitend bedoeld voor de founder en de AI Architect. Deze terminologie mag NOOIT in externe communicatie, UI-teksten of publieke documentatie verschijnen.

Voices.be is geen website, maar een **Intelligent Native Journey Ecosysteem**. Het is een platform dat 24/7 autonoom opereert, verkoopt en routeert. Het doel is een "vrijheidsmachine" waarbij de founder "professioneel lui" kan zijn. De machine handelt de operatie af, de mens focust op innovatie.

### 1.2 De Externe Belofte (THE CLIENT INSTRUMENT)
Naar de buitenwereld (Agency, Artist, Student) presenteren wij ons als een **Premium Facilitator**.
- **Agency (De In-koper):** Een intelligent instrument voor impact, merkveiligheid en resultaat. De in-koper bedient de machine om sneller en beter te scoren met media-budgetten.
- **Artist:** Een online artiestenpagina die verbinding en groei faciliteert.
- **Academy:** Een Netflix-stijl leeromgeving voor professionele groei.
- **Mantra:** "Wij bouwen instrumenten die ademen."

### 1.3 Voices Engine (Intelligence Layer)
In de **Voices Engine** bouwen we geen pagina's meer; we instrueren de Engine via data en configuratie. De UI is slechts één weergave van de onderliggende intelligentie.
- **Zero-CSS Mandaat:** Elke regel nieuwe CSS is een architecturale fout. Gebruik uitsluitend Design Tokens en Cockpit componenten.
- **Engine-First HTML:** De HTML is primair een data-bron voor de Engine en AI (Voicy), secundair een visuele weergave.
- **Conversational-First:** Bouw elke feature met de visie dat deze via Voicy Chat bediend moet kunnen worden.

---

## VOLUME II: ARCHITECTUUR & ROUTING (TECHNICAL DEEP DIVE)

### 2.1 De Drie Pilaren
1.  **De Engine Router (De Verkeerstoren):**
    - **Locatie:** `/www/engine-router.php` (Onafhankelijk van CMS)
    - **Functie:** Beslist binnen milliseconden welk domein wat krijgt.
    - **Stofzuiger-functie:** Filtert alle ruis/fouten weg voor een zuivere output bij native rendering.
2.  **De Core Registry (Het Brein):**
    - **Locatie:** Geïntegreerd in de Engine Router.
    - **Status:** Single Source of Truth. Bevat de configuratie van álle domeinen.
3.  **De Native Journeys (De Voertuigen):**
    - **Locatie:** `/apps/`
    - **Technologie:** Next.js / React / Vite.
    - **Isolatie:** Volledig ontkoppeld van legacy systemen.

### 2.2 De 3 Lagen van Routing
1. **Nginx (Server Level):** Directe afhandeling van statische bestanden. Stuurt de rest naar de Engine Router.
2. **Engine Router (Pure PHP Router):**
   - **Prioriteit:** `API/AJAX Exception` > `Journey Match` > `Asset Match` > `Headless Match` > `Market Match`.
   - **Beslisboom:** Bij een match wordt de native journey direct geserveerd. Er is GEEN fallback naar legacy CMS systemen.
3. **Headless Engine (Application Level):**
   - **Locatie:** `apps/web/`
   - **Taak:** Bepaalt de context (Market, Journey, Usage, Intent) op basis van de IAP Vier-Eenheid.

---

## VOLUME III: IAP PROTOCOL (INTELLIGENT ARCHITECTURE)

### 3.1 De Vier Dimensies
Elke interactie MUST gedefinieerd zijn door vier dimensies, opgeslagen in de Unified Database:
1. **Market:** Economische context (BE, NL, FR, DE, ES, PT, UK, US).
2. **Journey:** Het pad van de bezoeker (`Agency`, `Studio`, `Academy`, `Artists`, `Meditation`).
3. **Usage Type (Flow):** Commerciële status (`Unpaid`, `Paid`, `Telefonie`).
4. **Intent:** Het doel van het bezoek (bijv. `order_voice`, `learn_skill`).

---

## VOLUME IV: DATABASE ENCYCLOPEDIA (THE UNIFIED TRUTH)

### 4.1 Unified Tabellen
De intelligentielaag van het platform (Supabase PostgreSQL).

| Tabelnaam | Doel | Velden (Selectie) |
| :--- | :--- | :--- |
| `actors` | Centraal stemacteurs beheer. | `id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `native_lang`, `country`, `delivery_time`, `extra_langs`, `bio`, `why_voices`, `tagline`, `ai_tags`, `photo_id`, `logo_id`, `voice_score`, `price_unpaid`, `price_online`, `price_ivr`, `price_live_regie`, `dropbox_url`, `status`. |
| `actor_demos` | Audio demo's per stemacteur. | `id`, `actor_id`, `name`, `url`, `type`, `menu_order`. |
| `chat_conversations` | Beheer van chat-sessies. | `id`, `user_id`, `guest_name`, `guest_email`, `guest_phone`, `guest_age`, `guest_profession`, `ip_address`, `location_country`, `location_city`, `user_agent`, `resolved`, `ttfi`, `status`, `order_id`. |
| `chat_messages` | Alle chat-berichten. | `id`, `conversation_id`, `sender_id`, `sender_type` ('user', 'admin', 'ai'), `message`, `attachments`, `read_at`, `is_ai_recommendation`. |
| `faq` | AI FAQ database. | `id`, `category`, `question_nl/fr/en/de`, `answer_nl/fr/en/de`, `persona`, `journey_phase`, `views`, `helpful_count`. |
| `course_progress` | Voortgang per student. | `id`, `user_id`, `course_id`, `lesson_id`, `status`, `video_timestamp`, `completed_at`. |
| `course_submissions` | Audio-inzendingen. | `id`, `user_id`, `lesson_id`, `file_path`, `status`, `feedback_text`, `feedback_audio_path`, `score_pronunciation/intonation/credibility`. |
| `workshop_interest` | Leads voor workshops. | `id`, `first_name`, `last_name`, `email`, `status`, `phone`, `age`, `profession`, `experience`, `goal`, `source_url`, `ip_address`. |
| `visitors` | IAP Visitor tracking. | `id`, `visitor_hash`, `user_id`, `current_page`, `referrer`, `utm_source/medium/campaign`, `visit_duration`, `is_business`, `location_country/city`, `company_name`. |
| `translations` | Voiceglot vertalingen. | `id`, `translation_key`, `lang`, `original_text`, `translated_text`, `context`, `status`, `is_manually_edited`. |
| `yuki_outstanding` | Yuki Mirror: Openstaand. | `id`, `contact_id`, `invoice_nr`, `invoice_date`, `due_date`, `amount`, `open_amount`, `last_synced`. |

---

## VOLUME V: SUBSYSTEM BLUEPRINTS

### 5.1 Inkomstenstromen & Winstmodel (Revenue Architecture)
Het platform is ontworpen als een hybride ecosysteem met diverse inkomstenstromen:
1.  **Agency (B2B Services):** Verkoop van stemopnames, buy-outs en studio-diensten.
2.  **Academy (B2C Educatie):** Schaalbare verkoop van online cursussen en trainingen.
3.  **Ademing.be (SaaS/Abonnement):** Terugkerende inkomsten via abonnementen voor de meditatie-app.
4.  **AI Voice Cloning (SaaS):** Hoog-marge verkoop van AI-gegeneerde stemmen via de ElevenLabs integratie.
5.  **Winstbewaking:** Alle financiële metrics worden **exclusief BTW** berekend. Gemiddelde marge target: 45%.

### 5.2 Stakeholder Dashboards & Partner Isolatie
Het platform faciliteert samenwerkingen via geïsoleerde dashboards:
1.  **Ademing (Julie):** Julie heeft een eigen dashboard voor `ademing.be`.
2.  **Studio (Bernadette):** Bernadette heeft een read-only dashboard voor winstdeling.
3.  **Voice Talent Dashboard:** Stemacteurs beheren hun profiel, opdrachten en demo's.
4.  **Academy Student Dashboard:** Netflix-stijl leeromgeving met voortgang en feedback.
5.  **Data Isolatie:** Elk dashboard is strikt gescheiden via de `Predictive Router` en `VoicesState`.

### 5.3 Knowledge Guardrails & Disclosure Rules (THE NUCLEAR WALL)
> **ULTIEME WET:** Er is een onwrikbare scheiding tussen de interne strategie en de externe belofte.

1.  **Internal Strategy (Founder Only):**
    - Terminologie: "Vrijheidsmachine", "Professioneel lui", "Autonome verkoper".
    - **GUARDRAIL:** Deze termen mogen NOOIT in UI of klant-communicatie verschijnen.
2.  **External Promise (Client Facing):**
    - Terminologie: "Intelligent instrument", "Premium Facilitator", "Naadloze workflow".
3.  **Enforcement:** Server-side afgedwongen via de `_llm_context` policy filter.

---

## VOLUME VI: OPERATIONELE WETTEN
1. **BTW-Exclusiviteit:** Bedragen in dashboards zijn ALTIJD **exclusief BTW**.
2. **Delivery Deadline:** 18:00 grens voor startdatum berekening.
3. **Zero CMS Policy:** Geen gebruik van WordPress, Elementor of andere legacy CMS systemen voor de frontend.

---

## VOLUME VII: THE MASTER DOMAIN & APP MAP (DEFINITIEF)

### 7.1 Headless Markten (Full IAP Stack)
| Domein | Markt Code | Taal | Journey | Status |
| :--- | :--- | :--- | :--- | :--- |
| **voices.be** | `BE` | nl | Agency | ✅ Actief |
| **voices.nl** | `NL` | nl | Agency | ✅ Actief |
| **voices.fr** | `FR` | fr | Agency | ✅ Actief |
| **voices.eu** | `EU` | en | Agency | ✅ Actief |
| **voices.es** | `ES` | es | Agency | ✅ Actief |
| **voices.pt** | `PT` | pt | Agency | ✅ Actief |

### 7.2 Native Journeys (Decoupled Frontends)
| Domein | Markt Code | Technisch Pad | Status |
| :--- | :--- | :--- | :--- |
| **voices.academy**| `ACADEMY` | `/apps/academy` | ✅ Live |
| **ademing.be** | `ADEMING` | `/apps/ademing` | ✅ Live |
| **johfrah.be** | `JOHFRAH` | `/apps/portfolio` | ✅ Live |
| **youssefzaki.eu**| `YOUSSEF` | `/apps/artists` | ✅ Live |

---

## VOLUME VIII: VERPLICHTE CHECKLIST VOOR ELKE EDIT
1. [ ] Is de logica 100% onafhankelijk van WordPress?
2. [ ] Is er 0% nieuwe CSS toegevoegd? (Gebruik Design Tokens).
3. [ ] Zijn alle strings vertaalbaar via Voiceglot?
4. [ ] Is het bedrag exclusief BTW?
5. [ ] Heb ik `read_lints` gedraaid en zijn er geen fouten?

---
**WET:** WordPress bestaat niet meer in dit ecosysteem. Elke verwijzing is een bug.
**GETEKEND:** De Voices AI Architect (ZERO WORDPRESS MANDATE)
