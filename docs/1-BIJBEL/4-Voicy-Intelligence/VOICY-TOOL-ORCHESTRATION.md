---
title: VOICY TOOL ORCHESTRATION (2026)
status: ACTIVE
version: 1.0.0
date: 2026-02-18
category: INTELLIGENCE
priority: NUCLEAR
tags: [voicy, agent-mode, tools, orchestration]
---

# 🛠️ VOICY TOOL ORCHESTRATION: HET MANDAAT

Dit document is de "Remote Control" handleiding voor Voicy. Het definieert hoe Voicy de systemen van Voices.be bedient via atomaire acties.

## 🧠 HET AGENT-MANDAAT

1. **BOB (Architect):** Voicy is de dirigent van de bestaande instrumenten. Ze mag geen eigen logica verzinnen, maar moet de code-engines (Cody) aansturen.
2. **CHRIS (Discipline):** Elke actie moet deterministisch zijn. Geen gokwerk. Alleen gedocumenteerde acties zijn toegestaan.
3. **MOBY (Interactie):** 100ms feedback. Acties in de chat moeten direct zichtbaar zijn in de UI van de website.

---

## 🎡 1. DE CONFIGURATOR (Cody & Moby)
*Hulp bij prijsberekening en projectopbouw.*

- **Action ID:** `SET_CONFIGURATOR`
- **Parameters:**
  - `words` (number): Het aantal woorden in het script.
  - `usage` (commercial | telephony | unpaid): Het type gebruik.
  - `plan` (standard | premium | custom): Het gekozen pakket.
  - `music` (boolean): Alleen beschikbaar bij `usage: telephony`.
- **Trigger:** Vragen over prijs, lengte van opname of type project.
- **Gouden Regel:** Gebruik bij 2 minuten altijd 300 woorden (Vakmanschap-regel).
- **Muziek Regel:** Muziek is **UITSLUITEND** beschikbaar voor de Telephony journey. Stel dit nooit voor bij Commercial of Video.

## 🔍 2. VOICE SEARCH & FILTERING (Suzy & Laya)
*Hulp bij het vinden van de perfecte stem.*

- **Action ID:** `FILTER_VOICES`
- **Parameters:**
  - `language` (string): De gewenste taal (bijv. 'vlaams', 'frans').
  - `vibe` (string): De emotionele toon (bijv. 'warm', 'zakelijk').
  - `gender` (string): 'male' | 'female' | 'neutral'.
- **Trigger:** Zoekopdrachten naar specifieke stemkarakters.

## 💳 3. CHECKOUT & PREFILL (Kelly & Lex)
*Frictieloze overgang naar de kassa.*

- **Action ID:** `PREFILL_CHECKOUT`
- **Parameters:**
  - `email` (string): Het e-mailadres van de klant.
  - `vat_number` (string): Voor zakelijke validatie.
  - `briefing` (string): De tekst die ingesproken moet worden.
- **Trigger:** Wanneer de klant aangeeft klaar te zijn om te bestellen.

## 🎓 4. ACADEMY & STUDIO (Berny)
*Directe toegang tot workshops en cursussen.*

- **Action ID:** `NAVIGATE_JOURNEY`
- **Parameters:**
  - `url` (string): De specifieke route (bijv. `/studio/book?editionId=123`).
- **Trigger:** Vragen over data, locaties of inschrijvingen.

---

## 🛡️ VEILIGHEIDSPROTOCOL
- Voicy mag **NOOIT** zelfstandig prijzen overschrijven.
- Voicy mag **NOOIT** handmatige kortingen geven.
- Elke actie moet door de klant bevestigd kunnen worden of visueel duidelijk zijn in de UI.

## 🎵 5. DEMO DJ (Mark & Laya)
*Directe audio-ervaring in de chat.*

- **Action ID:** `PLAY_DEMO`
- **Parameters:**
  - `actorId` (string): De unieke ID van de stemacteur.
  - `demoUrl` (string): De URL naar de specifieke audio-file.
- **Trigger:** Wanneer een klant vraagt om een stem te horen of een voorbeeld zoekt.

## 🕵️ 6. BTW DETECTIVE (Kelly & Lex)
*Realtime validatie van bedrijfsgegevens.*

- **Action ID:** `VALIDATE_VAT`
- **Parameters:**
  - `vatNumber` (string): Het BTW-nummer om te controleren.
- **Trigger:** Wanneer een klant een BTW-nummer noemt of vraagt om facturatie-check.

## 💰 7. DIRECT CHECKOUT (Kelly)
*De kortste weg naar de betaling.*

- **Action ID:** `PLACE_ORDER`
- **Parameters:**
  - `email` (string): Verplicht e-mailadres.
  - `briefing` (string): De finale tekst.
  - `usage` (string): Bevestiging van het gebruikstype.
- **Trigger:** Wanneer de klant zegt: "Ik wil dit bestellen", "Reken maar af" of "Stuur de factuur".
- **Resultaat:** Voicy bereidt de order voor en toont een directe betaalknop in de chat.

## 🛒 8. CART MANAGEMENT (Kelly)
*Het opbouwen van een mandje met meerdere stemmen.*

- **Action ID:** `ADD_TO_CART`
- **Parameters:**
  - `actorId` (string): De ID van de stemacteur.
  - `briefing` (string): De tekst voor deze specifieke stem.
  - `usage` (string): Het gebruikstype.
- **Trigger:** Wanneer een klant zegt: "Zet deze er ook maar bij", "Voeg toe aan mandje" of "Ik wil er nog een stem bij".
- **Resultaat:** De huidige selectie wordt veilig in het mandje geplaatst en de calculator wordt klaargezet voor een volgende keuze.

## 📝 9. SCRIPT ARCHITECT (Mark)
*Diepe analyse van timing en toon.*

- **Action ID:** `ANALYZE_SCRIPT`
- **Parameters:**
  - `text` (string): Het script om te analyseren.
  - `targetDuration` (number): De gewenste lengte in seconden.
- **Trigger:** Vragen over timing, lengte of effectiviteit van het script.
- **Resultaat:** Voicy geeft een gedetailleerd advies over woorden/seconde en toon.

## 👤 10. LEAD IDENTIFICATION (Mat)
*Het identificeren van anonieme bezoekers.*

- **Action ID:** `SHOW_LEAD_FORM`
- **Parameters:** Geen.
- **Trigger:** Direct na het EERSTE bericht van een niet-geïdentificeerde klant.
- **Resultaat:** Toont een inline formulier in de chat voor naam en e-mailadres.

"Ik bedien de instrumenten, maar de klant bepaalt de muziek."
