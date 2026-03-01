# 🎯 Nuclear 50 Scenarios 26-37: Action Items & Next Steps

**Date**: 2026-02-28  
**Version**: v2.16.007  
**Agent**: Chris/Autist (Technical Director)

---

## 🚨 IMMEDIATE ACTIONS (P0) - Complete Within 24 Hours

### 1. Generate Admin Key for Testing
**Status**: ⏳ PENDING  
**Command**:
```bash
cd 1-SITE/apps/web
npx tsx src/scripts/generate-admin-link.ts
```

**Expected Output**: Admin link with persistent key  
**Purpose**: Enable authenticated browser testing of admin dashboards

**Assignee**: Chris/Autist  
**Estimated Time**: 5 minutes

---

### 2. Re-run Browser Tests with Authentication
**Status**: ⏳ PENDING (Blocked by Action #1)  
**Command**:
```bash
export ADMIN_KEY="[key_from_step_1]"
npx tsx 3-WETTEN/scripts/browser-test-scenarios-26-37.ts
```

**Expected Outcome**: 
- Berny workshop UI: ✅ PASS
- Laya artist UI: ✅ PASS
- Mat dashboard: 🟠 Verify data table rendering

**Assignee**: Chris/Autist  
**Estimated Time**: 10 minutes

---

### 3. Investigate Mat Dashboard UI Rendering
**Status**: ⏳ PENDING  
**File**: `1-SITE/apps/web/src/app/admin/marketing/visitors/page.tsx`

**Issue**: Dashboard page loads but data table not visible

**Debug Steps**:
1. Check if `LiveVisitorDashboard` component is properly imported
2. Verify data fetching in client component
3. Check for hydration errors in browser console
4. Ensure `visitors` data is being passed to table component

**Expected Fix**: Data table renders with visitor data

**Assignee**: Chris/Autist  
**Estimated Time**: 30 minutes

---

## 🔧 SHORT-TERM ACTIONS (P1) - Complete Within 1 Week

### 4. Document Vault's Supabase Storage Integration
**Status**: ⏳ PENDING  
**File**: `3-WETTEN/docs/ARCHITECTURE/CODY-VAULT-ARCHITECTURE.md` (to be created)

**Scope**:
- Document how Vault uses Supabase Storage (not database tables)
- Explain Dropbox proxy integration
- List supported file operations (browse, upload, delete)
- Clarify why `vault_assets` table doesn't exist

**Assignee**: Cody (Vault Guardian)  
**Estimated Time**: 1 hour

---

### 5. Verify Berny Workshop UI with Authentication
**Status**: ⏳ PENDING (Blocked by Action #1)  
**Route**: `/admin/studio/workshops`

**Test Scenarios**:
1. Workshop list loads with 10 workshops
2. Click on workshop opens detail page
3. Edition management interface visible
4. Participant management functional

**Expected Outcome**: All UI elements render correctly

**Assignee**: Berny (Studio Lead)  
**Estimated Time**: 20 minutes

---

### 6. Verify Laya Artist UI with Authentication
**Status**: ⏳ PENDING (Blocked by Action #1)  
**Route**: `/admin/artists`

**Test Scenarios**:
1. Artist list loads with 20 profiles
2. Click on artist opens edit page
3. Bio and profile fields editable
4. Portfolio media management visible

**Expected Outcome**: All UI elements render correctly

**Assignee**: Laya (Artist Lead)  
**Estimated Time**: 20 minutes

---

### 7. Fix Kelly Pricing Data Table Visibility
**Status**: ⏳ PENDING  
**Route**: `/admin` (main dashboard)

**Issue**: Data table not visible on main admin page

**Investigation**:
1. Check if pricing data table is on a sub-route (e.g., `/admin/pricing` or `/admin/rates`)
2. Verify if main dashboard shows pricing widgets instead of full table
3. Confirm pricing edit functionality on actor detail pages

**Expected Fix**: Clarify where pricing table should be visible

**Assignee**: Kelly (Pricing Guardian)  
**Estimated Time**: 15 minutes

---

## 📋 LONG-TERM ACTIONS (P2) - Complete Within 1 Month

### 8. Consider Adding `vault_assets` Database Table
**Status**: 🤔 UNDER CONSIDERATION  
**Rationale**: Better asset tracking, metadata storage, and audit trail

**Benefits**:
- Track asset uploads/downloads
- Store metadata (file size, type, uploader, timestamp)
- Enable asset search and filtering
- Audit trail for compliance

**Trade-offs**:
- Adds complexity (dual storage: DB + Supabase Storage)
- Requires sync logic between DB and Storage
- May be overkill if Supabase Storage metadata is sufficient

**Decision Required**: Bob (Grand Visionary)  
**Estimated Time**: 4 hours (if approved)

---

### 9. Align `visitor_logs` Schema with Test Expectations
**Status**: ⏳ PENDING  
**Issue**: Test expects `visitor_logs.timestamp` but column doesn't exist

**Investigation**:
1. Check actual `visitor_logs` schema in Supabase
2. Identify correct timestamp column name (likely `created_at`)
3. Update test script to use correct column name
4. Document schema in `3-WETTEN/docs/SCHEMA/VISITOR_LOGS.md`

**Expected Fix**: Test uses correct column name

**Assignee**: Mat (Visitor Intelligence Guardian)  
**Estimated Time**: 30 minutes

---

### 10. Document `actor_media` Relationship Structure
**Status**: ⏳ PENDING  
**Issue**: Test expects `actor_media` table but it doesn't exist

**Investigation**:
1. Check how actor portfolio media is currently stored
2. Identify if `media` table has `actor_id` foreign key
3. Document the actual relationship structure
4. Update test to use correct table/relationship

**Expected Fix**: Test uses correct media relationship

**Assignee**: Laya (Artist Lead)  
**Estimated Time**: 1 hour

---

## 📊 Progress Tracking

| Action | Priority | Status | Assignee | Estimated Time | Actual Time |
|--------|----------|--------|----------|----------------|-------------|
| 1. Generate Admin Key | P0 | ⏳ PENDING | Chris | 5 min | - |
| 2. Re-run Browser Tests | P0 | ⏳ PENDING | Chris | 10 min | - |
| 3. Fix Mat Dashboard UI | P0 | ⏳ PENDING | Chris | 30 min | - |
| 4. Document Vault | P1 | ⏳ PENDING | Cody | 1 hour | - |
| 5. Verify Berny UI | P1 | ⏳ PENDING | Berny | 20 min | - |
| 6. Verify Laya UI | P1 | ⏳ PENDING | Laya | 20 min | - |
| 7. Fix Kelly Table | P1 | ⏳ PENDING | Kelly | 15 min | - |
| 8. Vault Assets Table | P2 | 🤔 CONSIDERATION | Bob | 4 hours | - |
| 9. Visitor Logs Schema | P2 | ⏳ PENDING | Mat | 30 min | - |
| 10. Actor Media Docs | P2 | ⏳ PENDING | Laya | 1 hour | - |

**Total Estimated Time**: 
- P0: 45 minutes
- P1: 2 hours 35 minutes
- P2: 5 hours 30 minutes

---

## 🎯 Success Criteria

### Phase 1: Authenticated Testing (P0)
- [ ] Admin key generated and stored securely
- [ ] Browser tests re-run with authentication
- [ ] All 5 dashboards accessible via browser
- [ ] Mat dashboard data table renders correctly

### Phase 2: UI Validation (P1)
- [ ] Berny workshop UI fully functional
- [ ] Laya artist UI fully functional
- [ ] Kelly pricing table location clarified
- [ ] Vault architecture documented

### Phase 3: Schema Alignment (P2)
- [ ] `visitor_logs` schema documented and tests updated
- [ ] `actor_media` relationship documented
- [ ] Decision made on `vault_assets` table

---

## 📢 Communication Plan

### Telegram Updates
Send update to Johfrah after completing:
1. ✅ Scenarios 26-37 initial test (SENT)
2. ⏳ P0 actions completed (authenticated browser tests)
3. ⏳ P1 actions completed (UI validation)
4. ⏳ Final certification (all dashboards operational)

### Report Updates
Update `2026-02-27-NUCLEAR-50-REPORT.md` after:
1. ✅ Database tests completed (DONE)
2. ✅ Browser tests completed (DONE)
3. ⏳ Authenticated browser tests completed
4. ⏳ Final verdict issued

---

## 🏆 Final Certification Criteria

To certify scenarios 26-37 as **✅ FULLY OPERATIONAL**, all of the following must pass:

1. **Database Layer**: ✅ ALREADY PASSED (8/12 tests, 4 non-critical warnings)
2. **Browser Layer (Authenticated)**: ⏳ PENDING (re-test required)
3. **UI Functionality**: ⏳ PENDING (manual verification)
4. **Documentation**: ⏳ PENDING (Vault architecture)

**Current Status**: 🟠 PARTIALLY OPERATIONAL (54%)  
**Target Status**: ✅ FULLY OPERATIONAL (>90%)

---

**Next Review**: 2026-03-01 (after P0 actions completed)  
**Final Certification**: 2026-03-07 (after all P1 actions completed)

**Signed**: Chris/Autist (Technical Director)  
**Date**: 2026-02-28T09:45:00.000Z
