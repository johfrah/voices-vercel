# 🛡️ Chris-Protocol: Forensic Doubt Report (v2.4)

Dit rapport bevat alle items uit `order_items` die momenteel **niet gekoppeld** zijn aan een Acteur of een Product-categorie in de V2 architectuur.

## 🎙️ 1. Studio World: Ongekoppelde Workshops & Diensten
Deze items horen bij de **Studio World (World 2)** maar hebben momenteel geen officiële product-koppeling of categorie in de database.

| Item Naam | Aantal | Prijs (gem.) | Product ID | Analyse TD Chris |
| :--- | :--- | :--- | :--- | :--- |
| **Verwen je stem!** | 12 | €249,00 | 263913 | **Studio Workshop.** Moet naar `world_id: 2`. |
| **Voice-over voor audio-descriptie** | 3 | €499,00 | 260265 | **Studio Workshop/Dienst.** Moet naar `world_id: 2`. |
| **Perfectie van intonatie** | 19 | €249,00 | 267781 | **Studio Workshop.** |
| **Perfectie van articulatie** | 13 | €249,00 | 267780 | **Studio Workshop.** |
| **Voice-overs voor beginners** | 20 | €349 - €499 | 260250 | **Studio Workshop.** |
| **Audioboeken inspreken** | 9 | €499,00 | 260273 | **Studio Workshop.** |
| **Documentaires inspreken** | 7 | €499,00 | 260266 | **Studio Workshop.** |
| **Maak je eigen podcast** | 8 | €499,00 | 260274 | **Studio Workshop.** |
| **Maak je eigen radioshow** | 6 | NULL | 260272 | **Studio Workshop.** |
| **Workshop op maat** | 1 | €2994,00 | 272907 | **Studio Workshop.** |

---

## 🎵 2. Music World: Resterende Twijfelgevallen
Items die waarschijnlijk muziek-licenties zijn maar nog niet 100% gematcht.

| Item Naam | Aantal | Prijs (gem.) | Product ID | Analyse |
| :--- | :--- | :--- | :--- | :--- |
| **Summer** | 3 | €257 - €379 | 188956 | Waarschijnlijk **Extended Music License**. |
| **Muziek • Upbeat** | 1 | €5,90 | NULL | **Music.** |

---

## 👤 3. Acteur Handshake: Resterende Mis-matches
Namen die in `order_items` staan maar niet gelinkt zijn aan de `actors` tabel.

| Item Naam | Aantal | Prijs | Product ID | Oplossing |
| :--- | :--- | :--- | :--- | :--- |
| **Yvonne** | 1 | €187,15 | 216126 | Koppelen aan `actor_id` van Yvonne (ID 2809 of 1729). |
| **Christina** | 3 | €89 - €664 | 196832 | Koppelen aan `actor_id: 1717`. |
| **Gwenny** | 2 | €219,05 | 186323 | Koppelen aan `actor_id: 1699`. |
| **Veronique** | 1 | €89,00 | 194251 | Koppelen aan `actor_id: 1730`. |
| **Delphine L** | 1 | €157,45 | 240105 | Koppelen aan `actor_id: 1723`. |

---

## 🗑️ 4. Systeem Slop (Februari/Maart 2026)
Testdata die direct naar Trash mag.

| Item Naam | Aantal | Analyse |
| :--- | :--- | :--- |
| **Product** | 32 | Generieke slop uit de 177-testreeks. |
| **QA test order item** | 1 | Testdata. |
| **SANDBOX STATUS TEST ITEM** | 1 | Testdata. |

---

## 🛡️ Actieplan van TD Chris

1.  **Studio World Injection:** Ik ga alle bovenstaande workshops (Verwen je stem, etc.) toevoegen aan de `products` tabel met `category: 'workshop'` en `world_id: 2`.
2.  **Actor Handshake:** Ik ga de 5 bovenstaande acteurs definitief koppelen aan hun ID's in `order_items`.
3.  **Trash Execution:** De 177-testreeks wordt definitief op `status_id: 10` gezet.

**Certificering:**
*"Met dit rapport maken we de Studio World weer compleet. Geen enkele workshop blijft nog anoniem in de kelder."* - TD Chris
