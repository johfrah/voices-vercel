# 🚀 Masterclass Test Flow (Nuclear 2026)

Dit document beschrijft de onwrikbare test-architectuur van **Voices**, ontworpen om 'Slop' te elimineren en 100% Masterclass kwaliteit te garanderen.

## 🛡️ De 3 Lagen van Verificatie

### 1. Forensic Audit (Chris-Protocol)
Een statische analyse die de codebase scant op protocol-schendingen.
- **Wat het checkt**: Hardcoded contactgegevens, rauwe HTML (ipv LayoutInstruments), ontbrekende `ssr: false` op zware componenten, en non-ISO taalcodes.
- **Commando**: `npm run audit:forensic`
- **Doel**: Voorkomen dat systeem-fouten de productie bereiken.

### 2. Unit Tests (Kelly's Brain)
Grondige tests voor kritieke business logica via **Vitest**.
- **Wat het checkt**: De `SlimmeKassa` (prijsberekeningen), `MarketManager` (markt-logica), en data-transformaties.
- **Commando**: `npm run test:unit`
- **Doel**: 100% nauwkeurigheid in transacties en prijsopbouw.

### 3. Journey Tests (Moby's Regie)
End-to-end integratie tests via **Playwright**.
- **Wat het checkt**: De volledige 'Agency Journey', 'Artist Portfolio Journey', en 'Checkout Flow'.
- **Commando**: `npm run test:e2e` (Lokaal vereist: `npx playwright install`)
- **Doel**: Garanderen dat de bezoeker een vlekkeloze ervaring heeft over alle devices.

---

## 🛠️ Hoe te gebruiken

### Voor elke Push
Draai de volledige suite om zeker te zijn van Masterclass kwaliteit:
```bash
npm run test:all
```

### Bij Prijsaanpassingen
Draai specifiek de unit tests voor de SlimmeKassa:
```bash
npx vitest run src/lib/pricing-engine.test.ts
```

### Bij UI Wijzigingen
Draai de forensic audit om te checken of je geen rauwe HTML hebt geïntroduceerd:
```bash
npm run audit:forensic
```

---

## 📊 Status Dashboard (2026-02-22)

| Test Type | Status | Dekking |
| :--- | :--- | :--- |
| **Forensic Audit** | ⚠️ FAILED | 100% van `src/` (8000+ issues gevonden) |
| **Unit Tests** | ✅ PASSED | `SlimmeKassa` core logic |
| **E2E Tests** | ⏳ PENDING | Playwright setup gereed |

**Chris-Protocol Veto**: De Forensic Audit faalt momenteel op duizenden punten (voornamelijk hardcoded strings en rauwe HTML). Dit is de "Nuclear Debt" die we systematisch moeten wegwerken.

"Beter een eerlijke fout in de test dan een verborgen fout in productie." - Chris/Autist
