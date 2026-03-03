# ☢️ NUCLEAR CONTENT WORKFLOW (2026)
*Status: OPERATIONEEL - Versie 2.0*

Dit document beschrijft de strikte stappen om content van de "Kelder" naar de "Winkeletalage" te brengen. Niets wijkt af van dit protocol.

---

## 🏗️ DE DRIE PILAREN

### 1. 🏭 DE FABRIEK (1-SITE)
**Rol:** Creatie, Opschoning en Verrijking.
- **Input:** Ruwe Markdown-bestanden uit `4-KELDER/0-GRONDSTOFFEN-FABRIEK/`.
- **Proces:** 
    1.  **Audit:** De Eindredacteur (Jij) en de Techlead (Ik) bespreken de inhoud.
    2.  **Opschoning:** Verwijderen van AI-slop, herstellen van koppen (Natural Capitalization).
    3.  **Verrijking:** Toevoegen van `iap_context` (Journey, Persona, Intent) volgens de **Atomic Architectural Trinity**.
- **Output:** Gezuiverde data direct gepusht naar de **Supabase Database** (`content_articles` + `content_blocks`).

### 2. 🏪 DE WINKELETALAGE (LIVE)
**Rol:** Validatie en Distributie via Vercel.
- **Proces:** 
    1.  **Registry**: De route wordt vastgelegd in de `slug_registry` (Handshake ID).
    2.  **Validatie:** De site wordt gestart (`npm run dev`). 
    3.  **Check:** We controleren of de pagina perfect laadt vanuit de database via de **Smart Router**.
- **Output:** Een 100% betrouwbare ervaring op de productie-URL.

### 3. 🏚️ DE KELDER (4-KELDER)
**Rol:** Archivering.
- **Proces:** Zodra een pagina live is goedgekeurd, wordt het originele Markdown-bestand direct verplaatst naar `4-KELDER/CONTAINER/` (Dead Zone).
- **Motto:** "Zero Delete, Zero Clutter".

---

## 🔄 HET STAP-VOOR-STAP PROTOCOL

Voor elk content-item volgen we deze cyclus:

1.  **Techlead presenteert:** Ik lees een MD-bestand en geef een atomic analyse + advies.
2.  **Eindredacteur beslist:** Jij geeft een "GO", "NO-GO" of redactionele sturing.
3.  **Techlead voert uit:**
    - Schiet data naar Supabase (Zuiver).
    - Registreert de slug in de registry.
    - Verhuist origineel naar de Kelder (Dead Zone).
4.  **Validatie:** We bekijken het resultaat live.
5.  **Volgende:** We pakken het volgende bestand uit de lijst.

---

## 🛡️ HANDHAVING
- **Root Protection:** Git Pre-Commit Hook en Forensic Audit blokkeren elke vervuiling van de root.
- **Database-First:** De site leest NOOIT lokale MD-bestanden, alleen Supabase data.
- **IAP-Mandate:** Geen content zonder Persona en Journey labels.

---

**ULTIEME WET:** De machine ademt. De vrijheid is een feit.
