# 🗺️ Nuclear Inventory Mapping: De "1 Truth" van Producten (2026)

Om de nieuwe `orders` tabel (V2) te kunnen vullen, moeten we precies weten waar onze "producten" wonen. In de **Bob-methode** zijn producten geen platte tekst, maar levende entiteiten met een eigen tabel.

Hier is de huidige mapping van onze voorraad in Supabase:

## 1. De Product-Eilanden (Inventory)

| Categorie | Tabel in Supabase | Aantal | Nuclear Status |
| :--- | :--- | :--- | :--- |
| **Stemacteurs** | `actors` | 498 | ✅ **Nuclear**. Birgit, Johfrah, etc. wonen hier met al hun DNA. |
| **Workshops** | `workshops` | 12 | ✅ **Nuclear**. "Perfectie van intonatie", "Maak je eigen podcast", etc. |
| **Academy** | `courses` | 0 | ⚠️ **In aanbouw**. De digitale leeromgeving wordt nog gevuld. |
| **Diensten** | `products` | 0 | ⚠️ **Leeg**. Voor algemene zaken (bijv. "Studio huur") gebruiken we deze tabel. |

---

## 2. Hoe we dit koppelen in de Nieuwe Order (V2)

In plaats van de naam van een workshop of acteur in de order te typen (Slop), gebruiken we de **Atomic Handshake**:

### De `order_items` Koppeling
Elke regel in een bestelling wijst voortaan naar een uniek ID in een van de bovenstaande tabellen:

*   **Voice-over besteld?** → `order_items.actor_id` wijst naar `actors.id`.
*   **Workshop gekocht?** → `order_items.workshop_id` wijst naar `workshops.id`.
*   **Korting gebruikt?** → `order_items.coupon_id` wijst naar `coupons.id`.

---

## 3. De "1 Truth" Voordelen

1.  **Geen Typefouten**: Een order kan nooit meer wijzen naar een product dat niet bestaat.
2.  **Real-time Voorraad**: Als je de prijs van een workshop aanpast in de `workshops` tabel, ziet de kassa dat direct (maar de *oude* orders bewaren hun eigen prijs-tijdcapsule).
3.  **Cross-Journey Intelligence**: We kunnen direct zien: *"Klant X heeft 2 stemmen geboekt én 1 workshop gevolgd"*. Dit is het fundament voor de **Customer DNA** van Laya.

---

## 🎭 Sjareltje's Observatie
De `products` tabel is momenteel leeg. Dat is prima voor nu, want de kern van je business (Stemmen en Workshops) staat al in hun eigen gespecialiseerde tabellen. We hoeven ze dus niet te verplaatsen, alleen maar te **linken**.

**Zal ik de nieuwe `orders` tabel zo inrichten dat hij deze 3 bronnen (Actors, Workshops, Products) naadloos kan combineren?** Dan is je kassa klaar voor elke journey. 🚀🤝
