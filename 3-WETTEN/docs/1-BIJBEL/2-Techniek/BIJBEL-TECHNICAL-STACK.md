# 🏗️ BIJBEL: TECHNICAL STACK
## *Architectural Blueprint for the Headless Ecosystem*

```json
{
  "_llm_context": {
    "type": "technical",
    "version": "1.0.0",
    "protocol": "IAP/ARP-2026",
    "description": "Technical architecture and data purity standards."
  }
}
```

**STATUS:** LOCKED ✅ (Version 1.0.0 - 2026-02-07)

---

## 1. DE ARCHITECTUUR (The Unified Engine)

### A. Data Engine (Supabase / PostgreSQL)
- **Rol**: De enige Source of Truth (SSoT).
- **Verantwoordelijkheid**: Beheer van content, orders, gebruikers, assets en logica via Drizzle ORM.
- **API**: Server-side fetching en Server Actions. Geen legacy PHP/MySQL afhankelijkheden.

### B. Experience Layer (Next.js / TypeScript)
- **Rol**: De frontend die de gebruiker aanraakt.
- **Verantwoordelijkheid**: UI/UX, State management, Spatial Transitions en Sonic DNA.
- **Techniek**: App Router, Server Components, Tailwind CSS, LayoutInstruments.

---

## 2. HET PROTOCOL (IAP/ARP-2026)

### A. Intelligent Architecture Protocol (IAP)
- Elke request wordt verrijkt met context: `Market`, `Journey`, `Intent`, `Persona`.
- Gebruik de `Predictive Router` om de gebruiker naar de juiste "Pretty Intent URL" te leiden.

### B. AI Readability Protocol (ARP)
- Elke pagina injecteert een `_llm_context` JSON-LD blok.
- Voicy heeft direct toegang tot de Bijbel MD-bestanden voor context-bewuste antwoorden.

---

## 3. DATA PURITY & INTEGRITY (The Guarantee)

Tijdens de transitie naar Voices OS gelden de volgende wetten:
1. **Zero Data Loss**: Elke order, meta-key en asset blijft 100% gelinkt.
2. **Parallel Sync**: De nieuwe PostgreSQL database draait in schaduw-modus naast de Combell MySQL database.
3. **Atomic Validation**: Geen migratie zonder succesvolle validatie van de data-integriteit.

---

## 4. CORE ENGINES
- **VoicesCockpit**: De configuratie-gestuurde UI engine.
- **Voiceglot 2.0**: Het vertaalsysteem met Dutch als bron.
- **Master Door**: De centrale router die domeinen en sidecars valideert.

---
**ULTIEME WET:** De techniek ademt in functie van de ervaring.
