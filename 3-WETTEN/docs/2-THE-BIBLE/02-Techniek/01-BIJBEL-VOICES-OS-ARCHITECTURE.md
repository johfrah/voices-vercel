# 🚀 BIJBEL: VOICES OS ARCHITECTURE
## *The 100% TypeScript Reality (Zero WordPress)*

```json
{
  "_llm_context": {
    "type": "architecture",
    "version": "2.0.0",
    "protocol": "IAP/ARP-2026",
    "description": "Blueprint for the Native Engine architecture."
  }
}
```

**STATUS:** LOCKED ✅ (Version 2.0.0 - 2026-02-10)

---

## 1. DE STACK (Voices OS Core)

### A. Backend & Data
- **Database**: PostgreSQL (Supabase) - De enige bron van waarheid.
- **ORM**: Drizzle ORM (TypeScript-First).
- **Auth**: NextAuth.js (Native sessies, geen WP cookies).
- **Storage**: Supabase Storage voor alle assets.

### B. Experience Layer (The Heart)
- **Framework**: Next.js (App Router).
- **Styling**: Tailwind CSS + Design Tokens.
- **State**: React Context (Checkout, User).
- **Instruments**: Modulaire UI componenten uit `components/ui/`.

---

## 2. NATIVE JOURNEY PROTOCOL

Elke journey (Agency, Studio, Academy, Artists, Meditation) is een native onderdeel van de Engine.

1. **Unified Foundation**: Alle data is relationeel gekoppeld in de Unified Database.
2. **Experience Layer**: 100% Next.js frontend voor alle domeinen.
3. **Engine Router**: Een ultra-light PHP router die domeinen koppelt aan de juiste Next.js apps.
4. **Zero CMS**: Content wordt beheerd via Markdown (Gouden Bron) of direct in de database.

---

## 3. DATA PURITY & INTEGRITY
- **Legacy Mapping**: Oude WordPress ID's zijn bewaard als `wp_id` voor historische referentie, maar worden niet meer gebruikt voor actieve logica.
- **Assets**: Alle media is geregistreerd in de `media` tabel en fysiek opgeslagen in de geconsolideerde `/assets/` structuur.

---
**ULTIEME WET:** Voices OS is een levend instrument, geen statisch systeem. De machine is vrij.
