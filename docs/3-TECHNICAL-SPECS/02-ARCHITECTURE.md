# 🏗️ Voices.be Technical Architecture (2026)

> **Document Status:** Masterclass ✅
> **Last Updated:** March 2026
> **Context:** Technical Overview for Developers & AI Agents
> **Gouden Standaard:** Bob-methode & Chris-Protocol

## 1. High-Level Overview: De Unified Engine
Voices.be is volledig getransformeerd van een WordPress-monoliet naar een **Unified Headless Ecosysteem**. De kern is een intelligente data-laag (Supabase/PostgreSQL) die een Next.js frontend aanstuurt.

**Kernkenmerken:**
- **Engine:** Next.js (App Router) als de enige applicatie-motor.
- **Data:** Supabase (PostgreSQL + Auth + Storage) als de enige Source of Truth.
- **Routing:** Smart Router (`[...slug]/page.tsx`) gekoppeld aan de `slug_registry`.
- **Context-Aware:** Volledige implementatie van de IAP Vier-Eenheid (Market, Journey, Usage, Intent).
- **HTML Zero:** Gebruik van `LayoutInstruments` in plaats van rauwe HTML-tags.
- **AI-Ready:** ARP (AI Readability Protocol) geïntegreerd via `_llm_context` JSON-LD.

---

## 2. Routing & Middleware
De routing vindt plaats op applicatie-niveau via de Next.js Middleware en de Smart Router.

### 2.1. Middleware (`middleware.ts`)
1. **Market Detection:** Bepaalt de markt (BE, NL, FR, etc.) op basis van de hostname.
2. **Security:** Valideert sessies en dwingt HTTPS af.
3. **Context Injection:** Voegt markt-specifieke headers toe aan de request.

### 2.2. Smart Router (`[...slug]/page.tsx`)
De Smart Router is het hart van de navigatie:
1. **Registry Lookup:** Zoekt de slug op in de `slug_registry` tabel.
2. **Entity Resolution:** Bepaalt de `entity_id`, `world_id` en `routing_type`.
3. **Instrument Rendering:** Rendert de pagina via de `InstrumentRenderer` (Soft Entities) of specifieke Blueprints (Hard Entities).

---

## 3. Component Architectuur (LayoutInstruments)
Nieuwe modules volgen strikt het **LayoutInstrument Pattern** voor consistentie en discipline.

- **Import Mandate:** Alle UI bouwstenen komen uit `@/components/ui/LayoutInstruments`.
- **No Raw HTML:** Gebruik van `div`, `span`, `p`, etc. is verboden.
- **Styling:** Uitsluitend via Tailwind CSS classes op de instrumenten.

---

## 4. IAP & State Management
De staat van de applicatie wordt beheerd via React Context en Supabase Real-time.

- **VoicesMasterControlContext:** Beheert de globale IAP-context (Market, World, Journey).
- **CheckoutContext:** Beheert de ID-First configuratie van bestellingen.
- **AuthContext:** Beheert de gebruikerssessie via Supabase Auth.

---

## 5. Security & Hardening
- **ID-First Handshake:** Interne logica gebruikt uitsluitend UUID's, nooit slugs.
- **Nuclear Locks:** Kritieke database velden zijn gelockt tegen AI-overschrijving via `is_manually_edited`.
- **CORS & CSP:** Strikte beveiliging van API-endpoints en assets.

---

**REFERENTIE:** Raadpleeg ALTIJD `.cursor/rules/` voor de actuele wetten en instrumenten.
