# 🔬 FORENSIC AUDIT REPORT: Studio Page (v2.16.077)

**Date:** 2026-02-28  
**URL:** https://www.voices.be/studio/  
**Version:** 2.16.077  
**Auditor:** Chris (Technical Director)

---

## 📊 EXECUTIVE SUMMARY

The Studio page is **CRITICALLY BROKEN** due to a database query failure in the `/api/studio/workshops` endpoint. This cascades into multiple UI failures:

- ❌ **Workshop Carousel**: Empty (0 items) - API returns no data
- ❌ **Reviews Section**: Not found/not rendered
- ⚠️ **GlobalNav Links**: Showing Agency links instead of Studio links
- ✅ **Hero Video**: Present and functional
- ⚠️ **Calendar Section**: Present but not visible (height: 0)
- ⚠️ **FAQ Section**: Present but no items
- 🚨 **Console Error**: `ReferenceError: Cannot access 'tr' before initialization`

---

## 🔴 CRITICAL FAILURES

### 1. Workshop Carousel (FATAL)

**Status:** ❌ FAIL  
**Severity:** CRITICAL  
**Impact:** The primary content of the Studio page is missing

**Evidence:**
```json
{
  "found": true,
  "selector": "[class*=\"carousel\"]",
  "itemCount": 0,
  "html": "<div class=\"absolute -top-20 right-4 flex gap-4 z-20\">..."
}
```

**Root Cause:**
The `/api/studio/workshops` endpoint is returning an error:

```json
{
  "error": "Studio workshops fetch failed",
  "message": "Failed query: \n      SELECT\n        w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta, w.journey,\n        m.file_path AS media_file_path, m.alt_text AS media_alt_text\n      FROM workshops w\n      LEFT JOIN media m ON m.id = w.media_id\n      WHERE w.status IN ('publish', 'live')\n      ORDER BY w.title\n    \nparams: "
}
```

**Analysis:**
- The SQL query is failing at the database level
- Possible causes:
  1. The `workshops` table doesn't exist
  2. The `workshops` table has no rows with `status IN ('publish', 'live')`
  3. The database connection is using the wrong schema/pooler
  4. Column names don't match (snake_case vs camelCase drift)

**Location:** `1-SITE/apps/web/src/app/api/studio/workshops/route.ts:80-88`

**Recommendation:**
1. Verify the `workshops` table exists and has data
2. Check if there are any workshops with `status = 'publish'` or `status = 'live'`
3. Verify the database connection is using the correct pooler (6543) and schema
4. Add error logging to capture the exact database error message

---

### 2. Reviews Section (MISSING)

**Status:** ❌ FAIL  
**Severity:** HIGH  
**Impact:** Social proof is completely absent from the page

**Evidence:**
```json
{
  "found": false
}
```

**Analysis:**
- The `ReviewGrid` component is rendered by `StudioWorkshopsSection`
- Since the workshops API returns 0 workshops, `allReviews` is empty
- The component likely doesn't render when there are no reviews

**Location:** `1-SITE/apps/web/src/components/studio/StudioWorkshopsSection.tsx:144`

**Recommendation:**
1. Add a fallback state for when reviews are empty
2. Consider fetching reviews independently from workshops
3. Add placeholder reviews or testimonials

---

## ⚠️ WARNINGS

### 3. GlobalNav Links (WRONG CONTEXT)

**Status:** ⚠️ WARNING  
**Severity:** MEDIUM  
**Impact:** Users see Agency navigation instead of Studio navigation

**Evidence:**
```json
{
  "found": true,
  "links": [
    { "text": "Stemmen", "href": "/agency/" },
    { "text": "Hoe het werkt", "href": "/#how-it-works" },
    { "text": "Tarieven", "href": "/#pricing" },
    { "text": "Contact", "href": "/contact/" }
  ],
  "hasStudioLinks": false,
  "hasAgencyLinks": true,
  "type": "Agency"
}
```

**Analysis:**
- The GlobalNav is showing Agency links (`/agency/`, `/#how-it-works`, `/#pricing`)
- Expected Studio links: `/studio/`, `/studio/workshops`, `/studio/academy`, etc.
- This violates the **MARKET-CODE LOGICA** mandate (Rule #7)

**Location:** Likely in `GlobalNav` component or `MarketManager`

**Recommendation:**
1. Verify the `MarketManager` is correctly detecting the Studio journey
2. Add explicit Studio navigation links when on `/studio/*` routes
3. Implement journey-aware navigation rendering

---

### 4. Calendar Section (INVISIBLE)

**Status:** ⚠️ WARNING  
**Severity:** LOW  
**Impact:** Users cannot see upcoming workshop dates

**Evidence:**
```json
{
  "found": true,
  "selector": "[class*=\"calendar\"]",
  "visible": false,
  "text": ""
}
```

**Analysis:**
- The calendar element exists in the DOM
- It has `offsetHeight = 0` (not visible)
- Likely because there are no upcoming editions to display (due to empty workshops)

**Location:** `1-SITE/apps/web/src/components/studio/StudioWorkshopsSection.tsx:98-101`

**Recommendation:**
1. Add a fallback state for when there are no upcoming editions
2. Show a "No upcoming workshops" message
3. Add a CTA to contact for custom workshops

---

### 5. FAQ Section (NO ITEMS)

**Status:** ⚠️ WARNING  
**Severity:** LOW  
**Impact:** Users cannot find answers to common questions

**Evidence:**
```json
{
  "found": true,
  "selector": "text-based search",
  "itemCount": 0,
  "visible": true
}
```

**Analysis:**
- The FAQ section container exists
- No FAQ items are rendered (likely because the API returns empty `faqs` array)

**Location:** `1-SITE/apps/web/src/app/api/studio/workshops/route.ts:141-146`

**Recommendation:**
1. Verify the `faq` table has rows with `category = 'studio'`
2. Add fallback FAQs if database is empty
3. Add a "Contact us" CTA if no FAQs are available

---

## ✅ PASSING CHECKS

### 6. Version Check

**Status:** ✅ PASS  
**Version:** 2.16.077  
**Evidence:** `window.__VOICES_VERSION__ = "2.16.077"`

---

### 7. Hero Video

**Status:** ✅ PASS  
**Details:**
```json
{
  "found": true,
  "playing": false,
  "src": "https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/assets/common/branding/johfrah/portfolio/video-canvas.mp4",
  "error": null,
  "readyState": 4,
  "networkState": 1
}
```

**Analysis:**
- Video element is present and functional
- Video source is loading correctly from Supabase Storage
- No network errors detected
- `readyState = 4` (HAVE_ENOUGH_DATA)
- `networkState = 1` (NETWORK_IDLE)

---

### 8. ReferenceError (tl)

**Status:** ✅ PASS  
**Details:** No "tl" ReferenceError detected in console

---

### 9. Hydration Error (#419)

**Status:** ✅ PASS  
**Details:** No Hydration error detected in console

---

## 🚨 CONSOLE ERRORS

### Error 1: ReferenceError (tr)

**Severity:** CRITICAL  
**Message:**
```
ReferenceError: Cannot access 'tr' before initialization
    at O (https://www.voices.be/_next/static/chunks/app/layout-4e509d291af5640d.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:254274)
```

**Analysis:**
- This is a **different** ReferenceError than the "tl" error we were looking for
- The error is related to a variable `tr` being accessed before initialization
- This is happening in the layout chunk, suggesting a global/shared component issue
- The Nuclear Guard caught this error, preventing a full page crash

**Impact:**
- May be causing the Instruments crash mentioned in the Nuclear Guard log
- Could be related to translation/localization logic (tr = translate?)

**Location:** `app/layout-4e509d291af5640d.js:1:254274`

**Recommendation:**
1. Search for `tr` variable declarations in layout components
2. Ensure all variables are declared with `const`/`let` before use
3. Check for circular dependencies in translation/localization modules
4. Add explicit initialization for the `tr` variable

---

## 🌐 NETWORK ERRORS

**Status:** ✅ PASS  
**Details:** No network errors detected (all HTTP responses < 400)

---

## 📸 SCREENSHOTS

1. **Full Page:** `3-WETTEN/reports/screenshots/studio-forensic-full-2026-02-28T20-03-11.png`
2. **Hero Section:** `3-WETTEN/reports/screenshots/studio-hero-2026-02-28T20-03-11.png`
3. **Carousel (Empty):** `3-WETTEN/reports/screenshots/studio-carousel-2026-02-28T20-03-11.png`

---

## 🔧 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Database Query (BLOCKING)

1. **Investigate Database Schema:**
   - Verify `workshops` table exists
   - Check column names match the query (snake_case)
   - Verify there are workshops with `status IN ('publish', 'live')`

2. **Add Error Logging:**
   ```typescript
   } catch (error) {
     console.error('[Studio Workshops API] Database error:', error);
     console.error('[Studio Workshops API] Error details:', {
       message: error instanceof Error ? error.message : 'Unknown',
       stack: error instanceof Error ? error.stack : null,
       name: error instanceof Error ? error.name : null
     });
     return NextResponse.json({ error: 'Studio workshops fetch failed', details: error }, { status: 500 });
   }
   ```

3. **Test Query Directly:**
   - Use Drizzle Studio or SQL client to run the query manually
   - Verify the query returns data
   - Check for schema drift (camelCase vs snake_case)

### Priority 2: Fix ReferenceError (tr)

1. **Search for `tr` Variable:**
   ```bash
   rg "(?<!const |let |var )tr\s*=" 1-SITE/apps/web/src/app/layout.tsx
   ```

2. **Check Translation Imports:**
   - Verify all translation functions are properly imported
   - Check for circular dependencies in localization modules

3. **Add Defensive Initialization:**
   - Ensure `tr` is declared with `const` or `let` before use
   - Add null checks before accessing `tr`

### Priority 3: Fix GlobalNav Context

1. **Verify MarketManager Logic:**
   - Check if `/studio/` routes are correctly mapped to Studio journey
   - Ensure `market.market_code` is used (not `host.includes()`)

2. **Add Journey-Aware Navigation:**
   - Render Studio-specific navigation when on `/studio/*` routes
   - Hide Agency-specific links (Stemmen, Tarieven) on Studio pages

### Priority 4: Add Fallback States

1. **Workshop Carousel:**
   - Add "No workshops available" message
   - Show CTA to contact for custom workshops

2. **Reviews Section:**
   - Add placeholder testimonials
   - Fetch reviews independently from workshops

3. **Calendar Section:**
   - Show "No upcoming workshops" message
   - Add CTA to join waiting list

4. **FAQ Section:**
   - Add hardcoded fallback FAQs
   - Show "Contact us" CTA

---

## 🛡️ CHRIS-PROTOCOL VIOLATIONS

1. **ZERO-HALLUCINATION POLICY (Rule #2):** The API is failing silently, returning empty arrays instead of proper error messages.
2. **DATA-DRIVEN CONFIGURATION (Rule #6):** The page has no fallback data when the API fails.
3. **MARKET-CODE LOGICA (Rule #7):** The GlobalNav is showing Agency links on a Studio page.
4. **ANTI-LOOP & DEEP SCAN MANDATE (Rule #13):** The error logging is insufficient to diagnose the database failure.

---

## 📋 CERTIFICATION

**Status:** ❌ FAILED  
**Reason:** Critical database failure prevents the Studio page from functioning

**Next Steps:**
1. Fix the database query in `/api/studio/workshops`
2. Fix the `tr` ReferenceError in the layout
3. Add proper error handling and fallback states
4. Re-run this forensic audit to verify fixes

**Signed:** Chris (Technical Director)  
**Date:** 2026-02-28T20:03:17.500Z

---

## 🔬 APPENDIX: RAW AUDIT DATA

### API Response (Error)
```json
{
  "error": "Studio workshops fetch failed",
  "message": "Failed query: \n      SELECT\n        w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta, w.journey,\n        m.file_path AS media_file_path, m.alt_text AS media_alt_text\n      FROM workshops w\n      LEFT JOIN media m ON m.id = w.media_id\n      WHERE w.status IN ('publish', 'live')\n      ORDER BY w.title\n    \nparams: "
}
```

### Console Errors (Full)
```
1. ReferenceError: Cannot access 'tr' before initialization
    at O (https://www.voices.be/_next/static/chunks/app/layout-4e509d291af5640d.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:254274)
    at rE (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:40342)
    at l$ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:59317)
    at iZ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:117680)
    at ia (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:95163)
    at https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:94985
    at il (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:94992)
    at oJ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:92348)
    at oZ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:91767)
    at MessagePort.M (https://www.voices.be/_next/static/chunks/286-4222b58526460a65.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:84478)

2. [Nuclear Guard] Instruments Crash caught: ReferenceError: Cannot access 'tr' before initialization
    at O (https://www.voices.be/_next/static/chunks/app/layout-4e509d291af5640d.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:254274)
    at rE (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:40342)
    at l$ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:59317)
    at iZ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:117680)
    at ia (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:95163)
    at https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:94985
    at il (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:94992)
    at oJ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:92348)
    at oZ (https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:91767)
    at MessagePort.M (https://www.voices.be/_next/static/chunks/286-4222b58526460a65.js?dpl=dpl_D9UBFtmoMDbs8qW8jqP839HzFQqf:1:84478)
```

### GlobalNav Links (Full)
```json
{
  "found": true,
  "links": [
    { "text": "[SVG CSS]", "href": "/" },
    { "text": "Stemmen", "href": "/agency/" },
    { "text": "Hoe het werkt", "href": "/#how-it-works" },
    { "text": "Tarieven", "href": "/#pricing" },
    { "text": "Contact", "href": "/contact/" },
    { "text": "", "href": "/account/favorites/" },
    { "text": "", "href": "/checkout/" }
  ],
  "hasStudioLinks": false,
  "hasAgencyLinks": true,
  "type": "Agency"
}
```

---

**END OF REPORT**
