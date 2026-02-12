# ☢️ NUCLEAR CONTENT WORKFLOW (2026)
*Status: OPERATIONEEL - Versie 1.0*

Dit document beschrijft de strikte stappen om content van de "Kelder" naar de "Winkeletalage" te brengen. Niets wijkt af van dit protocol.

---

## 🏗️ DE DRIE PILAREN

### 1. 🏭 DE FABRIEK (1-DEVELOPMENT)
**Rol:** Creatie, Opschoning en Verrijking.
- **Input:** Ruwe Markdown-bestanden uit `nuclear-content`.
- **Proces:** 
    1.  **Audit:** De Eindredacteur (Jij) en de Techlead (Ik) bespreken de inhoud.
    2.  **Opschoning:** Verwijderen van WordPress-slop, herstellen van koppen.
    3.  **Verrijking:** Toevoegen van `iap_context` (Journey, Persona, Intent) volgens de **BIJBEL**.
- **Output:** Gezuiverde data direct gepusht naar de **Supabase Database**.

### 2. 🏪 DE WINKELETALAGE (2-SERVER-READY)
**Rol:** Validatie en Distributie.
- **Proces:** 
    1.  **Sync:** De vrachtwagen (`NUCLEAR SYNC`) brengt de schone code van de Fabriek naar de Etalage.
    2.  **Validatie:** De site wordt gestart in deze map (`npm run dev`). 
    3.  **Check:** We controleren op `http://localhost:3000` of de pagina perfect laadt vanuit de database.
- **Output:** Een 100% betrouwbare bron voor de Combell server.

### 3. 🏚️ DE KELDER (4-OLD)
**Rol:** Archivering.
- **Proces:** Zodra een pagina in de Etalage is goedgekeurd, wordt het originele Markdown-bestand direct verplaatst naar `4-OLD/4-DATA-AND-DUMPS/08-processed-content/`.
- **Motto:** "Zero Delete, Zero Clutter".

---

## 🔄 HET STAP-VOOR-STAP PROTOCOL

Voor elk content-item volgen we deze cyclus:

1.  **Techlead presenteert:** Ik lees een MD-bestand en geef een atomic analyse + advies.
2.  **Eindredacteur beslist:** Jij geeft een "GO", "NO-GO" of redactionele sturing.
3.  **Techlead voert uit:**
    - Schiet data naar Supabase (Zuiver).
    - Sync naar Server-Ready (Vrachtwagen).
    - Verhuist origineel naar de Kelder (Old).
4.  **Validatie:** We bekijken het resultaat in de Etalage.
5.  **Volgende:** We pakken het volgende bestand uit de lijst.

---

## 🛡️ HANDHAVING
- **Root Protection:** Git Pre-Commit Hook blokkeert elke vervuiling van de root.
- **Database-First:** De site leest NOOIT lokale MD-bestanden, alleen Supabase data.
- **IAP-Mandate:** Geen content zonder Persona en Journey labels.

---
*Vastgelegd op woensdag 11 februari 2026 door de Techlead.*
