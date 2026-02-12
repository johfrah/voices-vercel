# 👤 DATAGOLD: CUSTOMERS
## *De Intelligence Assets van Voices.be*

**DEFINITIE:** Datagold: Customers (voorheen Datamatch) is de intelligentie-laag die statische klantprofielen transformeert in actieve **DNA-Assets**. Deze assets bepalen de personalisatie, de Tone of Voice en de proactieve verkoopkansen in de Next.js Experience Layer.

---

## 🏗️ DE TRANSFORMATIE (VAN DATAMATCH NAAR DATAGOLD)

We migreren van een passieve "match-engine" naar een actieve "conversie-engine".

| Kenmerk | Oude Wereld (Datamatch) | Nieuwe Wereld (Datagold) |
| :--- | :--- | :--- |
| **Focus** | Interne statistieken | Externe activatie |
| **Output** | DNA-profiel (Technisch) | Persona Asset (Strategisch) |
| **UI Impact** | Geen (Backoffice only) | Bento Cards & Predictive UI |
| **AI Rol** | Handmatige analyse | Voicy-native Intentions |

---

## 🧠 DE INTELLIGENTIE-LAGEN (DNA ASSETS)

Elke klant wordt verrijkt met een hiërarchische structuur van intelligentie:

### 1. Persona & Role (De "Wie")
We combineren strategische archetypes met realistische rollen:
*   **Archetype (Categorie):** `quality-seeker`, `timesaver`, `self-recorder`, `budget-aware`.
*   **Role (Subcategorie):** De feitelijke functiebeschrijving (bijv. "IT Manager", "Zaakvoerder", "Marketing Director").
*   **Impact:** De IAP gebruikt het *Archetype* voor harde filters en de *Role* voor gepersonaliseerde copy.

### 2. Company DNA (De "Context")
De rijke beschrijving van het bedrijf die context geeft aan alle interacties:
*   **Description:** Een strategische samenvatting van wat het bedrijf doet, hun marktpositie en hun "vibe" (zonder HTML-vervuiling).
*   **Sector & Subsector:** De hiërarchische indeling van hun industrie (bijv. `IT & Software` > `SaaS`).
*   **Impact:** Deze data voedt de AI-assistent (Voicy) zodat deze weet: "Ik praat nu met een innovatief SaaS-bedrijf uit Gent dat focust op HR-tech."

### 3. Infrastructure & Setup (De "Hoe")
Gedetecteerd via Linguistic Intent in scripts:
*   **Infrastructure (Categorie):** `Telephony`, `Commercial`, `E-learning`.
*   **Setup (Subcategorie):** De technische omgeving (bijv. `GSM/Voicemail` vs `Microsoft Teams/IVR`).
*   **Asset Focus:** De voorkeur voor output-formaat (bijv. `Audio-First` vs `Script-First`).
*   **Impact:** Bepaalt de **Content Bridge** en de getoonde conversie-tool.

### 4. Economic DNA (De Opbrengst)
*   **Yield Category:** `high-yield`, `standard-yield`, `low-barrier`.
*   **LTV Status:** `priority-segment`, `growth-potential`, `one-off`.
*   **Decision Power:** Onderscheid tussen `End-User` en `Proxy-Buyer`.
*   **Impact:** Prioritering in de Bento-grid en proactieve sales-triggers. Bij `Proxy-Buyers` focust de copy op "Bedrijfszekerheid" en "Facturatie-gemak".

### 5. Nuclear Rescan (De Grote Schoonmaak)
Om de overgang naar de Next.js Experience Layer te voltooien, onderwerpen we alle historische data aan een **Nuclear Rescan**:
*   **Doel:** Oude, platte tekst-labels vervangen door rijke, hiërarchische JSON-objecten.
*   **Proces:**
    1.  **Purge:** Verwijder legacy HTML-vervuiling (`<br>`, etc.) uit de database.
    2.  **Enrich:** Herscan scripts voor `Decision Power`, `Asset Focus` en `Infrastructure`.
    3.  **Anonymize:** Transformeer klant-scripts naar universele `Blueprint Assets` voor de IAP.
*   **Impact:** Na de rescan is 100% van de historische data direct bruikbaar voor personalisatie in de nieuwe frontend.

---

## 🚀 ACTIVATIE IN NEXT.JS (PREDICTIVE UI)

De klant-intelligentie wordt direct geactiveerd in de **Next.js Experience Layer**:

### 1. The Personalized Bento Grid
In de cockpit van de klant verschijnen dynamische kaarten op basis van hun Datagold-status:
*   *Nieuwe klant?* Toon de "Vlaams Startpakket" kaart.
*   *Veel IVR besteld?* Toon de "Smart IVR Configurator" met hun laatste scripts als template.
*   *Lange tijd inactief?* Toon een "In de Studio Bij" video van een stem in hun favoriete sector.

### 2. Voicy Intentions
Voicy (de AI-assistent) laadt het Datagold-profiel in bij de start van een chat:
*   *"Welkom terug [Naam]. Wil je verder gaan met het script voor [Bedrijf] waar we gisteren over spraken?"*

### 3. The Golden Thread Linking
Datagold koppelt de klant direct aan relevante andere assets:
*   **Review Match:** Toon reviews van klanten met hetzelfde DNA.
*   **Blog Match:** Toon expertise-artikelen die hun specifieke "pijn" (bijv. technische specs) oplossen.

---

## 🛡️ GOVERNANCE & PRIVACY (THE SHADOW RULE)

1.  **Internal-Only:** Ruwe data (zoals exacte omzetcijfers of privé-mails) blijft in de schaduw.
2.  **Label-only Export:** Alleen de labels (`persona-timesaver`, `sector-it`) worden geëxporteerd naar de frontend API.
3.  **Zero-Leak:** Geen enkele interne Datamatch-term mag zichtbaar zijn in de publieke UI of URL's.

---
**ULTIEME WET:** We kennen de klant beter dan zij zichzelf kennen, maar we gebruiken die kennis uitsluitend om hun reis moeiteloos te maken.