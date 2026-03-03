# 🗄️ THE MASTER ENCYCLOPEDIA: VOICES DATABASE SCHEMA (2026)

Dit document is de absolute "Source of Truth" voor de data-architectuur van Voices.be. Het bevat de kern-tabellen en relaties die het Unified Headless platform aandrijven.

---

## 🏗️ 1. DATABASE ARCHITECTUUR (Supabase PostgreSQL)

De database is opgebouwd uit een relationeel model dat de IAP Vier-Eenheid ondersteunt.

### 🎙️ Core Entities
Dit zijn de primaire data-bronnen voor de journeys.

| Tabelnaam | Doel | Kernvelden |
| :--- | :--- | :--- |
| `actors` | Centraal stemacteurs beheer. | `id`, `first_name`, `last_name`, `email`, `gender`, `native_lang`, `voice_score`, `status`. |
| `actor_demos` | Audio demo's per stemacteur. | `id`, `actor_id`, `name`, `url`, `type`, `menu_order`. |
| `slug_registry` | De centrale router registry. | `id`, `slug`, `entity_id`, `routing_type`, `world_id`, `market_id`. |
| `content_articles` | CMS content voor alle pagina's. | `id`, `title`, `slug`, `world_id`, `journey_id`, `status`. |
| `content_blocks` | Modulaire bouwstenen voor artikelen. | `id`, `article_id`, `type`, `content` (JSONB), `order`. |

### 🛒 Commerce & Orders
Beheer van transacties en klant-DNA.

| Tabelnaam | Doel | Kernvelden |
| :--- | :--- | :--- |
| `orders` | Alle transacties en briefings. | `id`, `user_id`, `status`, `total_amount`, `iap_context` (JSONB). |
| `order_items` | Individuele regels per order. | `id`, `order_id`, `entity_id`, `usage_id`, `media_id`, `amount`. |
| `users` | Geünificeerd gebruikersbeheer. | `id`, `email`, `first_name`, `last_name`, `customer_insights` (JSONB). |

### 🌐 Intelligence & Localization
Het brein van de machine.

| Tabelnaam | Doel | Kernvelden |
| :--- | :--- | :--- |
| `translations` | Voiceglot vertalingen. | `id`, `translation_key`, `lang`, `translated_text`, `is_manually_edited`. |
| `system_events` | Forensic logs en auditing. | `id`, `event_type`, `severity`, `payload` (JSONB), `created_at`. |
| `market_configs` | Markt-specifieke instellingen. | `id`, `market_code`, `domain`, `config` (JSONB). |

---

## 🗺️ 2. MAPPING PROTOCOL (ID-FIRST)

1.  **UUID Mandate**: Gebruik ALTIJD de `id` (UUID) voor alle interne relaties en API-calls.
2.  **Slug Resolution**: Slugs worden uitsluitend gebruikt voor de URL-opbouw en worden direct geresolveerd via de `slug_registry`.
3.  **JSONB Flexibility**: Gebruik JSONB velden (`iap_context`, `customer_insights`) voor extensibele metadata zonder schema-drift.
4.  **Nuclear Lock**: Velden met `is_manually_edited: true` mogen NOOIT door automatische processen worden overschreven.

---

**ULTIEME WET:** Dit document reflecteert de werkelijkheid van de Supabase database. Bij afwijkingen is de live database leidend en moet dit document direct worden gecorrigeerd.
