# ⭐ DATAGOLD: REVIEWS
## *De Ambassador Assets van Voices.be*

Reviews zijn in de Datagold-strategie de "sluitsteen" van de funnel. Ze zijn niet langer statische sterrenscores, maar intelligente bewijsstukken die elke fase van de klantreis valideren.

---

### 🧠 INTELLIGENTIE-LAGEN (Labels)

Elke review wordt automatisch verrijkt met de volgende Engelse termen:

#### 1. Persona Tagging (De "Wie")
*   `quality-seeker`: Focus op artistieke kwaliteit, timbre en "klasse".
*   `timesaver`: Focus op snelheid, efficiëntie en "geen geknoei".
*   `self-recorder`: De klant die vroeger zelf opnam en nu de verlossing van een prof zoekt.
*   `budget-aware`: Focus op investering, tarieven en offertes.

#### 2. Sentiment Velocity (De Transformatie)
We meten de snelheid van de emotionele verandering (0-100):
*   **Hero Story (100):** Expliciete vermelding van pijn/frustratie uit het verleden gevolgd door verlossing door Voices.be.
*   **Positive (50):** Een goed resultaat zonder diepe emotionele voorgeschiedenis.

#### 3. IAP Context (De Architectuur)
*   `market_aware`: (vlaams / international) - Gedetecteerd via taal en regio.
*   `journey_aware`: Spreekt over het proces of de stappen.
*   `intent_aware`: Focus op het resultaat en de impact (conversie).

### 3. Economic Weighting (De Ambassador Yield)
*   **Doel:** Het identificeren van de meest waardevolle "Ambassador Assets" op basis van de LTV van de auteur.
*   **Intelligence Lagen:**
    *   **Review Yield:** We koppelen de review aan de historische omzet van de klant (via de Backtrace naar WooCommerce).
    *   **High-Value Validation:** Reviews van klanten met een hoge LTV (`priority-segment`) krijgen een hogere `conversion_score`.
    *   **Sector Authority:** Een review van een klant uit een `high-yield-sector` wordt zwaarder gewogen in de IAP voor die specifieke sector.
*   **Privacy-Safe Activation:**
    *   **Shadow Backtrace:** De koppeling tussen de review en de exacte euro-omzet is strikt intern (Shadow Data).
    *   **Public Impact:** In de frontend resulteert dit in een "Top Rated" of "Expert Choice" label bij de review, zonder ooit financiële data te onthullen.

---

### 🎯 FUNNEL & AWARENESS ACTIVATIE

Reviews fungeren als **Ambassador Assets** die we strategisch injecteren op basis van de fase van de bezoeker:

#### 1. Awareness Support (De "Opluchting" Injectie)
*   **Doel:** De zoeker laten zien dat zijn probleem (bijv. een rommelige centrale) oplosbaar is.
*   **Actie:** Toon reviews met een hoge `sentiment_velocity` naast "Hoe-stel-ik-in" blogs.
*   **Focus:** De transitie van "geknoei" naar "rust".

#### 2. Consideration Support (De "Expertise" Validatie)
*   **Doel:** Bewijzen dat onze technische of artistieke keuzes de juiste zijn.
*   **Actie:** Toon reviews van `quality-seekers` bij de "In de Studio Bij" video's.
*   **Focus:** De bevestiging van kwaliteit en autoriteit.

#### 3. Decision Support (De "Laatste Duw")
*   **Doel:** De angst voor de aankoop wegnemen.
*   **Actie:** Toon reviews over "snelheid" en "vlekkeloze levering" in de Smart Configurator.
*   **Focus:** Betrouwbaarheid en direct resultaat.

---

### 🔗 DE GOUDEN DRAAD (Linking)

Reviews worden intern gekoppeld aan:
1.  **Order Instructions:** De "Pijn" uit de briefing (Shadow Data) die leidde tot deze review.
2.  **Product IDs:** Specifieke stemacteurs die in de review worden genoemd.
3.  **Journey Bibles:** Directe link naar de relevante Bijbel (bijv. `BIJBEL-AGENCY-TELEPHONY.md`).

---

### 🚀 ACTIVATIE IN NEXT.JS

#### 1. De "Ambassador Yield" Widget (Authentic Proof)
De review-sectie is niet langer een statische lijst, maar een dynamisch bewijs-instrument:
*   **De Logica:** De widget koppelt reviews aan feitelijke data uit de `Nuclear Rescan` (sector, LTV-status, anciënniteit).
*   **De Activatie:** 
    *   **Sector Matching:** Toont reviews van klanten uit exact dezelfde sector als de bezoeker.
    *   **Authority Labels:** Voegt feitelijke badges toe zoals: *"Klant sinds 2018"*, *"Sector: Bouw & Vastgoed"*, *"12 succesvolle projecten"*.
    *   **Zero-Fake Policy:** Geen verzonnen claims. We tonen alleen wat we 100% zeker weten uit onze eigen database.
*   **Impact:** De bezoeker ziet social proof van "mensen zoals hij", wat de conversie-waarschijnlijkheid enorm verhoogt.

#### 2. Hero Story Highlighting
Reviews met `sentiment_velocity: 100` worden getransformeerd naar compacte case-studies in de Bento-grid.

#### 3. Instant Re-skinning in Social Proof
Placeholders zoals `{{company_name}}` kunnen worden gebruikt om de bezoeker direct te spiegelen aan de review: *"Net als bij `{{company_name}}` zorgden we voor een vlekkeloze installatie bij [Bedrijf X]"*.

---