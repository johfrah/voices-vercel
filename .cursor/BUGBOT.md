# 🤖 VOICES BUGBOT PROTOCOL (2026)

Dit bestand bevat de specifieke instructies voor de Cursor Bugbot om Pull Requests te valideren tegen de **Bob-methode** en het **Chris-Protocol**.

## 🏛️ 1. ARCHITECTURAL TRINITY (MANDATORY)
Bugbot MOET elke PR controleren op de aanwezigheid van de Trinity:
- **World Awareness**: Wordt de juiste `world_id` gebruikt? (1: Agency, 2: Studio, 3: Academy, etc.)
- **Market Integrity**: Gebruik UITSLUITEND `market.market_code` voor logica. Geen `host.includes()`.
- **Journey Flow**: Controleer of routes binnen de juiste World/Market context blijven.

## 🛡️ 2. CHRIS-PROTOCOL (TECHNICAL DISCIPLINE)
- **ID-First DNA Routing**: Gebruik uitsluitend UUIDs (`entity_id`) voor interne logica. Slugs zijn alleen voor de URL.
- **Snake Case Exclusivity**: Alle database-objecten en API payloads MOETEN `snake_case` gebruiken.
- **Nuclear Speed**: Zware instrumenten MOETEN `next/dynamic` met `ssr: false` gebruiken.
- **VoiceGlot Integrity**: Hardcoded strings zijn verboden. Gebruik `<VoiceglotText />` of `t()`.

## 🚫 ZERO TOLERANCE (AUTO-REJECT)
- **GEEN** `any` types.
- **GEEN** relatieve imports naar andere packages (`../../packages`). Gebruik `@db`.
- **GEEN** `console.log` in productie-code.
- **GEEN** HTML tags (`div`, `p`) buiten `LayoutInstruments`.

## 🧪 TEST & AUDIT
Bugbot moet controleren of:
- De versie in `package.json` is verhoogd bij wijzigingen.
- Er geen data-drift is tussen Next.js en Supabase.

"Code is ofwel Masterclass, ofwel Slop. Er is geen tussenweg." - Chris
