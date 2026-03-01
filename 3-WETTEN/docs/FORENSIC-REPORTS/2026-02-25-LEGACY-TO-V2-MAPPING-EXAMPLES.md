# 🧪 Forensic Mapping: Van Legacy Slop naar Nuclear V2 (Concrete Voorbeelden)

Om de transformatie visueel te maken, pakken we drie typische scenario's uit je huidige database en mappen we deze naar de nieuwe **Scenario B** architectuur.

---

## Scenario 1: De Stemacteur Booking (Agency Journey)
*De meest voorkomende order: een klant boekt een stem voor een online commercial.*

### 🔴 Legacy (V1 Slop) - In `orders.raw_meta`
```json
{
  "performer_183323": "Birgit", 
  "usage": "Online 1 jaar",
  "total": "250.00",
  "_alg_wc_cog_order_cost": "150.00",
  "audio_link": "https://voices.be/uploads/2021/03/spot.wav"
}
```
*Probleem: Birgit's naam is tekst (geen link), usage is tekst, inkoop zit in een vage key.*

### 🟢 Nuclear (V2 Handshake)
**In `orders_v2`:**
- `total_net`: 250.00
- `total_cost`: 150.00
- `journey_id`: 1 (Agency)

**In `order_items_v2`:**
- `actor_id`: 142 (Link naar Birgit in `actors` tabel)
- `usage_id`: 1 (Link naar "Online 1 jaar" in `usage_types`)
- `metadata`: `{ "audio_url": "spot.wav" }`

---

## Scenario 2: De Workshop Inschrijving (Studio Journey)
*Een klant schrijft zich in voor een fysieke workshop.*

### 🔴 Legacy (V1 Slop) - In `orders.raw_meta`
```json
{
  "workshop_name": "Perfectie van intonatie",
  "date": "2026-04-12",
  "billing_first_name": "Patrick",
  "_order_total": "249.00"
}
```
*Probleem: Geen directe link naar de workshop tabel, datum is platte tekst.*

### 🟢 Nuclear (V2 Handshake)
**In `orders_v2`:**
- `user_id`: 802 (Link naar Patrick in `users` tabel)
- `total_net`: 249.00
- `journey_id`: 2 (Studio)

**In `order_items_v2`:**
- `workshop_id`: 267781 (Link naar de workshop in `workshops` tabel)
- `metadata`: `{ "edition_date": "2026-04-12" }`

---

## Scenario 3: De Music & Services Mix (Portfolio Journey)
*Een complexe order met een muzikant en extra studio-diensten.*

### 🔴 Legacy (V1 Slop) - In `orders.raw_meta`
```json
{
  "artist": "Iann Music",
  "service": "Mixage & Mastering",
  "total": "500.00",
  "dropbox_link": "https://dropbox.com/sh/..."
}
```
*Probleem: Alles is tekst, geen onderscheid tussen product en dienst.*

### 🟢 Nuclear (V2 Handshake)
**In `orders_v2`:**
- `total_net`: 500.00
- `dropbox_url`: "https://dropbox.com/sh/..."

**In `order_items_v2` (Regel 1):**
- `artist_id`: 45 (Link naar Iann in `artists` tabel)
- `unit_price`: 400.00

**In `order_items_v2` (Regel 2):**
- `product_id`: 12 (Link naar "Studio Service" in `products` tabel)
- `unit_price`: 100.00

---

## 🎭 Sjareltje's Samenvatting
| Kenmerk | Legacy (V1) | Nuclear (V2) |
| :--- | :--- | :--- |
| **Koppeling** | "Zoek op naam" (Traag/Foutgevoelig) | **ID-Handshake** (Razendsnel/100% Correct) |
| **Data** | 100+ losse velden in JSON | **Gestraatlijnde kolommen** |
| **Integriteit** | Kan "Birgit" en "Birgitte" bevatten | Verwijst altijd naar **ID 142** |
| **Dashboard** | Moet JSON parsen (500 errors) | Directe SQL query (100ms LCP) |

**Zal ik de SQL-migratie nu uitvoeren om deze schone structuur werkelijkheid te maken?** 🚀🤝
