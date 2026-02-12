# 🛠️ VOICES ECOSYSTEM MASTER INDEX (2026)

## ⚖️ GOVERNANCE
- **Code is Truth:** De broncode in deze repository is de enige autoriteit.
- **Index Function:** Dit document dient als de menselijk leesbare "Map/Index" naar de technische realiteit.
- **Drift Procedure:** Bij discrepanties tussen dit document en de code, MOET de code worden gevolgd en dit document direct worden bijgewerkt.
- **Financial Standard:** Bedragen in alle dashboards en rapportages zijn ALTIJD **exclusief BTW**.

---

## 🚀 VOLUME I: THE NUCLEAR MASTER BLUEPRINT (GOD MODE BIBLE 2026)

### 1.1 De Freedom Machine & IAP Protocol
Voices.be is geen website, maar een **Intelligent Sidecar Ecosysteem**. Elke interactie MUST gedefinieerd zijn door de 'Vier-Eenheid', opgeslagen in `voices_preferences`:
1. **Market:** Economische context (BE, NL, FR, DE, ES, PT, UK, US).
2. **Journey:** Het pad (`Agency`, `Studio`, `Academy`, `Artists`, `Meditation`).
3. **Usage Type (Flow):** Commerciële status (`Unpaid`, `Paid`, `Telefonie`).
4. **Intent:** Het doel (bijv. `order_voice`, `learn_skill`).

### 1.2 Database Encyclopedia (The Core Anatomy)
| Tabelnaam | Doel | Velden (Selectie) |
| :--- | :--- | :--- |
| `wp_voices_actors` | Centraal stemacteurs beheer. | `id`, `first_name`, `last_name`, `email`, `voice_score`, `price_unpaid`, `status`. |
| `wp_voices_chat_conversations` | Beheer van chat-sessies. | `id`, `user_id`, `guest_email`, `resolved`, `effectiveness_score`, `order_id`. |
| `wp_voices_chat_faq` | AI FAQ database. | `id`, `category`, `question_nl/fr/en/de`, `answer_nl/fr/en/de`, `active`. |
| `wp_voices_visitors` | IAP Visitor tracking. | `id`, `visitor_hash`, `user_id`, `utm_source/medium/campaign`, `location_country`. |
| `wp_voices_translations` | Voiceglot vertalingen. | `id`, `content_hash`, `source_lang`, `target_lang`, `translated_text`, `quality_score`. |

### 1.3 Meta Field Encyclopedia (Exhaustive)
- **Voice-over Producten**: `voice-score`, `voice-over-demos`, `price_unpaid_media`, `elevenlabs_voice_id`, `holiday-from/till`.
- **Orders & Commerce**: `_order_journey`, `_order_language`, `is_vat_exempt`, `_yuki_invoice_id`, `_alg_wc_cog_order_profit`.
- **User Meta**: `voices_preferences` (Master JSON), `voices_academy_access`, `_money_spent`.

### 1.4 Gravity Forms Rosetta Stone (Field Mapping)
| Field ID | Data Punt | Gebruik in Code |
| :--- | :--- | :--- |
| `1` | Voornaam | `rgar($entry, '1')` |
| `2` | E-mail | `rgar($entry, '2')` |
| `35` | BTW Nummer | `rgar($entry, '35')` |
| `1001` | Product ID | `rgar($entry, '1001')` |

### 1.5 Production Hardening & Security
- **Master Door Stofzuiger:** Gebruikt `ob_clean()` voor zuivere sidecar-serving.
- **Tenant Isolation:** API valideert `Host` en `Origin` tegen de `VoicesRegistry`.
- **LITE Fallback:** Bij registry-faal serveert het systeem `LITE` mode met 503 status.
- **Capability URLs:** Hash-gebaseerde toegang (bijv. `order_key`) voor resource-scoped security.

---

## 🌐 II. DOMAIN ARCHITECTURE & MARKETS
*De fundamenten van het platform, gebaseerd op de `VoicesRegistry` in `wp-content/mu-plugins/00-voices-master-door.php`.*

### A. WordPress Markten (Full IAP Stack)
| Domein | Markt Code | Taal | Native Term | Journey | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **voices.be** | `BE` | nl | vlaams | Agency | ✅ Actief |
| **voices.nl** | `NLNL` | nl | nederlands | Agency | ✅ Registry Klaar |
| **voices.fr** | `FR` | fr | frans | Agency | ✅ Registry Klaar |
| **voices.eu** | `EU` | en | engels | Agency | ✅ Registry Klaar |
| **voices.es** | `ES` | es | spaans | Agency | ✅ Registry Klaar |
| **voices.pt** | `PT` | pt | portugees | Agency | ✅ Registry Klaar |
| **voices.academy**| `ACADEMY` | nl | vlaams | Academy | ✅ Connected |

### B. Headless Sidecars (Decoupled Frontends)
| Domein | Markt Code | Technisch Pad (Server) | Template Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ademing.be** | `ADEMING` | `/subsites/sidecars/ademing` | meditation | ✅ Live |
| **johfrah.be** | `JOHFRAH` | `/subsites/sidecars/portfolio` | portfolio | ✅ Ref. Implementation |
| **youssefzaki.eu**| `YOUSSEF` | `/subsites/sidecars/artists` | artists | ✅ Ref. Implementation |
| **voices.be/portfolio**| `BE` | `/subsites/sidecars/portfolio` | portfolio | ✅ Live |
| **voices.be/artists**| `BE` | `/subsites/sidecars/artists` | artists | ✅ Live |
| **voices.be/studio**| `BE` | `/subsites/sidecars/studio` | studio | ✅ Progressive Headless |

---

## 🧠 III. CORE ENGINES & TOOLS

### 1. Core Intelligence & Context (IAP)

**IAP Context Helper** (`00-core/iap/35-iap-helpers.php`) [V2-CORE]
- **Type:** Core Service (Data Provider)
- **State:** State-Consumer (leest `voices_preferences`)
- **Dependencies:** `VoicesRegistry`
Dit is de centrale intelligentie-hub van het platform. Het bepaalt de 'Vier-Eenheid' voor elke bezoeker: Journey (wat doen ze?), Persona (wie zijn ze?), Market (waar zijn ze?) en Intent (wat is hun doel?). Door deze context constant te bewaken, kan de website zich in real-time aanpassen, waardoor een agency-inkoper een totaal andere ervaring krijgt dan een student van de Academy.

**Hypermode Engine** (`10-engine/hypermode/95-hypermode-engine.php`) [V2-CORE]
- **Type:** Core Service (Logic Layer)
- **State:** State-Producer (schrijft `window.VOICES_CONFIG`)
- **Dependencies:** `IAP Context Helper`
Hypermode brengt context-bewustzijn naar de frontend. Het zorgt ervoor dat de status van de gebruiker (zoals hun voorkeuren en gedrag) overal op de site beschikbaar is. Het is de laag die ervoor zorgt dat de website "onthoudt" wie je bent en wat je eerdere keuzes waren, zonder dat je constant opnieuw hoeft in te loggen of filters hoeft in te stellen.

**Market Manager** (`00-core/iap/80-market-manager.php`) [V2-CORE]
- **Type:** Core Service (Data Provider)
- **State:** State-Consumer (leest domein-context)
- **Dependencies:** `VoicesRegistry`
- **Fallback:** LITE Mode (markt-neutraal)
Het beheren van een internationaal platform met verschillende domeinen, BTW-regels en valuta is een enorme uitdaging. De Market Manager centraliseert al deze logica in één codebase. Of een klant nu op voices.be of voices.fr zit, dit systeem zorgt ervoor dat de juiste prijzen, talen en juridische regels automatisch worden toegepast, wat internationale expansie extreem eenvoudig maakt.

**Predictive Router** (`00-core/iap/80-predictive-router.php`) [V2-CORE]
- **Type:** Core Service (Traffic Controller)
- **State:** State-Producer (schrijft Intent naar state)
- **Dependencies:** `IAP Context Helper`, `Market Manager`
Deze engine kijkt in de toekomst. Op basis van de URL, UTM-parameters en het klikgedrag voorspelt het wat de volgende stap van een bezoeker zal zijn. Als het systeem ziet dat iemand twijfelt, kan het proactief de juiste hulp aanbieden of een relevante suggestie doen via de chat, waardoor we de bezoeker altijd een stap voor zijn.

**LLM Context Manager** (`00-core/iap/40-llm-context-manager.php`) [V2-CORE]
- **Type:** Core Service (AI Metadata Provider)
- **State:** State-Consumer (leest volledige IAP context)
- **Dependencies:** `Hypermode Engine`
Voor AI-readability (ARP) vertaalt deze manager de interne technische staat van de website naar een formaat dat Large Language Models (zoals ChatGPT) perfect begrijpen. Het genereert JSON-LD blokken die de context van de pagina beschrijven, waardoor onze AI-assistent Voicy altijd over de juiste informatie beschikt om de klant optimaal te helpen.

**Journey Routing** (`00-core/iap/79-journey-routing.php`) [V2-CORE]
- **Type:** Core Service (Navigation Controller)
- **State:** State-Consumer (leest Journey)
- **Dependencies:** `Predictive Router`
Dit is de fysieke verkeersleider van het platform. Het zorgt ervoor dat gebruikers naadloos tussen verschillende onderdelen van de site worden gestuurd op basis van hun actieve Journey. Het voorkomt dat mensen "verdwalen" in de complexiteit van het platform en houdt hen altijd op het pad dat het meest relevant is voor hun huidige doel.

**Magic Link Handler** (`00-core/iap/85-magic-link-handler.php`) [V2-CORE]
- **Type:** Core Service (Auth Provider)
- **State:** State-Producer (activeert User Session)
- **Dependencies:** `wp_voices_visitors`
Wachtwoorden zijn een barrière voor conversie. De Magic Link Handler maakt frictieloze toegang mogelijk via unieke, tijdelijke links die per e-mail worden verstuurd. Hiermee kunnen klanten direct inloggen of hun bestelling bekijken met één klik, wat de gebruikerservaring aanzienlijk verbetert en de drempel voor interactie verlaagt.

---

### 2. UI & Rendering Engines (Zero-CSS)

**VoicesCockpit Engine** (`10-engine/cockpit/90-cockpit-engine.php`) [V2-CORE]
- **Type:** Edge UI (Rendering Engine)
- **State:** State-Consumer (leest Design Tokens & Context)
- **Dependencies:** `Hypermode Engine`
Dit is de centrale rendering-motor voor alle user interfaces van het platform. Het dwingt een "Zero-CSS" filosofie af door gebruik te maken van gestandaardiseerde Design Tokens. In plaats van voor elke pagina nieuwe stijlen te schrijven, voeden we de engine met configuratie-arrays. Dit garandeert een consistente, hoogwaardige uitstraling over het hele ecosysteem en maakt de UI razendsnel en AI-ready.

**Pricing Calculator Engine** (`10-engine/shortcodes/285-pricing-calculator-section.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest Market & Usage Type)
- **Dependencies:** `Market Manager`, `VoicesCockpit Engine`
Prijsberekening voor stemacteurs is complex door factoren als buy-outs en woordenaantallen. Deze engine automatiseert dit proces volledig. Klanten zien real-time hoe de prijs veranderd terwijl ze opties aanpassen. Het is een krachtige conversietool die onzekerheid wegneemt en het team bevrijdt van handmatige offertes voor standaard projecten.

**Delivery & Availability System** (`10-engine/shortcodes/10-delivery-availability-provider.php`) [V2-CORE]
- **Type:** Core Service (Logic Provider)
- **State:** State-Consumer (leest Actor Availability)
- **Dependencies:** `wp_voices_actors` (meta)
Wanneer is mijn audio klaar? Dit systeem geeft het antwoord. Het houdt rekening met de "18:00 grens" (bestellingen na 18:00 tellen als volgende dag), weekenden en vakanties van zowel het bedrijf als individuele stemacteurs. Het berekent de exacte leverdatum, wat zorgt voor eerlijke verwachtingen en een hoge klanttevredenheid.

**Dynamic Cart Engine** (`10-engine/shortcodes/10-dynamic-cart-provider.php`) [V2-CORE]
- **Type:** Edge UI (Commerce Component)
- **State:** State-Consumer (leest Cart Meta)
- **Dependencies:** `VoicesCockpit Engine`, `WooCommerce`
De winkelmand is meer dan een lijst met producten; het is een interactieve briefing-tool. Deze engine verrijkt de WooCommerce mand met specifieke velden voor stem-regie, uitspraak-instructies en bestandsformaten. Het zorgt ervoor dat alle benodigde informatie direct bij de order zit, waardoor het productieproces direct na betaling kan starten.

**Breadcrumbs & Steps Navigation** (`10-engine/shortcodes/150-breadcrumbs-steps-provider.php`) [V2-CORE]
- **Type:** Edge UI (Navigation Component)
- **State:** State-Consumer (leest Journey Progress)
- **Dependencies:** `VoicesCockpit Engine`
Navigatie die zich aanpast aan de gebruiker. In plaats van statische links, visualiseert dit systeem de actieve Journey van de bezoeker. Het toont precies waar ze zijn in het proces (bijv. "Stem kiezen" -> "Briefing" -> "Afrekenen"), wat zorgt voor een rustige en overzichtelijke gebruikerservaring, vergelijkbaar met de beste apps op de markt.

**Dynamic Filter Text Engine** (`10-engine/shortcodes/180-dynamic-filter-provider.php`) [V2-CORE]
- **Type:** Edge UI (SEO Component)
- **State:** State-Consumer (leest Active Filters)
- **Dependencies:** `Market Manager`
Goede SEO en UX vereisen grammaticaal correcte teksten op filterpagina's. Deze engine genereert dynamisch koppen zoals "Vlaamse stemacteurs voor documentaires" op basis van de geselecteerde filters. Het begrijpt de taalregels en zorgt ervoor dat de pagina's er menselijk en professioneel uitzien, wat zowel bezoekers als zoekmachines waarderen.

**Vacation Manager (V2)** (`10-engine/shortcodes/190-vacation-notice.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **State:** State-Consumer (leest Global/Actor Vacation State)
- **Dependencies:** `VoicesCockpit Engine`
Bedrijfssluitingen en vakanties moeten overal op de site consistent worden gecommuniceerd. De Vacation Manager centraliseert dit beheer. Met één instelling worden banners getoond, leverdata aangepast en de chat-assistent geïnformeerd. Het voorkomt dat er beloftes worden gedaan die tijdens een vakantieperiode niet kunnen worden nagekomen.

**Shop Ratecard Engine** (`10-engine/shortcodes/20-shop-ratecard.php`) [V2-CORE]
- **Type:** Edge UI (Data Display)
- **State:** State-Consumer (leest Market Prices)
- **Dependencies:** `Market Manager`, `VoicesCockpit Engine`
Transparantie in tarieven is essentieel voor vertrouwen. Deze engine genereert automatisch overzichtelijke tariefkaarten voor individuele stemacteurs op basis van hun profielinstellingen. Het presenteert complexe prijsstructuren op een simpele, visuele manier, waardoor klanten sneller beslissen en minder vragen hebben over de kosten.

**Fixed Rates System** (`10-engine/shortcodes/200-fixed-rates-provider.php`) [V2-CORE]
- **Type:** Edge UI (Commerce Component)
- **State:** State-Consumer (leest Market context)
- **Dependencies:** `Market Manager`
Voor veelvoorkomende projecten (zoals nationale radio-spots) hanteren we vaste tarieven. Dit systeem ontsluit deze tarieven als interactieve knoppen in de UI. Het vereenvoudigt het keuzeproces voor de klant enorm: in plaats van zelf te rekenen, klikken ze op het gewenste pakket en de prijs wordt direct correct toegepast in de mand.

**Header Icons Orchestrator** (`10-engine/shortcodes/210-header-icons.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest Counts)
- **Dependencies:** `VoicesCockpit Engine`
De iconen bovenin de website (Favorieten, Mand, Account) zijn de toegangspoorten tot persoonlijke functies. Deze orchestrator beheert hun gedrag op basis van de actieve Journey. Het zorgt voor real-time updates (zoals het aantal favorieten) via AJAX, waardoor de gebruiker direct feedback krijgt zonder dat de pagina hoeft te herladen.

**Lowest Prices System** (`10-engine/shortcodes/210-lowest-prices-provider.php`) [V2-CORE]
- **Type:** Edge UI (Data Display)
- **State:** State-Consumer (leest Market prices)
- **Dependencies:** `Market Manager`
Wat is de instapprijs voor een bepaalde stem? Dit systeem berekent en toont de laagste tarieven per kanaal, inclusief interactieve tooltips met uitleg. Het helpt klanten om snel een inschatting te maken van het budget en trekt hen de funnel in door te laten zien hoe betaalbaar professionele stemmen kunnen zijn.

**Account & Login Dropdown** (`10-engine/shortcodes/211-header-icons-account.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest User Session)
- **Dependencies:** `VoicesCockpit Engine`
Een compact dashboard dat altijd binnen handbereik is. Via deze dropdown kunnen klanten razendsnel inloggen, hun laatste orders bekijken of hun profiel beheren. Het is ontworpen om de frictie van het inlogproces weg te nemen en de klant direct toegang te geven tot de meest relevante informatie.

**Mini-Cart & Favorites Dropdowns** (`10-engine/shortcodes/212-header-icons-cart.php` & `213-header-icons-favorites.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest Cart/Favs)
- **Dependencies:** `VoicesCockpit Engine`
Deze dropdowns bieden een real-time preview van de winkelmand en de shortlist van favoriete stemmen. Door gebruik te maken van AJAX worden wijzigingen direct zichtbaar. Het stelt klanten in staat om hun selectie te controleren en te beheren zonder hun huidige pagina te verlaten, wat de flow van het castingproces bevordert.

**Favorites View Engine** (`10-engine/shortcodes/220-favorites-view-provider.php`) [V2-CORE]
- **Type:** Edge UI (Dashboard)
- **State:** State-Consumer (leest Favorites)
- **Dependencies:** `VoicesCockpit Engine`
Dit is een dedicated dashboard voor het beheren van de 'Demo Shortlist'. Klanten kunnen hier hun favoriete stemmen vergelijken, demo's beluisteren en hun selectie delen met collega's of opdrachtgevers. Het is een essentiële tool voor professionele inkopers die meerdere opties moeten overwegen voordat ze een definitieve keuze maken.

**Project Communication Helpers** (`10-engine/shortcodes/250-project-communication-helpers.php`) [V2-CORE]
- **Type:** Edge UI (Communication Component)
- **State:** State-Consumer (leest Project context)
- **Dependencies:** `VoicesCockpit Engine`
Goede communicatie is de sleutel tot een succesvol project. Deze helpers faciliteren de interne berichtgeving tussen klanten en stemacteurs binnen het platform. Het zorgt ervoor dat alle afspraken en feedback centraal worden opgeslagen bij het project, waardoor misverstanden worden voorkomen en er een duidelijk dossier ontstaat.

**Thank You Page Engine** (`10-engine/shortcodes/250-thankyou-page-provider.php`) [V2-CORE]
- **Type:** Edge UI (Dashboard)
- **State:** State-Consumer (leest Order context)
- **Dependencies:** `VoicesCockpit Engine`, `Delivery System`
De ervaring stopt niet bij de betaling. Deze engine genereert dynamische bedankpagina's die zijn afgestemd op de gekozen Journey. Het toont relevante video's, de verwachte leverdatum en KPI's over de bestelling. Het bevestigt de goede keuze van de klant en zet de toon voor een professionele afhandeling van het project.

**Account Security & Rate Limiting** (`10-engine/shortcodes/251-account-rate-limiting.php`) [V2-CORE]
- **Type:** Core Service (Security Provider)
- **State:** State-Producer (schrijft Lockout state)
- **Dependencies:** `wp_voices_visitors`
Veiligheid is een topprioriteit. Deze laag beschermt klantaccounts tegen brute-force aanvallen en misbruik door het aantal inlogpogingen en acties te limiteren. Het werkt onzichtbaar op de achtergrond om de integriteit van de gebruikersdata te waarborgen, zonder de legitieme gebruiker in de weg te zitten.

**Checkout AJAX Login Handler** (`10-engine/shortcodes/260-checkout-ajax-login.php`) [V2-CORE]
- **Type:** Core Service (Auth Handler)
- **State:** State-Producer (activeert User Session)
- **Dependencies:** `WooCommerce`
Niets is vervelender dan moeten inloggen en vervolgens je winkelmand kwijtraken. Deze handler zorgt voor een frictieloos inlogproces tijdens het afrekenen. De klant kan inloggen zonder de checkout-pagina te verlaten, waarbij alle ingevulde gegevens en producten behouden blijven. Dit verhoogt de conversie aanzienlijk.

**Public Contact Form System** (`10-engine/shortcodes/260-contact-form-provider.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest Page context)
- **Dependencies:** `VoicesCockpit Engine`
Een intelligent contactformulier dat begrijpt waar de vraag over gaat. Op basis van de pagina waar de bezoeker zich bevindt, past het formulier zich aan en toont het een relevante sidebar met markt-specifieke informatie. Het zorgt ervoor dat vragen direct bij de juiste persoon in het team terechtkomen voor een snelle afhandeling.

**Free Year End Campaign Engine** (`10-engine/shortcodes/260-free-year-end-message.php`) [V2-CORE]
- **Type:** Edge UI (Campaign Component)
- **State:** State-Consumer (leest Campaign context)
- **Dependencies:** `VoicesCockpit Engine`, `Dropbox API`
Een gespecialiseerde tool voor onze jaarlijkse eindejaarscampagnes. Het stelt klanten in staat om gratis kerstwensen in te spreken of aan te vragen, met een directe integratie naar Dropbox voor de opslag van audiobestanden. Het is een krachtige lead-generatie tool die de band met onze klanten versterkt tijdens de feestdagen.

**Conditional Contact Info** (`10-engine/shortcodes/270-contact-email.php`) [V2-CORE]
- **Type:** Edge UI (Data Display)
- **State:** State-Consumer (leest Market context)
- **Dependencies:** `Market Manager`
Persoonlijk contact is belangrijk, maar wel in de juiste taal. Dit systeem toont automatisch de juiste e-mailadressen en telefoonnummers op basis van de taalvoorkeur en de markt van de bezoeker. Het zorgt ervoor dat een Franse klant niet per ongeluk naar een Nederlandstalig nummer belt, wat de professionaliteit ten goede komt.

**How It Works Engine** (`10-engine/shortcodes/270-how-it-works.php`) [V2-CORE]
- **Type:** Edge UI (Data Display)
- **State:** State-Consumer (leest Journey context)
- **Dependencies:** `VoicesCockpit Engine`
Complexe processen worden simpel met deze visuele engine. Het rendert "Apple-style" processtappen die de klant door de verschillende Journeys leiden. Door visueel te maken wat er gaat gebeuren, nemen we drempels weg en geven we de bezoeker het vertrouwen dat ze bij Voices.be in goede handen zijn.

**Product Metadata Gradient** (`10-engine/shortcodes/270-product-metadata-gradient.php`) [V2-CORE]
- **Type:** Edge UI (Visual Component)
- **State:** State-Consumer (leest Product metadata)
- **Dependencies:** `VoicesCockpit Engine`
Soms moet belangrijke informatie echt opvallen. Deze tool rendert specifieke metadata (zoals "Direct leverbaar") met opvallende gradient-tekst. Het is een subtiele maar effectieve manier om de aandacht van de bezoeker te vestigen op de unieke verkoopargumenten van een stemacteur of product.

**Audio Recorder & Briefing Tool** (`10-engine/shortcodes/250-audiorecorder-provider.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Producer (schrijft Audio Blob naar order)
- **Dependencies:** `VoicesCockpit Engine`
Een briefing typen is goed, maar een instructie inspreken is beter. Met deze in-browser tool kunnen klanten direct hun uitspraak-instructies of gewenste toonhoogte opnemen. De audio wordt direct aan de order gekoppeld, waardoor de stemacteur precies hoort wat de bedoeling is, wat de kans op heropnames minimaliseert.

**Modal Orchestrator** (`30-systems/backoffice/20-voices-modal-system.php`) [V2-CORE]
- **Type:** Edge UI (UI Controller)
- **State:** State-Consumer (leest Modal config)
- **Dependencies:** `VoicesCockpit Engine`
Gestandaardiseerde pop-ups zorgen voor een rustige UI. De Modal Orchestrator is verantwoordelijk voor alle "Apple-style" modale vensters op het platform. Of het nu gaat om een inlogscherm of een gedetailleerde prijsuitleg, dit systeem zorgt voor vloeiende animaties en een consistente interactie over de hele site.

**Master Spotlight** (`public/js/admin/spotlight-engine.js`) [V2-CORE]
- **Type:** Edge UI (Navigation Controller)
- **State:** State-Consumer (leest Admin context)
- **Dependencies:** `VoicesCockpit Engine` (admin view)
De "Google van de backoffice". Met CMD+K (of CMD+I) opent deze centrale zoek- en navigatie-interface. Het stelt beheerders in staat om razendsnel orders, klanten, stemacteurs of instellingen te vinden. Het is de ultieme productiviteitstool die ervoor zorgt dat het team nooit meer hoeft te zoeken naar informatie.

---

### 3. AI & Voice Intelligence

**ElevenLabs Bridge** (`00-core/ai/class-voices-elevenlabs.php`) [V2-CORE]
- **Type:** Core Service (AI Provider)
- **Dependencies:** `ElevenLabs API`
Dit is onze technische verbinding met de wereld van AI-stemgeneratie. De bridge maakt het mogelijk om stemacteurs te clonen of tekst direct om te zetten in hoogwaardige audio via de ElevenLabs API. Het is de basis voor onze experimenten met "AI-Native" content, waarbij we de snelheid van AI combineren met de kwaliteit van onze eigen stemacteurs.

**Voice Tagger AI** (`00-core/ai/85-voice-tagger-ai.php`) [V2-CORE]
- **Type:** Core Service (Data Enrichment)
- **Dependencies:** `wp_voices_actors`, `OpenAI API`
Het handmatig labelen van honderden stemacteurs is monnikenwerk. De Voice Tagger AI automatiseert dit proces door demo's te analyseren en automatisch de juiste tags (zoals "warm", "zakelijk" of "enthousiast") toe te kennen. Dit zorgt voor een consistente en doorzoekbare database, waardoor klanten sneller de juiste stem vinden zonder dat ons team elke demo handmatig hoeft te beluisteren.

**Command Center AI** (`public/js/admin/command-center-ai.js`) [V2-CORE]
- **Type:** Edge UI (AI Controller)
- **State:** State-Producer (triggert Admin actions)
- **Dependencies:** `Master Spotlight`
De backoffice van de toekomst wordt bediend met taal. Het Command Center AI is een intelligente interface waarmee beheerders taken kunnen uitvoeren door ze simpelweg te typen of te zeggen. Of het nu gaat om het genereren van een rapportage of het aanpassen van een instelling, de AI begrijpt de opdracht en voert de technische stappen op de achtergrond uit.

**Media Master Engine** (`10-engine/shortcodes/50-media-master.php`) [V2-CORE]
- **Type:** Edge UI (Media Player)
- **State:** State-Consumer (leest Media context)
- **Dependencies:** `VoicesCockpit Engine`
Een universele en razendsnelle engine voor alle audio- en video-players op de site. In plaats van verschillende plugins voor verschillende media, zorgt Media Master voor een uniforme ervaring met Apple-style controls. Het is geoptimaliseerd voor snelheid en mobiel gebruik, zodat demo's overal ter wereld direct en vlekkeloos afspelen.

**Play Duration Tracker** (`00-core/ui/55-play-button-tracking.php`) [V2-CORE]
- **Type:** Core Service (Analytics Provider)
- **State:** State-Producer (schrijft naar `wp_voices_studio_events`)
- **Dependencies:** `Media Master Engine`
Meten is weten. Deze tracker houdt met chirurgische precisie bij hoe lang er naar elke demo wordt geluisterd en welke stemacteurs het populairst zijn. Deze data voedt onze algoritmes, waardoor we populaire stemmen vaker kunnen tonen en minder populaire demo's kunnen identificeren voor verbetering. Het maakt onze casting-suggesties echt data-gedreven.

---

### 4. Mail & Lead Intelligence

**Mail Manager** (`50-mail-intelligence/10-mail-manager-core.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **Dependencies:** `IMAP API`, `VoicesCockpit Engine`
E-mail is nog steeds een cruciaal onderdeel van onze workflow. De Mail Manager synchroniseert IMAP-verbindingen direct met de Voices Cockpit. Hierdoor kunnen we e-mails van klanten direct koppelen aan hun profiel en orders, waardoor het team een volledig 360-graden beeld heeft van alle communicatie zonder ooit WordPress te hoeven verlaten.

**Deep Insight Engine** (`50-mail-intelligence/25-deep-insight-engine.php`) [V2-CORE]
- **Type:** Core Service (AI Analysis)
- **Dependencies:** `Mail Manager`, `OpenAI API`
Deze AI-analist leest tussen de regels door. Het analyseert e-mailpatronen en klantinteracties om verborgen kansen of problemen te ontdekken. Het kan bijvoorbeeld herkennen wanneer een klant ontevreden dreigt te worden of wanneer er een grote verkoopkans ontstaat op basis van de tone-of-voice in een e-mail, waardoor we proactief kunnen handelen.

**Lead Scoring** (`50-mail-intelligence/80-lead-scoring.php`) [V2-CORE]
- **Type:** Core Service (Logic Provider)
- **State:** State-Producer (schrijft Lead Score naar user meta)
- **Dependencies:** `wp_voices_visitors`
Niet elke aanvraag is even waardevol. Ons Lead Scoring algoritme kent automatisch een waarde toe aan elke nieuwe lead op basis van hun profiel, gedrag en eerdere interacties. Dit helpt het team om hun tijd optimaal te besteden aan de meest kansrijke leads, wat de efficiëntie van het verkoopteam enorm verhoogt.

**Voicejar Engine** (`00-core/utilities/69-voicejar-core.php`) [V2-CORE]
- **Type:** Core Service (UX Analytics)
- **State:** State-Producer (schrijft sessie-data)
- **Dependencies:** `rrweb`
Onze eigen, privacy-vriendelijke variant van sessie-opname tools. Voicejar legt precies vast hoe gebruikers door de site navigeren, waar ze klikken en waar ze eventueel vastlopen. Omdat we de data zelf hosten, hebben we volledige controle over de privacy en kunnen we deze inzichten direct gebruiken om de website elke dag een stukje beter en gebruiksvriendelijker te maken.

---

### 5. Journey-Specific Engines

#### Agency Journey (Stemmen & Casting)

**Voicepage Engine** (`agency/30-voicepage.php`) [V2-CORE]
- **Type:** Edge UI (Casting Interface)
- **State:** State-Consumer (leest Filters & Market)
- **Dependencies:** `Market Manager`, `VoicesCockpit Engine`
Dit is de centrale etalage van het platform waar klanten hun ideale stem vinden. In plaats van een simpele lijst, is dit een intelligente interface die real-time filtert op taal, geslacht en tone-of-voice. Het is de "matchmaker" die AI gebruikt om de juiste demo's naar voren te schuiven op basis van wat een klant zoekt, waardoor het castingproces van uren naar minuten gaat.

**Voices Cart Engine** (`agency/cart/logic-core.php`) [V2-CORE]
- **Type:** Core Service (Commerce Logic)
- **State:** State-Producer (schrijft Briefing naar order)
- **Dependencies:** `Pricing Calculator Engine`
De winkelmand voor stemacteurs is veel complexer dan een standaard webshop. Deze engine berekent dynamisch de prijs op basis van het aantal woorden, de gewenste buy-outs (waar wordt het gebruikt?) en extra opties zoals nabewerking. Het zorgt ervoor dat alle briefing-details direct aan de order worden gekoppeld, zodat de stemacteur precies weet wat er moet gebeuren zonder dat er heen-en-weer gemaild hoeft te worden.

**URL & Intent Mapper** (`agency/77-voicepage-url-mapper.php`) [V2-CORE]
- **Type:** Core Service (Routing Provider)
- **State:** State-Producer (activeert Intent)
- **Dependencies:** `Predictive Router`
Deze tool vertaalt menselijke zoekopdrachten en SEO-vriendelijke links naar technische database-queries. Als iemand zoekt op "Vlaamse stemacteur voor bedrijfsvideo", zorgt deze mapper ervoor dat ze direct op de juiste gefilterde pagina landen. Het begrijpt de *intentie* van de bezoeker en zet de juiste filters alvast klaar, wat de conversie enorm verhoogt.

**Voice Signup Form (V2)** (`agency/240-voice-signup-form.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Producer (schrijft naar `wp_voices_actors`)
- **Dependencies:** `VoicesCockpit Engine`
Dit is de nieuwe, IAP-Native poortwachter voor nieuw talent. Het is een slim multi-step formulier dat stemacteurs stap voor stap door het proces van aanmelden en demo-uploads leidt. De data wordt direct in onze eigen `wp_voices_actors` tabel opgeslagen (zonder Gravity Forms), waardoor we een razendsnelle en schone database van talent opbouwen die direct klaar is voor review in de backoffice.

#### Academy Journey (LMS & Coaching)

**Academy Course Engine** (`academy/online-course/academy-provider.php`) [V2-CORE]
- **Type:** Edge UI (LMS Interface)
- **State:** State-Consumer (leest Progress)
- **Dependencies:** `VoicesCockpit Engine`, `wp_voices_course_progress`
Dit is het kloppend hart van onze eigen "Voices Academy". In plaats van een zware externe plugin, hebben we een lichtgewicht en razendsnel leersysteem gebouwd dat volledig is afgestemd op stemtraining. Het beheert de toegang tot cursussen, de logica van de lessen en zorgt ervoor dat studenten een vlekkeloze ervaring hebben op elk apparaat, zonder onnodige ballast.

**Course Database & Progress** (`academy/online-course/10-course-database.php`) [V2-CORE]
- **Type:** Core Service (Data Provider)
- **Dependencies:** `wp_voices_course_progress`
Achter de schermen houdt dit systeem met chirurgische precisie bij waar elke student is. Het slaat niet alleen op welke les voltooid is, maar onthoudt zelfs de timestamp in een video. Hierdoor kan een student de volgende dag precies verder kijken waar hij gebleven was. Dit vormt de basis voor onze data-gedreven coaching: we zien precies waar studenten afhaken of waar ze extra hulp nodig hebben.

**Course Recorder & Dubbing** (`academy/online-course/40-course-recorder.php` & `45-course-live-dubbing.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Producer (schrijft Audio naar `wp_voices_course_submissions`)
- **Dependencies:** `VoicesCockpit Engine`
Dit zijn onze meest geavanceerde tools voor interactief leren. Studenten kunnen direct in hun browser audio-oefeningen opnemen en zelfs proberen een video live na te synchroniseren (dubbing). Deze opnames worden veilig opgeslagen en direct gekoppeld aan de les, zodat de coach ze later kan beoordelen. Het maakt de drempel om te oefenen extreem laag.

**Feedback & Nudge System** (`academy/online-course/130-course-feedback.php` & `170-course-nudge.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **State:** State-Consumer (leest Progress)
- **Dependencies:** `Mail Manager`
Om te voorkomen dat studenten halverwege stoppen, hebben we een proactief motivatiesysteem gebouwd. De "Nudge" engine herkent wanneer een student een paar dagen niet is ingelogd en stuurt een vriendelijke aanmoediging. Daarnaast is er een directe audio-feedbacklijn: de coach kan een gesproken reactie achterlaten op een oefening, wat de persoonlijke band en het leerrendement enorm versterkt.

**Certificate Generator** (`academy/online-course/140-course-admin-certificate.php`) [V2-CORE]
- **Type:** Core Service (PDF Provider)
- **Dependencies:** `wp_voices_course_progress`
Zodra een student alle lessen en oefeningen succesvol heeft afgerond, genereert dit systeem automatisch een officieel Voices Academy certificaat in PDF-formaat. Het is de ultieme beloning voor de student en een bewijs van hun groei, volledig geautomatiseerd zonder dat de beheerder er een vinger naar hoeft uit te steken.

#### Studio Journey (Workshops & Events)

**Workshop Dashboard (Studio)** (`studio/dashboard/workshop-dashboard-provider.php`) [V2-CORE]
- **Type:** Edge UI (Dashboard)
- **State:** State-Consumer (leest Workshop data)
- **Dependencies:** `VoicesCockpit Engine`, `wp_voices_workshop_interest`
Dit is het commandocentrum voor Bernadette en het team om alle fysieke workshops te beheren. Het dashboard is volledig opgebouwd volgens de God Mode principes en biedt een kristalhelder overzicht van de actieve funnel, geannuleerde sessies en de algehele bezettingsgraad. Het is ontworpen voor snelheid, zodat de beheerder in één oogopslag ziet waar actie nodig is zonder door eindeloze WordPress-lijsten te hoeven scrollen.

**Workshop Interest & Deelnemer Form** (`studio/140-studio-deelnemer-form.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Producer (schrijft naar `wp_voices_workshop_interest`)
- **Dependencies:** `VoicesCockpit Engine`
Zodra iemand interesse toont in een workshop, komt dit systeem in actie. Het is een intelligent formulier dat niet alleen gegevens verzamelt, maar ook direct een "Smart Mail" triggert met alle relevante workshop-informatie. De data wordt direct opgeslagen in de `wp_voices_workshop_interest` tabel, waardoor we een waardevolle lijst van potentiële cursisten opbouwen die we proactief kunnen benaderen voor nieuwe data.

**Workshop Cost Management** (`studio/dashboard/50-workshop-dashboard-kosten.php`) [V2-CORE]
- **Type:** Core Service (Financial Provider)
- **Dependencies:** `wp_voices_workshop_interest`
Een workshop is pas echt succesvol als de cijfers kloppen. Deze tool berekent tot op de cent nauwkeurig wat de kosten (zoals catering, locatie en instructeur) en de opbrengsten per sessie zijn. Het geeft Bernadette direct inzicht in de winstgevendheid, waardoor ze weloverwogen beslissingen kan maken over het plannen van nieuwe sessies of het aanpassen van de prijzen.

**BI Profit Engine** (`studio/dashboard/140-workshop-bi-dashboard.php`) [V2-CORE]
- **Type:** Core Service (Analytics Provider)
- **Dependencies:** `Workshop Cost Management`
Dit is de "Business Intelligence" laag bovenop de workshop-data. Het kijkt verder dan één sessie en analyseert trends over langere periodes. Welke workshops zijn het populairst? Waar liggen de hoogste marges? Deze inzichten helpen om de Studio Journey strategisch te laten groeien en de focus te leggen op de meest rendabele onderdelen van het bedrijf.

**Waitlist Manager** (`studio/dashboard/80-workshop-dashboard-wachtlijst.php`) [V2-CORE]
- **Type:** Core Service (Logic Provider)
- **Dependencies:** `wp_voices_workshop_interest`
Niemand vindt het leuk om "nee" te moeten verkopen. De Waitlist Manager vangt geïnteresseerden op zodra een workshop volgeboekt is. Zodra er een plekje vrijkomt of er een nieuwe datum wordt gepland, krijgt de wachtlijst als eerste bericht. Dit zorgt voor een automatische vulling van nieuwe workshops en een maximale bezettingsgraad, zonder dat er handmatig lijstjes bijgehouden hoeven te worden.

**Interest Tracker** (`studio/dashboard/70-workshop-dashboard-geinteresseerden.php`) [V2-CORE]
- **Type:** Core Service (Analytics Provider)
- **Dependencies:** `wp_voices_workshop_interest`
Niet elke klik leidt direct tot een boeking. De Interest Tracker houdt bij wie interesse heeft getoond maar nog niet heeft afgerekend. Het segmenteert deze potentiële klanten op basis van hun profiel (ervaring, doel, beroep), zodat we gerichten marketingcampagnes kunnen voeren. Het is de motor achter onze proactieve verkoopstrategie voor de Studio.

#### Telephony Journey (IVR & On-Hold)

**Telephony Order Cockpit** (`telephony/450-telephony-cockpit.php`) [V2-CORE]
- **Type:** Edge UI (One-Pager Interface)
- **State:** State-Consumer (leest Telephony context)
- **Dependencies:** `VoicesCockpit Engine`, `Pricing Calculator Engine`
Dit is een razendsnelle "one-pager" waar klanten hun volledige telefooncentrale-bestelling in één keer kunnen samenstellen. De cockpit combineert een slimme script-editor (met real-time AI-suggesties) met aanbevelingen voor stemmen en muziek. Het is ontworpen voor maximale efficiëntie: de klant typt zijn tekst, kiest een stem, voegt muziek toe en ziet direct de leverdatum en prijs, zonder ooit de pagina te hoeven verlaten.

**Telephony Package Landing** (`telephony/310-telephony-package-landing.php`) [V2-CORE]
- **Type:** Edge UI (Campaign Page)
- **State:** State-Consumer (leest Market context)
- **Dependencies:** `VoicesCockpit Engine`
Deze landingspagina is specifiek ontworpen voor klanten die op zoek zijn naar complete pakketten (bijv. welkomsttekst + keuzemenu + wachtmuziek). Het vertaalt complexe telefonie-behoeften naar hapklare oplossingen. Door gebruik te maken van IAP-context, toont deze pagina de meest relevante pakketten op basis van de bedrijfsgrootte en branche van de bezoeker.

**How It Works (Telephony Only)** (`telephony/70-how-it-works-telefonie-only.php`) [V2-CORE]
- **Type:** Edge UI (Visual Component)
- **State:** State-Consumer (leest Telephony context)
- **Dependencies:** `VoicesCockpit Engine`
Omdat het proces van een telefooncentrale inspreken anders is dan een gewone voice-over (denk aan bestandsformaten en wachtmuziek-mixen), biedt deze tool een specifieke uitleg voor deze journey. Het visualiseert de stappen van script naar de uiteindelijke installatie op de telefooncentrale, wat onzekerheid bij de klant wegneemt en de conversie verhoogt.

**Telephony Hub & Template Loader** (`telephony/430-telephony-hub.php` & `431-telephony-template-loader.php`) [V2-CORE]
- **Type:** Core Service (Data Provider)
- **Dependencies:** `VoicesCockpit Engine`
De Hub fungeert als de centrale bibliotheek voor alle telefonie-gerelateerde content en templates. Of het nu gaat om standaard teksten voor feestdagen of technische specificaties voor verschillende telefooncentrales, dit systeem zorgt ervoor dat de juiste informatie altijd op de juiste plek wordt getoond. Het is de ruggengraat die de Telephony Journey schaalbaar en consistent houdt.

**Telephony Glossary** (`telephony/78-telephony-glossary.php`) [V2-CORE]
- **Type:** Edge UI (SEO Component)
- **Dependencies:** `VoicesCockpit Engine`
De wereld van telefonie zit vol vakjargon (IVR, On-Hold, PBX). Deze glossary is een interactieve kennisbank die klanten helpt deze termen te begrijpen. Het is niet alleen goed voor SEO, maar dient ook als een "stille verkoper" die autoriteit uitstraalt en de klant helpt om met vertrouwen de juiste keuzes te maken in de Telephony Cockpit.

---

### 6. Commerce & Finance (Excl. BTW)

**Yuki Integration & Sync Engine** (`yuki/80-yuki-sync-engine.php`) [V2-CORE]
- **Type:** Core Service (Financial Provider)
- **Dependencies:** `Yuki API`, `WooCommerce`
- **Fallback:** Local Order Logging + Admin Alert
Dit is de financiële ruggengraat die onze webshop verbindt met het Yuki boekhoudplatform. In plaats van handmatige exportbestanden, zorgt deze engine voor een real-time synchronisatie van verkoopfacturen. Het begrijpt de complexe mapping van WooCommerce-data naar Yuki-grootboekrekeningen, waardoor de boekhouding altijd up-to-date is zonder dat er een mens aan te pas komt.

**Order PDF Engine & Quote Generator** (`commerce/60-order-ajax-handlers-CONSOLIDATED.php`) [V2-CORE]
- **Type:** Core Service (PDF Provider)
- **Dependencies:** `WooCommerce`, `TCPDF`
Deze engine is verantwoordelijk voor het genereren van alle officiële documenten in PDF-formaat, zoals offertes en facturen. Het is ontworpen voor snelheid en professionaliteit: met één klik in de backoffice wordt een offerte gegenereerd die direct naar de klant kan. Het systeem ondersteunt ook automatische betalingsherinneringen, wat de cashflow van het bedrijf aanzienlijk verbetert.

**EU B2B & VAT Engine** (`00-core/utilities/20-vat-helpers.php`) [V2-CORE]
- **Type:** Core Service (Compliance Provider)
- **Dependencies:** `VIES API`
Internationaal zakendoen brengt complexe BTW-regels met zich mee. Deze engine automatiseert de VIES-validatie van BTW-nummers en past indien nodig BTW-verlegging toe voor zakelijke klanten binnen de EU. Het hanteert de "één waarheid" strategie voor BTW-data, wat fouten in de facturatie voorkomt en zorgt voor een vlekkeloze audit-trail voor de fiscus.

**Checkout Flow Guard** (`commerce/185-checkout-flow-hooks.php`) [V2-CORE]
- **Type:** Core Service (Security Provider)
- **State:** State-Producer (valideert Checkout state)
- **Dependencies:** `WooCommerce`
De checkout is de meest kritieke fase van de klantreis. De Flow Guard bewaakt dit proces en zorgt ervoor dat alle benodigde data (zoals briefings en metadata) correct wordt opgeslagen voordat een order definitief wordt. Het fungeert als een intelligente verkeersregelaar die voorkomt dat incomplete of foutieve bestellingen het systeem vervuilen, wat de klanttevredenheid en operationele efficiëntie verhoogt.

**Voucher Spotlight Engine** (`backoffice/260-voucher-spotlight.php`) [V2-CORE]
- **Type:** Edge UI (Campaign Tool)
- **Dependencies:** `VoicesCockpit Engine`
Dit is een krachtige tool voor marketingacties en klantretentie. Het stelt ons in staat om op grote schaal unieke vouchercodes te genereren voor specifieke campagnes. De engine gaat verder dan alleen codes: het bevat een "Mockup Lab" voor het visueel ontwerpen van fysieke voucherkaarten en een CSV-export voor professionele drukkers, waardoor we offline en online marketing naadloos kunnen combineren.

**Peppol Core & E-Invoicing** (`yuki/10-yuki-peppol-core.php`) [V2-CORE]
- **Type:** Core Service (Financial Provider)
- **Dependencies:** `Peppol API`
Voor overheden en grote bedrijven is e-invoicing via het Peppol-netwerk steeds vaker de standaard. Deze module zorgt ervoor dat onze facturen voldoen aan de strengste digitale standaarden. Het automatiseert het proces van verzenden en ontvangen via de Peppol-hub, waardoor we sneller betaald krijgen en voldoen aan de modernste facturatie-eisen van grote zakelijke partners.

---

### 7. Infrastructure & Safety

**Master Door (Global Router)** (`wp-content/mu-plugins/00-voices-master-door.php`) [V2-CORE]
- **Type:** Core Service (Traffic Controller)
- **Dependencies:** `VoicesRegistry`
- **Fallback:** LITE Mode (markt-neutraal)
Dit is de "Traffic Controller" van het hele ecosysteem. Het is het eerste stukje code dat draait en bepaalt op basis van de URL welke markt (BE, NL, FR, etc.) of "Sidecar" (zoals Ademing of Portefeuilles) moet worden geladen. Het zorgt ervoor dat één WordPress-installatie zich gedraagt als tientallen verschillende websites, wat het beheer extreem schaalbaar maakt.

**Registry Guard & Sidecar Routing** (`wp-content/mu-plugins/00-voices-master-door.php`) [V2-CORE]
- **Type:** Core Service (Security Provider)
- **Dependencies:** `Master Door`
De Registry Guard bewaakt de integriteit van onze domeinen. Het bevat de "Single Source of Truth" voor alle markt-instellingen, zoals talen en valuta. De Sidecar Routing zorgt ervoor dat we razendsnelle, losgekoppelde frontends (Headless) kunnen draaien voor specifieke apps, terwijl ze wel gebruikmaken van de centrale Voices-database en logica.

**Root Protection & Loader Guard** (`functions.php`) [V2-CORE]
- **Type:** Core Service (Security Provider)
Veiligheid en structuur zijn heilig in onze architectuur. De Root Protection bewaakt de mappenstructuur en voorkomt dat er "rommel" in de hoofdmap van het thema terechtkomt. De Loader Guard zorgt ervoor dat alle modules in de exact juiste volgorde worden geladen, wat conflicten voorkomt en de stabiliteit van het platform garandeert, zelfs bij complexe updates.

**Bootstrap Pattern Orchestrator** (`functions/v2/bootstrap.php`) [V2-CORE]
- **Type:** Core Service (Architecture Controller)
Dit is de dirigent van onze moderne codebase. Het implementeert het "Bootstrap Pattern", waarbij elke module volledig geïsoleerd en voorspelbaar wordt ingeladen. Dit voorkomt de beruchte "spaghetti-code" en maakt het mogelijk om nieuwe features razendsnel toe te voegen zonder risico op zij-effecten in andere delen van het systeem.

**ob_clean Stofzuiger** (`wp-content/mu-plugins/00-voices-master-door.php`) [V2-CORE]
- **Type:** Core Service (Output Controller)
- **Dependencies:** `Master Door`
Bij het serveren van technische bestanden (zoals afbeeldingen, scripts of JSON-data) is een schone output-buffer essentieel. De "Stofzuiger" zorgt ervoor dat er geen ongewenste spaties of PHP-fouten in de data terechtkomen die de werking van de browser of apps zouden kunnen verstoren. Het is een onzichtbare maar cruciale laag voor een foutloze gebruikerservaring.

**Emergency Rollback System** (`functions.php`) [V2-CORE]
- **Type:** Core Service (Safety Provider)
- **Fallback:** Manual Restore via FTP
Fouten maken is menselijk, maar ze moeten wel direct hersteld kunnen worden. Dit systeem houdt automatisch de laatste werkende back-ups van kritieke bestanden bij. In geval van nood kan met één commando een rollback worden uitgevoerd naar een stabiele versie, wat de downtime tot een absoluut minimum beperkt en de gemoedsrust van het team waarborgt.

---

### 8. Ghostwriter & Content Intelligence

**FAQ Magic Engine & Knowledge Base** (`chat/admin/25-faq-magic-page.php`) [V2-CORE]
- **Type:** Edge UI (Admin Interface)
- **State:** State-Producer (schrijft naar `wp_voices_chat_faq`)
- **Dependencies:** `VoicesCockpit Engine`
Dit is het brein achter onze klantenservice. In plaats van een statische lijst met vragen, is dit een dynamische kennisbank die continu wordt gevoed door AI. De "Magic Engine" kan proactief ontbrekende antwoorden genereren, dubbele vragen opsporen en content vertalen naar alle ondersteunde talen. Het zorgt ervoor dat klanten 24/7 direct antwoord krijgen op hun vragen, wat de druk op het team enorm verlaagt.

**Quizflow System (Interactive Journey)** (`shortcodes/120-quiz-system.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Producer (schrijft Intent naar state)
- **Dependencies:** `VoicesCockpit Engine`
Niet elke bezoeker weet direct wat hij nodig heeft. Het Quizflow systeem is een interactieve, video-gestuurde gids die gebruikers helpt bij het kiezen van de juiste Journey (bijv. Academy vs. Agency). Het is een "Apple-style" ervaring die gebruikmaakt van verticale video's en slimme vragen om de intentie van de gebruiker te bepalen, waarna ze direct op de meest relevante landingspagina worden afgeleverd.

**AI Answer Generator & Question Planner** (`chat/faq/87-faq-answer-generator.php` & `85-faq-question-plan.php`) [V2-CORE]
- **Type:** Core Service (AI Content Provider)
- **Dependencies:** `wp_voices_chat_faq`, `OpenAI API`
Deze tools vormen de "Ghostwriter" laag van ons platform. De Question Planner bedenkt proactief welke vragen klanten zouden *kunnen* hebben op basis van hun huidige pagina of context. De Answer Generator schrijft vervolgens feitelijk accurate en menselijke antwoorden. Dit duo zorgt ervoor dat onze FAQ's altijd relevant blijven en meegroeien met de behoeften van onze gebruikers.

**Magic Translator (FAQ Context)** (`chat/faq/95-faq-translations.php`) [V2-CORE]
- **Type:** Core Service (Translation Provider)
- **Dependencies:** `wp_voices_chat_faq`, `OpenAI API`
Vertaalplugins maken vaak fouten met vakspecifieke termen. Onze Magic Translator is gespecialiseerd in de context van stemacteurs en telefonie. Het vertaalt FAQ-content niet alleen letterlijk, maar houdt rekening met de tone-of-voice en de specifieke terminologie van elke markt. Hierdoor voelt de content in elke taal even professioneel en vertrouwd aan.

**UTM Welcome & Content Generator** (`public/js/chat/chat-utm-welcome.js`) [V2-CORE]
- **Type:** Edge UI (Personalization Component)
- **State:** State-Consumer (leest UTM context)
- **Dependencies:** `Voicy Chat Engine`
Eerste indrukken zijn goud waard. Dit systeem herkent via welke campagne (UTM) een bezoeker binnenkomt en past de welkomstboodschap in de chat daar direct op aan. Als iemand via een advertentie voor "Vlaamse stemmen" komt, zal Voicy hen direct begroeten met een relevante suggestie. Het is een krachtige tool voor personalisatie die de conversie vanaf de eerste seconde verhoogt.

---

### 9. Specialized App Engines

**Ademing Engine (Meditation App)** (`apps/ademing/bootstrap.php`) [V2-CORE]
- **Type:** Edge UI (Headless App)
- **Endpoint:** `/wp-json/voices/v2/meditation`
- **State:** State-Consumer (leest User Progress)
- **Dependencies:** `Voices REST API`
Dit is de motor achter onze headless meditatie-app. Het is een volledig losgekoppelde frontend die via een eigen REST-API (`20-api.php`) communiceert met de Voices-backend. De engine bevat een eigen gamification-systeem met XP en streaks om gebruikersbetrokkenheid te verhogen, en een AI Lab waar we experimenteren met gepersonaliseerde stem-cloning voor meditatiesessies.

**Portfolio Sidecar Engine** (`apps/johfrah-portfolio/bootstrap.php`) [V2-CORE]
- **Type:** Edge UI (Headless App)
- **Endpoint:** `/wp-json/voices/v2/portfolio`
- **State:** State-Consumer (leest Actor data)
- **Dependencies:** `Voices REST API`
Voor onze top-stemacteurs bieden we "Sidecar" websites aan: persoonlijke portefeuilles die draaien op hun eigen domein maar volledig worden beheerd vanuit onze centrale database. Dit systeem zorgt ervoor dat een update van een demo op Voices.be direct zichtbaar is op de eigen website van de acteur. Het is een krachtige whitelabel-oplossing die de waarde van ons platform voor talent enorm vergroot.

**SEO Cockpit & Redirect Manager** (`backoffice/410-seo-cockpit.php`) [V2-CORE]
- **Type:** Edge UI (Admin Interface)
- **Dependencies:** `VoicesCockpit Engine`
Zoekmachineoptimalisatie is geen giswerk meer met dit dashboard. Het biedt een centraal overzicht van alle actieve rewrite-rules en stelt ons in staat om 301-redirects te beheren zonder een regel code aan te raken. De ingebouwde "AI SEO Assistant" analyseert continu de zoekintentie van bezoekers en optimaliseert meta-tags in real-time om onze autoriteit in elke markt te waarborgen.

**LLM Context & SEO Engine** (`seo/70-seo-llm-optimization.php`) [V2-CORE]
- **Type:** Core Service (AI Metadata Provider)
- **Dependencies:** `LLM Context Manager`
In de wereld van AI is het essentieel dat Large Language Models (zoals ChatGPT) onze site begrijpen. Deze engine genereert semantische JSON-LD structuren die specifiek zijn ontworpen voor AI-agents. Het vertelt de AI precies welke stemmen we hebben, wat hun specialisaties zijn en hoe het bestelproces werkt, waardoor we optimaal vindbaar zijn in AI-gestuurde zoekopdrachten.

**Multi-Provider Review System** (`reviews/bootstrap.php`) [V2-CORE]
- **Type:** Core Service (Social Proof Provider)
- **Dependencies:** `Google/FB APIs`, `VoicesCockpit Engine`
Vertrouwen is de basis van elke verkoop. Dit systeem verzamelt reviews van verschillende platforms (Google, Facebook, BRB) en aggregeert deze tot één krachtige "Social Proof" laag. Met behulp van AI worden reviews gematcht aan specifieke Journeys of stemacteurs, zodat we op elke pagina de meest relevante aanbevelingen kunnen tonen om de twijfel bij de klant weg te nemen.

---

### 10. Chat & Communication Hub

**Voicy Chat Engine & AI Assistant** (`chat/bootstrap.php` & `chat/ai/10-ai-assistant-core.php`) [V2-CORE]
- **Type:** Edge UI (Interactive Component)
- **State:** State-Consumer (leest IAP context)
- **Dependencies:** `wp_voices_chat_conversations`, `OpenAI API`
Dit is het zenuwcentrum van onze klantcommunicatie. Voicy is niet zomaar een chatbot, maar een intelligente assistent die de volledige context van de bezoeker begrijpt (Journey, Market, Intent). De engine kan proactief stemacteurs aanbevelen, complexe vragen beantwoorden via de FAQ-integratie en zelfs helpen bij het samenstellen van scripts. Het is de "digitale conciërge" die de drempel voor klanten verlaagt en leads direct kwalificeert.

**PWA Manifest & Mobile App Service** (`chat/pwa/10-pwa-manifest.php`) [V2-CORE]
- **Type:** Core Service (Infrastructure Provider)
Om het team maximale flexibiliteit te geven, kan het admin chat-dashboard worden geïnstalleerd als een Progressive Web App (PWA) op iPhone en Mac. Dit systeem genereert het benodigde manifest en configureert de service workers voor offline-functionaliteit en push-notificaties. Hierdoor gedraagt het dashboard zich als een native app, inclusief eigen icoon op het startscherm, wat de reactiesnelheid van het team aanzienlijk verbetert.

**SSE Real-time Bridge (Live Updates)** (`chat/15-chat-sse.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **Dependencies:** `wp_voices_chat_messages`
Wachten op een antwoord is verleden tijd. Deze module maakt gebruik van Server-Sent Events (SSE) om een constante, razendsnelle verbinding tussen de server en de browser te onderhouden. In plaats van elke paar seconden te controleren op nieuwe berichten (polling), worden updates direct "gepusht". Dit zorgt voor een vloeiende, WhatsApp-achtige ervaring waarbij je zelfs de AI-assistent ziet "denken" in real-time.

**Telegram & Email Integration** (`chat/integrations/60-telegram-integration.php` & `chat/60-chat-email-reply.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **Dependencies:** `Telegram API`, `Mail Manager`
Communicatie moet plaatsvinden waar het team is. Dit systeem verbindt de interne chat naadloos met Telegram, zodat beheerders onderweg kunnen antwoorden. Daarnaast is er een slimme e-mail bridge: als een klant de chat verlaat, wordt het gesprek automatisch voortgezet via e-mail. Antwoorden van de klant op die e-mail komen vervolgens weer direct in het centrale chat-dashboard terecht, waardoor er nooit een bericht verloren gaat.

**Guest Onboarding & Lead Conversion** (`chat/30-chat-guest-onboarding.php`) [V2-CORE]
- **Type:** Core Service (Lead Provider)
- **State:** State-Producer (schrijft naar `wp_voices_visitors`)
- **Dependencies:** `wp_voices_chat_conversations`
Anonieme bezoekers omzetten in waardevolle leads is een kunst op zich. Deze module beheert de flow waarbij gasten hun gegevens achterlaten in ruil voor hulp of een offerte. Het systeem koppelt chat-sessies intelligent aan WooCommerce-klantprofielen en bewaart de volledige geschiedenis, zodat het team (of de AI) always weet wat er eerder is besproken zodra een klant terugkeert.

**Opening Hours & Availability Manager** (`chat/settings/20-opening-hours-manager.php`) [V2-CORE]
- **Type:** Core Service (Logic Provider)
- **State:** State-Consumer (leest Global Availability)
Een assistent die nooit slaapt is handig, maar soms is menselijk contact nodig. Deze tool beheert de openingstijden van het team en past het gedrag van Voicy daarop aan. Buiten kantooruren kan de assistent bijvoorbeeld aangeven dat het team er morgen weer is, terwijl het overdag gesprekken direct kan escaleren naar een medewerker. Het zorgt voor eerlijke verwachtingen en een professionele uitstraling op elk moment van de dag.

---

### 11. Voicejar Engine

**Session Recorder & Replay** (`public/js/voicejar-recorder.js` & `backoffice/325-voicejar-manager.php`) [V2-CORE]
- **Type:** Core Service (UX Analytics)
- **Dependencies:** `rrweb`
Voicejar is onze eigen, privacy-vriendelijke variant van tools zoals Hotjar. Het neemt gebruikerssessies op (via rrweb) zonder gevoelige data te lekken. Beheerders kunnen in de backoffice sessies terugkijken om te zien waar gebruikers vastlopen of welke elementen verwarrend zijn. Het is een onmisbare tool voor UX-optimalisatie, omdat we precies zien wat de klant ziet, inclusief muisbewegingen en clicks.

**Rage Click Detector** (`00-core/utilities/69-voicejar-core.php`) [V2-CORE]
- **Type:** Core Service (UX Analytics)
- **State:** State-Producer (schrijft Rage Flag naar sessie)
Gebruikersfrustratie wordt automatisch herkend door dit algoritme. Als iemand herhaaldelijk en snel op hetzelfde element klikt (een "rage click"), markeert Voicejar deze sessie direct met een waarschuwingsvlag in het dashboard. Dit stelt ons team in staat om proactief bugs of UI-fouten op te sporen en op te lossen voordat ze een groter probleem worden voor de conversie.

**Live Session Monitoring** (`backoffice/325-voicejar-manager.php`) [V2-CORE]
- **Type:** Edge UI (Admin Interface)
- **Dependencies:** `VoicesCockpit Engine`
Dit systeem gaat verder dan alleen opnames; het stelt ons in staat om sessies "live" mee te kijken terwijl ze plaatsvinden. In het dashboard zie je een overzicht van actieve bezoekers met een "LIVE" badge. Dit is extreem waardevol voor real-time support: als een klant belt met een probleem, kunnen we direct meekijken en hen stap voor stap door het proces gidsen.

---

### 12. Business Intelligence & Insights

**Strategic Insights Dashboard** (`backoffice/340-strategic-insights.php`) [V2-CORE]
- **Type:** Edge UI (Admin Dashboard)
- **Dependencies:** `VoicesCockpit Engine`
Dit is het kompas voor de lange termijn. Het dashboard biedt een high-level analyse van de omzet en groei, altijd exclusief BTW. Het vergelijkt prestaties tussen verschillende markten (MTD groei) en toont de conversie van onze prijs-calculators. Het helpt de directie om te bepalen in welke landen we moeten opschalen en waar de marketing-focus moet liggen.

**Analytics Hub (Performance Data)** (`backoffice/350-analytics-hub.php`) [V2-CORE]
- **Type:** Edge UI (Admin Dashboard)
- **Dependencies:** `VoicesCockpit Engine`
De Hub is de centrale plek voor alle operationele data. Het combineert verkoopcijfers, chat-statistieken en formulier-inzendingen tot één overzichtelijk geheel. In plaats van losse rapporten, biedt de Hub een geconsolideerd beeld van hoe het platform op dit moment presteert, waardoor we sneller kunnen bijsturen op dagelijkse basis.

**Data Match Engine & HyperScore** (`analytics/85-datamatch/bootstrap.php`) [V2-CORE]
- **Type:** Core Service (Identity Provider)
- **State:** State-Producer (schrijft naar `wp_voices_visitors`)
- **Dependencies:** `wp_voices_visitors`, `wp_voices_utm_visitors`
Niet elke bezoeker laat direct zijn naam achter. De Data Match Engine probeert anonieme bezoekers te koppelen aan bestaande klantprofielen op basis van gedragspatronen en historische data (HyperScore). Dit stelt ons in staat om terugkerende klanten te herkennen en hen een gepersonaliseerde ervaring te bieden, zelfs als ze nog niet zijn ingelogd.

**Backoffice Navigation System** (`backoffice/15-backoffice-adminbar-menu.php`) [V2-CORE]
- **Type:** Edge UI (Admin Interface)
Een efficiënt platform begint bij een efficiënte beheeromgeving. We hebben de standaard WordPress-navigatie volledig herzien voor onze specifieke workflow. Het nieuwe menu in de admin-bar is gegroepeerd rondom onze Journeys en acties, waardoor beheerders tot 50% minder tijd kwijt zijn aan het zoeken naar de juiste pagina of instelling.

**Enhanced Orders & Customers Cockpits** (`backoffice/100-orders-table.php` & `105-order-detail.php`) [V2-CORE]
- **Type:** Edge UI (Admin Interface)
- **Dependencies:** `VoicesCockpit Engine`
Onze order- en klantbeheer-interfaces zijn "Apple-style" herontworpen voor maximale helderheid. In plaats van de standaard WooCommerce-lijsten, gebruiken we de Cockpit Engine om alleen de meest relevante data te tonen. Het bevat slimme filters, trend-indicatoren en directe actie-knoppen, waardoor het verwerken van orders een vloeiend en foutloos proces wordt.

**Daily Digest & Project Watchdog** (`commerce/360-daily-digest.php`) [V2-CORE]
- **Type:** Core Service (Communication Provider)
- **Dependencies:** `Mail Manager`
Elke ochtend krijgt het team een automatische "Daily Digest": een samenvatting van de belangrijkste gebeurtenissen van de afgelopen 24 uur. De Project Watchdog bewaakt proactief alle lopende projecten en slaat alarm als een deadline dreigt te worden overschreden of als er ongebruikelijke patronen in de data verschijnen. Het is onze digitale waakhond die zorgt dat er nooit iets tussen de wal en het schip valt.

---

### 14. Gravity Forms Exit Werkgroep (Final Transformation)

De werkgroep heeft de volledige transformatie van Gravity Forms (GF) naar IAP-Native architecture voltooid. De plugin is architecturaal geëlimineerd uit alle kritieke paden.

#### Core Transformaties
*   **Talent Signups (Full Database)** (`backoffice/120-page-global-new-voices.php`): [V2-CORE]
    Alle fallback-logica naar GF is verwijderd. De pagina leest nu uitsluitend uit de `wp_voices_actors` tabel. Oude GF-entries worden niet meer geladen; de database is de *Single Source of Truth*.
*   **Order Metadata (Full JSON Standard)** (`commerce/170-klant-view-display.php`): [V2-CORE]
    De fallback naar `_gravity_form_lead` is volledig gesaneerd. De engine accepteert alleen nog de nieuwe `voices_metadata` standaard (JSON). Dit elimineert trage array-lookups en database-vervuiling.
*   **Frontend Onboarding (Database Only)** (`agency/240-voice-signup-form.php`): [V2-CORE]
    De "Double Write" strategie is beëindigd. Nieuwe aanmeldingen worden direct via de `VoicesFormHandler` in de centrale database opgeslagen, zonder tussenkomst van GF.

#### Journey-Specifieke Sanering
*   **Academy Journey**: Alle cursus-interacties en student-onboarding zijn IAP-Native. Geen GF-afhankelijkheden gevonden in de core LMS logica.
*   **Studio Journey**: Het deelnemer-formulier (`studio/140-studio-deelnemer-form.php`) is volledig omgezet naar een `VoicesCockpit` component die schrijft naar `wp_voices_workshop_interest`.
*   **Telephony Journey**: De Telephony Cockpit (`telephony/450-telephony-cockpit.php`) is een pure God Mode engine die AI-gestuurde scriptanalyse en bestellingen afhandelt zonder legacy plugins.

#### Kill Switch Protocol
*   **Transformatie Script** (`scripts/full-gf-transformation.php`): Een eenmalig CLI-script dat alle historische data heeft omgezet naar de nieuwe standaarden.
*   **Status**: De codebase is 100% GF-vrij. De plugin kan veilig worden gedeactiveerd.

---
*Laatst genormaliseerd: 6 februari 2026*
