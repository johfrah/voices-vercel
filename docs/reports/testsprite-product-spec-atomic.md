# TestSprite Product Specification (Atomic)

## 1) Product Snapshot
- Product name: Voices Headless
- Stack: Next.js 14 monorepo + Supabase (cloud) + Drizzle
- Primary purpose: multi-tenant voice-over platform with world-specific routing and journeys
- Core architecture constraints:
  - SmartRouter resolves dynamic routes via `slug_registry`
  - world-aware behavior is derived from path and context
  - telephony script input uses one field with bracket markers

## 2) Test Mission
Validate critical user-facing flows with zero regression on routing, world context, and high-value UI interactions.

## 3) Test Scope (In)
1. Routing and world-aware navigation behavior
2. Studio route interception behavior
3. Telephony script single-field parsing behavior
4. Voicy chat graceful fallback when AI key is unavailable
5. Console cleanliness on critical pages

## 4) Out of Scope
1. Real production payments
2. Real outgoing email/SMS/webhook side effects
3. Destructive database writes in production datasets
4. Full cross-browser matrix beyond smoke level

## 5) Environment and Access
- Base URL: preview/staging URL under test
- Auth roles:
  - public visitor
  - authenticated admin (when needed)
- Runtime assumptions:
  - Supabase is external cloud dependency
  - no local database required for core UI verification

## 6) Safety Rules (Mandatory)
1. Sandbox or read-only mode only for any flow with external side effects.
2. No real payment execution.
3. No real outbound communication triggers.
4. If sandbox is unavailable: perform dry-run validation and report skipped side effects explicitly.

## 7) Atomic Journeys

### AJ-001: World-aware navigation on studio path
- Goal: confirm `/studio/` context is detected from pathname first.
- Preconditions: app is reachable and navigation is visible.
- Steps:
  1. Open `/studio/`.
  2. Inspect global navigation variant.
  3. Navigate to one studio child page and back.
- Expected:
  - studio navigation context remains correct.
  - no fallback to unrelated world navigation.

### AJ-002: SmartRouter dynamic resolution
- Goal: confirm dynamic pages resolve through registry-driven flow.
- Preconditions: test slug that should resolve via SmartRouter.
- Steps:
  1. Open dynamic route candidate.
  2. Confirm page resolves and renders expected entity content.
  3. Open one additional dynamic route in same world.
- Expected:
  - no 404 for valid registered slug.
  - content appears for resolved entity.

### AJ-003: Studio sub-route interception
- Goal: verify `/studio/*` special handling does not break known sub-pages.
- Steps:
  1. Open `/studio/quiz`.
  2. Open `/studio/doe-je-mee`.
  3. Open `/studio/contact` and `/studio/faq`.
- Expected:
  - each route resolves to intended studio-specific behavior.
  - no unexpected fallback into unrelated routing handlers.

### AJ-004: Telephony single-field script format
- Goal: validate bracket-marker script input behavior.
- Sample input:
  - `[welkom] Welkom bij ... [wacht] Een moment geduld ...`
- Steps:
  1. Open telephony journey form.
  2. Enter one long script with bracket markers in the single text field.
  3. Continue flow until validation/preview step.
- Expected:
  - system accepts one-field input format.
  - marker-based multi-file intent is preserved.
  - no forced split into multiple message fields.

### AJ-005: Voicy chat graceful fallback
- Goal: ensure chat does not crash when AI key/model path is unavailable.
- Steps:
  1. Open page with Voicy chat.
  2. Trigger one chat request in a key-missing or offline-like condition.
- Expected:
  - graceful fallback message appears.
  - UI stays stable without hard crash.

## 8) Non-Functional Acceptance Criteria
1. No uncaught TypeError on tested flows.
2. No blocking console errors during core interactions.
3. Key routes load and remain interactive.
4. Main navigation remains usable after each journey check.

## 9) Test Data and Credentials Template
- `base_url`:
- `public_test_slug_1`:
- `public_test_slug_2`:
- `admin_email`:
- `admin_password`:
- `telephony_test_payload`:
- `chat_test_prompt`:

## 10) Reporting Format (Required)
For each failed check, report:
1. Journey ID (for example `AJ-003`)
2. Exact URL
3. Step index
4. Expected vs actual
5. Screenshot or replay timestamp
6. Console/network evidence (if relevant)
7. Severity: blocker / high / medium / low

## 11) Definition of Done
- All atomic journeys executed.
- No blocker regressions.
- Safety rules respected.
- Final report includes clear pass/fail status per journey ID.
