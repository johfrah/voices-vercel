# 📸 Photo-Matcher Audit Report 2026 (Louis)

**Auditor:** Louis (Photographer & Visual Asset Manager)  
**Date:** 13 February 2026  
**Scope:** API routes, GeminiService, database schema, placeholder usage, asset flow

---

## Executive Summary

The Photo-Matcher system is a well-architected admin tool for matching orphaned legacy photos to actors and moving them into the `media` table. However, it lacks **authenticity detection** (AI/stock vs real), has no integration with `contentArticles.featuredImageId`, and several frontend components still rely on generic placeholders instead of real actor or content images.

---

## 1. API Routes Analysis (`src/app/api/admin/photo-matcher/**`)

| Route | Method | Purpose |
|-------|--------|---------|
| `analyze` | GET | Fetches image via SSH from `voices-prod`, runs Gemini Vision, returns `{ description, labels, vibe }` |
| `match` | POST | Copies photo to actor folder, creates media record, links `actors.photoId` |
| `auto-matched` | GET | Lists media where `metadata->>'autoMatched' = 'true'` |
| `serve` | GET | Streams file from voices-prod via SSH `cat` |
| `archive` | POST | Moves file to `./ARCHIVE/photo-matcher-cleanup` |

### Findings

1. **Analyze route depends on SSH**  
   - All images must exist on `voices-prod`. Local files in `1-SITE/assets/` or `4-KELDER/assets_backup/` cannot be analyzed without a local serve path.

2. **Gemini output lacks authenticity**  
   - `analyzeImage` returns `description`, `labels`, `vibe` but **no** `authenticity` or `isStock` field.
   - No way to flag AI-generated or stock imagery for review or replacement.

3. **Match route only links to actors**  
   - No support for linking to `contentArticles.featuredImageId` or `instructors.photoId`.
   - Articles and instructors are not served by the current match flow.

---

## 2. GeminiService.analyzeImage

**Location:** `1-SITE/apps/web/src/services/GeminiService.ts` (lines 73–124)

**Current output:**
```json
{
  "description": "De beschrijving",
  "labels": ["label1", "label2"],
  "vibe": "warm" | "zakelijk" | "creatief" | "rustig"
}
```

**Missing (Louis mandate):**
- `authenticity`: `"real" | "stock" | "ai_generated" | "unknown"`
- `confidence`: `0-1` for authenticity
- `suggested_alt`: editorially sound alt-text

---

## 3. Database & Asset State

### Schema

| Table | Column | Purpose |
|-------|--------|---------|
| `media` | id, fileName, filePath, labels, metadata | Central asset store |
| `actors` | photoId → media.id | Actor profile photo |
| `contentArticles` | featuredImageId → media.id | Article hero image |
| `instructors` | photoId → media.id | Workshop instructor photo |

### Photo URL Flow

- **Agency:** `photo_url` = `actor.dropboxUrl` (legacy path or full URL)
- **Sync bridge:** Falls back to `getExactAssetPath(actor, null, 'photo')` → `/assets/agency/voices/{market}/{lang}/{gender}/{firstName}-{status}-{id}/{firstName}-photo.jpg`
- **Photo-Matcher match:** Sets `actors.photoId` and writes to `media`; `dropboxUrl` is not updated by the match flow, so legacy paths still drive display in some places.

### Unassigned / Orphan Media

- **Backoffice Media API** (`/api/backoffice/media?filter=orphans`) returns media not linked to actors, articles, demos, or ademing tracks.
- No script or cron currently queries unassigned media for bulk cleanup or re-matching.

---

## 4. Placeholder Usage (Slop Inventory)

| Path | Used In | Action |
|------|---------|--------|
| `/placeholder-artist.jpg` | VoiceDetailClient, ArtistDetailClient | Replace with real actor photo or VOICES_CONFIG placeholders |
| `/assets/common/placeholders/placeholder-voice.jpg` | DynamicActorFeed, VOICES_CONFIG | Keep as fallback; ensure real photos preferred |
| `/mic-placeholder.png` | PricingSummary | Replace with real actor photo when available |
| `/assets/studio/placeholder.jpg` | WorkshopContent | Replace with real workshop or instructor image |

**Root cause:** `actor.photo_url` is often null or missing when:
- Actor has no `dropboxUrl`
- Actor has `photoId` but frontend uses `dropboxUrl` instead of resolving `media.filePath`

---

## 5. Proposed Matches (First Batch)

### High-Impact Replacements

| # | Current Slop | Target | Rationale |
|---|--------------|--------|-----------|
| 1 | `/placeholder-artist.jpg` in VoiceDetailClient | Resolve `actor.photoId` → `media.filePath` when `dropboxUrl` is empty | Actor photos already in DB via Photo-Matcher |
| 2 | `/mic-placeholder.png` in PricingSummary | Same resolution as above | Checkout should show real actor |
| 3 | `/assets/studio/placeholder.jpg` in WorkshopContent | Link to `workshop.mediaId` or `instructor.photoId` | Workshops have media in DB |
| 4 | `placeholder-voice.jpg` in DynamicActorFeed | Resolve `photoId` → media when actor has no `dropboxUrl` | Admin feed should show real faces |

### Content Articles Without Featured Image

- `getArticle` does not join `featuredImageId` with `media`.
- Articles such as `how-it-works`, `onze-belofte`, `voorbeeldteksten-telefooncentrale`, `story-skygge`, `wachtmuziek-die-werkt` have no hero image in the article page.
- **Action:** Add featured image support to `getArticle` and wire `featuredImageId` to media; then match real photos from the manifest/archive to these articles.

---

## 6. Action Plan

### Phase 1: Authenticity in Gemini (1–2 days)

1. Extend `GeminiService.analyzeImage` prompt to ask for:
   - `authenticity`: real | stock | ai_generated | unknown
   - `suggested_alt`: editorially sound alt text (max 125 chars)
2. Persist both in `media.metadata`.
3. In Photo-Matcher UI, surface authenticity and flag stock/AI for review or archive.

### Phase 2: Photo URL Resolution (1 day)

1. In `agency-bridge` and `api-server` getActor flows:
   - If `actor.dropboxUrl` is null/empty and `actor.photoId` exists, resolve `media.filePath` and build full URL.
2. Ensure `VoiceDetailClient`, `PricingSummary`, and `DynamicActorFeed` receive this resolved `photo_url`.

### Phase 3: Content Article Featured Images (1–2 days)

1. Extend `getArticle` to join `contentArticles.featuredImageId` with `media`.
2. Add featured image block to `article/[slug]/page.tsx`.
3. Extend Photo-Matcher `match` route to accept `articleId` and set `contentArticles.featuredImageId`.

### Phase 4: Workshop Placeholders (0.5 day)

1. In `WorkshopContent`, use `workshop.mediaId` or `instructor.photoId` when available.
2. Add a studio-specific fallback (e.g. `/assets/studio/default-workshop.jpg`) instead of generic placeholder.

---

## 7. Laws Compliance

| Law | Status |
|-----|--------|
| Authenticity Above All | ⚠️ Not enforced: no AI/stock detection in Gemini |
| Content–Visual Harmony | ✅ Vibe/labels help; suggested_alt would strengthen |
| Metadata Precision | ⚠️ alt-text not generated; manual only |

---

## 8. Appendix: Key File References

- `1-SITE/apps/web/src/app/api/admin/photo-matcher/analyze/route.ts`
- `1-SITE/apps/web/src/services/GeminiService.ts`
- `1-SITE/apps/web/src/lib/agency-bridge.ts` (photo_url mapping)
- `1-SITE/apps/web/src/app/api/backoffice/media/route.ts` (orphan filter)
- `1-SITE/packages/database/schema.ts` (media, actors, contentArticles, instructors)
