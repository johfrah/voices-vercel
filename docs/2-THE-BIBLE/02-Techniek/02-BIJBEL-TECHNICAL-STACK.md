# 🏗️ BIJBEL: TECHNICAL STACK
## *Architectural Blueprint for the Native Engine*

```json
{
  "_llm_context": {
    "type": "technical",
    "version": "2.0.0",
    "protocol": "IAP/ARP-2026",
    "description": "Technical architecture and data purity standards for the Native Engine."
  }
}
```

**STATUS:** LOCKED ✅ (Version 2.0.0 - 2026-02-10)

---

## 1. DE ARCHITECTUUR (Unified Native Engine)

### A. Data Engine (Supabase / PostgreSQL)
- **Rol**: De enige bron van waarheid (SSoT).
- **Verantwoordelijkheid**: Beheer van content, orders, gebruikers, actors en assets.
- **ORM**: Drizzle ORM voor type-safe data access.

### B. Experience Layer (Next.js / TypeScript)
- **Rol**: De frontend die de gebruiker aanraakt.
- **Verantwoordelijkheid**: UI/UX, State management, Spatial Transitions en Sonic DNA.
- **Techniek**: App Router, Server Components, Tailwind CSS.

---

## 2. HET PROTOCOL (IAP/ARP-2026)

### A. Intelligent Architecture Protocol (IAP)
- Elke request wordt verrijkt met context: `Market`, `Journey`, `Intent`, `Persona`.
- De `Engine Router` (PHP) verdeelt het verkeer op basis van domein en route.

### B. AI Readability Protocol (ARP)
- Elke pagina injecteert een `_llm_context` JSON-LD blok.
- Voicy heeft direct toegang tot de Bijbel MD-bestanden voor context-bewuste antwoorden.

---

## 3. DATA PURITY & INTEGRITY (The Guarantee)

1. **Zero WordPress**: Geen afhankelijkheid van WordPress tabellen of cookies.
2. **Atomic Validation**: Elke wijziging wordt getoetst aan de Unified Database schema's.
3. **Nuclear Autonomy**: De machine opereert zelfstandig zonder legacy ballast.

---

## 4. CORE ENGINES
- **Voices Engine**: De centrale TypeScript motor.
- **Voiceglot 2.0**: Het native vertaalsysteem.
- **Engine Router**: De centrale PHP hub voor domein-distributie.

---
**ULTIEME WET:** De techniek ademt in functie van de ervaring. WordPress bestaat niet meer.
