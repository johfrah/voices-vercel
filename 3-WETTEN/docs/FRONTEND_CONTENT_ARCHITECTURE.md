# 🎭 Voices Frontend Content Architecture (2026)

Dit document beschrijft de universele structuur van content binnen het Voices ecosysteem, verdeeld over verschillende **Journeys** en **Markets**. Het doel is een onverwoestbare, data-gedreven architectuur volgens de **Bob-methode**.

---

## 🌍 1. Markets (Domeinen & Talen)

Elke markt heeft zijn eigen "Etalage" (domein) maar deelt dezelfde machinekamer.

| Markt-Code | Domein | Primaire Taal | Journeys |
|:---|:---|:---|:---|
| **BE** | `voices.be` | nl-BE / fr-BE | Agency, Studio, Academy |
| **NLNL** | `voices.nl` | nl-NL | Agency |
| **FR** | `voices.fr` | fr-FR | Agency |
| **EU** | `voices.eu` | en-GB | Agency |
| **PORTFOLIO** | `johfrah.be` | nl-BE | Portfolio (Johfrah) |
| **ARTIST** | `youssefzaki.eu` | en-US | Artist (Youssef) |
| **ADEMING** | `ademing.be` | nl-BE | Meditation |
| **JOHFRAI** | `johfrai.be` | nl-BE | AI Voices |

---

## 🎭 2. Journeys (De Gebruikerservaring)

Elke journey heeft een specifiek doel en een eigen URL-structuur.

### 🎙️ A. Agency Journey (Stemmen zoeken)
*   **Doel**: Klanten helpen de perfecte stem te vinden en direct te boeken.
*   **URL Structuur**:
    *   `/agency` (of `/stemmen`, `/voix`): De zoekmachine (Grid).
    *   `/voice/[slug]` (of `/stem/[slug]`): Het profiel van de acteur.
    *   `/voice/[slug]/[journey]/[medium]`: Directe landing op een specifieke demo (bijv. `/voice/johfrah/commercial/radio`).
    *   `/tarieven`: De Slimme Kassa / Calculator.

### 🏫 B. Academy & Studio Journey (Leren & Opnemen)
*   **Doel**: Vakmanschap doorgeven en fysieke diensten aanbieden.
*   **URL Structuur**:
    *   `/academy`: Overzicht van cursussen.
    *   `/academy/lesson/[id]`: De leeromgeving (na inlog).
    *   `/studio`: Overzicht van workshops en faciliteiten.
    *   `/studio/[slug]`: Specifieke workshop pagina (bijv. `/studio/voice-over-beginners`).

### 🎨 C. Artist & Portfolio Journey (De Ziel)
*   **Doel**: Persoonlijke branding en luxe presentatie van talent.
*   **URL Structuur**:
    *   `/artist/[slug]`: Artistiek portfolio (bijv. `/artist/youssef`).
    *   `johfrah.be/`: Directe toegang tot het portfolio zonder prefix.
    *   `/music/free`: Toegang tot de rechtenvrije muziekbibliotheek.

### 🧘 D. Ademing Journey (Rust & Verbinding)
*   **Doel**: Meditatie en stem-gebaseerde wellness.
*   **URL Structuur**:
    *   `/ademing`: Overzicht van tracks en sessies.

---

## 🛠️ 3. Content Types & Resolutie

De **SmartRouter** bepaalt op basis van de URL welke "receptionist" de bezoeker ontvangt.

| Content Type | Database Tabel | SmartRouter Herkenning |
|:---|:---|:---|
| **Actor** | `actors` | Prefix `/voice/`, `/stem/` OF via `slug` check. |
| **Artist** | `artists` | Prefix `/artist/` OF via `slug` check. |
| **Workshop** | `workshops` | Prefix `/studio/` OF via `slug` check. |
| **CMS Page** | `content_articles` | Geen prefix (bijv. `/over-ons`, `/contact`). |
| **Pitch Link** | `casting_lists` | Prefix `/pitch/[hash]`. |

---

## 🧠 4. De "Handshake Truth" (Voorstel)

Om gokken te voorkomen en 100% stabiliteit te garanderen, introduceren we een **Routing Mandate**:

1.  **Explicit Prefixes**: We dwingen af dat systeem-content altijd via een prefix bereikbaar is (bijv. `/voice/`).
2.  **Slug Registry**: In de database krijgt elke entiteit (acteur, artiest, pagina) een veld `routing_type`.
    *   `routing_type = 'actor'` -> De SmartRouter gaat direct naar de `actors` tabel.
    *   `routing_type = 'cms'` -> De SmartRouter gaat direct naar de `content_articles` tabel.
3.  **Canonical Redirects**: Als iemand naar `/johfrah` gaat, kijkt de server in de registry, ziet `type = 'actor'`, en stuurt de bezoeker (indien gewenst) door naar de officiële `/voice/johfrah` URL (of serveert deze direct).

---

##  Suzy-Mandate (SEO)

*   **Titels**: Altijd `[Naam] | [Markt Naam]`.
*   **Talen**: URL's gebruiken 2-letter codes (`/fr/`), database gebruikt ISO-5 (`fr-BE`).
*   **Sitemaps**: Worden per journey gegenereerd op basis van de `routing_type`.

---

"Alles in harmonie, van de eerste klik tot de laatste noot." - **BOB**
