# BLUEPRINT: HET LANCEREN VAN EEN NIEUWE JOURNEY

Dit document dient als handleiding voor het toevoegen van een nieuwe bedrijfstak of "Journey" (zoals Academy, Agency, Studio) aan het Voices-platform.

## 1. Concept & Scope Bepaling
Voordat je begint met coderen:
*   **Doel:** Wat is het doel van deze journey? (bv. Educatie, Dienstverlening, Productverkoop).
*   **Toegang:** Wie mag erin? (Iedereen, leden, kopers van product X).
*   **Interactie:** Wat moet de gebruiker kunnen doen? (Kijken, Uploaden, Chatten, Boeken).

## 2. Database Architectuur
Bepaal welke data je moet opslaan die niet in de standaard WP-tabellen past.
*   **Progressie:** `wp_voices_[journey]_progress` (voor cursussen/trajecten).
*   **Inzendingen:** `wp_voices_[journey]_submissions` (voor uploads).
*   **Meta:** `wp_voices_[journey]_meta` (voor specifieke instellingen per gebruiker).

## 3. Toegangscontrole (The Gatekeeper)
*   Maak een `access.php` bestand in de module.
*   Gebruik `template_redirect` hooks om niet-bevoegde gebruikers om te leiden.
*   Koppel toegang aan WooCommerce producten (`wc_customer_bought_product`) of gebruikersrollen.

## 4. Frontend Experience (De Cockpit)
*   **Dashboard:** Creëer een centrale landingspagina met shortcode (bv. `[voices_[journey]_dashboard]`).
*   **Routing:** Gebruik `add_rewrite_rule` om mooie URL's te maken (bv. `/journey/stap/1/` i.p.v. `?step=1`).
*   **IAP Compliance:** 
    *   **Context:** Registreer de journey in `MarketManager`.
    *   **Sticky:** Gebruik `VoicesPreferences` om de status van de gebruiker te onthouden.
    *   **AI-Ready:** Voeg `data-voices-context` attributen toe aan je dashboard containers.
*   **Styling:** Gebruik de bestaande `Cockpit UI` variabelen (zwart/wit/roze) voor consistentie.

## 5. Backend Management (De Admin)
*   **Menu:** Voeg een item toe aan het WordPress admin-menu (`add_menu_page`).
*   **Overzicht:** Maak een matrix-view om de status van alle gebruikers in deze journey te zien.
*   **Tools:** Integreer specifieke admin-tools (zoals de Audio Recorder of Feedback formulieren).

## 6. Communicatie (Journey Manager)
*   **Registratie:** Voeg de nieuwe journey toe aan `Voices_Email_Journey_Manager::get_stage_for_type`.
*   **Triggers:** Definieer specifieke e-mail triggers (bv. `journey_started`, `journey_completed`).
*   **Notificaties:** Zorg voor bi-directionele notificaties (Admin -> User en User -> Admin).

## 7. Integraties
*   **Chat:** Koppel het chat-systeem aan de journey-context (zodat je weet waarover een vraag gaat).
*   **WooCommerce:** Zorg dat aankoop direct leidt tot toegang en onboarding.

## Checklist voor Livegang
- [ ] Database tabellen aangemaakt?
- [ ] Toegangscontrole getest met niet-koper en wel-koper?
- [ ] Frontend werkt op mobiel en desktop?
- [ ] Admin kan alles beheren zonder code?
- [ ] E-mails komen aan en staan in de juiste categorie?
- [ ] `.htaccess` beveiliging op upload-mappen actief?

---
*Gebruik deze blueprint als startpunt voor elke nieuwe uitbreiding (bijv. Podcast Masterclass, Voice-over Agency Portal).*
