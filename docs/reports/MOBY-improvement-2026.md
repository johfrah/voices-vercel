# MOBY Improvement Report 2026
**Agent:** Moby (Mobile-First UX, Thumb-Zone, Speed)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from component structure, `MobileFloatingDock`, skeletons, and form patterns.

### P0 (CRITICAL – Mobile Experience)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **MobileFloatingDock search input niet FormInstrument** | `MobileFloatingDock.tsx` L61–69 | Raw `<form>` en `<input>` – moet `FormInstrument` + `InputInstrument` gebruiken voor consistency en Sonic DNA |
| 2 | **Skeleton adoption beperkt** | `VoiceGridSkeleton.tsx` exists; weinig consumer usage | Grep: `VoiceGridSkeleton`/`VoiceCardSkeleton` alleen in eigen file – voice grid/agency page gebruikt waarschijnlijk geen deterministic skeletons → layout shift risk |
| 3 | **Thumb-Zone op desktop leeg** | `MobileFloatingDock` is `md:hidden` | Op desktop geen equivalent floating dock; account/cart/zoeken zitten in header – conform, maar geen expliciete thumb-zone audit |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **WorkshopInterestForm: raw `<button>` + uppercase** | `WorkshopInterestForm.tsx` L229–241 | `<button>` i.p.v. `ButtonInstrument`; `defaultText="VORIGE"`, `"VERWERKEN..."`, `"INSCHRIJVING VOLTOOIEN"` – Natural Capitalization breach |
| 2 | **CheckoutForm: div wrapper i.p.v. FormInstrument** | `CheckoutForm.tsx` L431 | `<div className="pt-4">` rond CTA; form structuur kan verbeterd met `FormInstrument` |
| 3 | **Voice detail / artist pages: geen skeleton** | `VoiceDetailClient.tsx`, `ArtistDetailClient.tsx` | Bij lazy load of slow network: geen deterministic skeleton → CLS |

---

## 3 Masterclass Improvements (Concrete)

### 1. **Voice Grid Skeleton Integration**
- **Actie:** Gebruik `VoiceGridSkeleton` in `agency/page.tsx`, `search/page.tsx` en voice-listing componenten tijdens data fetch.
- **Bestanden:** `1-SITE/apps/web/src/app/agency/page.tsx`, `1-SITE/apps/web/src/app/search/page.tsx`, VoicePageClient/agency client.
- **Impact:** 100ms LCP compliance; zero layout shift bij load (Chris-Protocol Deterministic Skeletons).

### 2. **MobileFloatingDock Instrument-Compliance**
- **Actie:** Vervang `<form>` en `<input>` in `MobileFloatingDock.tsx` door `FormInstrument` + `InputInstrument`. Behoud `autoFocus` en placeholder. Voeg `useSonicDNA().playClick` toe bij submit.
- **Bestand:** `1-SITE/apps/web/src/components/ui/MobileFloatingDock.tsx`
- **Impact:** Consistente UX; Instrumenten Mandate compliant.

### 3. **WorkshopInterestForm Button Instrument + Natural Cap**
- **Actie:** Vervang `<button>` door `ButtonInstrument`. Wijzig Voiceglot defaultText: "Vorige", "Verwerken...", "Inschrijving voltooien" (Natural Capitalization).
- **Bestand:** `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx`
- **Impact:** Zero-Slop UI; Moby + Chris alignment.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/components/ui/MobileFloatingDock.tsx` – form/input instruments
2. `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx` – button + copy
3. `1-SITE/apps/web/src/app/agency/page.tsx` – VoiceGridSkeleton
4. `1-SITE/apps/web/src/app/voice/[slug]/VoiceDetailClient.tsx` – skeleton during load
