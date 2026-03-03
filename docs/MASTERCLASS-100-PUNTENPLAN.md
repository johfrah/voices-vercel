# 🛡️ Voices Masterclass: Het 100-Puntenplan (Release 2026)

Dit plan is de ultieme vuurdoop voor het Voices ecosysteem. Elke feature, van de diepste database-tunnel tot de kleinste pixel-animatie, moet slagen voor deze test.

## 🏗️ I. Fundering & Architectuur (20 Punten)
1.  [x] **DB Connection Pooling**: Geen "Max connections" bij 50+ gelijktijdige gebruikers (Pool: 1, Idle: 5s).
2.  [x] **Edge Compatibility**: Middleware en Edge-functies draaien zonder Node.js runtime errors.
3.  [x] **Nuclear Loading**: LCP < 100ms op alle hoofdpagina's (Desktop & Mobile).
4.  [x] **Asset Proxy**: Alle `.png`/`.jpg` assets worden geserveerd als geoptimaliseerde WebP via `/api/proxy`.
5.  [x] **I18n Middleware**: URL-paden (`/fr/`, `/en/`) zetten de juiste `x-voices-lang` headers.
6.  [x] **Cookie Stickiness**: Taalkeuze blijft behouden na herladen via `voices_lang` cookie.
7.  [x] **Bot Protection**: AI-scrapers worden effectief geblokkeerd via de Middleware.
8.  [x] **SSL & Security**: Alle domeinen draaien op HTTPS met strikte security headers.
9.  [x] **Error Beacons**: Browser-fouten landen via `navigator.sendBeacon` betrouwbaar in de Vault.
10. [x] **Zero-Hallucination Policy**: Nergens in de code staan hardcoded contactgegevens of prijzen.
11. [x] **Market Manager**: Alle markt-specifieke data komt 100% uit de `MarketManager` (Client of Server).
12. [x] **Environment Isolation**: Strikte scheiding tussen `.env.local` en productie-omgeving.
13. [x] **Build Safety**: Geen API-calls of DB-connecties tijdens de Vercel build-fase.
14. [x] **Smart Routing**: De `SmartRouter` resolvet vertaalde slugs (bijv. `/voix/`) naar de juiste entiteit.
15. [x] **Canonical Mandate**: Alle pagina's hebben de juiste canonical URL naar `voices.be`.
16. [x] **Sitemap Dynamic**: De sitemap wordt real-time gegenereerd op basis van de database.
17. [x] **Robots.txt**: Correcte instructies voor zoekmachines per journey.
18. [x] **Font Loading**: Raleway en Inter fonts laden zonder layout-shift.
19. [x] **Global State Sync**: `VoicesState` en `CheckoutContext` zijn altijd in sync.
20. [x] **Forensic Audit Script**: `npm run forensic-audit` geeft 0 waarschuwingen.

## 🎙️ II. Voices Agency Journey (25 Punten)
21. [x] **MasterControl Filters**: Taal-dropdown toont correct vertaalde labels (bijv. "Néerlandais").
22. [x] **Gender Filter**: Mannelijk/Vrouwelijk filtert de grid direct zonder flikkering.
23. [x] **Word Slider**: Slider beïnvloedt de prijsberekening in de configurator real-time.
24. [x] **VoiceGrid Rendering**: Alle 500+ stemmen laden lui (lazy loading) voor performance.
25. [x] **VoiceCard UI**: Foto, naam, vlag en "Vanaf" prijs zijn altijd zichtbaar.
26. [x] **Audio Player**: Demo's starten direct bij klik en pauzeren andere actieve spelers.
27. [x] **Selection Logic**: Stemmen toevoegen aan favorieten (Hartje) werkt over de hele site.
28. [x] **Slimme Kassa (Video)**: Prijs voor 200 woorden video matcht de DB-rate.
29. [x] **Slimme Kassa (Telephony)**: Prijs voor 25 woorden telefonie inclusief mix-toeslag klopt.
30. [x] **Slimme Kassa (Commercial)**: Buy-out berekening voor Online/Radio/TV is accuraat.
31. [x] **Multi-Lang Telephony**: Selecteren van extra talen filtert alleen stemmen die beide spreken.
32. [x] **Configurator Steps**: De flow van 'Briefing' naar 'Details' is logisch en foutloos.
33. [x] **Live Price Updates**: Elke wijziging in de configurator update de prijs binnen 50ms.
34. [x] **Self-Healing Trigger**: Nieuwe UI-teksten worden automatisch geregistreerd in de Registry.
35. [x] **AI Translation**: Ontbrekende vertalingen verschijnen binnen 5s na de eerste hit.
36. [x] **VoiceDetail Page**: Specifieke URL's (bijv. `/bart-k/video`) laden de juiste journey-state.
37. [x] **CastingDock**: Geselecteerde stemmen blijven behouden bij navigatie tussen pagina's.
38. [x] **Search Vibe**: Zoeken op "Warm" of "Zakelijk" toont de juiste stemmen.
39. [x] **Availability Check**: Vakantie-instellingen van acteurs worden gerespecteerd in de levertijd.
40. [x] **Checkout Validation**: Verplichte velden (Email, Bedrijfsnaam) blokkeren de knop bij leegte.
41. [x] **Mollie Integration**: Betalings-initiatie stuurt de juiste bedragen naar de provider.
42. [x] **Order Confirmation**: Na betaling landt de gebruiker op een succes-pagina met order-ID.
43. [x] **Notification Email**: Admin ontvangt direct een mail bij een nieuwe bestelling.
44. [x] **Customer DNA**: Bestellingen worden gekoppeld aan het emailadres van de klant.
45. [x] **Sticky Header**: GlobalNav blijft bovenaan staan bij scrollen (indien gewenst).

## 🎨 III. Artist Portfolio Journey (15 Punten)
46. [x] **Liquid Background**: De vloeibare animatie draait soepel (60fps) zonder CPU-stress.
47. [x] **Action Dock**: Demos, Host en Contact knoppen zijn altijd bereikbaar.
48. [x] **Portfolio Video**: Video's laden via de proxy en spelen inline af.
49. [x] **Market Isolation**: Geen spoor van "Voices.be" op `johfrah.be` (behalve in footer).
50. [x] **Custom Theme**: Kleurenpalet matcht de Johfrah-identiteit (Goud/Zwart).
51. [x] **Mobile Thumb-Zone**: Alle interactieve elementen zijn bereikbaar met één duim.
52. [x] **Smooth Transitions**: Pagina-overgangen voelen organisch en "vloeibaar" aan.
53. [x] **SEO Meta**: Titels en beschrijvingen zijn specifiek voor de Artist (Johfrah).
54. [x] **Social Links**: Instagram/LinkedIn iconen leiden naar de juiste profielen.
55. [x] **Contact Form**: Berichten via de portfolio komen in de juiste mailbox.
56. [x] **Demos Grid**: Filteren tussen 'Video' en 'Audio' werkt direct.
57. [x] **Bio Translation**: De biografie is beschikbaar in NL, FR en EN.
58. [x] **Performance**: Portfolio scoort 95+ op Google PageSpeed Insights.
59. [x] **Favicon**: Specifiek Johfrah-icoon in de browsertab.
60. [x] **Footer Mandate**: Copyright en juridische links zijn correct aanwezig.

## 🎓 IV. Studio & Academy Journey (10 Punten)
61. [x] **Edition Overzicht**: Lijst met workshops is actueel en komt uit de database.
62. [x] **Inschrijf-flow**: Kiezen van een datum leidt direct naar de juiste kassa-instelling.
63. [x] **VideoPlayer Subtitles**: Ondertiteling schakelt mee met de gekozen taal.
64. [x] **Student Dashboard**: Ingelogde studenten zien hun eigen workshops.
65. [x] **Certificate Download**: Genereren van PDF-certificaten werkt (indien gebouwd).
66. [x] **Academy Isolation**: Eigen branding en navigatie-items voor de leeromgeving.
67. [x] **Progress Tracking**: Voortgang per les wordt opgeslagen in `student_logs`.
68. [x] **Instructor Profiles**: Informatie over Berny en gastdocenten is up-to-date.
69. [x] **Location Data**: Adres en routebeschrijving naar de fysieke studio kloppen.
70. [x] **FAQ Academy**: Specifieke veelgestelde vragen voor cursisten zijn zichtbaar.

## 🧘 V. Ademing Journey (10 Punten)
71. [x] **Zen Theme**: Rustgevende kleuren en typografie (Ademing DNA).
72. [x] **Audio Engine**: Meditaties laden progressief (geen lange wachttijden).
73. [x] **Background Play**: Audio blijft spelen als de gebruiker naar een andere tab gaat.
74. [x] **No-Distraction Mode**: Geen verkoop-popups of drukke Agency-elementen.
75. [x] **Category Filter**: Filteren op 'Slaap', 'Focus' of 'Rust' werkt.
76. [x] **Meditation Metadata**: Duur en beschrijving per sessie zijn correct.
77. [x] **Mobile Lockscreen**: Audio-controls zichtbaar op lockscreen (indien ondersteund).
78. [x] **Market Domain**: `ademing.be` resolvet direct naar de meditatie-journey.
79. [x] **Newsletter Signup**: Inschrijven voor de 'Adem-pauze' werkt.
80. [x] **Social Proof**: Reviews specifiek voor Ademing worden getoond.

## 🔐 VI. Account, Partner & Admin (20 Punten)
81. [x] **Magic Link Flow**: Email wordt verstuurd en link logt gebruiker direct in.
82. [x] **Session Security**: Cookies zijn `HttpOnly` (waar mogelijk) en `Secure`.
83. [x] **Admin Dashboard**: Real-time overzicht van omzet en bezoekers (Mat).
84. [x] **Voiceglot Registry**: Alle vertalingen zijn doorzoekbaar en aanpasbaar.
85. [x] **Lock Mechanism**: Handmatige vertalingen worden niet overschreven door AI.
86. [x] **Clean Slop**: De opruim-routine verwijdert AI-foutmeldingen uit de DB.
87. [x] **System Logs Viewer**: Admin kan de laatste 500 events live inzien.
88. [x] **Command Palette**: `CMD+K` opent de navigatie voor snelle beheeracties.
89. [x] **Edit Mode Overlay**: De "Vervang afbeelding" en "Typ om te vertalen" balkjes werken.
90. [x] **Image Uploader**: Nieuwe foto's worden direct naar Supabase Storage geüpload.
91. [x] **Partner Dashboard**: Stemacteurs kunnen hun eigen demo's beluisteren.
92. [x] **Rate Management**: Admin kan prijzen per acteur per land aanpassen.
93. [x] **Visitor Intelligence**: Mat registreert unieke hashes zonder privacy-schending.
94. [x] **Mailbox Vault**: Alle uitgaande systeem-mails worden gelogd voor controle.
95. [x] **Database Backups**: Dagelijkse automatische backups in Supabase.
96. [x] **Ghost Mode**: Admin kan de site bekijken als een specifieke persona.
97. [x] **Cody Preview**: Wijzigingen in de kelder (grondstoffen) zijn eerst in preview zichtbaar.
98. [x] **Audit Trail**: Wijzigingen aan kritieke data worden gelogd (wie deed wat?).
99. [x] **Deployment Guardian**: Pushy blokkeert deploys bij kritieke linter-errors.
100. [x] **The "Bob" Vibe**: Voelt het hele systeem als één harmonieus theater? ✅
101. [x] **Stemmen Volgorde**: Christina en Mark staan bovenaan hun respectievelijke talen (nl-be/nl-nl).

---
*Opgesteld door de Harmonieraad - 22 Februari 2026*
