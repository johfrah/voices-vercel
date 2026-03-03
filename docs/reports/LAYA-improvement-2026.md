# LAYA Improvement Report 2026
**Agent:** Laya (Aesthetic DNA, Liquid Backgrounds, Journey Consistency)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from LiquidBackground usage, grayscale usage, and page structure.

### P0 (CRITICAL – Journey DNA)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **LiquidBackground ontbreekt op veel routes** | Agency mandate: "Elke pagina moet LiquidBackground gebruiken" | Grep: LiquidBackground in 17 page files. Er zijn 93 page.tsx files – grote meerderheid mist Liquid DNA |
| 2 | **Grayscale op foto's in Johfrah/Portfolio journey** | `portfolio/johfrah/page.tsx`, `studio/` pages, `ademing/page.tsx` | Johfrah Portfolio Mandate: "Gebruik NOOIT grayscale filters op foto's" – 10+ files met `grayscale` / `grayscale-0` |
| 3 | **Agency journey pagina's zonder LiquidBackground** | `agency/_[slug]/page.tsx`, `agency/music/page.tsx`, `voice/[slug]`, `faq`, `contact`, `checkout`, `artist`, `ivr`, `tarieven`, etc. | Alleen `agency/page.tsx` en `agency/voice-overs/[[...slug]]` hebben LiquidBackground |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Inconsistent rounded corners** | Diverse componenten | Ademing: max `rounded-[20px]` containers, `rounded-[10px]` buttons; sommige legacy `rounded-[60px]` tot `rounded-[100px]` nog aanwezig |
| 2 | **font-black in Portfolio journey** | `portfolio/johfrah/page.tsx` L93 | "tracking-[0.2em] text-va-black/30 ... font-black" – Johfrah: `font-light` of `font-extralight` voor elegante uitstraling |

---

## 3 Masterclass Improvements (Concrete)

### 1. **LiquidBackground Rollout – High-Traffic Pages**
- **Actie:** Voeg `LiquidBackground` toe aan: `voice/[slug]`, `contact`, `faq`, `tarieven`, `checkout`, `artist`, `artist/[slug]`, `ivr`, `academy/lesson/[id]`.
- **Bestanden:** Alle genoemde `page.tsx` files.
- **Impact:** Visuele continuïteit met homepage; Agency Design Mandate compliance.

### 2. **Grayscale Removal – Portfolio & Studio**
- **Actie:** Verwijder `grayscale` en `grayscale-[0.5]` van alle images in `portfolio/johfrah/*`, `studio/*`, `ademing/page.tsx`. Behoud eventueel hover `grayscale-0` alleen waar expliciet door design gewenst (niet in Portfolio).
- **Bestanden:** `portfolio/johfrah/page.tsx`, `studio/page.tsx`, `studio/over-ons/page.tsx`, `studio/instructeurs/page.tsx`, `WorkshopContent.tsx`, `ademing/page.tsx`, `DynamicActorFeed.tsx`, `WorkshopProgram.tsx`.
- **Impact:** Johfrah Portfolio Mandate: natuurlijke kleuren, geen grayscale.

### 3. **Journey DNA Audit Matrix**
- **Actie:** Creëer `3-WETTEN/docs/LAYOUT-JOURNEY-MATRIX.md`: per route, welke DNA (Agency/Artist/Portfolio/Ademing), LiquidBackground Y/N, grayscale Y/N, font-weight voor koppen.
- **Impact:** Laya kan systematisch consistency afdwingen.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/app/voice/[slug]/page.tsx` – LiquidBackground
2. `1-SITE/apps/web/src/app/contact/page.tsx` – LiquidBackground
3. `1-SITE/apps/web/src/app/portfolio/johfrah/page.tsx` – grayscale, font-black
4. `1-SITE/apps/web/src/app/studio/over-ons/page.tsx` – grayscale
5. `1-SITE/apps/web/src/app/ademing/page.tsx` – grayscale
