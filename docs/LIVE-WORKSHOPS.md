# 🎙️ SUPABASE WORKSHOP CONTENT (Nuclear Truth)

*Generated on: 2026-02-28T16:29:06.741Z*

> **⚠️ WARNING:** Dit document is een live-mirror van de database. 
> Raadpleeg bij twijfel ALTIJD de database via de `database-diagnostics` skill.

## 🏗️ Database Architectuur (Heldere Inzichten)
Om de database helder en doorzoekbaar te maken, gebruiken we nu een **Database View** en **Junction Tables**.

💡 **Smart Assets (Vault):** Workshops met `has_demo_bundle = true` tonen verwachtingen vooraf. Edities worden via `workshop_edition_vault_links` hard gekoppeld aan folders.
💡 **Related Journeys:** De ideale leerroute is via `workshop_journeys` (Next Steps) hard verankerd.
💡 **Hard Review Handshake:** Reviews zijn nu via `workshop_reviews` hard verbonden aan workshops.
💡 **Expert Note:** Elke workshop heeft een begeleidend zinnetje dat de ziel van de dag vangt.
💡 **6 Pijlers van Vakmanschap:** Elke workshop is gescoord op *Stemtechniek, Uitspraak, Intonatie, Storytelling, Studiotechniek* en *Business*.
💡 **Smart Experience Levels:** Niveaus (Starter, Basis) zijn via `workshop_level_mappings` gekoppeld.
💡 **Hard Taxonomy Handshake:** Workshops zijn nu via `workshop_taxonomy_mappings` verbonden aan Pijlers (Categories) en Types (Anker/Gast).
💡 **Hard Media Handshake:** Video's en afbeeldingen zijn nu via `workshop_media` hard verbonden aan de centrale `media` tabel.
💡 **Hard Handshake FAQ:** FAQ's zijn via `faq_mappings` verbonden.
💡 **Zichtbaarheid:** We gebruiken de kolom `is_public` voor frontend-filtering.
💡 **Status Systeem:** Workshops en edities gebruiken de `workshop_statuses` koppeltabel.

---

## 📊 Overzicht Integriteit & Classificatie

| ID | Workshop Title | Pijler | Type | Status | Public | Bundle | Media | FAQ | Reviews |
|---|---|---|---|---|---|---|---|---|---|
| 260273 | Audioboeken inspreken | Voice-over | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | ❌ |
| 260266 | Documentaires inspreken | Voice-over | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | 🤝 2 |
| 260274 | Maak je eigen podcast | Storytelling | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | ❌ |
| 260272 | Maak je eigen radioshow | Storytelling | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | ❌ |
| 274488 | Meditatief spreken | Uitspraak | Gastworkshop | Live / Actief | ✅ Ja | ❌ Nee | 🤝 Hard | 🤝 Hard | ❌ |
| 260263 | Opname en audio-nabewerking | Storytelling | Gastworkshop | Live / Actief | ✅ Ja | ❌ Nee | 🤝 Hard | 🤝 Hard | ❌ |
| 272702 | Perfect spreken in 1 dag | Uitspraak | Vaste Workshop | Live / Actief | ✅ Ja | ❌ Nee | 🤝 Hard | 🤝 Hard | 🤝 1 |
| 267780 | Perfectie van articulatie | Uitspraak | Gastworkshop | Live / Actief | 🔒 Nee | ❌ Nee | 🤝 Hard | 🌐 Gen | 🤝 6 |
| 267781 | Perfectie van intonatie | Uitspraak | Gastworkshop | Live / Actief | 🔒 Nee | ❌ Nee | 🤝 Hard | 🌐 Gen | ❌ |
| 260271 | Presenteren in de camera | Storytelling | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | ❌ | 🤝 Hard | 🤝 1 |
| 260261 | Speel een stemmetje in een tekenfilm | Voice-over | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | ❌ |
| 263913 | Verwen je stem! | Uitspraak | Gastworkshop | Live / Actief | 🔒 Nee | ❌ Nee | 🤝 Hard | 🌐 Gen | 🤝 2 |
| 260265 | Voice-over voor audio-descriptie | Voice-over | Gastworkshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🌐 Gen | ❌ |
| 260250 | Voice-overs voor beginners | Voice-over | Vaste Workshop | Live / Actief | ✅ Ja | 📦 Ja | 🤝 Hard | 🤝 Hard | ❌ |
| 272907 | Workshop op maat | Voice-over | Gastworkshop | Live / Actief | 🔒 Nee | ❌ Nee | ❌ | 🌐 Gen | ❌ |

---

## 📦 [260273] Audioboeken inspreken

### 🏗️ Structurele Classificatie
- **Pijler**: Voice-over
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ✅ Ja (Deelnemers ontvangen opnames)

### 💡 Expert Note
> *"Je leert hoe je een lange vertelling boeiend houdt door de juiste cadans te vinden en personages subtiel te kleuren."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 1/5 | ●○○○○ | Starter |
| Uitspraak | 2/5 | ●●○○○ |  |
| Intonatie | 5/5 | ●●●●● |  |
| Storytelling | 5/5 | ●●●●● |  |
| Studiotechniek | 1/5 | ●○○○○ |  |
| Business | 1/5 | ●○○○○ |  |

### 🔗 Volgende Stappen (Related Journey)
❌ Geen specifieke volgende stappen verankerd

### ⭐ Gekoppelde Reviews (Hard Handshake)
❌ Geen publieke reviews gekoppeld

### ⚙️ Configuratie
- **Slug:** `audioboeken-inspreken`  
- **Status:** `Live / Actief` (ID: `1`)  
- **Zichtbaarheid:** ✅ Publiek (Zichtbaar op site)  

### 👨‍🏫 Instructors
#### 👤 Goedele Vermaelen (ID: `8`)
- **Tagline:** Genomineerd voor Beste Vlaamse Voorlezer
- **Slug:** `goedele-vermaelen`
- **Foto ID:** `5091` (Gekoppeld via `photo_id`) - ⚠️ Media record niet gevonden in `allMedia`

### 📍 Locaties
#### 🏠 Sonhouse (ID: `5`)
- **Adres:** Deschampheleerstraat 26, 1081, Koekelberg

---

## 📦 [260266] Documentaires inspreken

### 🏗️ Structurele Classificatie
- **Pijler**: Voice-over
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ✅ Ja (Deelnemers ontvangen opnames)

### 💡 Expert Note
> *"Je leert de techniek van het understated spreken: geloofwaardig informeren zonder dat het voelt als voorlezen."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 1/5 | ●○○○○ | Basiservaring |
| Uitspraak | 4/5 | ●●●●○ |  |
| Intonatie | 4/5 | ●●●●○ |  |
| Storytelling | 4/5 | ●●●●○ |  |
| Studiotechniek | 1/5 | ●○○○○ |  |
| Business | 1/5 | ●○○○○ |  |

---

## 📦 [260274] Maak je eigen podcast

### 🏗️ Structurele Classificatie
- **Pijler**: Storytelling
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ✅ Ja (Deelnemers ontvangen opnames)

### 💡 Expert Note
> *"Je leert hoe je een audio-format opbouwt, een interview technisch strak opneemt en de basis van montage in een DAW."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 1/5 | ●○○○○ | Starter |
| Uitspraak | 2/5 | ●●○○○ |  |
| Intonatie | 2/5 | ●●○○○ |  |
| Storytelling | 5/5 | ●●●●● |  |
| Studiotechniek | 4/5 | ●●●●○ |  |
| Business | 3/5 | ●●●○○ |  |

---

## 📦 [260272] Maak je eigen radioshow

### 🏗️ Structurele Classificatie
- **Pijler**: Storytelling
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ✅ Ja (Deelnemers ontvangen opnames)

### 💡 Expert Note
> *"Je leert hoe je een live-format presenteert, schuibt aan een mengpaneel en hoe je timing bewaakt tijdens een uitzending."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 1/5 | ●○○○○ | Starter |
| Uitspraak | 2/5 | ●●○○○ |  |
| Intonatie | 2/5 | ●●○○○ |  |
| Storytelling | 5/5 | ●●●●● |  |
| Studiotechniek | 4/5 | ●●●●○ |  |
| Business | 3/5 | ●●●○○ |  |

---

## 📦 [274488] Meditatief spreken

### 🏗️ Structurele Classificatie
- **Pijler**: Uitspraak
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ❌ Nee (Geen opnames voorzien)

### 💡 Expert Note
> *"Je leert hoe je je spreektempo vertraagt en je stemkleur aanpast om een sfeer van diepe rust en focus te creëren."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 5/5 | ●●●●● | Starter |
| Uitspraak | 4/5 | ●●●●○ |  |
| Intonatie | 4/5 | ●●●●○ |  |
| Storytelling | 4/5 | ●●●●○ |  |
| Studiotechniek | 4/5 | ●●●●○ |  |
| Business | 1/5 | ●○○○○ |  |

---

## 📦 [260263] Opname en audio-nabewerking

### 🏗️ Structurele Classificatie
- **Pijler**: Storytelling
- **Type**: Gastworkshop
- **Demo Bundle Aanwezig**: ❌ Nee (Geen opnames voorzien)

### 💡 Expert Note
> *"Je leert hoe je ruwe opnames opschoont (de-breath, EQ, compressie) en hoe je een professionele audio-export maakt."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 1/5 | ●○○○○ | Starter |
| Uitspraak | 1/5 | ●○○○○ |  |
| Intonatie | 1/5 | ●○○○○ |  |
| Storytelling | 1/5 | ●○○○○ |  |
| Studiotechniek | 5/5 | ●●●●● |  |
| Business | 4/5 | ●●●●○ |  |

---

## 📦 [272702] Perfect spreken in 1 dag

### 🏗️ Structurele Classificatie
- **Pijler**: Uitspraak
- **Type**: Vaste Workshop
- **Demo Bundle Aanwezig**: ❌ Nee (Geen opnames voorzien)

### 💡 Expert Note
> *"Je leert je ademsteun beheersen en je resonantie gebruiken om zonder moeite een tekst kristalhelder over te brengen."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 5/5 | ●●●●● | Starter |
| Uitspraak | 5/5 | ●●●●● |  |
| Intonatie | 5/5 | ●●●●● |  |
| Storytelling | 4/5 | ●●●●○ |  |
| Studiotechniek | 1/5 | ●○○○○ |  |
| Business | 1/5 | ●○○○○ |  |

---

## 📦 [260250] Voice-overs voor beginners

### 🏗️ Structurele Classificatie
- **Pijler**: Voice-over
- **Type**: Vaste Workshop
- **Demo Bundle Aanwezig**: ✅ Ja (Deelnemers ontvangen opnames)

### 💡 Expert Note
> *"Je leert de basis van microfoontechniek, tekstontleding en hoe je verschillende tone-of-voices toepast in de booth."*

### 🧠 Smart Skill DNA & Niveau
| Onderdeel | Score | Visual | Niveau |
| :--- | :--- | :--- | :--- |
| Stemtechniek | 4/5 | ●●●●○ | Starter |
| Uitspraak | 4/5 | ●●●●○ |  |
| Intonatie | 4/5 | ●●●●○ |  |
| Storytelling | 4/5 | ●●●●○ |  |
| Studiotechniek | 4/5 | ●●●●○ |  |
| Business | 4/5 | ●●●●○ |  |
