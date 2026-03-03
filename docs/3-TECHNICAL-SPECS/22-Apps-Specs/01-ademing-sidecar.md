# 🧘 ADEMING SIDECAR PROTOCOL (IAP GODMODE)

**Status:** Initializing  
**Location:** `functions/v2/50-apps/ademing/`  
**Database:** `wp_voices_ademing_tracks` (Isolated)  
**Frontend:** `ademing.be` (Headless React)

---

## 1. HET DOEL
Het creëren van een onverwoestbare, intelligente backend voor de Ademing-app binnen het Voices-ecosysteem, zonder de core van Voices te belasten of te verstoren tijdens de lopende refactor.

## 2. ARCHITECTUUR (THE SIDECAR)
We gebruiken het **Sidecar Pattern**. Ademing draait mee op de Voices-engine (Payments, Auth), maar heeft zijn eigen "cabine" voor data en logica.

### A. Isolatie-garantie
- **Code:** Alles leeft in `functions/v2/50-apps/ademing/`. Geen wijzigingen in `functions.php` of core mappen.
- **Data:** Eigen database tabel `wp_voices_ademing_tracks`. Geen afhankelijkheid van `wp_posts`.
- **API:** Eigen namespace `voices/v2/ademing/`.

### B. IAP Godmode Features
- **Context-Aware:** De API geeft `data-voices-context` mee voor AI-readiness.
- **Zero-CSS Admin:** Beheer via `VoicesCockpit` met gestandaardiseerde design tokens.
- **Unified Commerce:** Sales vloeien direct in het Voices Dashboard (Excl. BTW).

---

## 3. DATA SCHEMA (`wp_voices_ademing_tracks`)
| Veld | Type | Omschrijving |
| :--- | :--- | :--- |
| `id` | BIGINT | Primary Key |
| `title` | VARCHAR | Titel van de meditatie |
| `slug` | VARCHAR | Unieke URL slug |
| `audio_url` | TEXT | Link naar audio (CDN) |
| `cover_url` | TEXT | Link naar cover image |
| `theme` | VARCHAR | rust, energie, ritme |
| `element` | VARCHAR | aarde, water, lucht, vuur |
| `maker` | VARCHAR | Julie, Johfrah |
| `duration_sec`| INT | Lengte in seconden |
| `is_premium` | BOOL | Toegang beperkt tot abonnees |
| `iap_context` | JSON | AI/LLM context laag |

---

## 4. DE "VOICES BRIDGE" (INTEGRATIE)
1. **Auth:** De React-app logt in via Voices (JWT).
2. **Payments:** De app start een checkout op `voices.be/checkout/ademing/`.
3. **Access:** Voices checkt WooCommerce abonnementen en zet `has_access` in de API response.

---

## 5. TODO / ROADMAP
- [ ] [STEP 1] Database tabel aanmaken via `10-database.php`.
- [ ] [STEP 2] Headless API bouwen in `20-api.php`.
- [ ] [STEP 3] VoicesCockpit beheerpagina maken in `30-cockpit.php`.
- [ ] [STEP 4] WooCommerce/Mollie bridge in `40-commerce.php`.
- [ ] [STEP 5] Frontend koppelen aan de nieuwe Voices API.

---
**ULTIEME WET:** Ademing is de serene schil, Voices is de krachtige motor. Samen vormen ze een onverslaanbare vrijheidsmachine.
