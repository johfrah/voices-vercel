# 🎭 Voices Masterplan: De Grote Generale Repetitie (2026)

Dit plan definieert de strategische aanpak voor het testen van de Voices-site voor publicatie, gebaseerd op de **Bob-methode** en het **Chris-Protocol**.

## 🐒 Monkeyproof & Real-World Scenario's (35 stuks)

Hieronder staan 35 scenario's waarbij we uitgaan van **nul voorkennis**, vage intenties, en onvoorspelbaar gebruikersgedrag.

### 🎡 Groep 1: De "Ik heb een vaag idee" (Discovery)
1.  **De Verloren Zoeker:** Een klant typt "stem voor filmpje" in Google and landt op de homepage. Hij scrolt doelloos en klikt op willekeurige elementen zonder te weten wat een 'agency' is. *Check: Is de navigatie intuïtief genoeg?*
2.  **De Twijfelaar:** Iemand wil een voice-over maar weet niet of het voor een commercial of een interne video is. Hij wisselt 10 keer van 'Usage' in de configurator. *Check: Blijft de prijsberekening stabiel en logisch?*
3.  **De Audio-Zapper:** Een gebruiker klikt razendsnel op 15 verschillende demo's van verschillende acteurs tegelijkertijd. *Check: Gaan audio-streams door elkaar lopen of crasht de player? (100ms regel)*
4.  **De Mobiele Chaos:** Een klant op een krakkemikkige treinverbinding probeert een stem te luisteren. Hij ververs de pagina halverwege het laden. *Check: Werken de Skeletons en herstelt de state zich?*
5.  **De "Wat is dit?" Quizzer:** Iemand landt op de Studio Quiz, vult overal tegenstrijdige antwoorden in (wil alles maar heeft geen budget). *Check: Geeft de quiz een zinvol advies of een foutmelding?*

### 🛒 Groep 2: De "Oeps, foutje" (Configurator & Checkout)
6.  **De Script-Dumper:** Een klant plakt een tekst van 10.000 woorden (een heel boek) in het scriptveld dat bedoeld is voor een korte commercial. *Check: Bevriest de browser of wordt de prijs correct (en traag) berekend?*
7.  **De BTW-Goochelaar:** Een Belgische klant vult een Nederlands BTW-nummer in om te kijken of hij de BTW kan ontduiken. *Check: Valideert Kelly de match tussen land en BTW-nummer?*
8.  **De "Terug-knop" Fetisjist:** Iemand vult de hele checkout in, gaat naar de betaalpagina, bedenkt zich, klikt 3 keer op 'Back' in de browser en probeert dan iets te wijzigen. *Check: Blijft de winkelmand intact (Persistence)?*
9.  **De Dubbele Klikker:** Een ongeduldige klant klikt 5 keer heel snel op de "Bestelling afronden" knop. *Check: Worden er 5 orders aangemaakt of blokkeert Wim de dubbele actie?*
10. **De Emoji-Invasie:** Een klant vult zijn script en naam in met uitsluitend emoji's en vreemde tekens (UTF-8 stress test). *Check: Kan de database en de mail-engine dit aan?*

### 🎤 Groep 3: De "Ik ben een ster" (Artist & Talent)
11. **De Onvolledige Ster:** Een nieuwe stemacteur probeert zich aan te melden maar uploadt een PDF in plaats van een MP3 als demo. *Check: Is de foutmelding duidelijk voor een niet-technisch persoon?*
12. **De Link-Klikker:** Een bezoeker op een artist-pagina klikt op een social media link die niet meer bestaat. *Check: Is er een 'Safe Harbor' (404) die hem terugbrengt naar Voices?*
13. **De "Dark Mode" Zoeker:** Een gebruiker probeert de site in dark mode te dwingen via browser-settings op een pagina die strikt `bg-va-off-white` is. *Check: Blijft de tekst leesbaar (Contrast)?*

### 🎓 Groep 4: De "Ik wil nu leren" (Academy & Studio)
14. **De Gratis-Hacker:** Iemand probeert de URL van een Academy-les direct te raden (`/academy/lesson/99`) zonder te betalen. *Check: Staat Wim aan de deur om hem naar de kassa te sturen?*
15. **De Onzichtbare Student:** Een student start een video, zet hem op pauze, komt 3 dagen later terug op een ander device. *Check: Weet de site nog waar hij was?*
16. **De "Ik wil bellen" Klant:** Een klant zoalth naar een telefoonnummer op de Academy pagina (die er niet is). *Check: Is Voicy (Chat) prominent genoeg om hem te helpen?*

### 🚪 Groep 5: De "Monkey Business" (Edge Cases)
17. **De Tab-Hoarder:** Een klant opent 10 tabs met 10 verschillende acteurs en probeert in elke tab een andere briefing te schrijven. *Check: Raakt de localStorage 'voices_checkout_state' in de war?*
18. **De Valuta-Verwarde:** Een klant uit de US (via VPN) probeert in Dollars te denken terwijl alles in Euro's staat. *Check: Is de 'Legal Disclaimer' van Lex duidelijk over de valuta?*
19. **De "Ik typ alles in Caps" Klant:** Een klant vult zijn hele briefing in met uitsluitend HOOFDLETTERS. *Check: Wordt dit door de UI 'gezuiverd' naar Natural Capitalization of blijft het schreeuwen?*
20. **De "Ik heb haast" Checkout:** Iemand vult alleen zijn e-mail in en klikt direct op "Betalen" zonder de verplichte velden te zien. *Check: Worden de velden rood en springt de focus naar de fout?*

### 🌍 Groep 6: De "Nieuwe Horizon" (Internationaal & Geavanceerd)
21. **De "Ik spreek geen Nederlands" Expat:** Een Engelstalige klant landt op de site en probeert de taal te wisselen naar Engels. *Check: Zijn alle kritieke paden (checkout, configurator) vertaald via Voiceglot?*
22. **De "Ik heb een kortingscode" Koopjesjager:** Een klant heeft een oude kortingscode en probeert deze 5 keer in te voeren met kleine variaties (spaties, hoofdletters). *Check: Is de coupon-validatie case-insensitive en geeft het duidelijke feedback?*
23. **De "Ik wil een offerte" Manager:** Een zakelijke klant wil geen directe betaling maar een officiële PDF offerte voor zijn boekhouding. *Check: Is de 'Offerte' optie duidelijk en genereert Kelly de juiste PDF/Mail?*
24. **De "Ik ben mijn wachtwoord vergeten" (Magic Link) Gebruiker:** Iemand probeert in te loggen via de checkout maar typt zijn e-mail verkeerd. *Check: Is de foutmelding behulpzaam of cryptisch?*
25. **De "Ik wil alles op factuur" Belg:** Een Belgische ondernemer vult zijn BTW-nummer in en verwacht dat de BTW direct naar 0 gaat (verlegging). *Check: Weet Kelly dat BTW-verlegging binnen België NIET kan voor Belgische bedrijven?*
26. **De "Ik heb haast" Producent:** Een producent wil binnen 60 seconden een stem boeken. Hij skipt alle demo's en klikt direct op de eerste de beste stem. *Check: Kan het systeem dit tempo aan zonder te haperen?*
27. **De "Ik wil bellen voor advies" Twijfelaar:** Een klant vindt de site prachtig maar durft niet online te bestellen. Hij zoekt de contactpagina. *Check: Is de overgang naar persoonlijk contact (telefoon/mail) naadloos?*
28. **De "Ik heb een heel kort script" Klant:** Iemand heeft maar 3 woorden ("Welkom bij Voices"). *Check: Wordt de minimum-prijs correct gehanteerd of gaat de berekening naar 0?*
29. **De "Ik wil meerdere stemmen" Agency:** Een reclamebureau wil 3 verschillende stemmen voor 3 verschillende spots in één keer bestellen. *Check: Ondersteunt de winkelmand meerdere items met verschillende configuraties?*
30. **De "Ik gebruik een antieke iPad" Gebruiker:** Iemand op een oude tablet met een trage browser probeert de configurator te openen. *Check: Is de UI responsive en performant genoeg (geen heavy JS crashes)?*
31. **De "Ik verander mijn land op het laatst" Klant:** Iemand vult alles in voor België, maar verandert in de allerlaatste stap zijn land naar Frankrijk. *Check: Wordt de BTW en de prijs (indien land-afhankelijk) direct bijgewerkt?*
32. **De "Ik plak HTML in mijn script" Hacker:** Een ondeugende gebruiker probeert `<script>alert('XSS')</script>` in het briefingveld te plakken. *Check: Saniteert Cody de input voordat deze in de database of mail komt?*
33. **De "Ik wil mijn winkelmandje delen" Klant:** Een werknemer vult alles in en stuurt de URL van de checkout naar zijn baas om te betalen. *Check: Is de state gekoppeld aan de URL of uitsluitend aan de lokale browser-sessie?*
34. **De "Ik heb een heel specifiek accent nodig" Zoeker:** Iemand zoekt naar "West-Vlaams" of "Antwerps" in de zoekbalk. *Check: Werkt de search op metadata/tags of alleen op naam?*
35. **De "Ik wil mijn bestelling annuleren" Klant:** Direct na betaling bedenkt de klant zich en zoekt een annuleerknop. *Check: Is er duidelijke informatie over het herroepingsrecht (of het ontbreken daarvan bij digitale diensten)?*

---

## 🧠 Naive User Simulation Protocol (Simulation Mode)

Om de site echt "monkeyproof" te maken, activeer ik de **Simulation Mode**. Hierbij hanteer ik de volgende regels:

1.  **Persona Adoptie**: Ik kies een persona uit de lijst (bijv. "De Verloren Zoeker") en handel uitsluitend vanuit hun beperkte kennis.
2.  **Live Reasoning**: Ik rapporteer elke gedachte, twijfel of frustratie die opkomt tijdens het browsen.
3.  **No Shortcuts**: Ik gebruik geen directe URL's of kennis van de backend, tenzij de UI me daar expliciet naartoe leidt.
4.  **Frictie Detectie**: Elke keer dat ik moet "zoeken" of een actie niet binnen 100ms resultaat geeft, markeer ik dit als een defect volgens het **Chris-Protocol**.

---

## 🚀 Uitvoering & Resultaten (Generale Repetitie)

Hieronder de resultaten van de uitgevoerde scenario's en de doorgevoerde fixes.

| Scenario | Status | Bevindingen & Fixes |
| :--- | :--- | :--- |
| 1. De Verloren Zoeker | **PASS** | **FIX**: Media selector zichtbaar gemaakt en 'Terug naar lijst' knop toegevoegd. |
| 2. De Twijfelaar | **PASS** | **FIX**: Media cache toegevoegd om selectie te onthouden bij switch. |
| 3. De Audio-Zapper | **PASS** | **FIX**: Audio player logica hersteld voor razendsnel zappen tussen acteurs. |
| 6. De Script-Dumper | **PASS** | Prijsberekening blijft stabiel bij 10.000+ woorden. Auto-save gedebounced. |
| 7. De BTW-Goochelaar | **PASS** | **FIX**: Kelly valideert nu de match tussen land en BTW-nummer (fraude-preventie). |
| 8. De Terug-knop | **PASS** | **FIX**: URL-gebaseerde stap-detectie toegevoegd voor correcte browser-navigatie. |
| 12. De Expat | **PASS** | **FIX**: 11 hardcoded strings vertaalbaar gemaakt via Voiceglot. |
| 22. De Koopjesjager | **PASS** | **FIX**: Coupon code trim() toegevoegd en case-insensitive gemaakt. |
| 32. De Script-Hacker | **PASS** | **FIX**: HTML-sanitatie toegevoegd aan alle e-mail briefings (cleanText). |

---

## 5. Agent Verantwoordelijkheden
*(Zie eerdere versie)*
