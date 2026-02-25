# 📝 DATAGOLD: BLOG
## *De Bridge & Authority Assets van Voices.be*

Blogs zijn in de Datagold-strategie de "motoren" van de funnel. Ze transformeren zoekers in kopers door expertise te koppelen aan actie, gesegmenteerd per fase van de klantreis.

---

### 🏗️ CONTENT CATEGORISERING (Funnel Stages & Taxonomy)

We transformeren de platte blog-structuur naar een intelligente **Nuclear Taxonomy**. Bestaande termen uit de `blog` taxonomie worden gemapt naar onze Journeys en Sales Stages. 

**BELANGRIJK:** De "Nieuwe Journey" namen zijn uitsluitend voor intern gebruik. De frontend gebruikt "Clean Slugs".

| Oude Term | Interne Journey ID | Public Frontend Slug | Sales Stage | Asset Type |
| :--- | :--- | :--- | :--- | :--- |
| `keuzemenu-schrijftips` | `agency-telephony` | `/telefooncentrale` | `awareness` | Bridge Asset |
| `voicemail-voorbeeldteksten`| `agency-telephony` | `/telefooncentrale` | `decision` | Smart Configurator |
| `stories` | `agency-commercial` | `/commercials` | `ambassador` | Hybrid (Interview) |
| `achter-de-schermen` | `academy` | `/academy` | `consideration` | Studio Series |
| `out-of-office` | `agency-telephony` | `/out-of-office` | `decision` | Seasonal Hook |

#### 1. Bridge Assets (Awareness)
*   **Doel:** De zoeker opvangen die een technisch of praktisch probleem heeft.
*   **Datagold Actie:** Toon het **Vlaams Startpakket** of een link naar de **Smart Configurator**.

#### 2. Authority Assets (Consideration)
*   **Doel:** De twijfelaar overtuigen met diepgaande expertise.
*   **Datagold Actie:** Koppel deze blogs aan **Ambassador Reviews** van vergelijkbare persona's.

#### 3. Inspiration Assets (Studio Series)
*   **Doel:** Een persoonlijke band opbouwen en de droom verkopen.
*   **Auteur:** Altijd **Johfrah (The Mentor)**.
*   **Hook:** Directe link naar de fysieke **Voices Studio** workshops.

---

### ⚡ CONVERSIE HOOKS (Activation)

#### 1. Context-Aware Blog Widgets (De "Sector-Reskin")
Blogs zijn niet langer statisch; ze passen zich aan de sector van de lezer aan:
*   **De Widget:** Een interactieve Bento-kaart midden in het artikel.
*   **De Logica:** De widget leest de `current_intent.sector` uit de `VoicesState`.
*   **De Activatie:** 
    *   *Anoniem:* Toont een sector-selector ("Kies uw sector voor relevante voorbeelden").
    *   *Gedetecteerd:* Toont direct 3 **Blueprints** (geanonymiseerde scripts) uit die specifieke sector.
*   **Impact:** Een lezer die een blog over "Wachtmuziek" leest, ziet direct voorbeelden van zijn eigen sector (bijv. "Schilderwerken") in plaats van algemene teksten.

#### 2. Smart IVR Configurator (Klik-to-Buy)
*   **Stage:** Decision.
*   **Actie:** Scripts in de blog of widget krijgen een "Boek deze tekst" knop.
*   **Instant Re-skinning:** De placeholders `{{company_name}}` in de blogtekst worden live ingevuld zodra de lezer zijn gegevens verstrekt.
*   **Spatial:** Een sidepanel schuift open voor een vloeiende workflow.

#### 3. AI-Native Preview (Johfrah AI)
*   **Stage:** Consideration.
*   **Actie:** Voor blogs met script-voorbeelden bieden we een "Luister via Johfrah AI" optie. 
*   **Techniek:** De lezer hoort het script direct gegenereerd door de AI-stem van Johfrah. Dit geeft een instant preview van het resultaat.

#### 4. Interactive Audio (Players & Demo Carousels)
*   **Stage:** Consideration.
*   **Actie:** Dynamische injectie van stem-demo's die passen bij de blog-context en de gedetecteerde sector.
*   **Engagement:** De lezer kan direct luisteren zonder de pagina te verlaten.

#### 5. Proactieve "Temporal Outreach" (Human-in-the-Loop)
*   **Actie:** De engine stelt op basis van blog-interactie en historische data nieuwe artikelen of updates voor.
*   **Controle:** Deze voorstellen worden klaargezet in Johfrah's dashboard voor preview en autorisatie.

#### 6. Real-Time Relevance (Live Holidays)
*   **Actie:** Vakantie-artikelen gebruiken de `Holiday Engine` voor actuele data.
*   **Live:** Voorbeelden in de blog tonen altijd de data van de *eerstvolgende* vakantie (bijv. Pasen 2026).

---

### 👤 AUTHOR PERSONA'S
*   **Johfrah (The Multi-Faceted Expert):** De centrale stem van het platform. Zijn autoriteit is universeel, maar zijn presentatie is context-bewust.
    *   **Contextual Bio's:** De biografie van Johfrah past zich dynamisch aan de journey aan:
        *   **Telephony:** Focus op technische ontzorging, snelheid en de duizenden centrales die hij heeft ingericht.
        *   **Commercial:** Focus op artistieke impact, nationale campagnes en zijn rol als strategische partner.
        *   **Academy:** Focus op mentorschap, coaching en zijn passie om het vak door te geven aan studenten.
        *   **Ademing:** Focus op rust, mindfulness en de kracht van de stem als instrument voor welzijn.
*   **Voices.be (The Platform):** Gebruikt voor algemene aankondigingen, platform-updates en brede B2B expertise.

---

### ✍️ DE REWRITE STRATEGIE (Nuclear Optimization)

Elk artikel wordt herschreven om te fungeren als een **dynamische conversie-hub**. De focus verschuift van statische tekst naar een interactieve ervaring.

#### 1. De "Atomic" Structuur
*   **Contextual Intro:** Directe aansluiting bij de Persona en Journey (bijv. "Worstelt u ook met...").
*   **Expertise Core:** De kernwaarde van het artikel, geschreven door de juiste Author Persona (Johfrah of Voices.be).
*   **Dynamic Injection Points:** Plekken in de tekst waar we automatisch Datagold-assets laden:
    *   `[AMBASSADOR_BLOCK]`: Injecteert de meest relevante review.
    *   `[SMART_SCRIPT_BLOCK]`: Injecteert een script met "Klik-Klik-Klaar" knop.
    *   `[DEMO_CAROUSEL]`: Injecteert stem-demo's die passen bij de vibe.
    *   `[FAQ_BLOCK]`: Injecteert de top 3 meest relevante vragen.

#### 2. Linguistic Mirroring
*   Gebruik van de "Voice of the Customer" (bijv. "geknoei", "net echt", "kers op de taart") om de Sentiment Velocity te verhogen.

#### 3. Real-Time Relevance
*   Vervang harde data door dynamische placeholders voor vakanties en levertijden.

---

### 🔍 SEARCH & AI OPTIMIZATION (SEO, LLM & SCHEMA)

Elk artikel wordt voorzien van een onzichtbare intelligentie-laag die zowel zoekmachines (Google) als AI-modellen (LLM's) helpt de content te begrijpen en te vertrouwen.

#### 1. LLM Context Layer (`_llm_context`)
Een specifiek JSON-blok dat de essentie van het artikel samenvat voor AI-modellen zoals Voicy of ChatGPT:
*   `primary_intent`: Het hoofddoel van de tekst (bijv. "Educate on IVR setup").
*   `key_takeaways`: De 3 belangrijkste lessen.
*   `target_persona_profile`: Voor wie is dit geschreven?
*   `sentiment_velocity_target`: Welke emotionele verandering willen we bereiken?

#### 2. Advanced Schema Markup (JSON-LD)
We gaan verder dan standaard blog-schema. We voegen journey-specifieke schema's toe:
*   **`HowTo` Schema:** Voor Bridge Assets (bijv. "Hoe stel je een centrale in?").
*   **`FAQPage` Schema:** Voor de geïntegreerde FAQ-secties.
*   **`VideoObject` Schema:** Voor de YouTube video's en Studio Series.
*   **`Review` Schema:** Voor de gekoppelde Ambassador Reviews (Social Proof).

#### 3. SEO & Semantic Metadata
*   **`semantic_keywords`:** In plaats van alleen focus-keywords, slaan we een cluster van gerelateerde termen op die de autoriteit verhogen.
*   **`internal_authority_links`:** Automatische suggesties voor links naar de relevante Bijbels en Voicepages.

---
**ULTIEME DOEL:** De lezer van "Awareness" naar "Decision" brengen binnen de context van één artikel, terwijl Google en AI het artikel zien als de absolute autoriteit in de niche.
