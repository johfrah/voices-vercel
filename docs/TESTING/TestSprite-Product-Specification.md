# Voices – Product Specification Document (TestSprite)

**Version:** 1.1  
**Purpose:** Structured product specification for TestSprite MCP test generation and execution.  
**Product:** Voices – multi-tenant voice-over & experience platform (9 Worlds).

---

## 1. Product overview

| Attribute | Description |
|-----------|-------------|
| **Product name** | Voices |
| **Domains** | voices.be, johfrah.be, ademing.be, youssefzaki.eu, voices.academy |
| **Tech stack** | Next.js 14, React 18, Supabase (DB + Storage), Vercel |
| **App type** | Multi-tenant web application; frontend + Next.js API routes |
| **Default base URL (local)** | http://localhost:3000 |

The platform serves **9 Worlds** (business verticals) from a single Next.js app. Each World has its own entry paths, navigation, and content. Routing is ID-first: all dynamic routes resolve via a central `slug_registry` to an `entity_id`. The frontend uses a design system of **LayoutInstruments** (no raw HTML tags in components).

### 1.1 Worlds (business verticals)

| World ID | World name | Domain/path | Lead |
|----------|------------|-------------|------|
| 0 | Foyer | `/contact`, `/terms` (global) | Mat |
| 1 | Agency | voices.be, `/agency` | Voicy |
| 2 | Studio | voices.be/studio, `/studio` | Berny |
| 3 | Academy | voices.academy, `/academy` | Berny |
| 5 | Portfolio | johfrah.be, `/freelance` (path) | Laya |
| 6 | Ademing | ademing.be, `/ademing` | Mat |
| 7 | Freelance | `/freelance` | Chris |
| 8 | Partner | `/partners` | Sally |
| 10 | Johfrai | johfrai.be, `/johfrai` | Voicy |
| 25 | Artist | youssefzaki.eu, `/artist/youssef` | Laya |

### 1.2 Agency journeys (product types)

Within the Agency flow, users choose a **journey** (type of voice product). These map to URL segments and configurator steps:

| Journey code | Label (example) | URL pattern (actor slug) | Use case |
|--------------|----------------|---------------------------|----------|
| video | Video | `/{actor-slug}/video/` | Corporate, website voice-over |
| commercial | Advertentie | `/{actor-slug}/commercial/` | Radio, TV, online ads |
| telephony | Telefonie | `/{actor-slug}/telephony/` or `telefoon` | Voicemail, IVR |

Example: after selecting actor "serge" on Agency, the app may navigate to `/serge/video/` (script/configurator step).

---

## 2. Goals and success criteria

- **Discoverability:** Users can find voice actors, workshops, and content per World via clear navigation and search/filters.
- **Conversion:** Key flows (choose voice → script → checkout; workshop sign-up; contact) complete without errors.
- **Consistency:** UI is responsive, uses LayoutInstruments, and respects market/locale (e.g. nl-BE, fr-BE).
- **Performance:** No blocking main-thread; heavy UI (chat, audio, docks) loaded with `next/dynamic` and `ssr: false` where required.

---

## 3. User personas (for test scenarios)

| Persona | Goal | Typical flows |
|---------|------|----------------|
| **Visitor (Agency)** | Find and book a voice for a project | Homepage → Agency → filter voices → choose voice → script/configurator → checkout or contact |
| **Visitor (Studio)** | Discover workshops and sign up | Homepage / Studio → workshop list → workshop detail → info or sign-up |
| **Visitor (Academy)** | Browse learning content | Academy → courses/learning environment |
| **Visitor (Ademing)** | Use meditation/breathing content | Ademing → dashboard/content |
| **Visitor (Portfolio/Freelance)** | View freelancer work and request commissions | johfrah.be / Freelance → portfolio pages |
| **Logged-in user** | Manage account, view orders/partner dashboard | Login → account dashboard / partner dashboard |

---

## 4. Functional requirements and user flows

### 4.1 Global shell (all pages)

- **FR-G1** Global navigation (GlobalNav) is visible and reflects the current World (Agency, Studio, Academy, Ademing, Johfrai, etc.) based on path or market.
- **FR-G2** Footer is present with links and legal/contact where applicable.
- **FR-G3** On mobile, a floating dock (MobileFloatingDock) is available for key actions.
- **FR-G4** No raw HTML in layout; components use LayoutInstruments (ContainerInstrument, HeadingInstrument, TextInstrument, SectionInstrument, ButtonInstrument, etc.).

**Acceptance (example):**  
Load http://localhost:3000 → header and footer render; navigation items are clickable; no console errors from missing components.

---

### 4.2 Agency World (voices.be, /agency)

- **FR-A1** Homepage or Agency entry loads with hero, filters, and a grid of voice actors (VoiceGrid, VoiceCard). Only actors with `status = 'live'` and `is_public = true` are shown on the public site.
- **FR-A2** User can filter by language, tone, or other visible filters; grid updates. Language dropdown only shows languages that have at least one active (live + public) actor.
- **FR-A3** User can click “Kies stem” (or equivalent CTA) on a voice card; CheckoutContext is updated; app navigates to the script/configurator step (e.g. `/{actor-slug}/video/`). Animation: VoiceGrid exits, selected card morphs to sidebar, configurator enters.
- **FR-A4** Script/configurator step (ConfiguratorPageClient) shows script input and journey-specific options (video/commercial/telephony). User can add to cart ("Bestellen") or request quote; email may be required before adding to cart.
- **FR-A5** Prices are displayed in the correct market currency and format (e.g. € for BE). VoiceCard shows a calculated starting price (e.g. from SlimmeKassa).
- **FR-A6** VoicesMasterControl (journey/filter controls) remains visible at top when in script step. CastingDock appears when at least one actor is selected and user is not on an excluded page (e.g. Artist, Launchpad).
- **FR-A7** On page refresh on `/agency/` with no selected actor, the app reverts to voice step (VoiceGrid). Refresh on `/{slug}/{journey}/` is handled by SmartRouter (dynamic route).

**Key UI components (for test selectors):**  
GlobalNav, AgencyHeroInstrument, VoicesMasterControl, VoiceGrid, VoiceCard, "Kies stem" button, ConfiguratorPageClient, CastingDock, MobileFloatingDock, FooterWrapper, LiquidBackground.

**Acceptance (example):**  
Navigate to /agency/ → see actor cards → click "Kies stem" on one → URL changes to /{slug}/video/ (or journey); configurator and selected actor sidebar visible; price displayed correctly.

---

### 4.3 Studio World (/studio, voices.be/studio)

- **FR-S1** Studio landing or list page shows workshops (WorkshopCard). Workshops shown have appropriate status (e.g. live) and visibility.
- **FR-S2** User can open a workshop detail page via `/studio/[slug]`. Detail page includes: WorkshopHeroIsland, SkillDNAIsland, DayScheduleIsland, InstructorLocationIsland, ReviewGrid, WorkshopInterestForm (or similar). Content and sign-up info are visible.
- **FR-S3** Workshop media (images) load from Supabase Storage; file paths without accents/spaces. No broken images for valid workshop entries.
- **FR-S4** Special Studio sub-routes (resolved before slug_registry or as articles): `/studio/quiz` (WorkshopQuiz), `/studio/doe-je-mee`, `/studio/faq`, `/studio/contact`. Each loads the correct layout and content.
- **FR-S5** Contact or sign-up actions (e.g. WorkshopInterestForm) are available where designed; forms validate and submit (sandbox/stub in tests).

**Key UI components:**  
WorkshopCard, WorkshopHeroIsland, SkillDNAIsland, DayScheduleIsland, ReviewGrid, WorkshopInterestForm, WorkshopQuiz, LiquidBackground, PageWrapperInstrument.

**Acceptance (example):**  
Navigate to /studio/ → list of workshops → click one → detail page with hero, schedule, form; navigate to /studio/quiz → quiz component visible.

---

### 4.4 Academy World (/academy)

- **FR-Ac1** Academy entry shows learning/course content or navigation.
- **FR-Ac2** User can navigate to course or lesson pages without errors.

**Acceptance (example):**  
Navigate to /academy/ → content or menu visible; sub-routes load.

---

### 4.5 Ademing World (/ademing, ademing.be)

- **FR-Ad1** Ademing entry shows meditation/breathing dashboard or content.
- **FR-Ad2** Key UI elements (e.g. session start, content list) are present and usable.

**Acceptance (example):**  
Navigate to /ademing/ → dashboard or content visible; no critical JS errors.

---

### 4.6 Portfolio / Freelance (johfrah.be, /freelance)

- **FR-P1** Portfolio or freelance entry shows freelancer/commission content.
- **FR-P2** User can navigate to project or commission-related pages.

**Acceptance (example):**  
Navigate to /freelance/ (or johfrah.be) → portfolio content visible; links work.

---

### 4.7 Contact and forms

- **FR-F1** World-specific or global contact forms (e.g. /contact, /studio/contact) are present and submittable (submit may be stubbed or sandbox in tests).
- **FR-F2** Form validation behaves (e.g. required fields, format); error messages do not break layout.

**Acceptance (example):**  
Open contact page → fill required fields → submit (or validate); no layout break.

---

### 4.8 Authentication (if test account provided)

- **FR-Auth1** Login form accepts credentials and redirects or shows success/error.
- **FR-Auth2** After login, account or partner dashboard is accessible and shows expected sections.

**Acceptance (example):**  
Login with test credentials → redirect to dashboard; dashboard content loads.  
*Note:* Use only provided test credentials; no production accounts.

---

### 4.9 Checkout flow (Agency → Cart → Checkout)

- **FR-C1** From configurator step, user can click "Bestellen" (or equivalent). If required, email is collected and validated before adding to cart.
- **FR-C2** After adding to cart, user can go to cart (`/cart`) or checkout (`/checkout`). CheckoutContext holds selected actor, journey, and cart state.
- **FR-C3** Checkout page (`/checkout`) loads without errors; shows CheckoutPageClient and MobileCheckoutSheet. No "useCheckout is not defined" or chunk load errors when CheckoutProvider is present in root.
- **FR-C4** Checkout configurator entry: `/checkout/configurator` exists and can be used for direct configurator access where designed.
- **FR-C5** Success page: `/checkout/success` is available after a completed order (stub or sandbox in tests; do not trigger real payment).

**Key components:** CheckoutContext, CheckoutProvider, ConfiguratorPageClient (Bestellen button), Cart page, CheckoutPageClient, MobileCheckoutSheet, checkout/success.

**Acceptance (example):**  
Agency → select voice → script step → Bestellen (with email if required) → cart or checkout page loads; checkout page shows order summary and no console errors.

---

### 4.10 Voicy Chat and Johfrai World

- **FR-V1** Voicy Chat (`components/ui/VoicyChat.tsx`, VoicyChatV2) may be present on certain pages; requires GOOGLE_API_KEY for AI responses. Without it, chat may show a graceful offline message.
- **FR-V2** Johfrai World (`/johfrai`) has its own entry and content; navigation and CTAs work without errors.

---

## 5. Non-functional requirements (test-relevant)

- **NFR-1** **Routing:** Dynamic routes resolve via slug_registry/entity_id; no reliance on hardcoded slugs in core logic.
- **NFR-2** **UI components:** New components use LayoutInstruments only; no raw `<div>`, `<h1>`, `<p>`, `<section>`, `<main>`, `<button>` in new code. Catalog: ContainerInstrument, HeadingInstrument (level 1–6), TextInstrument, SectionInstrument, ButtonInstrument, PageWrapperInstrument, and other instruments from `@/components/ui/LayoutInstruments`.
- **NFR-3** **Data shape:** API and database use `snake_case` for fields; frontend may map for display.
- **NFR-4** **Locale:** Use ISO locale codes (e.g. nl-BE, fr-BE); no full language names in API/DB keys.
- **NFR-5** **Markets:** Host/domain → market/world is determined by MarketManager; no `host.includes()` in components.
- **NFR-6** **Heavy components:** Chat, audio players, and floating docks use `next/dynamic` with `ssr: false` to protect LCP and avoid hydration issues.

---

## 6. Technical context for test automation

### 6.1 URLs and base

- **Base URL (local):** http://localhost:3000  
- **API base (same origin):** http://localhost:3000/api/

### 6.2 Route list (non-admin, test-relevant)

| Path | Description |
|------|-------------|
| `/` | Home |
| `/agency`, `/agency/` | Agency World (voice grid) |
| `/studio`, `/studio/` | Studio World (workshop list) |
| `/studio/[slug]` | Studio workshop detail or article (e.g. quiz, doe-je-mee, faq, contact) |
| `/studio/quiz` | Workshop quiz |
| `/studio/doe-je-mee` | Studio sub-foyer |
| `/academy`, `/academy/` | Academy World |
| `/ademing`, `/ademing/` | Ademing World |
| `/ademing/offline` | Ademing offline page |
| `/johfrai`, `/johfrai/` | Johfrai World |
| `/freelance`, `/freelance/` | Freelance/Portfolio |
| `/contact`, `/terms` | Global Foyer (contact, terms) |
| `/partners` | Partner World |
| `/[slug]`, `/[slug]/[journey]/`, `/[slug]/[journey]/[medium]` | SmartRouter: actor profile, configurator (e.g. /serge/video/) |
| `/checkout` | Checkout page |
| `/checkout/configurator` | Checkout configurator |
| `/checkout/success` | Order success |
| `/cart` | Cart |
| `/account`, `/account/login`, `/account/partner`, `/account/orders`, `/account/settings`, `/account/mailbox`, `/account/favorites`, `/account/signup` | Account (auth required for most) |

### 6.3 Reserved paths (must NOT be routed via SmartRouter)

These are system routes; SmartRouter returns 404 if they are requested via the catch-all:

`admin`, `backoffice`, `account`, `api`, `auth`, `checkout`, `cart`, `demos`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `sitemap`, `static`, `assets`, `_next`, `wp-content`, `wp-includes`

### 6.4 API endpoints (safe for smoke/contract tests)

All under `http://localhost:3000/api/`. Use GET where possible; avoid triggering side effects in tests.

- `/api/chat` – Chat (POST; may require body)
- `/api/admin/config` – Config (admin/key may be required)
- `/api/checkout/create-order` – Create order (POST; sandbox only)
- `/api/checkout/submit` – Submit checkout (POST; sandbox only)
- `/api/auth/magic-link` – Magic link (POST; sandbox only)
- `/api/johfrai/demos` – Johfrai demos
- `/api/artist/donate` – Artist donate (sandbox only)

Do not call webhooks, Telegram, or payment providers with real data.

### 6.5 Auth and payments

- **Auth:** Use only test credentials provided in TestSprite config; no production or real user data.
- **Payments:** Not in scope for automated tests unless explicitly in sandbox mode; do not trigger real payments (Stripe/Mollie).

---

## 7. Error handling and edge cases

- **404 / notFound:** Requests to SmartRouter for unknown slugs trigger Lazy Discovery (attempt to discover actor/article/workshop and register in slug_registry). If still not found, Next.js `notFound()` is returned. Reserved paths requested via catch-all return 404.
- **Actor visibility:** On the public site, only actors with `status = 'live'` AND `is_public = true` may be shown. Ignoring this double filter is a critical bug.
- **Empty states:** If no actors match filters on Agency, the grid may be empty; no crash. If no workshops, Studio list may be empty.
- **Refresh / state recovery:** On `/agency/`, if the user had been in script step but context has no selected actor (e.g. after refresh), the app reverts to voice step and shows VoiceGrid. Console may log: `[AgencyContent] Script step active but no actor selected. Reverting to voice step.`
- **Locale:** Use ISO codes (nl-BE, fr-BE). Header `x-voices-lang` or middleware sets locale; MarketManager derives market and world from host/path.
- **Heavy components:** Chat, audio, CastingDock, and similar are loaded with `next/dynamic` and `ssr: false`. Tests should allow time for client hydration before asserting on these.

---

## 8. Out of scope for this specification

- Admin/backoffice-only flows (unless explicitly added to test scope).
- Real payment flows (Stripe/Mollie); only sandbox or mocked if ever in scope.
- Real email/SMS sending; use sandbox or mocks.
- Third-party OAuth or external IDP flows unless stubbed.
- Performance/load testing (optional; not required for this PSD).
- SEO/crawlability (optional; not required for this PSD).

---

## 9. Test data and environment

- **Environment:** The app under test **must run on localhost**. Start with `npm run dev` so the app is reachable at **http://localhost:3000**. TestSprite will open and navigate this URL during frontend tests; if the server is not running, tests will fail.
- **PRD/PSD:** This document (and optionally `TestSprite-PRD-draft.md`) can be uploaded as the Product Requirements / Product Specification for TestSprite bootstrap.
- **Test credentials:** Provide via TestSprite configuration only when testing authenticated flows; never hardcode in repo.

---

## 10. Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | — | Initial PSD |
| 1.1 | — | Worlds table, Agency journeys, expanded Agency/Studio/Checkout flows, UI components, route list, reserved paths, API list, error handling and edge cases, Voicy Chat, actor visibility mandate |

---

*End of Product Specification Document. TestSprite may use this to generate normalized requirements, test plans, and executable UI/API tests.*
