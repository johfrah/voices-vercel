# LOUIS Improvement Report 2026
**Agent:** Louis (Visual Authenticity, Photo-Matcher, Real vs Stock)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from `3-WETTEN/docs/PHOTO-MATCHER-AUDIT-2026.md` and grayscale/placeholder grep.

### P0 (CRITICAL – Louis Mandate)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Placeholder-artist.jpg in VoiceDetailClient** | `VoiceDetailClient.tsx` | `PHOTO-MATCHER-AUDIT`: Actor photos fallback naar `/placeholder-artist.jpg` – moet `actor.photoId` → `media.filePath` resolven bij ontbrekende dropboxUrl |
| 2 | **mic-placeholder.png in PricingSummary** | Checkout flow | Audit: Replace met echte actor photo wanneer available |
| 3 | **Gemini analyzeImage mist authenticity** | `GeminiService.ts` | Output heeft geen `authenticity` (real/stock/ai_generated) – Louis mandate: altijd echte foto's prefereren |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Studio placeholder.jpg** | `WorkshopContent.tsx` | `/assets/studio/placeholder.jpg` – link naar workshop.mediaId of instructor.photoId |
| 2 | **contentArticles.featuredImageId niet gejoin'd** | `getArticle` | Articles zonder hero image; geen join met media voor featuredImageId |
| 3 | **Grayscale in Portfolio (Johfrah)** | `portfolio/johfrah/page.tsx`, studio pages | Johfrah Mandate: no grayscale – zie LAYA report voor overlap |

---

## 3 Masterclass Improvements (Concrete)

### 1. **Photo Resolution: photoId over dropboxUrl**
- **Actie:** In `VoiceDetailClient`, `PricingSummary`, `DynamicActorFeed`, `VoiceCard`: als `actor.dropboxUrl` leeg is en `actor.photoId` bestaat, resolve via `media.filePath` (API of server component). Gebruik die URL i.p.v. placeholder.
- **Bestanden:** `VoiceDetailClient.tsx`, `PricingSummary.tsx`, `DynamicActorFeed.tsx`, `VoiceCard.tsx`.
- **Impact:** Placeholder-slop eliminatie; echte faces in checkout en casting.

### 2. **Gemini analyzeImage Authenticity Field**
- **Actie:** Breid `GeminiService.analyzeImage` prompt uit om `authenticity: "real" | "stock" | "ai_generated" | "unknown"` te returnen. Toon in Photo-Matcher UI een badge voor review.
- **Bestand:** `1-SITE/apps/web/src/services/GeminiService.ts`.
- **Impact:** Louis kan stock/AI flaggen; bewuste keuze voor echte foto's.

### 3. **getArticle featuredImageId Join**
- **Actie:** In `getArticle` (api-server of lib): join `contentArticles.featuredImageId` met `media`. Return `article.featuredImageUrl` of `article.image`. Gebruik in article page hero.
- **Bestanden:** `lib/api-server` of article fetch, `article/[slug]/page.tsx`.
- **Impact:** Articles krijgen echte hero images; minder placeholder content.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/app/voice/[slug]/VoiceDetailClient.tsx` – photo resolution
2. `1-SITE/apps/web/src/components/checkout/PricingSummary.tsx` – mic-placeholder
3. `1-SITE/apps/web/src/services/GeminiService.ts` – authenticity
4. `1-SITE/apps/web/src/lib/api-server` (of getArticle) – featuredImageId
