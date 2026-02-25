# 🏗️ Voices.be Technical Architecture

> **Document Status:** Living Document
> **Last Updated:** Feb 2026
> **Context:** Technical Overview for Developers & Auditors
> **Gouden Standaard:** Gebaseerd op `VOICES-2-0-ROUTING-BLUEPRINT.md`

## 1. High-Level Overview: De Freedom Machine
Voices.be is geëvolueerd van een monolithische WordPress site naar een **Intelligent Sidecar Ecosysteem**. De kern is een "Intelligence Engine" (WordPress/Database) die een vloot van gespecialiseerde, ontkoppelde frontends (Sidecars) aanstuurt.

**Kernkenmerken:**
- **Engine:** WordPress + WooCommerce als data- en business logic bron.
- **Routing:** Master Door (`mu-plugin`) beslist over Sidecar vs. WordPress mode.
- **Context-Aware:** Volledige implementatie van de IAP Vier-Eenheid (Market, Journey, Usage, Intent).
- **Decoupled:** Sidecars draaien onafhankelijk van het WordPress thema.
- **AI-Ready:** ARP (AI Readability Protocol) geïntegreerd in elke route.

---

## 2. De Master Door & Routing
De routing vindt plaats op het allerhoogste niveau via `wp-content/mu-plugins/00-voices-master-door.php`.

### 2.1. Beslisboom
1. **Sidecar Match:** Indien het domein of de route in de `VoicesRegistry` staat als sidecar, serveert de Master Door direct de assets/HTML en stopt de executie (`exit;`).
2. **WordPress Match:** Indien geen sidecar match, wordt de markt-context gezet en laadt WordPress het thema.

### 2.2. De Stofzuiger (ob_clean)
Bij sidecar-serving wordt `ob_clean()` gebruikt om alle PHP-ruis (notices, banners) te verwijderen, wat 100% zuivere assets garandeert.

---

## 3. Module Architectuur (Bootstrap Pattern)
Nieuwe modules volgen strikt het **Bootstrap Pattern** voor isolatie en voorspelbaarheid.

- **Explicit Loading:** Een module heeft één `bootstrap.php`.
- **Autoloader Bypass:** De thema-autoloader stopt bij het vinden van een `bootstrap.php`.
- **Isolation:** Voorkomt "Magic Loading" conflicten en side-effects.

---

## 4. IAP & State Management
De staat van de applicatie wordt beheerd via `VoicesState.js` en `VoicesPreferences`.

- **Single Source of Truth:** `voices_preferences` JSON-key in de database.
- **Sticky Sync:** Automatische synchronisatie tussen `localStorage` (gasten) en User Meta (ingelogd).
- **Market-Aware API:** De REST API filtert data op basis van de markt-context die door de Master Door is gezet.

---

## 5. Security & Hardening
- **The Gate:** Harde validatie van Host/Origin tegen de Registry.
- **Capability URLs:** Beveiligde, hash-gebaseerde toegang tot klantprojecten.
- **CORS:** Strikte scheiding tussen Asset-toegang (*) en API-toegang (allowlist).

---
**REFERENTIE:** Raadpleeg ALTIJD `3-CURSOR-ONLY/docs/4-ROADMAPS-AND-LOGS/04-Plans/` voor de volledige technische specificaties en schema's.
