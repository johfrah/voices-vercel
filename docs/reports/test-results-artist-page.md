# 🎭 Artist Page Test Results - Johfrah (voices.be)

**Test Date**: 2026-02-27  
**Test URL**: https://www.voices.be/johfrah  
**Tester**: Mat (Visitor Intelligence)

---

## 📊 Executive Summary

**FINAL SCORE**: 1 PASS / 4 FAIL  
**CRITICAL ISSUE DETECTED**: React Error #419 - Suspense boundary failure during SSR

---

## 🧪 Test Scenario Results

### ❌ Test 16: Artist Page (Black World) DNA
**Status**: FAIL  
**Severity**: CRITICAL

**Errors**:
- TimeoutError: page.goto: Timeout 30000ms exceeded
- Page failed to load within 30 seconds, indicating a blocking render issue

**Root Cause Analysis**:
The page is experiencing a **React Suspense boundary failure** during server-side rendering. The error `Minified React error #419` indicates:
> "The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering."

**Code Location**:
`1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx`

**Specific Issues**:
1. **Line 255-268**: `VideoPlayer` wrapped in `<Suspense>` but loaded with `dynamic(..., { ssr: false })`
2. **Line 321-326**: `LiquidBackground` wrapped in `<Suspense>` but loaded with `dynamic(..., { ssr: false })`
3. **Line 613-618**: Second `VideoPlayer` instance with same pattern

**The Smoking Gun**:
Combining `dynamic(..., { ssr: false })` WITH `<Suspense>` creates a hydration mismatch. The server renders the Suspense fallback, but the client expects the dynamic component to be immediately available, causing React to throw error #419.

**Fix Required**:
Remove the `<Suspense>` wrappers around dynamically loaded components that already have `ssr: false`. The `loading` prop in the `dynamic()` call already provides the fallback.

```tsx
// ❌ WRONG (Current)
<Suspense fallback={<Loader />}>
  <VideoPlayer />  // Already has ssr: false + loading prop
</Suspense>

// ✅ CORRECT
<VideoPlayer />  // The dynamic() loading prop handles the fallback
```

---

### ❌ Test 17: Demo Player Functionaliteit
**Status**: FAIL  
**Severity**: CRITICAL

**Errors**:
- Execution context was destroyed, most likely because of a navigation
- Could not evaluate page elements due to React error blocking render

**Details**:
- Audio elements found: Unknown (page crashed before evaluation)
- Play buttons found: Unknown
- Demo sections found: Unknown

**Root Cause**:
Same React #419 error prevents the page from rendering, making it impossible to test demo player functionality.

**Fix Required**:
Same as Test 16 - fix the Suspense boundary issue.

---

### ✅ Test 18: Contact/Boekingsknop Isolatie
**Status**: PASS  
**Severity**: N/A

**Details**:
- Casting dock found: false ✅
- Casting dock visible: false ✅
- Global CTA found: false ✅
- Booking buttons: 0 ✅
- Artist contact buttons: 0
- Contact options: []

**Screenshot**: `test18-contact-isolation-2026-02-27T18-03-49-417Z.png`

**Analysis**:
The artist page correctly HIDES global casting elements, maintaining focus isolation as per the Bob-method. However, the page shows a **blank white screen** with only:
- Header navigation (Audio, Medewerker spreken, phone, email)
- Voicy chat button (bottom right)

**UX Concern**:
While the isolation is technically correct, the page content is completely missing due to the React error, resulting in a broken user experience.

---

### ❌ Test 19: SEO & Schema.org Validatie
**Status**: FAIL  
**Severity**: HIGH

**Errors**:
- No Person or Service schema found on artist page
- Only Organization schema detected

**Details**:
- Schema.org scripts found: 1
- Schema types: Organization (WRONG - should be Person or MusicGroup)
- Page title: "Johfrah - Voice-over Stem | Voices | Voices België" ✅
- Meta description: "Dit is een korte voorstelling van wie ik ben" ✅
- Canonical URL: `https://www.voices.be/nl/johfrah/` ⚠️ (includes `/nl/` - should be `https://www.voices.be/johfrah`)
- OG Image: `https://www.voices.be/assets/common/og-image.jpg` ✅

**Code Location**:
`1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx:44-59`

**Issue 1 - Wrong Schema Type**:
The component generates a `MusicGroup` schema (line 46), but this is NOT being injected into the page. Instead, the global Organization schema from the layout is showing.

**Issue 2 - Canonical URL Violation**:
The canonical URL includes the language prefix `/nl/`, violating the **Canonical Mandate**:
> "Alle URL's in metadata MOETEN `https://www.voices.be/` als basis gebruiken."

**Fix Required**:
1. Ensure the `jsonLd` schema from `ArtistDetailClient` is properly injected via the `<script type="application/ld+json">` tag (line 240-243)
2. Fix the canonical URL generation in `1-SITE/apps/web/src/app/[...slug]/page.tsx` metadata function (line 356-372)
3. Change schema `@type` from `MusicGroup` to `Person` for voice actors (Johfrah is not a music group)

**Screenshot**: `test19-seo-schema-2026-02-27T18-03-49-938Z.png`

---

### ❌ Test 20: Mobile Thumb-Zone Check
**Status**: FAIL  
**Severity**: HIGH

**Errors**:
- TimeoutError: page.screenshot: Timeout 30000ms exceeded
- Could not capture mobile viewport screenshot due to page hang

**Details**:
- Viewport: 375x667 (iPhone SE)
- Test could not complete due to React error blocking render

**Root Cause**:
Same React #419 error prevents mobile rendering.

**Fix Required**:
Same as Test 16 - fix the Suspense boundary issue.

---

## 🚨 Console Errors Detected

```
[Watchdog] Client-side error caught: Error: Minified React error #419
```

**Full Stack Trace**:
```
at https://www.voices.be/_next/static/chunks/1dd3208c-1cc769b764b35573.js?dpl=dpl_3CY6B7KjcGpigerFG9VRzmQrnbxP:1:64468
at lZ (...)
at iZ (...)
at ia (...)
```

**React Error #419 Explanation**:
From react.dev/errors/419:
> "The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering."

This error occurs when:
1. A Suspense boundary fails during SSR
2. React falls back to client-side rendering
3. Hydration mismatch causes the component tree to crash

---

## 🔍 Visual Evidence

### Screenshot 1: Contact Isolation Test (Blank Page)
![test18-contact-isolation-2026-02-27T18-03-49-417Z.png](../test-results/artist-page/test18-contact-isolation-2026-02-27T18-03-49-417Z.png)

**Observations**:
- Completely blank white page
- Header visible with contact info (Audio, phone, email)
- Voicy chat button present (bottom right)
- NO artist content visible
- NO Black World DNA applied

### Screenshot 2: SEO Schema Test (Partial Render)
![test19-seo-schema-2026-02-27T18-03-49-938Z.png](../test-results/artist-page/test19-seo-schema-2026-02-27T18-03-49-938Z.png)

**Observations**:
- Page shows partial render with navigation
- Footer visible with "Direct Boeken" CTA (pink background)
- Artist name "Johfrah" visible in breadcrumb
- Main content area is blank/gray
- Voicy chat button present

---

## 🛠️ Required Fixes (Priority Order)

### 1. CRITICAL: Fix React Suspense Boundary Error
**File**: `1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx`  
**Lines**: 255-268, 321-326, 613-618

**Action**:
Remove `<Suspense>` wrappers around components that are already loaded with `dynamic(..., { ssr: false })`.

**Before**:
```tsx
<Suspense fallback={<div className="..."><Loader2 /></div>}>
  <VideoPlayer src="..." />
</Suspense>
```

**After**:
```tsx
<VideoPlayer src="..." />
```

The `loading` prop in the `dynamic()` call (lines 25-32) already provides the fallback UI.

---

### 2. HIGH: Fix Schema.org Type for Voice Actors
**File**: `1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx`  
**Line**: 46

**Action**:
Change `@type` from `MusicGroup` to `Person` for voice actors.

**Before**:
```tsx
"@type": "MusicGroup",
```

**After**:
```tsx
"@type": "Person",
"jobTitle": "Voice Actor",
```

---

### 3. HIGH: Fix Canonical URL (Remove Language Prefix)
**File**: `1-SITE/apps/web/src/app/[...slug]/page.tsx`  
**Line**: ~364 (in `generateMetadata` function)

**Action**:
Ensure canonical URLs do NOT include the language prefix `/nl/`.

**Expected**:
```
https://www.voices.be/johfrah
```

**Current (WRONG)**:
```
https://www.voices.be/nl/johfrah/
```

---

### 4. MEDIUM: Add Black World DNA Verification
**File**: `1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx`  
**Line**: 235-238

**Action**:
Ensure `data-world="artist"` attribute is added to the main wrapper for DNA detection.

**Before**:
```tsx
<PageWrapperInstrument className={cn(...)}>
```

**After**:
```tsx
<PageWrapperInstrument data-world="artist" className={cn(...)}>
```

---

### 5. MEDIUM: Add Demo Player Fallback
**File**: `1-SITE/apps/web/src/components/legacy/ArtistDetailClient.tsx`

**Action**:
Ensure the artist page has a fallback message if no demos are available.

---

## 📋 Verification Checklist (For Chris)

After implementing fixes, verify:

- [ ] Page loads within 3 seconds (no timeout)
- [ ] Black World DNA applied (dark background, `data-world="artist"`)
- [ ] Console shows 0 React errors
- [ ] Schema.org type is `Person` (not `MusicGroup` or `Organization`)
- [ ] Canonical URL is `https://www.voices.be/johfrah` (no `/nl/`)
- [ ] Demo player visible and functional
- [ ] Mobile viewport renders correctly (375x667)
- [ ] Primary CTA buttons within thumb-zone (bottom 50% of viewport)
- [ ] Casting dock remains hidden on artist page

---

## 🎯 Impact Assessment

**User Impact**: CRITICAL  
**SEO Impact**: HIGH  
**Performance Impact**: CRITICAL

**Estimated Fix Time**: 30-45 minutes  
**Complexity**: Medium (requires understanding of React Suspense + dynamic imports)

---

**Report Compiled By**: Mat (Visitor Intelligence Guardian)  
**Reviewed By**: Chris (Technical Director) - PENDING  
**Status**: AWAITING FIX
