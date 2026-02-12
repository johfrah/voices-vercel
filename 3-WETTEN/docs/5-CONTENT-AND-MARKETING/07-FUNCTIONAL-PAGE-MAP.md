# 🗺️ VOICES.BE: FUNCTIONAL PAGE MAP (NUCLEAR GOLD)

Dit document beschrijft alle pagina's van het platform en de specifieke functies/onderdelen die per pagina aanwezig moeten zijn in de nieuwe headless architectuur.

---

## 1. FRONT-FACING (CONSUMER JOURNEY)

### A. Homepagina (`/`)
*Focus: Directe conversie en scannability.*
- **Hero Sectie:** 
    - Dynamische titel (Vind de perfecte stemacteur).
    - "Ademing-feel" achtergrond (Mesh gradient).
- **Command Search (Raycast Style):**
    - Instant search op naam, stijl of kenmerk.
    - Aura-focus effect bij activatie.
- **VoiceCards Grid (Bento Style):**
    - **PriceFilters:** Filteren op starttarief.
    - **MediaType Filters:** Filteren op gebruik (Video, Radio, Telefonie, etc.).
    - **Taal-selector:** Luxe dropdown met vlaggen/namen.
    - **VoiceCard Functies:**
        - Apple-style zoom op foto.
        - Instant Play (Sonic DNA feedback).
        - "Online" status badge (Stripe style).
        - Directe prijsindicatie.
- **Hoe werkt het? (Shortcode Conversie):**
    - 3-stappen proces met grote gradient-nummers.
    - Interactieve hover-states.
- **ReviewsCarousel:**
    - Horizontale scroll van klantervaringen.
    - Sterren-rating (Lucide icons).
- **Sticky Footer:**
    - Real-time teller van acteurs online.
    - "Hulp nodig?" CTA (Voicy trigger).

### B. Muziek Pagina (`/music-on-hold/`)
*Focus: Sfeer en selectie.*
- **Genre Browser:** Grid van muziekstijlen met iconen.
- **Media Master Player:**
    - Waveform weergave (indien mogelijk).
    - Play/Pause/Skip functies.
    - Volume-beheer met mechanical feel.
- **Zoekfunctie:** Specifieke zoekbalk voor soundtracks.
- **Add to Project:** Knop om muziek te koppelen aan een stem-bestelling.

### C. Hoe werkt het? (`/how-it-works/`)
*Focus: Vertrouwen en uitleg.*
- **Deep-Dive Steps:** Uitgebreide uitleg van de journey (van script naar audio).
- **Video Embed:** Luxe video player (Apple style) met uitleg.
- **FAQ Sectie:** Accordion component voor veelgestelde vragen.
- **CTA Sectie:** Grote knop naar de stemmenbank.

### D. Tarieven (`/price/`)
*Focus: Transparantie.*
- **Pricing Calculator:**
    - Interactieve selector voor gebruikstype (Telefoon, Video, Ads).
    - Volume-slider (aantal woorden/minuten).
    - Live prijs-update (geanimeerde cijfers).
- **Inbegrepen-lijst:** Checkmark lijst van wat standaard in de prijs zit.
- **Custom Quote CTA:** Voor complexe projecten.

### E. Contact (`/contact/`)
*Focus: Bereikbaarheid.*
- **Unified Contact Form:**
    - Validatie op velden (Next-gen UX).
    - Succes-animatie na verzenden.
- **Direct Contact:**
    - Klikbare telefoonnummers en e-mailadressen.
    - Kantoor-informatie met kaart-integratie.

---

## 2. CONVERSION & CHECKOUT (THE ENGINE)

### A. Stemacteur Detail (`/actors/[slug]`)
- **Bio & Kenmerken:** Overzicht van stem-karakteristieken.
- **Demo Playlist:** Lijst van alle beschikbare demo's per categorie.
- **Beschikbaarheidskalender:** Visuele weergave van wanneer de acteur opneemt.
- **Direct Boeken Box:** Sticky box die meescrolt voor instant actie.

### B. Checkout Journey (Single Page App)
- **Stap 1: Briefing:** Tekstveld voor script + upload voor PDF/Docx.
- **Stap 2: Opties:** Muziek toevoegen, extra snelle levering, etc.
- **Stap 3: Review:** Overzicht van alle kosten (Excl. BTW mandaat).
- **Stap 4: Betaling:** Stripe/Apple Pay integratie zonder pagina-refresh.

---

## 3. PORTAL & INTELLIGENCE

### A. Voicy Chat (Overal aanwezig)
- **Context-Awareness:** Voicy weet op welke pagina je bent.
- **Action Triggers:** Voicy kan filters instellen of de checkout starten.

### B. Klant/Acteur Portal
- **Dashboard:** KPI stats (Bestellingen, inkomsten).
- **Project Chat:** Directe communicatie (Admin-mediated).
- **File Management:** Downloaden van opgeleverde audio.

---

## TECHNISCHE VEREISTEN (PER PAGINA)
1.  **LLM Context:** Elke pagina moet een `_llm_context` script-tag hebben.
2.  **Zero-CSS:** Geen custom CSS, alleen Tailwind utility classes en tokens.
3.  **Sonic DNA:** Elke knop-klik moet een `playClick()` triggeren.
4.  **No-Emoji:** Geen emoji's in de UI (mandaat van de founder).
