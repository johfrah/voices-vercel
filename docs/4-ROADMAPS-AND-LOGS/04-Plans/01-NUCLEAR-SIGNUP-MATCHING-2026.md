# ⚡ NUCLEAR SIGNUP MATCHING MANIFEST (2026)

**STATUS:** BATCH 1 CONSOLIDATED (Asset Architecture Verified)
**ARCHITECTUUR:** IAP-Compliance (Rule 320: Asset Architecture)
**DATABASE:** Supabase (Single Source of Truth)
**ID-POLICY:** 6-Digit WooCommerce Product ID (Primary) > Short ID (Fallback)
**SAFETY:** NO-OVERWRITE POLICY (Data Preservation)
**SUFFIX-POLICY:** Eerste talent met een specifieke voornaam krijgt GEEN achternaam-initial suffix (bijv. `sander-A-234808` ipv `sander-g-A-234808`).

---

## 🏗️ 1. DE ARCHITECTUUR VOLGENS PROTOCOL 320
Elke stem krijgt een unieke map in `assets/agency/voices/[land-code]/[taal-code]/[gender]/`.

**Pad Hiërarchie:**
- **Land:** `be`, `nl`, `fr`, `de`, etc.
- **Taal:** `nl`, `en`, `fr`, `de`, etc.
- **Gender:** `male`, `female`.
- **Slug:** `[voornaam]-[initial]-[STATUS]-[ID]/` (Initial is optioneel voor de "eerste" van die naam).

**Inhoud van de Actor Map:**
1.  `demos/`: Bevat alle `.mp3` / `.wav` demo's.
2.  `videos/`: Bevat alle `.mp4` video's.
3.  `[voornaam]-photo.jpg`: De hoofd-profielfoto.
4.  `_private_admin.txt`: De private metadata vault (inclusief Supabase Backup).

---

## 🛡️ 2. SAFETY FIRST: DATA BEHOUD PROTOCOL
1.  **Merge-Only:** Als een doelmap al bestaat, worden nieuwe bestanden **toegevoegd**, nooit overschreven.
2.  **Collision Handling:** Bij identieke namen krijgt het nieuwe bestand een suffix: `[naam]-signup-2026.mp3`.
3.  **No-Delete Policy:** Er worden NOOIT bestanden verwijderd uit de doelmap.

---

## 🚀 3. MASTER MANIFEST (BATCH 1: BE/NL - COMPLETED)

| Talent (Signup) | Land | Taal | Gender | Status | ID | Definitieve Mapnaam |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BE - Sander G - Online | be | nl | male | A | 234808 | `be/nl/male/sander-A-234808/` |
| BE - Berdien - Niet | be | nl | female | C | 187188 | `be/nl/female/berdien-C-187188/` |
| BE - Kirsten L - Online | be | nl | female | A | 207784 | `be/nl/female/kirsten-A-207784/` |
| BE - Sen - Online | be | nl | male | A | 194242 | `be/nl/male/sen-A-194242/` |
| BE - Brecht V - Online | be | nl | male | A | 238957 | `be/nl/male/brecht-A-238957/` |

---

## 📦 4. CONSOLIDATIE STATUS
1.  **Move & Rename:** ✅ Voltooid voor Batch 1.
2.  **Photo Standard:** ✅ Voltooid (`[voornaam]-photo.jpg`).
3.  **Admin File:** ✅ Voltooid (`_private_admin.txt` met Supabase Backup).
4.  **Suffix Cleanup:** ✅ Brecht, Sander en Kirsten zijn de "eersten" en hebben geen suffix meer.

---
**GEAUTORISEERD DOOR:** VOICES ENGINE 2026
**MANDAAT:** NUCLEAR CONSOLIDATION COMPLETED (RULE 320 COMPLIANT)
