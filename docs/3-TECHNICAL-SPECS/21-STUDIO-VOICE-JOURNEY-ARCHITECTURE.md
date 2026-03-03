# 🎯 Studio vs Voice Customer Journey - Holistische Architectuur Analyse

**Doel:** Twee verschillende customer journeys op dezelfde WordPress site organiseren  
**Laatste update:** 2025-11-13

---

## 📊 HUIDIGE SITUATIE

### Journey 1: Voice Producten
- **Entry:** Voicepage (`/`, `/stemmen/`, etc.)
- **Flow:** Voicepage → Favorieten → Demo Request → Order → Thank You
- **Header/Footer:** Standaard Voices header (ONZE STEMMEN, MUZIEK, etc.)
- **Cart/Checkout:** Standaard WooCommerce flow
- **Thank You:** Voice-specifieke message met video

### Journey 2: Studio Producten
- **Entry:** Studio pagina's (`/studio/`, `/studio/voice-over-beginners/`, etc.)
- **Flow:** Studio pagina → Workshop overzicht → Inschrijving → Order → Thank You
- **Header/Footer:** Studio header (Onze workshops, Veelgestelde vragen, etc.)
- **Cart/Checkout:** **PROBLEEM:** Valt terug op standaard header/footer
- **Thank You:** Studio-specifieke message met video

---

## 🎨 ARCHITECTUUR OPTIES

### OPTIE 1: Elementor Display Conditions (Huidige Aanpak)
**Status:** ❌ Werkt niet dynamisch

**Probleem:**
- Elementor display conditions zijn statisch
- Kunnen niet detecteren of er Studio producten in cart zitten
- Cart/checkout/thank you vallen terug op standaard header

**Oplossing Pogingen:**
- PHP filters (`elementor_pro/theme_builder/template_id`)
- Template prioritization
- **Resultaat:** Filters worden mogelijk niet aangeroepen of werken niet

**Voor:**
- ✅ Geen code changes nodig als het werkt
- ✅ Elementor native oplossing

**Tegen:**
- ❌ Werkt niet dynamisch
- ❌ Complex om te debuggen
- ❌ Afhankelijk van Elementor internals

---

### OPTIE 2: JavaScript Header/Footer Swapping
**Status:** ✅ Technisch haalbaar

**Aanpak:**
1. Detecteer Studio producten in cart via AJAX
2. Vervang header/footer DOM elementen met Studio versie
3. Gebruik bestaande body classes (`studio-checkout`, `studio-order-received`)

**Implementatie:**
```javascript
// Detecteer Studio producten
if (document.body.classList.contains('studio-checkout') || 
    document.body.classList.contains('studio-order-received')) {
    
    // Haal Studio header/footer op via AJAX
    // Vervang huidige header/footer
    // Update navigation state
}
```

**Voor:**
- ✅ Werkt altijd (client-side)
- ✅ Geen Elementor dependencies
- ✅ Flexibel en aanpasbaar

**Tegen:**
- ❌ Mogelijk flash of content shift (FOUC)
- ❌ Extra AJAX calls
- ❌ Complexer dan PHP oplossing

---

### OPTIE 3: Separate WooCommerce Templates
**Status:** ✅ WordPress native

**Aanpak:**
1. Maak custom WooCommerce templates voor Studio:
   - `woocommerce/studio/cart.php`
   - `woocommerce/studio/checkout.php`
   - `woocommerce/studio/thankyou.php`
2. Detecteer Studio producten en laad juiste template
3. Templates gebruiken Studio header/footer via `get_header('studio')`

**Implementatie:**
```php
// In functions.php of template loader
add_filter('woocommerce_locate_template', function($template, $template_name) {
    if (voices_cart_has_studio_products()) {
        $studio_template = locate_template("woocommerce/studio/{$template_name}");
        if ($studio_template) {
            return $studio_template;
        }
    }
    return $template;
}, 10, 2);
```

**Voor:**
- ✅ WordPress native oplossing
- ✅ Volledige controle over layout
- ✅ Geen JavaScript nodig
- ✅ Geen Elementor dependencies

**Tegen:**
- ❌ Vereist template duplicatie
- ❌ Maintenance overhead (2 sets templates)
- ❌ Header/footer nog steeds via Elementor

---

### OPTIE 4: Conditional Header/Footer Loading
**Status:** ✅ Meest flexibel

**Aanpak:**
1. Detecteer context (Studio vs Voice) vroeg in WordPress lifecycle
2. Forceer juiste header/footer template via `get_header()` / `get_footer()`
3. Gebruik custom template loader

**Implementatie:**
```php
// Detecteer context vroeg
add_action('template_redirect', function() {
    if (is_cart() || is_checkout() || is_wc_endpoint_url('order-received')) {
        if (voices_cart_has_studio_products() || voices_order_has_studio_products()) {
            // Force Studio header/footer
            add_filter('get_header', function($name) {
                return 'studio';
            });
        }
    }
});
```

**Voor:**
- ✅ Volledige controle
- ✅ Werkt met Elementor Theme Builder
- ✅ Geen JavaScript nodig
- ✅ Geen template duplicatie

**Tegen:**
- ❌ Complex om Elementor templates te forceren
- ❌ Mogelijk conflicten met Elementor internals

---

### OPTIE 5: URL-Based Routing (Separate Checkout Flows)
**Status:** 🔄 Architecturale wijziging

**Aanpak:**
1. Maak separate checkout flows:
   - `/cart/` → Standaard (Voice)
   - `/studio/cart/` → Studio checkout
   - `/studio/checkout/` → Studio checkout
2. Elke flow heeft eigen templates en header/footer
3. Redirect op basis van cart content

**Implementatie:**
```php
// Redirect naar juiste checkout flow
add_action('template_redirect', function() {
    if (is_cart() && voices_cart_has_studio_products()) {
        wp_redirect('/studio/cart/');
        exit;
    }
});
```

**Voor:**
- ✅ Volledig gescheiden journeys
- ✅ Duidelijke URL structuur
- ✅ Makkelijk te debuggen
- ✅ SEO vriendelijk

**Tegen:**
- ❌ Grote architecturale wijziging
- ❌ Vereist URL rewrites
- ❌ Mogelijk verwarrend voor gebruikers
- ❌ Maintenance overhead

---

### OPTIE 6: Hybrid Approach (Aanbevolen)
**Status:** ✅ Beste van beide werelden

**Aanpak:**
1. **PHP Detection:** Detecteer Studio context vroeg
2. **Body Classes:** Gebruik bestaande `studio-checkout`, `studio-order-received`
3. **JavaScript Fallback:** Vervang header/footer als PHP niet werkt
4. **Elementor Override:** Probeer eerst Elementor filters, fallback naar JS

**Implementatie:**
```php
// 1. PHP: Force body classes (al gedaan)
// 2. PHP: Probeer Elementor filters (huidige code)
// 3. JavaScript: Fallback header/footer swap
```

**Voor:**
- ✅ Werkt altijd (PHP + JS fallback)
- ✅ Geen architecturale wijzigingen
- ✅ Bestaande code blijft werken
- ✅ Geleidelijke implementatie mogelijk

**Tegen:**
- ❌ Twee systemen onderhouden
- ❌ Mogelijk dubbele code

---

## 🎯 AANBEVELING

### **KORTE TERMIJN (Nu):**
**Optie 6: Hybrid Approach**
1. ✅ Body classes zijn al geïmplementeerd
2. ✅ Probeer Elementor filters (huidige code)
3. ✅ Voeg JavaScript fallback toe voor header/footer swapping
4. ✅ Test beide flows

### **LANGE TERMIJN (Toekomst):**
**Optie 3: Separate WooCommerce Templates**
- Volledige controle over Studio checkout flow
- Geen Elementor dependencies
- Makkelijker te onderhouden
- Betere performance

---

## 📋 IMPLEMENTATIE PLAN

### Fase 1: JavaScript Fallback (Nu)
- [ ] Detecteer `studio-checkout` / `studio-order-received` body classes
- [ ] Haal Studio header/footer HTML op via AJAX
- [ ] Vervang huidige header/footer DOM elementen
- [ ] Test op cart/checkout/thank you pagina's

### Fase 2: Elementor Filter Debugging (Later)
- [ ] Debug waarom Elementor filters niet werken
- [ ] Test verschillende filter hooks
- [ ] Documenteer werkende oplossing

### Fase 3: Template Consolidation (Toekomst)
- [ ] Maak Studio WooCommerce templates
- [ ] Implementeer template loader
- [ ] Migreer naar native WordPress oplossing

---

## 🔍 TECHNISCHE DETAILS

### Detectie Logic
```php
// Studio product detectie
function voices_cart_has_studio_products() {
    if (!WC()->cart) return false;
    foreach (WC()->cart->get_cart() as $cart_item) {
        if (has_term('studio', 'product_cat', $cart_item['product_id'])) {
            return true;
        }
    }
    return false;
}
```

### Body Classes
- `studio-checkout` → Checkout pagina met Studio producten
- `studio-order-received` → Thank you pagina met Studio order
- `studio-cart` → Cart pagina met Studio producten (nog toe te voegen)

### Elementor Template Detection
- Studio Header: Conditions bevatten "Productcategorieën #3039" of "Pagina #260030"
- Studio Footer: Zelfde conditions als header

---

## ❓ BESLISSINGSPUNTEN

1. **Wil je nu een werkende oplossing?** → Optie 6 (Hybrid)
2. **Wil je lange termijn architectuur?** → Optie 3 (Templates)
3. **Wil je volledig gescheiden flows?** → Optie 5 (URL Routing)

**Mijn aanbeveling:** Start met Optie 6, migreer later naar Optie 3.








