# ❓ DATAGOLD: FAQ
## *De Knowledge Assets van Voices.be*

FAQs zijn in de Datagold-strategie de **"Snelwegen naar Zekerheid"**. Ze beantwoorden de specifieke twijfels van de klant in elke fase van de funnel en dienen als de perfecte ondersteuning voor onze blogs en reviews.

---

### 🧠 INTELLIGENTIE-LAGEN (Labels)

Elke FAQ wordt verrijkt met dezelfde intelligentie-structuur als onze reviews en blogs:

#### 1. Persona Tagging (De "Wie")
*   `quality-seeker`: Vragen over timbre, retakes en artistieke garanties.
*   `timesaver`: Vragen over levertijden, bestelproces en directe download.
*   `self-recorder`: Vragen over microfoons, homestudio-setup en coaching.
*   `budget-aware`: Vragen over kortingen, pakketprijzen en verborgen kosten.

#### 2. Sales Stage Mapping (De Funnel)
*   `awareness`: "Wat is een IVR?", "Waarom een professionele stem?"
*   `consideration`: "Welk formaat heb ik nodig?", "Hoe werkt de feedback-loop?"
*   `decision`: "Hoe kan ik betalen?", "Wanneer is het klaar?"

---

### 🔗 DE HYBRIDE INTEGRATIE (Blog + Review + FAQ)

De echte kracht van Datagold ontstaat wanneer we deze drie assets combineren in de Next.js Experience Layer:

#### Het "Authority Block" Concept:
Onderaan een blogartikel (bijv. over Academy) tonen we een gecombineerd blok:
1.  **De Expertise (Blog):** *"Hoe benoem je jouw demo's?"*
2.  **De Veelgestelde Vraag (FAQ):** *"Moet ik mijn demo in WAV of MP3 aanleveren?"*
3.  **Het Bewijs (Review):** *"Johfrah gaf me de tip om mijn demo's anders te benoemen en ik kreeg direct meer werk!"*

---

### 🚀 ACTIVATIE IN NEXT.JS

#### 1. De "Smart FAQ" Widget (Persona-Driven Sorting)
De FAQ is niet langer een statische lijst, maar een intelligent instrument dat zich herschikt op basis van de bezoeker:
*   **De Logica:** De widget leest het `archetype` en de `asset_focus` uit de `VoicesState`.
*   **De Activatie:** 
    *   **IT Manager (Proxy-Buyer / Audio-First):** Plaatst technische vragen over bestandsformaten (WAV, 8kHz), API-koppelingen en facturatie bovenaan.
    *   **Zaakvoerder (End-User / self-recorder):** Plaatst vragen over coaching, "hoe spreek ik zelf in" en het verschil tussen DIY en Pro bovenaan.
    *   **Marketing Manager (Proxy-Buyer / Script-First):** Plaatst vragen over tone-of-voice, retakes en meertalige scripts bovenaan.
*   **Impact:** De klant vindt direct de antwoorden op zijn specifieke twijfels, zonder door irrelevante vragen te hoeven scrollen.

#### 2. Contextual FAQ Injection
Toon alleen FAQs die relevant zijn voor de huidige `journey` en `sales_stage`.

#### 3. Voicy Bridge
Voicy gebruikt de FAQ-database als primaire bron voor directe antwoorden in de chat.

#### 4. Instant Re-skinning in Antwoorden
Placeholders zoals `{{company_name}}` worden ook in FAQ-antwoorden live ingevuld. 
*   *Voorbeeld:* "Hoe wordt `{{company_name}}` vermeld op de factuur?"

---
**ULTIEME DOEL:** Elke twijfel wegnemen nog voordat de klant de vraag hoeft te stellen.
