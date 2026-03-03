# SUZY Improvement Report 2026
**Agent:** Suzy (SEO, JSON-LD Schemas, Knowledge Graph)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from application/ld+json usage across pages.

### P0 (CRITICAL – Schema Completeness)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **VoiceActor schema mist offers/price** | `VoiceDetailClient.tsx` | Person schema heeft geen `offers` of `priceRange` – commercieel intent niet gestructureerd voor LLM |
| 2 | **Course/Lesson schema incomplete** | `academy/lesson/[id]/page.tsx` | Heeft JSON-LD maar mogelijk mist `educationalLevel`, `teaches`, `hasCourseInstance` |
| 3 | **Article schema mist image** | `article/[slug]/page.tsx` | `Article` heeft geen `image` property – featured image niet in Schema |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Duplicate/conflicting JSON-LD** | `article/[slug]/page.tsx` | Twee script tags: Article + `article.meta?.llm_context` –后者 kan ongevalideerde data zijn |
| 2 | **global-error.json schematype** | `global-error.tsx` | ErrorPage schema – check of @type correct is voor foutpagina's |
| 3 | **VoicyBridge document.querySelector** | `VoicyBridge.tsx` L67 | Lees JSON-LD van DOM – fragile; beter: props of context doorgeven |

---

## 3 Masterclass Improvements (Concrete)

### 1. **VoiceActor Schema Commerce Extension**
- **Actie:** Voeg aan `VoiceDetailClient.tsx` Person schema toe: `"jobTitle": "Voice-over Artist"`, `"offers": { "@type": "Offer", "priceCurrency": "EUR", ... }` of link naar `tarieven` met `url`. Gebruik `knowsAbout` voor talen/sectoren.
- **Bestand:** `1-SITE/apps/web/src/app/voice/[slug]/VoiceDetailClient.tsx`.
- **Impact:** LLM's kunnen commercial intent begrijpen; Zero-Click Answer potentie.

### 2. **Article Schema Image Injection**
- **Actie:** Als `article.featuredImageId` of `article.image` bestaat, voeg `"image": { "@type": "ImageObject", "url": "..." }` toe aan Article JSON-LD in `article/[slug]/page.tsx`. Integreer met Louis' `getArticle` + `featuredImageId` fix.
- **Bestanden:** `article/[slug]/page.tsx`, `lib/api-server` getArticle.
- **Impact:** Rich snippets voor artikelen; visuele autoriteit.

### 3. **Centralized Schema Factory**
- **Actie:** Creëer `lib/schema/` met `createPersonSchema()`, `createArticleSchema()`, `createCourseSchema()` – herbruikbaar. Verminder copy-paste JSON-LD in components.
- **Impact:** Consistente Schema-structuur; Suzy kan één plek beheren voor Schema-wijzigingen.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/app/voice/[slug]/VoiceDetailClient.tsx` – Person/offers
2. `1-SITE/apps/web/src/app/article/[slug]/page.tsx` – Article image, llm_context script
3. `1-SITE/apps/web/src/app/academy/lesson/[id]/page.tsx` – Course schema
4. `1-SITE/apps/web/src/components/ui/VoicyBridge.tsx` – querySelector dependency
