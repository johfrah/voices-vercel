# 🎭 Actor Page vs. Portfolio Page (Managed Service Model 2026)

Binnen het Voices-ecosysteem maken we een strikt onderscheid tussen de **Actor Page** op het hoofdplatform en de individuele **Portfolio Page** (bijv. `johfrah.be`). Dit onderscheid is gebaseerd op een **Managed Service** filosofie: de stemacteur huurt een platform om ontlast te worden van techniek, SEO en administratie, in ruil voor het volgen van de Voices-kwaliteitsstandaarden.

## 1. De Filosofie: "Quality as a Service"
Een portfolio is geen losstaande website, maar een verlengstuk van de Voices-machine. 
- **Ontlasting**: De stem hoeft zich niet bezig te houden met boekhouding (Mollie/facturatie), SEO-updates of technische stabiliteit.
- **Mandate**: Om deze service te kunnen garanderen, moet het portfolio voldoen aan de **Bob-methode** en het **Chris-Protocol**. Afwijkingen leiden tot chaos en kwaliteitsverlies.
- **One Truth**: Prijzen, beschikbaarheid en kern-assets zijn overal gelijk om de marktwaarde van de stem te beschermen.

## 2. Functionele Verschillen

| Feature | Actor Page (`voices.be/artist/slug`) | Portfolio Page (`slug.be`) |
| :--- | :--- | :--- |
| **Context** | Onderdeel van een marktplaats (vergelijking). | Individuele branding & showcase. |
| **Navigatie** | Global Voices menu (Stemmen, Werkwijze). | Branded menu (Voice-over, Host, Contact). |
| **Configurator** | Volledig (alle filters, talen, geslachten). | **Solo-Configurator** (alleen deze stem). |
| **Branding** | Voices DNA (Off-white/Pink). | Custom DNA (Custom kleuren/fonts per stem). |
| **Conversie** | "Voeg toe aan casting" / "Bestel". | "Direct Bestellen" / "Boek als Host". |
| **HITL Status** | Alleen goedgekeurde content (Approved). | **Hybrid**: Live op portfolio, Pending op Voices. |

## 3. HITL & Data Integriteit (The Chris-Protocol)

Om de kwaliteit te waarborgen zonder de snelheid van het portfolio te remmen, hanteren we een hybride goedkeuringsproces:

### A. Direct Live (Portfolio)
Wijzigingen die de stemacteur doet via `Cmd + Shift + E` zijn **onmiddellijk** zichtbaar op hun eigen domein. Dit geeft de stem de vrijheid om hun eigen etalage direct bij te werken voor eigen klanten.

### B. Admin Approval (Voices.be)
Dezelfde wijzigingen gaan op `voices.be` pas live na goedkeuring door de admin:
- **Prijzen**: Worden opgeslagen in `pending_rates`. Pas na audit worden ze de "Source of Truth".
- **Bio & Tagline**: Gaan via `pending_bio` en `pending_tagline`. Mark/Admin controleert op "AI Slop" en tone-of-voice.
- **Demo's & Video's**: Krijgen de status `pending`. Ze verschijnen op het portfolio met een "In review" label, maar ontbreken op de marktplaats tot ze goedgekeurd zijn.

## 4. De "Solo-Configurator"
Op een portfolio-site is de configurator gestript van alle ruis:
- Geen taal- of genderfilters.
- Geen "Wie is deze stem" sectie.
- Directe focus op de **Journey** (Telefonie, Video, Commercial) en de **Prijs**.

---

"Wij bewaken de wetten, zodat de stem kan stralen." - **BOB**
