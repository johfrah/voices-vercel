# 🧰 VOICES DEVELOPER TOOLBOX (2026)

Dit document is de centrale index van alle gestandaardiseerde tools, helpers en engines binnen het Voices.be platform. Gebruik deze componenten om het wiel niet opnieuw uit te vinden en consistentie te garanderen.

---

## 🏗️ Core Engines

### 1. VoicesCockpit Engine
De centrale engine voor het renderen van UI-surfaces.
- **Locatie:** `functions/v2/10-engine/cockpit/90-cockpit-engine.php`
- **Hoofdfunctie:** `VoicesCockpit::render($config)`
- **Helpers:** 
    - `VoicesCockpit::format_currency($amount)`
    - `VoicesCockpit::get_status_badge($status)`

### 2. Voiceglot 2.0 (Translation)
Het verplichte vertaalsysteem voor alle user-facing strings.
- **Locatie:** `functions/v2/00-core/translation/10-voices-translation-core.php`
- **Hoofdfunctie:** `voices_t($key, $default, $context)`
- **Engine-functie:** `voices_voiceglot_translate($key, $default, $source_lang, $target_lang, $context)` (niet direct gebruiken op frontend)
- **Opslag:** `voices_voiceglot_save_translation($key, $lang, $data)` (Beschermt manual edits!)
- **Regel:** Gebruik GEEN `wp_localize_script` meer voor vertalingen. Alles via de Voiceglot API.

### 3. Hypermode & IAP Context
Systeem voor intelligentie en context-bewustzijn.
- **Locatie:** `functions/v2/10-engine/hypermode/95-hypermode-engine.php`
- **Hoofdfunctie:** `VoicesHypermode::get_user_context()`
- **IAP Helper:** `voices_get_iap_context()` (Journey, Persona, Market)
- **Sticky UI:** Gebruik `VoicesPreferences.get()` (JS) en `voices_get_preference()` (PHP).

---

## 🛠️ Utilities & Helpers

### 4. Asset Helpers (DRY Enqueue)
De enige toegestane manier om CSS en JS te laden.
- **Locatie:** `functions/v2/00-core/ui/51-asset-helpers.php`
- **Functies:**
    - `voices_enqueue_theme_style($handle, $rel_path, $deps)`
    - `voices_enqueue_theme_script($handle, $rel_path, $deps, $in_footer)`
    - `voices_theme_asset_url($rel_path)`

### 5. PDF Engine
Voor het genereren van Quotes, Invoices en Reminders.
- **Locatie:** `functions/v2/140-woocommerce/50-order-pdf-generator.php` (Target Locatie)
- **Classes:** `Voices_Quote_PDF`, `Voices_Invoice_PDF`, `Voices_Reminder_PDF`

### 6. VIES Validation (VAT)
EU BTW-nummer validatie integratie.
- **Locatie:** `functions/v2/00-core/ui/54-woocommerce-compat.php` (bevat VAT logica)
- **Functie:** `voices_validate_vies_vat($vat_number, $country_code)`

### 7. Yuki Integration
Facturatie koppeling met Yuki.
- **Locatie:** `functions/v2/180-yuki/20-yuki-dashboard.php`
- **Functie:** `yuki_push_order_ajax()`

### 8. Review Mapping Helper
Voorkomt verwarring tussen Studio en Agency reviews.
- **Locatie:** `functions/v2/30-systems/reviews/includes/review-helpers.php`
- **Functie:** `voices_get_business_slug($type)` ('workshops' | 'agency')

---

## 📱 Frontend & Interactie

### 9. VoicesState.js
Centrale state management voor de frontend.
- **Locatie:** `public/js/VoicesState.js`
- **Doel:** Tracking van user intent en UI state voor Voicy.

### 10. Voicy Bridge
De brug tussen de browser en de AI Assistant.
- **Functies:** `window.Voicy.attention()`, `window.Voicy.highlight()`, `window.Voicy.notify()`.

### 11. Modal & Notification System
Gestandaardiseerde popups en meldingen.
- **Locatie:** `functions/v2/00-core/ui/20-voices-modal-system.php`
- **JS:** `VoicesModal.show()`, `VoicesNotification.success()`.

### 12. Email Templating Helpers
- **Locatie:** `functions/v2/00-core/ui/40-footer-helpers.php` (bevat email helpers)
- **Functies:** 
    - `voices_render_cta_button()`
    - `voices_render_invoice_details_table()`
    - `voices_render_customer_details()`
    - `voices_render_bank_details()`
    - `voices_render_standard_questions()`

---

## 📊 Analytics & Tracking

### 12. Studio Event Tracker
- **Locatie:** `functions/v2/20-journeys/studio/analytics/10-studio-analytics-core.php`
- **Functie:** `voices_track_studio_event($event_type, $data)`

### 13. UTM & Visitor Tracking
- **Locatie:** `functions/v2/00-core/tracking/40-utm-tracking-core.php`
- **Functie:** `voices_get_visitor_context()`
- **Legacy Bronnen:** AFL WC UTM (order meta), Gravity Forms (entry meta), Burst Statistics (db table).

### 15. Academy Core API
- **Locatie:** `functions/v2/20-journeys/studio/online-course/`
- **Tabellen:** `wp_voices_course_progress`, `wp_voices_course_submissions`, `wp_voices_course_activity`.
- **Hooks:** `voices_user_has_course_access`, `voices_course_submission_received`.

---

## 🔒 Security & Protection

### 14. Root Protection
Handhaving van de mappenstructuur.
- **Locatie:** `functions.php` (Loader)
- **Regel:** Blokkeert acties in niet-toegestane root-bestanden.

### 15. Carefull Protocol
Voor risicovolle debug operaties.
- **Trigger:** Gebruik de string "Carefull" in je prompt om extra veiligheidsmaatregelen te activeren.

## 🗄️ Data Access Helpers
Gebruik deze helpers om data op te halen volgens de geverifieerde keys in `060-DATABASE-SCHEMA.md`.

### 16. Post & User Meta
- **PHP**: `get_post_meta($id, $key, true)` / `get_user_meta($id, $key, true)`.
- **Regel**: Gebruik uitsluitend keys uit het schema. Bij twijfel: check live DB.
- **IAP Preference**: `voices_get_preference($key)` (PHP) / `VoicesPreferences.get($key)` (JS).

### 17. Demobeheer (Audio/Video)
- **Alle demo's**: `voices_get_product_demos($product_id)` (Source of Truth: `wp_voices_demos`).
- **Best match**: `voices_get_best_demo_url($product_id, $context)` (Intelligente context-switch).

### 18. Gravity Forms Data
- **Entry Access**: `rgar($entry, '{field_id}')`.
- **Mapping**: Gebruik de Rosetta Stone in `.cursor/rules/210-gravity-forms-mapping.mdc`.

---
**GOUDEN REGEL:** Zoek ALTIJD eerst in deze toolbox voordat je een nieuwe helper functie schrijft. Bij database-acties is `060-DATABASE-SCHEMA.md` je bijbel.
