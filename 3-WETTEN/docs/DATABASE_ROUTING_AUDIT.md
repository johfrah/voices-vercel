# Database Routing Audit Report
**Date**: 2026-02-25  
**Agent**: Chris (Technical Director)  
**Purpose**: Comprehensive analysis of routing infrastructure in Supabase

---

## Executive Summary

The Voices platform currently uses a **code-based Smart Router** without a centralized `slug_registry` table. Routing logic is handled entirely in the Next.js application layer via the `[...slug]/page.tsx` catch-all route.

---

## 1. Slug Registry Table

### Status: ❌ **DOES NOT EXIST**

**Finding**: No `slug_registry` table exists in the database schema.

**Current Approach**: The Smart Router resolves slugs dynamically by querying multiple tables in sequence:
1. `artists` table (for Artist journey)
2. `actors` table (for Agency journey - voice actors)
3. `content_articles` table (for CMS pages)
4. `workshops` table (for Studio/Academy journey)
5. `instructors` table (for instructor profiles)

**Implication**: Each page load requires multiple database queries to determine the page type. No centralized routing registry exists.

---

## 2. Routing-Related Fields in Core Tables

### 2.1 `actors` Table
**Routing Field**: `slug` (text, unique, indexed)

```sql
"slug" text UNIQUE
CONSTRAINT "actors_slug_unique" UNIQUE("slug")
CREATE UNIQUE INDEX "actors_slug_idx" USING btree (slug)
```

**Additional Fields**:
- `status` (enum: pending, approved, active, live, publish, rejected, cancelled, unavailable)
- `is_public` (boolean, default: false)
- `portfolio_tier` (text, default: 'none')

**Routing Logic**: 
- Actor is routable if: `status = 'live'` AND `is_public = true`
- URL pattern: `/{slug}` or `/voice/{slug}` or `/{slug}/{journey}/{medium}`

---

### 2.2 `artists` Table
**Routing Field**: `slug` (text, unique, NOT NULL)

```sql
"slug" text UNIQUE NOT NULL
```

**Additional Fields**:
- `status` (text, default: 'active')
- `is_public` (boolean, default: true)

**Routing Logic**:
- Artist is routable if: `status = 'active'` AND `is_public = true`
- URL pattern: `/{slug}` or `/artist/{slug}`

---

### 2.3 `content_articles` Table
**Routing Field**: `slug` (text, unique, NOT NULL)

```sql
"slug" text NOT NULL
CONSTRAINT "content_articles_slug_unique" UNIQUE("slug")
```

**Additional Fields**:
- `status` (text, default: 'publish')
- `is_manually_edited` (boolean, default: false)
- `lock_status` (text, default: 'unlocked')

**Routing Logic**:
- Article is routable if: `status = 'publish'`
- URL pattern: `/{slug}`

---

### 2.4 `workshops` Table
**Routing Field**: `slug` (text, unique)

```sql
"slug" text UNIQUE
CONSTRAINT "workshops_slug_unique" UNIQUE("slug")
```

**Additional Fields**:
- `status` (text, default: 'upcoming')
- `date` (timestamp, NOT NULL)

**Routing Logic**:
- Workshop is routable if: `status IN ('upcoming', 'publish')`
- URL pattern: `/studio/{slug}` or `/academy/{slug}`

---

### 2.5 `instructors` Table
**Routing Field**: `slug` (text, unique)

```sql
"slug" text UNIQUE
CONSTRAINT "instructors_slug_unique" UNIQUE("slug")
```

**Additional Fields**:
- `is_public` (boolean, default: true)

**Routing Logic**:
- Instructor is routable if: `is_public = true`
- URL pattern: `/studio/docent/{slug}`

---

## 3. Smart Router Logic (Application Layer)

### Location
`1-SITE/apps/web/src/app/[...slug]/page.tsx`

### Current Resolution Order

```typescript
// 1. Check for Agency Journey segments (hardcoded list)
if (MarketManager.isAgencySegment(firstSegment)) {
  // Return Agency journey page
}

// 2. Check for Artist (by slug)
const artist = await getArtist(firstSegment, lang);
if (artist) {
  // Return Artist profile page
}

// 3. Check for Actor (by slug)
const actor = await getActor(firstSegment, lang);
if (actor) {
  // Return Actor profile page
}

// 4. Check for CMS Article (by slug)
const article = await db.select()
  .from(contentArticles)
  .where(eq(contentArticles.slug, firstSegment))
  .limit(1);
if (article) {
  // Return CMS page
}

// 5. Not found
return notFound();
```

### System Prefixes (Handled in Code)
The router recognizes these prefixes and shifts segments accordingly:
- `voice`, `stem`, `voix`, `stimme` → Actor journey
- `artist`, `artiest` → Artist journey
- `studio`, `academy` → Workshop journey
- `music`, `muziek` → Music journey

**Example**: `/voice/johfrah` → resolves to actor with slug `johfrah`

---

## 4. Database Functions & Triggers

### Status: ❌ **NONE FOUND**

**Finding**: No database-level functions, triggers, or views related to routing exist.

**Implication**: All routing logic is handled in the application layer (Next.js). No database-side automation for slug resolution.

---

## 5. Slug Uniqueness Across Tables

### Current State: ⚠️ **NO GLOBAL UNIQUENESS CONSTRAINT**

**Risk**: The same slug can exist in multiple tables:
- `actors.slug = 'johfrah'`
- `artists.slug = 'johfrah'`
- `content_articles.slug = 'johfrah'`

**Current Mitigation**: The Smart Router's resolution order (Artist → Actor → CMS) determines which entity wins.

**Recommendation**: Consider a central `slug_registry` table to enforce global uniqueness and provide explicit routing rules.

---

## 6. Proposed `slug_registry` Table Schema

### Option A: Central Registry (Recommended)

```sql
CREATE TABLE slug_registry (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  routing_type TEXT NOT NULL, -- 'actor', 'artist', 'article', 'workshop', 'instructor'
  entity_id INTEGER NOT NULL,
  market TEXT DEFAULT 'ALL', -- 'BE', 'NL', 'FR', 'DE', 'ALL'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority wins in case of conflicts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT slug_registry_slug_unique UNIQUE(slug, market)
);

CREATE INDEX idx_slug_registry_slug ON slug_registry(slug);
CREATE INDEX idx_slug_registry_type ON slug_registry(routing_type);
CREATE INDEX idx_slug_registry_active ON slug_registry(is_active);
```

**Benefits**:
- Global slug uniqueness per market
- Explicit routing rules
- Priority system for conflicts
- Market-specific routing
- Single query to resolve any slug

**Drawbacks**:
- Requires sync logic when entities are created/updated
- Additional table to maintain

---

### Option B: Add `routing_type` Column to Existing Tables

```sql
-- Add to actors table
ALTER TABLE actors ADD COLUMN routing_type TEXT DEFAULT 'actor';

-- Add to artists table
ALTER TABLE artists ADD COLUMN routing_type TEXT DEFAULT 'artist';

-- Add to content_articles table
ALTER TABLE content_articles ADD COLUMN routing_type TEXT DEFAULT 'article';

-- Add to workshops table
ALTER TABLE workshops ADD COLUMN routing_type TEXT DEFAULT 'workshop';

-- Add to instructors table
ALTER TABLE instructors ADD COLUMN routing_type TEXT DEFAULT 'instructor';
```

**Benefits**:
- No new table needed
- Self-documenting entity type

**Drawbacks**:
- No global uniqueness enforcement
- Still requires multiple queries to resolve
- Redundant (type is implicit in table name)

---

## 7. Recommendation: Central `slug_registry` Approach

### Why?

1. **Performance**: Single query to resolve any slug instead of 3-5 sequential queries
2. **Clarity**: Explicit routing rules in one place
3. **Flexibility**: Easy to add new entity types without changing router logic
4. **Market-Specific**: Support for market-specific slugs (e.g., `/over-ons` in BE, `/a-propos` in FR)
5. **Conflict Resolution**: Priority system handles edge cases
6. **Auditability**: Clear history of slug assignments

### Implementation Plan

1. **Create `slug_registry` table** with schema above
2. **Populate from existing tables** via migration script
3. **Add triggers** to auto-sync when entities are created/updated/deleted
4. **Update Smart Router** to query `slug_registry` first
5. **Add admin UI** to manage slug conflicts and priorities

---

## 8. Current Routing State Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Centralized Registry** | ❌ Does not exist | All routing is code-based |
| **Slug Uniqueness** | ⚠️ Per-table only | No global constraint |
| **Database Functions** | ❌ None | All logic in Next.js |
| **Routing Fields** | ✅ Present | `slug` column in all core tables |
| **Market-Specific Routing** | ⚠️ Partial | Handled via `MarketManager` in code |
| **Performance** | ⚠️ Moderate | 3-5 queries per page load |
| **Maintainability** | ⚠️ Moderate | Routing logic scattered across codebase |

---

## 9. Next Steps

### Immediate (No DB Changes)
1. ✅ Document current routing state (this report)
2. Add `routing_type` metadata to existing tables (non-breaking)
3. Create database view to simulate `slug_registry` for testing

### Short-Term (Recommended)
1. Create `slug_registry` table
2. Write migration script to populate from existing data
3. Add database triggers for auto-sync
4. Update Smart Router to use registry

### Long-Term (Optional)
1. Add market-specific slug support
2. Implement slug versioning/history
3. Add redirect rules for old slugs
4. Create admin UI for slug management

---

## 10. Conclusion

The Voices platform currently uses a **functional but non-optimal** routing approach. The Smart Router works well for the current scale, but a centralized `slug_registry` table would provide:

- **Better performance** (1 query vs 3-5)
- **Clearer architecture** (explicit routing rules)
- **Easier maintenance** (single source of truth)
- **Future flexibility** (market-specific slugs, redirects, etc.)

**Recommendation**: Implement the `slug_registry` table as described in Section 6, Option A.

---

**Report Generated By**: Chris (Technical Director)  
**Verification Status**: ✅ Schema verified via Drizzle ORM  
**Last Updated**: 2026-02-25
