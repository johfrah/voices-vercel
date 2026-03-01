# 🛡️ Atomic Audit: 100% Live Readiness Checklist (2026)

Dit document dient als de absolute meetlat voor de "Masterclass" status van het Voices platform. Pas als alle punten per journey op ✅ staan, beschouwen we de release als 100% geslaagd.

## 🎭 Algemene Systeem-Integriteit (Chris-Protocol)
- [ ] **Database Stabiliteit**: Geen "Max client connections reached" errors in de logs (Pool size: 1, Idle: 5s).
- [ ] **Zero-Touch I18n**: Alle talen (/fr/, /en/, etc.) laden direct de juiste vertalingen uit de Vault zonder fallback naar NL.
- [ ] **Nuclear Loading**: LCP onder 100ms door strikt gebruik van `next/dynamic` met `ssr: false` voor alle instrumenten.
- [ ] **Forensic Logging**: Alle browser-errors landen via Beacons betrouwbaar in de `system_events` tabel.
- [ ] **Asset Proxy**: Geen 404's op afbeeldingen; automatische WebP optimalisatie voor alle `.png` en `.jpg` bronbestanden.

---

## 🎙️ Journey 1: Voices Agency (Voices.be / .nl / .fr)
*Focus: Conversie & Casting*

- [ ] **MasterControl**: Filters (Taal, Gender, Medium) werken direct en filteren de VoiceGrid real-time.
- [ ] **VoiceCards**: Alle acteurs tonen een correcte foto, audio-demo en startprijs.
- [ ] **Slimme Kassa**: Prijsberekening in de configurator matcht de database-rates (Corporate vs. Commercial).
- [ ] **Self-Healing**: Ontbrekende vertalingen worden binnen 3 seconden door de AI aangevuld (zonder loops).
- [ ] **Checkout Flow**: Van "Selecteer stem" naar "Betaalpagina" zonder onderbrekingen of data-verlies.

---

## 🎨 Journey 2: Artist Portfolio (Johfrah.be)
*Focus: Esthetiek & Autoriteit*

- [ ] **Liquid DNA**: De achtergrond en overgangen voelen vloeibaar en high-end aan.
- [ ] **Johfrah Action Dock**: Alle actieknoppen (Demos, Host, Contact) zijn thumb-zone geoptimaliseerd.
- [ ] **Portfolio Grid**: Alle video- en audiofragmenten laden direct en spelen vloeiend af.
- [ ] **Market Isolation**: Geen "Voices Agency" branding zichtbaar, puur de persoonlijke merkidentiteit.

---

## 🎓 Journey 3: Studio & Academy (Voices.be/studio)
*Focus: Educatie & Inschrijving*

- [ ] **Edities Beheer**: Up-to-date overzicht van beschikbare workshops uit de database.
- [ ] **VideoPlayer**: Academy video's laden met de juiste ondertiteling per taal.
- [ ] **Inschrijf-Engine**: Naadloze koppeling tussen workshop-selectie en de Slimme Kassa.
- [ ] **Student DNA**: Ingelogde studenten zien hun voortgang en certificaten.

---

## 🧘 Journey 4: Ademing (Ademing.be)
*Focus: Rust & UX*

- [ ] **Minimalistische Navigatie**: Geen onnodige Agency-icons (zoals winkelmandje) zichtbaar.
- [ ] **Audio Engine**: Meditaties starten direct zonder buffering en blijven spelen bij schermvergrendeling.
- [ ] **Theme Consistency**: Het kleurenpalet is strikt conform de Ademing-brandguide (rustgevend).

---

## 🔐 Journey 5: Account & Partner (Voices.be/account)
*Focus: Veiligheid & Self-Service*

- [ ] **Magic Link Login**: Inloggen werkt zonder wachtwoord, direct via e-mail.
- [ ] **Customer 360**: Klanten zien hun eigen bestelgeschiedenis en favoriete stemmen.
- [ ] **Partner Vault**: Partners (stemmen) kunnen hun eigen profiel en rates inzien.
- [ ] **Admin Command Palette**: `CMD+K` geeft direct toegang tot alle beheerfuncties voor admins.

---

## 🚀 Validatie Procedure (De Laatste Mijl)
1. [ ] **Atomic Audit**: Draai `000-ATOMIC-AUDIT.mdc`.
2. [ ] **Forensic Script**: Draai `npm run forensic-audit` na elke push.
3. [ ] **Hard Refresh Test**: Controleer op 3 verschillende devices (Desktop, iPhone, Android).
4. [ ] **Bob's Veto**: Voldoet het aan de visie? Is het theater perfect?

*"Beter 10x controleren dan 1x slop introduceren."* - Chris/Autist
