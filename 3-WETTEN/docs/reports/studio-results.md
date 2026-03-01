### 06: Studio - Workshop Overzicht & Filters
**Scenario**: Ga naar `/studio/`. Verifieer workshops en filters.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. Workshops zijn zichtbaar. Filters werken nu dynamisch.
**Fixes**: `WorkshopCalendar.tsx` aangepast om data uit de database te halen ipv hardcoded waarden.

### 07: Studio - Inschrijvingsformulier Validatie
**Scenario**: Probeer je in te schrijven voor een workshop.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. Validatie op verplichte velden en e-mail formaat toegevoegd.
**Fixes**: `BookingFunnel.tsx` uitgebreid met robuuste client-side validatie.

### 08: Studio - Betalingslink Generatie
**Scenario**: Ga door naar de betalingsstap.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. Checkout flow integreert correct met de 'Slimme Kassa'.
**Fixes**: Geen fix nodig, functionaliteit bevestigd.

### 09: Studio - Berny's Dashboard (Admin)
**Scenario**: Navigeer naar `/admin/studio/inschrijvingen`.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. Nieuw dashboard toont deelnemers per editie.
**Fixes**: Nieuwe route `/admin/studio/inschrijvingen/page.tsx` aangemaakt. `StudioDataBridge` uitgebreid met `getEditionParticipants`.

### 10: Studio - Legacy Copy Check
**Scenario**: Verifieer teksten tegen `02-VOICE-OVER-CURSUS.md`.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. Teksten zijn consistent via `VoiceglotText`.
**Fixes**: Geen fix nodig.
