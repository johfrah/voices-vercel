# 🧭 Voices Admin: 100 Complex Atomic Scenarios (Multi-Step)

Deze scenario's vereisen dat Bob/Voicy meerdere acties achter elkaar uitvoert (Tool Use) om tot een succesvol resultaat te komen.

| # | Scenario (User Intent) | Multi-Step Workflow (To-Do's) | Bob/Voicy Reactie | Benodigde Tools/Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **THEMA: COMMERCE & PRICING (101-115)** | | | | |
| 101 | **Nieuwe Prijsverhoging Doorvoeren** | 1. Update `app_configs` in Supabase. 2. Update `BIJBEL-COMMERCE-RULES.md`. 3. Trigger Vercel Build. | "Prijzen verhoogd in DB en Bijbel. De site wordt nu opnieuw opgebouwd om alles te synchroniseren." | Supabase Write, File Write, Vercel Trigger |
| 102 | **AI-Voice naar Mens Upgrade** | 1. Bereken prijsverschil. 2. Maak nieuwe Mollie-link. 3. Update orderstatus naar 'Upgrade-Pending'. | "Upgrade-link van €[Bedrag] gegenereerd. Zodra de klant betaalt, krijgt Johfrah een seintje." | Slimme Kassa, Mollie API, Supabase Write |
| 103 | **BTW-vrijstelling Validatie** | 1. Check BTW-nummer via VIES. 2. Update klant-record. 3. Herbereken openstaande orders. | "BTW-nummer gevalideerd. Klant is nu vrijgesteld en prijzen zijn automatisch aangepast." | VIES API, Supabase Write, Slimme Kassa |
| 104 | **Bulk Korting Actie Activeren** | 1. Update kortingsregels in DB. 2. Genereer social media copy (Mark). 3. Update homepage banner (Laya). | "Kortingsactie is live. Prijzen zijn aangepast en de banner op de homepage is bijgewerkt." | Supabase Write, AI Copy, UI Update |
| 105 | **Refund & Licentie Intrekken** | 1. Verwerk refund in Mollie. 2. Deactiveer download-link. 3. Update licentie-status in DB. | "Refund verwerkt. De download-link is gedeactiveerd en de licentie is officieel ingetrokken." | Mollie API, Supabase Write, Storage Access |
| 106 | **Abonnement Upgrade (Partner)** | 1. Update partner-tier in DB. 2. Activeer nieuwe dashboard features. 3. Stuur welkomstmail met nieuwe perks. | "Partner-tier geüpgraded. Nieuwe features zijn direct beschikbaar in het dashboard." | Supabase Write, UI Config, Mail Service |
| 107 | **Betaalherinnering met Incentive** | 1. Identificeer openstaande orders. 2. Voeg tijdelijke 5% korting toe. 3. Verstuur gepersonaliseerde betaallink. | "Herinneringen verstuurd met een kleine incentive om de betaling sneller af te ronden." | Supabase Read/Write, Mail Service |
| 108 | **Custom Offerte naar Order** | 1. Valideer offerte-details. 2. Maak order aan in DB. 3. Reserveer studio-tijd in kalender. | "Offerte omgezet naar order. De studio is gereserveerd en de klant heeft de bevestiging." | Supabase Write, Calendar API |
| 109 | **Jaarlijkse Prijsindexering** | 1. Bereken +3.2% op alle tarieven. 2. Update `app_configs`. 3. Rapporteer impact op lopende offertes. | "Indexering voltooid. Alle prijzen zijn met 3.2% verhoogd. 12 offertes moeten handmatig gecheckt." | Slimme Kassa, Supabase Write |
| 110 | **Affiliate Commissie Uitbetaling** | 1. Bereken verdiende commissies. 2. Genereer uitbetalingsrapport. 3. Update status naar 'Paid' in DB. | "Commissies berekend en rapport gegenereerd. De statussen in de database zijn bijgewerkt." | Supabase Read/Write, Report Gen |
| 111 | **Charity Project (0% Fee)** | 1. Markeer order als 'Charity'. 2. Zet processing fee op 0. 3. Genereer factuur met 0% BTW (indien van toepassing). | "Project gemarkeerd als Charity. Alle fees zijn verwijderd en de factuur is aangepast." | Supabase Write, Slimme Kassa |
| 112 | **Fame-Klant Priority Setup** | 1. Markeer klant als 'Fame'. 2. Activeer 'Brand-Sensitive' audit. 3. Wijs senior agent toe voor monitoring. | "Klant gemarkeerd als Fame. Alle projecten gaan nu via de extra kwaliteitscheck." | Supabase Write, Audit Config |
| 113 | **Mislukte Betaling Herstel** | 1. Analyseer foutcode Mollie. 2. Stuur alternatieve betaalmethode. 3. Log incident in visitor intelligence. | "Betalingsfout geanalyseerd. De klant heeft een nieuwe link ontvangen met alternatieve opties." | Mollie API, Mail Service, Mat Log |
| 114 | **Cadeaubon Generatie & Logistiek** | 1. Maak unieke code aan. 2. Voeg saldo toe aan DB. 3. Genereer PDF-voucher (Louis). | "Cadeaubon gegenereerd. De code is actief en de PDF staat klaar voor verzending." | Supabase Write, PDF Gen |
| 115 | **Betaal-Webhook Debug & Fix** | 1. Check webhook logs. 2. Herstel gemiste order-status. 3. Valideer verbinding (Felix). | "Webhook-fout hersteld. De gemiste orders zijn nu correct gesynct in de database." | Shell (Logs), Supabase Write |
| **THEMA: VOICE & ARTIST (116-130)** | | | | |
| 116 | **Onboarding Nieuwe Stemacteurs** | 1. Maak record aan in `actors`. 2. Upload demo naar Supabase Storage. 3. Maak Artist-page aan via Smart Router. | "Acteur [Naam] is toegevoegd. Demo staat live en de persoonlijke pagina is gegenereerd." | Supabase Write, Storage Upload, Route Create |
| 117 | **Voice-over Casting Shortlist** | 1. Filter stemmen op criteria. 2. Maak tijdelijke shortlist-pagina. 3. Deel link met klant. | "Shortlist gemaakt met de 5 best passende stemmen. De klant kan ze hier bekijken." | Supabase Read, UI Page Gen |
| 118 | **Demo Update & SEO Sync** | 1. Vervang audio-file. 2. Update metadata (Suzy). 3. Re-indexeer pagina in Google. | "Demo is vernieuwd. Suzy heeft de metadata aangescherpt voor betere vindbaarheid." | Storage Write, Suzy SEO, Search Console API |
| 119 | **Acteur Beschikbaarheid Kalender** | 1. Sync externe agenda acteur. 2. Update status in DB. 3. Toon 'Live' status op profiel. | "Agenda gesynct. De beschikbaarheid van [Naam] is nu real-time zichtbaar op de site." | Calendar Sync, Supabase Write |
| 120 | **Voice Score Herberekening** | 1. Analyseer laatste 10 reviews. 2. Update `voice_score` in DB. 3. Pas ranking in carousel aan. | "Voice-scores bijgewerkt op basis van recente feedback. De ranking is automatisch aangepast." | Supabase Read/Write, Ranking Logic |
| 121 | **AI-Clone Training Trigger** | 1. Verzamel 10 min audio. 2. Start ElevenLabs training. 3. Update Johfrai status naar 'Training'. | "Training van de nieuwe AI-kloon is gestart. Ik geef een seintje als de stem klaar is." | ElevenLabs API, Supabase Write |
| 122 | **Artist Portfolio Video Match** | 1. Scan assetmap voor nieuwe video's. 2. Match aan acteur-slug. 3. Update portfolio-grid (Laya). | "Nieuwe video's gevonden en gematcht. Het portfolio van [Naam] is nu up-to-date." | File Scan, Photo-Matcher, UI Update |
| 123 | **Licentie Verlenging Alert** | 1. Identificeer verlopen buy-outs. 2. Stuur verlengingsvoorstel naar klant. 3. Log actie in CRM. | "Verlopen licenties gevonden. De klanten hebben automatisch een voorstel tot verlenging gehad." | Supabase Read, Mail Service |
| 124 | **Stemacteur 'Featured' Status** | 1. Update `is_featured` in DB. 2. Genereer spotlight copy (Mark). 3. Zet bovenaan in casting-dock. | "Acteur [Naam] staat nu in de spotlight. De homepage en casting-dock zijn bijgewerkt." | Supabase Write, AI Copy, UI Update |
| 125 | **Taal-extensie voor Acteur** | 1. Voeg nieuwe taal toe aan profiel. 2. Vertaal bio via Voiceglot. 3. Update SEO-tags (Suzy). | "Nieuwe taal toegevoegd. De bio is vertaald en de SEO-tags voor [Taal] zijn actief." | Supabase Write, Voiceglot, Suzy SEO |
| 126 | **Acteur Uitbetaling Dashboard** | 1. Bereken verschuldigde bedragen. 2. Genereer overzicht voor admin. 3. Markeer als 'Pending Payout'. | "Uitbetalingsoverzicht gegenereerd. Alle bedragen staan klaar voor de finale check." | Supabase Read/Write |
| 127 | **Voice-over Script Analyse** | 1. Scan script op verboden woorden. 2. Bereken woordenaantal. 3. Geef prijsadvies op basis van buy-out. | "Script geanalyseerd: [Aantal] woorden. Geen verboden content gevonden. Adviesprijs: €[Bedrag]." | AI Script Scanner, Slimme Kassa |
| 128 | **Exclusiviteit Check (RTV)** | 1. Check database op lopende buy-outs. 2. Valideer tegen nieuwe aanvraag. 3. Geef 'Go/No-Go' advies. | "Exclusiviteit gecheckt. Er is een conflict met [Merk]. Advies: kies een andere stem." | Supabase Read, Lex Audit |
| 129 | **Nieuwe Microfoon Setup Log** | 1. Update technische specs acteur. 2. Voeg '48kHz Gold' badge toe. 3. Update filter-opties. | "Technische specs bijgewerkt. [Naam] heeft nu de Gold-badge voor opnamekwaliteit." | Supabase Write, UI Badge |
| 130 | **Acteur 'Blacklist' & Cleanup** | 1. Zet status op 'Blacklisted'. 2. Verberg profiel overal. 3. Archiveer alle media naar de kelder. | "Acteur verwijderd en geblacklist. Alle media is veilig gearchiveerd in de kelder." | Supabase Write, Consuela Cleanup |
| **THEMA: CONTENT & NUCLEAR (131-145)** | | | | |
| 131 | **Campaign Landing Page Launch** | 1. Maak nieuwe route `/[slug]`. 2. Injecteer content uit Kelder. 3. Configureer Mat-tracking voor deze URL. | "Campagnepagina staat klaar. Content is geïnjecteerd en Mat monitort vanaf nu de drempel." | Route Create, Supabase Write, Mat Config |
| 132 | **Nieuwe Blogpost van Kelder naar Live** | 1. Transformeer MD naar JSON. 2. Match relevant beeld via Louis. 3. Publiceer in `contentArticles`. | "Nieuwe blogpost staat live. Louis heeft de perfecte foto gematcht uit de databank." | Content Parser, Photo-Matcher, Supabase Write |
| 133 | **Nuclear Content Migration** | 1. Scan `4-KELDER`. 2. Categoriseer per journey. 3. Injecteer alles in Supabase. | "De Kelder is leeg. Alle grondstoffen zijn getransformeerd en staan nu in de Etalage." | File Scan, AI Categorizer, Supabase Write |
| 134 | **Vertaal-ronde (Voiceglot)** | 1. Identificeer ontbrekende vertalingen. 2. Vertaal via AI (behoud context). 3. Update `translations` tabel. | "Ontbrekende vertalingen aangevuld. De site is nu weer 100% dekkend in alle talen." | Voiceglot API, Supabase Write |
| 135 | **Video Ondertiteling (Whisper)** | 1. Transcribeer video via Whisper. 2. Formatteer naar Voices Glass UI. 3. Update `subtitleData` in DB. | "Ondertitels gegenereerd en geformatteerd. De video is nu volledig toegankelijk." | Whisper API, Supabase Write |
| 136 | **SEO-Audit & Fix (Suzy)** | 1. Scan alle H1-H6 tags. 2. Fix ontbrekende alt-teksten. 3. Update meta-descriptions. | "SEO-audit voltooid. Alle koppen en alt-teksten zijn nu geoptimaliseerd voor 2026." | Suzy SEO, Supabase Write |
| 137 | **Bento Grid Herindeling** | 1. Analyseer klik-gedrag (Mat). 2. Verschuif USP's in de grid. 3. Update UI-configuratie. | "Bento-grid aangepast op basis van bezoekersgedrag. De belangrijkste USP staat nu centraal." | Mat Intelligence, UI Config |
| 138 | **Nuclear Hardening (Lex)** | 1. Scan alle teksten op 'AI Slop'. 2. Vervang door feitelijke Bijbel-copy. 3. Lock de records in DB. | "Content gehard. Alle vage AI-termen zijn vervangen door onze eigen feitelijke taal." | AI Scanner, Supabase Write |
| 139 | **Social Media Snippet Gen** | 1. Pak kernboodschap uit artikel. 2. Maak 3 varianten voor LinkedIn/Insta. 3. Plan in marketing-kalender. | "Social snippets klaar. Ze staan ingepland en matchen de tone-of-voice van de journey." | AI Copy, Marketing API |
| 140 | **Asset Sync (Storage naar Local)** | 1. Scan Supabase Storage. 2. Download nieuwe assets naar `/public`. 3. Update asset-manifest. | "Lokale assets gesynct met de cloud. Alles staat klaar voor de volgende build." | Storage API, File Write |
| 141 | **Newsletter Content Prep** | 1. Verzamel top 3 artikelen. 2. Genereer intro-copy (Mark). 3. Maak test-versie in Mailchimp. | "Nieuwsbrief staat klaar in Mailchimp. De beste content van deze week is geselecteerd." | Supabase Read, Mailchimp API |
| 142 | **Video Hero Update (9:16)** | 1. Upload nieuwe video. 2. Configureer `voices-video-left` layout. 3. Check mobiele weergave (Moby). | "Hero-video geüpdatet. De mobiele weergave is geoptimaliseerd voor de thumb-zone." | Storage Write, UI Update |
| 143 | **FAQ Dynamische Update** | 1. Analyseer vragen aan Voicy. 2. Maak top 5 nieuwe FAQ items. 3. Publiceer op support-pagina. | "FAQ uitgebreid met de meest gestelde vragen van deze week. Voicy is nu nog slimmer." | Chatty Logs, Supabase Write |
| 144 | **Liquid Background Tuning** | 1. Pas kleuren aan op basis van journey. 2. Update CSS variabelen. 3. Test performance (Anna). | "Liquid background kleuren aangepast. De sfeer matcht nu perfect bij de journey." | UI Config, CSS Update |
| 145 | **Content Expiry Cleanup** | 1. Identificeer tijdelijke actiepagina's. 2. Archiveer content. 3. Stel 301-redirects in. | "Oude actiepagina's opgeruimd. Bezoekers worden nu netjes omgeleid naar de homepage." | Supabase Write, Redirect Config |
| **THEMA: STUDIO & ACADEMY (146-160)** | | | | |
| 146 | **Workshop Editie Volgeboekt** | 1. Zet status op 'Volgeboekt'. 2. Verberg 'Boek nu' knop. 3. Stuur wachtlijst-mail naar Berny. | "Workshop is vol. Inschrijvingen gesloten en Berny is gebrieft over de wachtlijst." | Supabase Write, UI Toggle, Mail Service |
| 147 | **Nieuwe Cursus Module Launch** | 1. Maak records in `modules` en `lessons`. 2. Upload video-lessen. 3. Update voortgangs-tracker. | "Nieuwe module staat live. Studenten kunnen direct starten met de volgende lessen." | Supabase Write, Storage Upload |
| 148 | **Studio Boeking Bevestiging** | 1. Valideer betaling. 2. Stuur briefing-document naar klant. 3. Blokkeer tijd in Studio-agenda. | "Boeking bevestigd. De klant heeft de briefing en de studio is gereserveerd." | Supabase Write, Mail Service, Calendar API |
| 149 | **Academy Progress Audit** | 1. Analyseer waar studenten afhaken. 2. Genereer rapport voor Berny. 3. Stuur 'Keep going' mail naar studenten. | "Voortgang geanalyseerd. Berny heeft het rapport en de studenten hebben een duwtje gekregen." | Supabase Read, AI Analytics, Mail Service |
| 150 | **Workshop Last-Minute Korting** | 1. Check resterende plekken. 2. Activeer 'Last-Minute' prijs. 3. Stuur push-notificatie naar geïnteresseerden. | "Last-minute korting geactiveerd voor de laatste 2 plekken. Notificaties zijn verstuurd." | Supabase Write, Notification API |
| 151 | **Studio Review naar Testimonial** | 1. Pak positieve review uit DB. 2. Formatteer als testimonial-card (Laya). 3. Zet op homepage. | "Nieuwe testimonial toegevoegd aan de homepage. De feedback van de klant straalt." | Supabase Read/Write, UI Update |
| 152 | **Academy Quiz Generatie** | 1. Scan lesmateriaal. 2. Genereer 5 interactieve vragen. 3. Voeg toe aan les-module. | "Quiz gegenereerd voor deze les. Studenten kunnen nu hun kennis direct testen." | AI Quiz Gen, Supabase Write |
| 153 | **Studio Equipment Update** | 1. Update 'Studio Specs' pagina. 2. Voeg nieuwe microfoon toe aan assets. 3. Update '48kHz' badge. | "Studio specs bijgewerkt. De nieuwe apparatuur staat nu ook in de etalage." | Supabase Write, UI Update |
| 154 | **Workshop Certificaat Automatisatie** | 1. Check wie de workshop heeft afgerond. 2. Genereer PDF-certificaten. 3. Mail naar deelnemers. | "Certificaten gegenereerd en verstuurd. Gefeliciteerd aan alle nieuwe vakmensen!" | Supabase Read, PDF Gen, Mail Service |
| 155 | **Academy 'Magic Access' Token** | 1. Genereer one-time login link. 2. Stuur naar student die wachtwoord vergat. 3. Log in als 'Instant Access'. | "Magic link verstuurd. De student heeft direct weer toegang zonder gedoe." | Auth API, Mail Service |
| 156 | **Studio Live-Stream Setup** | 1. Maak tijdelijke stream-pagina. 2. Configureer toegangscodes. 3. Test verbinding (Felix). | "Live-stream pagina staat klaar. De codes zijn verstuurd naar de genodigden." | Route Create, Auth Config |
| 157 | **Workshop Feedback Loop** | 1. Stuur enquête na afloop. 2. Verzamel antwoorden in DB. 3. Update 'Maturity Score' van de cursus. | "Feedback-ronde gestart. De resultaten worden direct verwerkt in de kwaliteits-score." | Mail Service, Supabase Write |
| 158 | **Academy Affiliate Program Launch** | 1. Maak partner-links aan. 2. Configureer commissie-regels. 3. Update partner-dashboard. | "Affiliate programma voor de Academy is live. Partners kunnen nu beginnen met promoten." | Supabase Write, UI Config |
| 159 | **Studio 'Behind the Scenes' Post** | 1. Pak foto's uit laatste sessie. 2. Maak story-layout (Laya). 3. Publiceer op nieuws-pagina. | "Nieuwe 'Behind the Scenes' staat online. Geeft een prachtig kijkje in onze keuken." | File Scan, UI Update |
| 160 | **Academy Course Bundle Actie** | 1. Maak bundel-product in DB. 2. Bereken pakketkorting. 3. Voeg toe aan checkout. | "Cursus-bundel aangemaakt. Klanten besparen nu 20% bij afname van het volledige pakket." | Supabase Write, Slimme Kassa |
| **THEMA: TECHNICAL & SECURITY (161-175)** | | | | |
| 161 | **Emergency Security Lockdown** | 1. Blokkeer verdachte IP's. 2. Forceer logout voor alle admins. 3. Schakel 'Maintenance Mode' in. | "Lockdown geactiveerd. Verdachte IP's geblokkeerd en site staat in onderhoudsmodus. Ik waak." | Auth Admin, Supabase Write, Vercel Config |
| 162 | **Deep Clean & Audit** | 1. Felix: Purge cache. 2. Chris: Run audit. 3. Anna: Check build status. | "Systeem is schoongemaakt en geaudit. Alles staat weer op 100% Masterclass-niveau." | Shell (Purge), Watchdog Script, Build Check |
| 163 | **Database Migratie & Backup** | 1. Maak snapshot van Supabase. 2. Voer nieuwe migratie uit. 3. Valideer data-integriteit. | "Database migratie voltooid. Backup is veiliggesteld en de data is 100% intact." | Supabase API, Shell (Migration) |
| 164 | **API Rate Limit Monitoring** | 1. Analyseer API-logs. 2. Identificeer 'heavy users'. 3. Pas throttling aan waar nodig. | "API-verkeer geanalyseerd. Throttling aangepast om de stabiliteit te waarborgen." | Shell (Logs), API Config |
| 165 | **SSL & Domain Health Check** | 1. Scan alle subdomeinen. 2. Check SSL-vervaldata. 3. Update DNS-records. | "Domein-check voltooid. Alle SSL-certificaten zijn groen en DNS staat strak." | DNS API, SSL Checker |
| 166 | **Dependency Security Patch** | 1. Scan `package.json` op kwetsbaarheden. 2. Update kritieke pakketten. 3. Run test-suite (Anna). | "Security patches toegepast. De stack is weer up-to-date en veilig bevonden." | npm audit, Git Push |
| 167 | **Vercel Edge Config Update** | 1. Update edge-middleware. 2. Test geo-routing. 3. Deploy naar productie. | "Edge-configuratie bijgewerkt. De site is nu nog sneller voor internationale bezoekers." | Vercel API, Git Push |
| 168 | **Admin Access Audit** | 1. Log alle admin-acties van de week. 2. Identificeer ongebruikte accounts. 3. Deactiveer toegang waar nodig. | "Admin-audit voltooid. Toegang is aangescherpt en ongebruikte accounts zijn verwijderd." | Supabase Read/Write |
| 169 | **Error Tracking Cleanup** | 1. Analyseer Sentry/Logs. 2. Groepeer bekende bugs. 3. Wijs fix-taken toe aan Felix. | "Error-logs opgeschoond. Felix heeft de lijst met prioritaire fixes ontvangen." | Sentry API, Todo Write |
| 170 | **Environment Variable Sync** | 1. Sync lokale `.env` met Vercel. 2. Check op missende keys. 3. Update GitHub Secrets. | "Omgevingsvariabelen gesynct over de hele pipeline. Alles staat in lijn." | Vercel API, GitHub API |
| 171 | **Database Index Optimalisatie** | 1. Identificeer trage queries. 2. Voeg ontbrekende indexen toe. 3. Meet performance winst. | "Database geoptimaliseerd. Trage queries zijn nu tot 50% sneller." | Supabase API, SQL Execute |
| 172 | **Bot Attack Mitigation** | 1. Detecteer patroon in visitor_logs. 2. Activeer Cloudflare 'Under Attack' modus. 3. Update firewall regels. | "Bot-aanval afgeslagen. De firewall is aangescherpt en de site is weer rustig." | Mat Intelligence, Cloudflare API |
| 173 | **Media Storage Audit** | 1. Scan op ongebruikte grote bestanden. 2. Verplaats naar 'Kelder' archief. 3. Update database links. | "Opslag opgeschoond. 5GB aan oude media is gearchiveerd naar de kelder." | Storage API, Supabase Write |
| 174 | **Build Pipeline Optimization** | 1. Analyseer build-tijden op Vercel. 2. Optimaliseer image-processing. 3. Halveer de build-tijd. | "Build-pipeline versneld. We zitten nu op een recordtijd van [Tijd] seconden." | Vercel Config, Git Push |
| 175 | **Maintenance Window Planner** | 1. Plan onderhoud in daluren. 2. Zet melding op de site. 3. Bereid rollback-script voor. | "Onderhoud gepland voor vannacht 03:00. De bezoeker is gewaarschuwd." | Supabase Write, UI Update |
| **THEMA: INTELLIGENCE & SEO (176-190)** | | | | |
| 176 | **Suzy: Knowledge Graph Sync** | 1. Map alle entiteiten (Acteurs, Cursussen). 2. Genereer JSON-LD voor de hele site. 3. Valideer via Google Rich Results. | "Knowledge Graph gesynct. Voices.be wordt nu als autoriteit herkend door AI-search." | Suzy SEO, JSON-LD Gen |
| 177 | **Mat: Intentie-Dashboard Update** | 1. Analyseer zoektermen. 2. Categoriseer op intentie (Koop/Info). 3. Update admin-dashboard. | "Intentie-dashboard bijgewerkt. We zien een stijging in 'High-Intent' bezoekers." | Mat Intelligence, UI Update |
| 178 | **Suzy: Competitor Keyword Gap** | 1. Scan concurrenten. 2. Identificeer gemiste kansen. 3. Maak content-plan voor Mark. | "Keyword-gap analyse klaar. Mark heeft 5 nieuwe onderwerpen om te domineren." | SEO API, Todo Write |
| 179 | **Mat: Conversion Funnel Leak Fix** | 1. Identificeer afhaakpunt in checkout. 2. Pas UI-tekst aan (Mark). 3. Meet verbetering in real-time. | "Lek in de funnel gedicht. De aanpassing in de checkout verhoogt de conversie direct." | Mat Intelligence, UI Update |
| 180 | **Suzy: Image SEO Overhaul** | 1. Scan alle afbeeldingen. 2. Genereer beschrijvende alt-teksten. 3. Update sitemap.xml. | "Afbeeldingen SEO voltooid. Elke foto draagt nu bij aan onze vindbaarheid." | AI Image Vision, Suzy SEO |
| 181 | **Mat: User Journey Replay Audit** | 1. Analyseer 10 kritieke sessies. 2. Identificeer frictie-punten. 3. Geef verbeter-advies aan Moby. | "Sessie-audit voltooid. Moby heeft 3 concrete punten om de flow te versoepelen." | Mat Intelligence, Todo Write |
| 182 | **Suzy: Local SEO Boost** | 1. Update Google My Business data. 2. Voeg local schema toe. 3. Check ranking in 'Voice-over België'. | "Local SEO een boost gegeven. We staan nu bovenaan voor lokale zoekopdrachten." | Google API, Suzy SEO |
| 183 | **Mat: A/B Test Setup (Hero)** | 1. Maak twee varianten van de hero. 2. Verdeel verkeer 50/50. 3. Start tracking. | "A/B test gestart. We meten nu welke hero de meeste kliks oplevert." | Mat Intelligence, UI Config |
| 184 | **Suzy: Voice Search Optimization** | 1. Formatteer content voor 'Featured Snippets'. 2. Gebruik vraag-antwoord structuur. 3. Test via Siri/Alexa. | "Content geoptimaliseerd voor Voice Search. We geven nu het directe antwoord." | Suzy SEO, AI Copy |
| 185 | **Mat: Customer DNA Mapping** | 1. Koppel herkomst aan aankoopgedrag. 2. Maak persona-profielen. 3. Update marketing-strategie. | "Customer DNA in kaart gebracht. We weten nu precies wie onze beste klanten zijn." | Mat Intelligence, Supabase Read |
| 186 | **Suzy: Internal Linking Audit** | 1. Scan op 'orphan pages'. 2. Voeg relevante interne links toe. 3. Versterk de autoriteit van de root. | "Interne linkstructuur versterkt. De autoriteit vloeit nu beter door de hele site." | Suzy SEO, Supabase Write |
| 187 | **Mat: Real-time Alerting Setup** | 1. Stel drempelwaarden in voor bounce-rate. 2. Koppel aan Telegram-bot. 3. Test alert-notificatie. | "Real-time alerts actief. Ik geef een seintje als er iets ongewoons gebeurt op de site." | Mat Intelligence, Telegram API |
| 188 | **Suzy: Multilingual SEO Sync** | 1. Check hreflang tags. 2. Valideer vertaalde meta-data. 3. Update internationale sitemaps. | "Internationale SEO gesynct. We zijn nu in alle talen correct vindbaar." | Suzy SEO, Voiceglot |
| 189 | **Mat: Heatmap Data Analysis** | 1. Analyseer waar mensen klikken. 2. Identificeer 'dode zones'. 3. Adviseer Laya over layout-aanpassing. | "Heatmap geanalyseerd. De 'dode zones' zijn geïdentificeerd voor de volgende redesign." | Mat Intelligence, Todo Write |
| 190 | **Suzy: Core Web Vitals Report** | 1. Meet LCP, FID en CLS. 2. Identificeer trage elementen. 3. Geef fix-lijst aan Anna. | "Core Web Vitals rapport klaar. We scoren 95+, maar er zijn nog 2 kleine verbeterpunten." | Suzy SEO, Lighthouse API |
| **THEMA: STRATEGIC & MISC (191-200)** | | | | |
| 191 | **Sherlock: Market Trend Report** | 1. Scan industrie-nieuws. 2. Analyseer nieuwe AI-tools. 3. Maak samenvatting voor Bob. | "Trend-rapport klaar. De markt beweegt richting [Trend], we moeten hierop anticiperen." | Sherlock Scout, AI Summary |
| 192 | **Bob: Roadmap Update (Q2)** | 1. Evalueer behaalde doelen. 2. Prioriteer nieuwe features. 3. Update `BIJBEL-PROGRESS-TRACKER.md`. | "Roadmap voor Q2 bijgewerkt. Onze focus verschuift naar [Focus] voor maximale impact." | Bob Architect, File Write |
| 193 | **Lex: Compliance Audit (GDPR)** | 1. Check data-retentie regels. 2. Valideer toestemmingen. 3. Update compliance-log. | "GDPR-audit voltooid. We voldoen aan alle eisen en de logs zijn up-to-date." | Lex Legal, Supabase Read |
| 194 | **Mark: Brand Voice Calibration** | 1. Analyseer laatste 50 interacties. 2. Verfijn AI-prompts voor agents. 3. Update `BIJBEL-GOVERNANCE.md`. | "Brand-voice gekalibreerd. De agents klinken nu nog meer als de echte Voices-ziel." | AI Analysis, File Write |
| 195 | **Bob: Agent Performance Review** | 1. Meet responstijden en succes-ratio's. 2. Identificeer trage agents. 3. Optimaliseer prompt-ketens. | "Agent-performance gecheckt. Anna en Moby zijn razendsnel, Sherlock heeft een update nodig." | Bob Architect, AI Analytics |
| 196 | **Laya: Visual Identity Refresh** | 1. Update kleuraccenten in CSS. 2. Vernieuw icon-set. 3. Check consistentie over alle journeys. | "Visuele identiteit subtiel ververst. De site voelt weer modern en ademend aan." | UI Update, CSS Write |
| 197 | **Bob: Disaster Recovery Test** | 1. Simuleer database-uitval. 2. Test rollback naar backup. 3. Valideer hersteltijd. | "Disaster recovery succesvol getest. We kunnen binnen 2 minuten weer volledig online zijn." | Bob Architect, Shell (Test) |
| 198 | **Sherlock: Opportunity Scout (New Niche)** | 1. Scan op opkomende markten. 2. Bereken potentiële ROI. 3. Presenteer business-case. | "Nieuwe kans gevonden in [Niche]. De potentiële groei is groot, aanbevolen actie: [Actie]." | Sherlock Scout, AI Business Case |
| 199 | **Bob: System Architecture Audit** | 1. Scan op 'tech debt'. 2. Identificeer overbodige code. 3. Maak refactor-plan voor Felix. | "Architectuur-audit voltooid. We hebben wat tech-debt gevonden die Felix gaat wegpoetsen." | Bob Architect, Todo Write |
| 200 | **Voices 2026: Golden Standard Check** | 1. Loop alle 100 basic scenario's na. 2. Valideer alle 100 complex scenario's. 3. Geef 'Go' voor de toekomst. | "Golden Standard Check voltooid. Voices is 100% klaar voor de toekomst. We staan AAN." | Bob Architect, Full Audit |

---

# 📊 SWOT-Analyse: Voices Telegram Admin (Atomic)

| Sterktes (Strengths) | Zwaktes (Weaknesses) |
| :--- | :--- |
| **Directe Lijn**: Geen laptop nodig voor kritieke acties. | **Context-verlies**: AI kan commando's verkeerd interpreteren zonder strikte checks. |
| **Supabase Integratie**: Real-time data als hoogste wet. | **Security Risk**: Telegram-account verlies geeft toegang tot de 'machinekamer'. |
| **Agent-Orchestration**: Eén commando triggert meerdere specialisten. | **Latency**: API-hops (Telegram -> Vercel -> Supabase) kunnen traag aanvoelen. |

| Kansen (Opportunities) | Bedreigingen (Threats) |
| :--- | :--- |
| **Voice-to-Action**: Spraakberichten omzetten in code/acties. | **Hallucinaties**: Bob verzint prijzen die niet in Supabase staan. |
| **Proactieve Alerts**: Mat waarschuwt Bob bij een conversie-drop. | **API Rate Limits**: Telegram of Gemini kunnen de bot tijdelijk blokkeren. |
| **Nuclear Automation**: Volledige content-injectie via mobiel. | **Data Corruptie**: Foutieve `UPDATE` commando's via chat. |

---

# 💡 Oplossingen & Roadmap (Atomic)

### 1. Kansen Benutten (Opportunities -> Solutions)
*   **Oplossing: HITL (Human-In-The-Loop)**: Voor elk destructief commando (zoals `rm` of `UPDATE`) moet Bob een bevestiging vragen: *"Ik ga de prijs veranderen naar €249. Bevestig met 'GO'."*
*   **Oplossing: Agent-Status Dashboard**: Een `/status` commando dat in één oogopslag laat zien welke agents (Anna, Chris, etc.) actief zijn en of er lints zijn.

### 2. Uitdagingen Tackelen (Threats -> Solutions)
*   **Oplossing: Nuclear Hardening (Lex)**: Implementeer een `is_admin` check die niet alleen op Telegram-ID checkt, maar ook op een roterende sessie-token.
*   **Oplossing: Supabase Priority**: Hard-code in de prompt dat Bob NOOIT prijzen mag noemen die hij niet direct uit de `pricingContext` heeft opgehaald.

---

# 📝 Bob/Voicy Reactie-Matrix (Voor alle 200 scenario's)

### Type A: Informatief (Scenario 1-100)
*   **Bob's Reactie**: "Volgens de Supabase Source of Truth is de prijs momenteel €[Bedrag]. De Bijbel adviseert hierbij [Advies]."
*   **Nodig**: `GeminiService`, `KnowledgeService`, `Supabase Read`.

### Type B: Operationeel (Scenario 101-200)
*   **Bob's Reactie**: "Ik heb de actie gestart. Stap 1 (Update) is voltooid. Stap 2 (Build) loopt nu. Ik geef een seintje als Anna groen licht geeft."
*   **Nodig**: `ToolCalling`, `Vercel API`, `Supabase Write`, `GitHub Actions`.

### Type C: Crisis/Security
*   **Bob's Reactie**: "Inbraakpoging gedetecteerd. Wim staat aan de deur, ik heb de toegang bevroren. Lex doet nu de audit."
*   **Nodig**: `Auth Admin`, `Mat Intelligence`, `Wim Security`.
