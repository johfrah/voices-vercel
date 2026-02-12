# Asset loading – standaarden en DRY

## Huidige staat (kort)

- **Niet gestandaardiseerd:** Scripts en styles worden op **166+ plekken** geladen via `wp_enqueue_style` / `wp_enqueue_script`, zonder centraal schema.
- **Twee URL‑patronen:**  
  - `get_stylesheet_directory_uri() . '/public/js/...'`  
  - `site_url('/wp-content/themes/' . get_stylesheet() . '/public/js/...', 'https')`  
  Beide zijn geldig; wel inconsistent en niet DRY.
- **Versies wisselend:** `filemtime(...)`, `'1.0.0'`, `time()`, `null` – geen vaste afspraak.
- **Wat wél centraal is:**
  - **50-frontend-enqueues.php** – kern frontend (jQuery, guards, cart, workshop inschrijvingen, universal login) op `wp_enqueue_scripts` priority 5.
  - **51-asset-helpers.php** – `voices_is_broken_asset_url()`, en vanaf nu ook **theme asset URL/versie/enqueue** helpers (DRY).
  - **52-asset-routing-fixes.php** – filtert broken asset URLs en taalprefix in style/script URLs.

## Aanbevolen conventie (DRY)

### 1. Theme-assets (CSS/JS in theme)

Gebruik de helpers uit **51-asset-helpers.php**:

- **URL:** `voices_theme_asset_url( $relative_path )`  
  Voorbeeld: `voices_theme_asset_url('public/js/header-icons.js')`
- **Versie:** `voices_theme_asset_version( $relative_path, $fallback )`  
  Binnen de theme: liefst geen hardcoded `'1.0.0'`; gebruik de helper (filemtime of fallback).
- **Enqueue in één keer:**
  - **CSS:** `voices_enqueue_theme_style( $handle, $relative_path, $deps )`  
    Enqueue alleen als het bestand bestaat.
  - **JS:** `voices_enqueue_theme_script( $handle, $relative_path, $deps, $in_footer )`  
    Idem.

Voorbeeld (in een shortcode of module):

```php
// Oud (niet fout, wel repetitief):
wp_enqueue_style('feedback-dashboard-css', get_stylesheet_directory_uri() . '/public/css/components/feedback-dashboard.css', array(), '2025.1.0');

// Nieuw (DRY):
voices_enqueue_theme_style('feedback-dashboard-css', 'public/css/components/feedback-dashboard.css', array());
```

### 2. Waar enqueue doen

- **Frontend:** `wp_enqueue_scripts` (priority naar behoefte: 5 = vroeg, 10–20 = normaal, 25+ = laat).
- **Admin/backoffice:** `admin_enqueue_scripts` (of `wp_enqueue_scripts` alleen op frontend).
- **Conditional assets** (per pagina/shortcode) blijven in de betreffende module; wel de **theme helpers** gebruiken voor URL/versie/enqueue.

### 3. Externe assets (CDN)

- Geen theme-helper voor; gewoon `wp_enqueue_style( $handle, $url, $deps, null )` of met vaste versie.
- Voorbeeld: Datatables, Font Awesome, rrweb – blijven zoals nu.

### 4. file_exists

- Bij **theme-assets**: de helpers `voices_enqueue_theme_style` / `voices_enqueue_theme_script` doen al `file_exists`; geen dubbele check nodig.
- Als je handmatig `wp_enqueue_style/script` blijft gebruiken met `voices_theme_asset_url()`, dan zelf `file_exists(get_stylesheet_directory() . '/' . $relative_path)` doen vóór enqueue.

### 5. Wat je nog kunt vergeten

- **Broken URLs:** Geen theme-CSS/JS enqueuen met `home_url()`, `site_url()` zonder path of lege string – dat geeft MIME‑fouten; 52-asset-routing-fixes blokkeert ze, maar beter niet toevoegen.
- **Prioriteiten:** Bij veel modules: duidelijke prioriteit (5 / 10 / 15 / 20) houden zodat volgorde voorspelbaar blijft.
- **Dependencies:** Juiste `$deps` zetten (bijv. `array('jquery')`) zodat volgorde klopt.
- **Admin vs frontend:** Geen frontend‑only scripts op admin-pagina’s enqueueën (performance); conditional houden.

### 6. Intelligent Loading (IAP)

Volgens het **Intelligent Architecture Protocol** laden we assets niet alleen op basis van de pagina, maar ook op basis van **Intent**:

*   **Predictive Loading:** Als een gebruiker in de `Unpaid` flow de tarieven bekijkt, laad dan via de theme helpers alvast de checkout-assets op de achtergrond.
*   **Contextual Assets:** Gebruik de journey-context (`voices_get_journey_context()`) om te bepalen of zware scripts (zoals de Audio Recorder) geladen moeten worden.

## Migratie (optioneel)

Bestanden geleidelijk omzetten naar:

- `voices_theme_asset_url()` + `voices_theme_asset_version()` of
- `voices_enqueue_theme_style()` / `voices_enqueue_theme_script()`

waar het om theme-CSS/JS gaat. Geen big-bang; bij elke aanpassing in een bestand die bestand consistent maken is voldoende.

## Samenvatting

| Onderdeel              | Status        | Actie                                      |
|------------------------|---------------|--------------------------------------------|
| Centrale URL/versie    | Nieuwe helpers| Gebruik `voices_theme_asset_*` en `voices_enqueue_theme_*` |
| Frontend-kern          | Centraal      | 50-frontend-enqueues – niet verspreiden    |
| Broken-URL-beveiliging| Centraal      | 51 + 52 – laten staan                      |
| Versie (filemtime vs 1.0.0) | Inconsistent | Nieuwe code: helper; bestaande code bij aanraking aanpassen |
| Enqueue-locaties       | Verspreid     | OK; wel overal theme-helpers gebruiken    |
