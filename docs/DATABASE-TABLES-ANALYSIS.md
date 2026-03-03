# 🗄️ Database Tables Analysis - Final Report

**Datum**: 2026-02-24 17:54 UTC
**Onderzoeker**: Chris/Autist (Database Guardian)

---

## 📊 Executive Summary

De Voices database heeft **74 gedefinieerde tables** in het schema, maar de API endpoint `/api/admin/database/tables/` toont slechts **8 tables** (11% coverage).

**Root Cause**: De API gebruikt een **hardcoded fallback lijst** omdat de Drizzle SQL query faalt.

---

## 🔍 API Endpoint Analysis

### Current Implementation
**File**: `src/app/api/admin/database/tables/route.ts`

**Intended Behavior** (regel 17-21):
```sql
SELECT tablename 
FROM pg_catalog.pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename ASC
```

**Actual Behavior** (regel 26-35):
De query faalt en valt terug op een hardcoded lijst:
```typescript
return [
  { tablename: 'actors' },
  { tablename: 'users' },
  { tablename: 'orders' },
  { tablename: 'order_items' },
  { tablename: 'reviews' },
  { tablename: 'media' },
  { tablename: 'actor_demos' },
  { tablename: 'translations' }
];
```

---

## 📋 Complete Table Inventory

### Tables Returned by API (8)
✅ actors
✅ users
✅ orders
✅ order_items
✅ reviews
✅ media
✅ actor_demos
✅ translations

### Tables in Schema but NOT in API (66)

#### 🎭 Actor/Talent (11 missing)
- actorAttributes
- actorAttributeMappings
- actorLanguages
- actorStatuses
- actorTones
- actorVideos
- aiClones
- voiceAffinity
- voiceTones
- fameRegistry
- artistPortfolio

#### 🛒 E-commerce (5 missing)
- orderNotes
- invoiceRegistry
- yukiOutstanding
- vouchers
- voucherBatches

#### 🎬 Casting & Projects (5 missing)
- castingLists
- castingListItems
- auditions
- approvalQueue
- centralLeads

#### 🎓 Studio & Academy (9 missing)
- workshops
- workshopEditions
- workshopInterest
- studioSessions
- studioScripts
- studioFeedback
- courseProgress
- courseSubmissions
- instructors

#### 🌍 Localization & Content (9 missing)
- translationRegistry
- languages
- countries
- contentArticles
- contentBlocks
- faq
- navMenus
- mailContent
- systemKnowledge

#### 💬 Chat & Communication (3 missing)
- chatConversations
- chatMessages
- chatPushSubscriptions

#### 📊 Analytics & Tracking (8 missing)
- visitors
- visitorLogs
- utmTouchpoints
- funnelEvents
- voicejarEvents
- voicejarSessions
- systemEvents
- aiLogs

#### 🧘 Adening (4 missing)
- ademingSeries
- ademingTracks
- ademingStats
- ademingReflections

#### 🎨 Artist & Portfolio (2 missing)
- artists
- artistPortfolio

#### 📁 Media & Assets (2 missing)
- locations
- vaultFiles

#### 🤖 AI (1 missing)
- aiRecommendations

#### ⭐ Social (1 missing)
- favorites

#### 📅 Scheduling (2 missing)
- appointments
- partnerWidgets

#### 🎯 Onboarding (1 missing)
- quizSteps

#### ⚙️ Configuration (2 missing)
- appConfigs
- agencyMembers

---

## 🚨 Impact Analysis

### Critical Missing Tables

1. **castingLists / castingListItems** ❌
   - Impact: Pitch functionality not visible in admin
   - Used by: Agency journey, casting workflow

2. **workshops / workshopEditions** ❌
   - Impact: Studio/Academy management incomplete
   - Used by: Berny (Studio Lead)

3. **visitors / visitorLogs** ❌
   - Impact: Mat's Visitor Intelligence not accessible
   - Used by: Marketing analytics

4. **systemEvents** ❌
   - Impact: Watchdog logs not visible
   - Used by: Debugging, forensic audit

5. **chatConversations / chatMessages** ❌
   - Impact: Voicy chat history not accessible
   - Used by: Customer support

---

## 🔧 Root Cause

The Drizzle SQL query is **failing silently** and falling back to the hardcoded list. Possible reasons:

1. **Database Connection Issue**: Drizzle client not properly initialized
2. **Permission Issue**: Service role key lacks permission to query pg_catalog
3. **Schema Mismatch**: Tables exist but not in 'public' schema
4. **Build-time vs Runtime**: Query works locally but fails in Vercel

---

## ✅ Recommendations

### 1. Fix the SQL Query (High Priority)
Replace the current implementation with a more robust query:

```typescript
const result = await db.execute(sql`
  SELECT table_name as tablename
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  ORDER BY table_name ASC
`);
```

### 2. Add Error Logging (High Priority)
Log the actual error instead of silently falling back:

```typescript
.catch(async (err) => {
  console.error('❌ [Tables API] Drizzle query failed:', err);
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);
  // Then fallback...
});
```

### 3. Use Schema Export (Alternative)
Instead of querying the database, export table names from the schema:

```typescript
import * as schema from '@db/schema';

const tables = Object.keys(schema)
  .filter(key => schema[key]?.constructor?.name === 'PgTable')
  .map(key => key.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1))
  .sort();
```

### 4. Add Query Parameter (Enhancement)
Allow filtering via query parameter:

```typescript
const { searchParams } = new URL(request.url);
const full = searchParams.get('full') === 'true';

if (!full) {
  // Return only core tables
  return NextResponse.json({ tables: CORE_TABLES });
}
// Otherwise return all tables
```

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total Tables in Schema | 74 |
| Tables Shown by API | 8 |
| Hidden Tables | 66 |
| API Coverage | 11% |
| Missing Critical Tables | 5+ |

---

## 🎯 Next Steps

1. ✅ **Immediate**: Add error logging to understand why Drizzle query fails
2. ✅ **Short-term**: Fix the SQL query or use schema export
3. ✅ **Medium-term**: Add `?full=true` parameter for complete table list
4. ✅ **Long-term**: Build admin UI to browse all 74 tables

---

## 📁 Artifacts

**Analysis Report**: `/tmp/database-tables-final-report.md`
**Complete Table List**: 74 tables extracted from `schema.ts`
**API Endpoint**: `/api/admin/database/tables/`

---

**Report Generated**: 2026-02-24 17:54 UTC
**Status**: ⚠️ API shows only 11% of tables due to fallback
**Recommendation**: Fix Drizzle query or use schema export
