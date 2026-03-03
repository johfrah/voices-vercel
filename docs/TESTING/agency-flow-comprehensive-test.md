# Agency Flow Comprehensive Test Report

**Date**: 2026-02-18  
**Test URL**: http://localhost:3000/agency/  
**Tester**: CHRIS (Code Integrity Guardian)  
**Status**: ✅ CODE ANALYSIS COMPLETE - MANUAL TESTING REQUIRED

---

## 🎯 Test Objectives

This document provides a comprehensive test plan for the Agency page voice selection flow, including state management, URL handling, and refresh behavior.

---

## 📋 Test Flow Breakdown

### Test 1: Initial Page Load (Casting State)

**Expected Behavior**:
1. ✅ Page loads at `/agency/`
2. ✅ `GlobalNav` header is visible at the top
3. ✅ `AgencyHeroInstrument` displays the hero section with filters
4. ✅ `VoicesMasterControl` shows journey/filter controls
5. ✅ `VoiceGrid` displays all available voice actors (18 actors based on server logs)
6. ✅ Each `VoiceCard` shows:
   - Actor photo
   - Actor name
   - Tone of voice tags
   - Bio/tagline
   - Starting price (€301.29 for most actors)
   - "Kies stem" button
7. ✅ `FooterWrapper` is visible at the bottom
8. ✅ `LiquidBackground` provides the animated background
9. ✅ `MobileFloatingDock` is visible on mobile devices

**Code Evidence**:
- Layout includes `GlobalNav` (layout.tsx:171) and `FooterWrapper` (layout.tsx:190)
- AgencyContent starts in 'voice' step by default (AgencyContent.tsx:23)
- VoiceGrid renders all filtered actors (VoiceGrid.tsx:50-71)

**Console Logs to Expect**:
```
[AgencyPage] Fetching actors for market: BE, initialLang: Vlaams
[AgencyPage] Found 18 actors
 VoiceGrid: rendering 18 actors { featured: false, actors: [...] }
[VoiceCard] Calculated price for Serge: 301.29
[VoiceCard] Calculated price for Birgit: 301.29
... (for each actor)
```

---

### Test 2: Voice Actor Selection (Transition to Script State)

**Action**: Click "Kies stem" on any VoiceCard (e.g., Serge)

**Expected Behavior**:

#### Phase 1: Button Click (0ms)
1. ✅ Sonic DNA plays a "success" click sound
2. ✅ `handleStudioToggle` in VoiceCard calls `onSelect(voice)`
3. ✅ `handleSelect` in VoiceGrid logs: `[VoiceGrid] handleSelect for: Serge { hasOnSelect: true }`
4. ✅ `handleActorSelect` in AgencyContent is triggered

#### Phase 2: State Updates (0-50ms)
1. ✅ `selectActor(actor)` updates CheckoutContext
2. ✅ `updateStep('script')` changes MasterControl state
3. ✅ `router.push(/${slug}/${journey}/)` initiates navigation
4. ✅ URL changes to `/serge/video/` (or appropriate journey)

#### Phase 3: Animation Exit (0-300ms)
1. ✅ VoiceGrid container begins exit animation:
   - Opacity: 1 → 0
   - Scale: 1 → 0.95
   - Blur: 0px → 10px
   - Duration: 300ms
2. ✅ All VoiceCards fade out simultaneously
3. ✅ **IMPORTANT**: With `mode="wait"` on AnimatePresence, the configurator waits for this to complete

#### Phase 4: Layout Transition (0-???ms)
1. ✅ Selected VoiceCard with `layoutId="actor-{id}"` morphs to sidebar position
2. ✅ Spring animation: `stiffness: 300, damping: 30, mass: 1`
3. ✅ Card transforms from grid position to left sidebar (3 columns wide)
4. ✅ Card becomes compact and sticky (`lg:sticky lg:top-10`)

#### Phase 5: Animation Enter (300-800ms)
1. ✅ Configurator container fades in:
   - Initial: `opacity: 0, scale: 0.98, y: 20`
   - Animate: `opacity: 1, scale: 1, y: 0`
   - Duration: 600ms
2. ✅ ConfiguratorPageClient slides in from left:
   - Initial: `opacity: 0, x: -20`
   - Animate: `opacity: 1, x: 0`
   - Delay: 300ms
   - Duration: 500ms
3. ✅ Smooth scroll to `#master-control-anchor` with -20px offset

#### Phase 6: Final State (800ms+)
1. ✅ Layout is now 12-column grid:
   - Left sidebar (3 cols): Compact VoiceCard (selected actor)
   - Main area (9 cols): ConfiguratorPageClient
2. ✅ VoicesMasterControl filters remain visible at top
3. ✅ GlobalNav header remains visible
4. ✅ FooterWrapper remains at bottom
5. ✅ URL shows: `/serge/video/`

**Code Evidence**:
- handleActorSelect (AgencyContent.tsx:125-155)
- Animation config (AgencyContent.tsx:168-225)
- layoutId matching (VoiceGrid.tsx:53 and AgencyContent.tsx:215)

**Console Logs to Expect**:
```
[VoiceGrid] handleSelect for: Serge { hasOnSelect: true }
[AgencyContent] Initializing with actor from homepage: Serge
```

---

### Test 3: Page Refresh in Script State (State Recovery)

**Action**: Press F5 or Cmd+R while in the Script state (URL: `/serge/video/`)

**Expected Behavior**:

#### Scenario A: Refresh on `/serge/video/` URL
1. ⚠️ **CRITICAL**: This URL pattern is NOT handled by `/agency/page.tsx`
2. ❌ The page will likely show a 404 or load a different route
3. 🔧 **ISSUE**: The Smart Routing mandate requires a catch-all route handler

**Code Evidence**:
- AgencyContent expects to be on `/agency/` (AgencyContent.tsx:127-131)
- No dynamic route exists for `/{slug}/{journey}/` pattern in the agency folder

#### Scenario B: Refresh on `/agency/` URL (if manually navigated back)
1. ✅ Page loads fresh from server
2. ✅ CheckoutContext is reset (no selectedActor)
3. ✅ MasterControl state is reset (currentStep = 'voice')
4. ✅ useEffect detects: `state.currentStep === 'script' && !checkoutState.selectedActor`
5. ✅ Console warning: `[AgencyContent] Script step active but no actor selected. Reverting to voice step.`
6. ✅ `updateStep('voice')` is called
7. ✅ VoiceGrid is displayed
8. ✅ URL remains `/agency/`

**Code Evidence**:
- Recovery logic (AgencyContent.tsx:99-104)
```javascript
else if (!actorId && !checkoutState.selectedActor && state.currentStep === 'script') {
  console.warn("[AgencyContent] Script step active but no actor selected. Reverting to voice step.");
  updateStep('voice');
}
```

---

### Test 4: Console Errors Check

**Expected Console Output** (No Errors):
```
✅ [AgencyPage] Fetching actors for market: BE, initialLang: Vlaams
✅ [AgencyPage] Found 18 actors
✅  VoiceGrid: rendering 18 actors
✅ [VoiceCard] Calculated price for Serge: 301.29
✅ [VoiceGrid] handleSelect for: Serge { hasOnSelect: true }
```

**Potential Warnings** (Non-Critical):
```
⚠️ react-hooks/exhaustive-deps in ConfiguratorPageClient.tsx (line 202)
⚠️ react-hooks/exhaustive-deps in VoiceDetailClient.tsx (line 105)
```

**Errors to Watch For**:
- ❌ `router is not defined` - FIXED (added import and initialization)
- ❌ `Cannot read property 'slug' of undefined` - Should not occur with null checks
- ❌ Layout shift warnings - Should be minimal with layoutId
- ❌ Hydration errors - Should not occur with proper SSR

---

### Test 5: Header and Footer Visibility

**Throughout All States**:

1. ✅ **GlobalNav** (Header):
   - Always visible at top of page
   - Includes logo, navigation links, cart, account
   - Rendered in layout.tsx:171
   - Z-index should keep it above content

2. ✅ **FooterWrapper** (Footer):
   - Always visible at bottom of page
   - Includes links, contact info, legal
   - Rendered in layout.tsx:190
   - Should scroll naturally with content

3. ✅ **MobileFloatingDock**:
   - Visible on mobile devices
   - Sticky at bottom on mobile
   - Rendered in layout.tsx:172

**Code Evidence**:
- All rendered outside PageWrapperInstrument (layout.tsx:171, 172, 190)
- Not affected by AgencyContent state changes

---

## 🐛 Known Issues & Limitations

### Issue #1: URL Routing Mismatch ⚠️ CRITICAL
**Problem**: When in Script state, URL changes to `/{slug}/{journey}/` but there's no route handler for this pattern in the agency folder.

**Impact**: 
- Refreshing the page in Script state will likely result in 404
- Direct navigation to `/{slug}/{journey}/` won't work as expected

**Recommended Fix**:
Create a catch-all route at `/1-SITE/apps/web/src/app/[slug]/[journey]/page.tsx` that:
1. Detects the slug and journey from URL params
2. Fetches the actor data
3. Renders the AgencyContent with pre-selected actor
4. Sets initial step to 'script'

**Alternative Fix**:
Keep URL at `/agency/?actor={slug}&journey={journey}` instead of changing path

### Issue #2: AnimatePresence Mode
**Status**: ✅ FIXED
**Change**: Added `mode="wait"` to prevent overlap between exit and enter animations

### Issue #3: Missing Router Import
**Status**: ✅ FIXED
**Change**: Added `import { useRouter } from 'next/navigation';` and initialized hook

### Issue #4: VoiceCard onSelect Not Called
**Status**: ✅ FIXED
**Change**: Modified handleStudioToggle to call onSelect when provided

---

## 🧪 Manual Testing Checklist

### Pre-Test Setup
- [ ] Server is running on http://localhost:3000
- [ ] Browser DevTools are open (F12)
- [ ] Console tab is visible
- [ ] Network tab is monitoring (optional)
- [ ] Responsive design mode is off (test desktop first)

### Test 1: Initial Load
- [ ] Navigate to http://localhost:3000/agency/
- [ ] Header (GlobalNav) is visible
- [ ] Hero section loads with filters
- [ ] VoiceGrid shows 18 actors (or appropriate number)
- [ ] Each card shows photo, name, price, "Kies stem" button
- [ ] Footer is visible at bottom
- [ ] No console errors
- [ ] Page feels responsive and smooth

### Test 2: Voice Selection
- [ ] Click "Kies stem" on first actor (Serge)
- [ ] Hear click sound (if audio enabled)
- [ ] Grid fades out smoothly (no jarring jumps)
- [ ] Selected card morphs to sidebar position
- [ ] Configurator slides in from left
- [ ] URL changes to `/serge/video/` (or similar)
- [ ] No page reload occurs
- [ ] No console errors
- [ ] Transition feels smooth (< 1 second total)
- [ ] Header remains visible
- [ ] Footer remains visible

### Test 3: Script State Verification
- [ ] Selected actor card is in left sidebar (3 columns)
- [ ] Card is compact and sticky
- [ ] ConfiguratorPageClient is visible (9 columns)
- [ ] Script input field is visible
- [ ] Pricing summary is visible
- [ ] MasterControl filters remain at top
- [ ] Can interact with configurator
- [ ] No visual glitches

### Test 4: Refresh Behavior
- [ ] Press F5 to refresh page
- [ ] **EXPECTED**: May show 404 (due to URL routing issue)
- [ ] **OR**: If on `/agency/`, should revert to grid view
- [ ] Check console for: `[AgencyContent] Script step active but no actor selected. Reverting to voice step.`
- [ ] No crash or blank page

### Test 5: Back Navigation
- [ ] Click browser back button
- [ ] Should return to `/agency/` URL
- [ ] Grid view should be displayed
- [ ] No console errors
- [ ] Smooth transition

### Test 6: Mobile Responsiveness
- [ ] Open DevTools responsive mode
- [ ] Set to iPhone 12 Pro (390x844)
- [ ] Repeat Tests 1-3
- [ ] Verify MobileFloatingDock is visible
- [ ] Verify layout adapts (single column on mobile)
- [ ] Verify touch interactions work

### Test 7: Different Journeys
- [ ] Change journey filter to "Telefonie"
- [ ] Select an actor
- [ ] Verify URL includes `/telefoon/`
- [ ] Verify pricing updates
- [ ] Change to "Commercial"
- [ ] Verify URL includes `/commercial/`

---

## 📊 Performance Metrics

### Target Metrics (Bob-Methode)
- **Initial Page Load**: < 3 seconds (SSR)
- **LCP**: < 2.5 seconds
- **FID**: < 100ms
- **CLS**: < 0.1
- **SPA Transition**: < 1 second total
- **Animation FPS**: 60fps (smooth)

### How to Measure
1. Open DevTools → Performance tab
2. Click "Record"
3. Perform voice selection
4. Stop recording
5. Analyze:
   - Frame rate should be 60fps
   - No long tasks > 50ms
   - Smooth animation curves

---

## 🎨 Visual Quality Assessment

### Animation Quality Checklist
- [ ] Selected card "flies" smoothly to sidebar (no teleporting)
- [ ] Other cards fade out uniformly (no staggered disappearance)
- [ ] Blur effect on exit is subtle and pleasant
- [ ] Configurator slides in smoothly (no jank)
- [ ] No "flash" of unstyled content
- [ ] No layout shifts (CLS = 0)
- [ ] Colors remain consistent (no flash)
- [ ] Typography remains crisp throughout

### Layout Quality Checklist
- [ ] Sidebar card maintains aspect ratio
- [ ] Configurator fills remaining space
- [ ] Gaps and padding are consistent
- [ ] Responsive breakpoints work correctly
- [ ] No horizontal scrollbar appears
- [ ] Footer doesn't overlap content

---

## 🚀 Recommended Next Steps

### Priority 1: Fix URL Routing 🔴
Create a catch-all route handler for `/{slug}/{journey}/` pattern to support direct navigation and refresh.

### Priority 2: Test on Real Devices 🟡
Manual testing on actual mobile devices (iOS Safari, Android Chrome) to verify touch interactions and performance.

### Priority 3: Performance Audit 🟢
Run Lighthouse audit to verify metrics meet Bob-Methode standards.

### Priority 4: Accessibility Check 🟢
Verify keyboard navigation, screen reader support, and ARIA labels.

---

## 📝 Test Results Template

```
## Test Session: [Date/Time]
**Tester**: [Name]
**Browser**: [Chrome/Firefox/Safari] [Version]
**Device**: [Desktop/Mobile] [OS]

### Test 1: Initial Load
- Status: [✅ PASS / ❌ FAIL]
- Notes: 

### Test 2: Voice Selection
- Status: [✅ PASS / ❌ FAIL]
- Transition Quality: [Smooth / Jarring / Glitchy]
- Animation FPS: [60fps / <60fps]
- Notes:

### Test 3: Script State
- Status: [✅ PASS / ❌ FAIL]
- Notes:

### Test 4: Refresh Behavior
- Status: [✅ PASS / ❌ FAIL]
- URL After Refresh: 
- Notes:

### Test 5: Back Navigation
- Status: [✅ PASS / ❌ FAIL]
- Notes:

### Console Errors
[Copy/paste any errors here]

### Screenshots
[Attach screenshots of any issues]

### Overall Assessment
[Summary of findings]
```

---

**Report Status**: ✅ READY FOR MANUAL TESTING  
**Code Quality**: ✅ LINTER PASSED  
**Known Issues**: ⚠️ URL ROUTING NEEDS FIX  
**Recommended Action**: PROCEED WITH MANUAL TESTING

---

**Generated By**: CHRIS (The Absolute Bewaker)  
**Compliance**: Bob-Methode ✅ | Chris-Protocol ✅ | Anna-Mandate ✅
