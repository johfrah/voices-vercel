# 🧠 UNIFIED CUSTOMER INTELLIGENCE (UCI) - SPECIFICATIE

## 1. HET CONCEPT
UCI is de intelligentielaag die de "gefragmenteerde data" zwakte ombuigt naar een strategische sterkte. In plaats van losse WordPress Users of WooCommerce Orders, praten we over **één Customer Entity** die over alle systemen heen wordt herkend via email-matching.

## 2. DE ARCHITECTUUR (3-LAAGS)

### A. De Data Bronnen (Raw)
- **WP Users:** Identiteit & Rollen.
- **WC Orders:** Koophistorie & CLV.
- **Central Leads (`wp_voices_central_leads`):** Formulier-interacties, UTM's en Lead Scoring.
- **Chat History:** Communicatie-context.
- **Visitor Tracking:** Real-time gedrag.

### B. De Intelligence Laag (`VoicesDataStandardizer`)
Deze laag (reeds deels actief) verwerkt raw data naar:
- **Lead Vibe:** (Cold, Warm, Hot, Burning).
- **B2B Detection:** Reverse IP lookup naar bedrijfsnamen.
- **Intent Scoring:** Op basis van bezochte pagina's en UTM-termen.

### C. De API Laag (`voices_get_customer_360($email)`)
Een centrale helper die een geaggregeerd object teruggeeft:
```php
[
    'identity' => [ ... ],
    'vibe' => 'burning',
    'clv' => 1250.00,
    'last_intent' => 'order_voice',
    'company' => 'Philips NV',
    'touchpoints' => [ ... ]
]
```

## 3. WAAROM DIT EEN STERKTE IS (THE "FREE-MONEY" MACHINE)

1. **Proactieve Sales (Butler Mode):** Voicy ziet een 'Burning' lead op de site en kan direct een chat starten: *"Hoi [Naam], ik zie dat je naar tarieven kijkt voor [Bedrijf]. Zal ik een offerte op maat maken?"*
2. **Frictionless Checkout:** Omdat we de data al hebben in `central_leads`, kunnen we formulieren pre-fillen voor gasten zonder dat ze een account nodig hebben.
3. **B2B Radar:** We weten welke bedrijven op de site zitten, zelfs als ze niets invullen (via Reverse IP in de central leads tabel).
4. **Churn Prevention:** Automatische detectie van 'Loyal' klanten die al 6 maanden niets besteld hebben.

## 5. PRIVACY & SECURITY (MANDAAT)
UCI data is strikt hiërarchisch beveiligd:

1.  **Admin Context (`$admin_context = true`):** Volledige toegang tot CLV, orderhistorie, BTW-nummers en gedetailleerde touchpoints. Alleen voor backoffice gebruik.
2.  **Voicy/Frontend Context (`$admin_context = false`):** Voicy heeft GEEN toegang tot financiële data of ruwe database records. Voicy ziet alleen:
    *   Voornaam (voor personalisatie).
    *   Vibe & Intentie (voor proactieve hulp).
    *   Voorkeuren (voor UX optimalisatie).

**GOUDEN REGEL:** Voicy deelt NOOIT financiële data of bedrijfsgevoelige informatie met de eindgebruiker. UCI intelligentie wordt gebruikt om de *ervaring* te sturen, niet om de *data* te exposeren.

## 6. COMMUNICATIE PROTOCOL (HUMAN-IN-THE-LOOP)
UCI-inzichten mogen NOOIT leiden tot automatische, ongecontroleerde AI-gegenereerde e-mails of berichten naar de klant.

1.  **Vaste Templates (Toegestaan):** Bestaande, vooraf goedgekeurde automatische mails met vaste inhoud (bijv. orderbevestigingen, workshop reminders) blijven actief.
2.  **AI Content (Preview-First):** Elke actie waarbij AI de inhoud genereert (bijv. een gepersonaliseerd heractivatie-voorstel of offerte-opvolging op maat) moet eerst als **concept** worden klaargezet in een admin-modal.
3.  **Admin Approval:** De admin moet de AI-gegenereerde inhoud handmatig goedkeuren en verzenden.
4.  **Geen Directe AI-Chat:** Voicy mag UCI-data gebruiken om de admin te adviseren over een gesprek, maar mag nooit zelfstandig gevoelige UCI-informatie naar de klant communiceren zonder menselijke tussenkomst.
