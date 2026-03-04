# Functies, Supabase-tabellen en Instruments

Per domein: **wat elke functie doet**, **aan welke Supabase-tabellen ze gekoppeld zijn**, en **welke LayoutInstruments** de bijbehorende pagina’s gebruiken.

---

## 1. Account (klant)

| Functie | Doel | Supabase-tabellen | Instruments (pagina’s) |
|--------|------|-------------------|-------------------------|
| **GET /api/account/notifications** | Notificaties voor ingelogde gebruiker ophalen. Nu nog vaste welkomst; later uit `notifications`. | Geen (hardcoded); bedoeld: **notifications** | — |
| **GET /api/intelligence/customer-360** | Klant-360 (orders, favorieten, inzichten) voor account en chat. Admin of eigen e-mail/userId. | **users**, **app_configs** (cache); UCI haalt o.a. **orders**, **order_items**, **favorites** | — |
| **AccountDashboardClient** (pagina `/account`) | Hoofddashboard: welkomst, notificaties, orders-link, profiel, “Mijn winkel” (partner/admin), mailbox-link. | Geen directe queries; gebruikt customer-360 en notifications-API. | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, LoadingScreenInstrument, AccountHeroInstrument |
| **account/orders** | Lijst eigen bestellingen + detail. Data via customer-360. | Via customer-360: **orders**, **order_items** | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, LoadingScreenInstrument |
| **account/favorites** | Favoriete stemmen tonen. | Via customer-360 / favorites: **favorites**, **actors** | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, LoadingScreenInstrument |
| **account/settings** | Profiel, taal, (partner) projecten/rating, (admin) Agency Workspace. | **users** (via auth/sessie) | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, InputInstrument, etc. |
| **account/mailbox** (Notificaties) | Lijst notificaties; nu welkomst-placeholder. | Geen (API geeft hardcoded); bedoeld: **notifications** | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, LoadingScreenInstrument |
| **account/partner (PartnerDashboardClient)** | Partner-overzicht, campagnes, affiliate. | Partner-API’s (zie Partner). | PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, BentoCard, BentoGrid |

---

## 2. Auth

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **POST /api/auth/magic-link** | Magic link sturen voor login. | Supabase Auth (geen eigen tabel) | — |
| **GET /api/auth/magic-login** | Token uitwisselen voor sessie; redirect naar bv. `/account/orders`. | — | — |
| **account/callback** (route) | Code voor sessie uitwisselen (Magic Link / reset). | — | — |
| **account/login (LoginPageClient)** | Loginpagina (magic link / wachtwoord). | **users** (na login voor role) | PageWrapperInstrument, FormInstrument, InputInstrument, ButtonInstrument, LoadingScreenInstrument |

---

## 3. Checkout

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **POST /api/checkout/submit** | Bestelling aanmaken: order + order_items; user aanmaken indien nodig. | **actors**, **workshops**, **users**, **orders**, **order_items** | — |
| **POST /api/checkout/webhook** | Webhook (bv. Mollie); cache invalideren. | **app_configs** (cache delete) | — |
| **CheckoutForm** (component) | Formulier checkout; toont prijs, levering, login/guest. | Via checkout/submit | FormInstrument, InputInstrument, ButtonInstrument, ContainerInstrument, etc. |

---

## 4. Casting (proefopname)

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **POST /api/casting/submit** | Casting indienen: users (aanmaken/ophalen), auditions, casting_lists, casting_list_items, slug_registry. | **users**, **auditions**, **casting_lists**, **casting_list_items**, **slug_registry** | — |
| **GET /api/admin/casting/quick-link** | Admin: quick-link voor casting genereren. | (context casting_lists) | — |

---

## 5. Chat & conversaties

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **POST /api/chat** | Chatbericht verwerken; conversatie/message aanmaken of bijwerken; AI-antwoord. | **chat_conversations**, **chat_messages** | — |
| **GET /api/chat/sse** | Server-Sent Events voor stream. | — | — |
| **GET /api/chat/faq** | FAQ voor chat. | (faq) | — |
| **VoicyChat** (component) | Chat-UI in de site. | Via /api/chat | Eigen UI + LayoutInstruments waar van toepassing |

---

## 6. Admin – dashboard & config

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/admin/dashboard/overview** | Overzicht voor admin-dashboard: tellers (orders, approvals, mails, studio, stemmen, edities) en menu-items; World-filter. | **worlds**, **app_configs**, **orders**, **approval_queue**, **system_events**, **workshop_interest**, **actors**, **workshop_editions** | Admin-dashboardpagina’s gebruiken o.a. BentoGrid, HeadingInstrument, TextInstrument, ButtonInstrument |
| **GET /api/admin/config** | Globale config voor app: worlds, languages, experience_levels, actor_statuses, voice_tones, sectors, telephony_subtypes, script_blueprints, actor_demos, genders, countries, journeys, media_types. | **slug_registry**, **worlds**, **languages**, **experience_levels**, **actor_statuses**, **voice_tones**, **sectors**, **telephony_subtypes**, **script_blueprints**, **actor_demos**, **genders**, **countries**, **journeys**, **media_types** | — |

---

## 7. Admin – orders, funnel, insights

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET/POST /api/admin/orders**, **/api/admin/orders/[id]** | Orders beheren, detail, acties. | **orders**, **order_items** (en gerelateerd) | Admin orders-pagina’s: tabel, forms, ButtonInstrument, etc. |
| **GET /api/admin/funnel** | Funnel-data: funnel_events, workshop_interest, orders. | **funnel_events**, **workshop_interest**, **orders** | — |
| **GET /api/admin/insights** | Inzichten (users, orders, chat). | **users**, **orders**, **chat_conversations** | — |

---

## 8. Admin – mailbox (e-mail)

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/mailbox/inbox** | Inbox van het team (e-mail); alleen admin. | **mail_content** | Admin mailbox-pagina |
| **POST /api/mailbox/sync** | Mail synchroniseren. | **mail_content** | — |
| **POST /api/mailbox/contact** | Contactformulier: lead + chat-conversatie/message. | **central_leads**, **chat_conversations**, **chat_messages** | — |
| **GET /api/mailbox/insights** | Inzichten uit mails. | **mail_content** | — |

---

## 9. Admin – stemmen (actors)

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/admin/actors** | Lijst acteurs; filter op world. | **actors**, **worlds**, **media** | — |
| **GET/PATCH /api/admin/actors/[id]** | Acteur detail en bijwerken; talen/tones/demos. | **actors**, **actor_languages**, **actor_tones**, **actor_demos** | — |
| **GET /api/admin/actors/demos/[id]** | Demo beheren. | **actor_demos** | — |
| **POST /api/admin/actors/upload** | Upload (foto/media). | **voices**, **media** | — |

---

## 10. Admin – Studio (workshops, edities, inschrijvingen)

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/admin/studio/editions** | Workshop-edities. | (workshop_editions, workshops) | — |
| **POST /api/admin/studio/create-edition** | Nieuwe editie aanmaken. | **workshop_editions**, **workshops** | — |
| **GET /api/admin/studio/inschrijvingen** (pagina data) | Inschrijvingen beheren. | **workshop_interest**, **workshop_editions**, **workshops** | — |
| **GET /api/admin/studio/locations** | Locaties. | **locations** | — |
| **GET /api/admin/studio/instructors** | Instructors. | **instructors** | — |
| **GET /api/studio/workshops** | Publieke workshop-lijst. | **workshops**, **workshop_editions**, **workshop_skill_dna**, **workshop_skills** | — |
| **POST /api/studio/workshop-interest** | Interesseformulier workshop. | **workshop_interest**, **workshop_interest_products**, **system_events** | — |

---

## 11. Admin – systeem, logs, routing

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/admin/system/logs** | System logs (events); filter op world. | **worlds**, **system_events** | — |
| **POST /api/admin/system/watchdog** | Watchdog-events schrijven. | **system_events** | — |
| **GET /api/admin/routing/list** | Lijst routing/slugs. | **slug_registry** | — |
| **GET /api/admin/slugs** | Slug-registry. | **slug_registry** | — |

---

## 12. VoiceGlot (vertalingen)

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/translations** | Vertalingen ophalen. | **translations** | — |
| **GET /api/admin/voiceglot/list** | Lijst vertalingen + registry. | **translations**, **translation_registry** | — |
| **POST /api/admin/voiceglot/update** | Vertaling bijwerken. | **translations** (Drizzle) | — |
| **GET /api/admin/voiceglot/stats** | Stats; cache in app_configs. | **app_configs**, **translation_registry**, **translations** | — |
| **POST /api/admin/voiceglot/turbo-heal** | Heal vertalingen; registry + translations. | **translation_registry**, **translations**, **languages** | — |

---

## 13. Marketing & visitors

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **POST /api/marketing/track** | Bezoeker/event tracken. | **visitors**, **visitor_logs** | — |
| **GET /api/admin/marketing/stats** | Marketing-statistieken. | **visitors** | — |
| **GET /api/admin/marketing/live** | Live bezoekers. | **visitors**, **visitor_logs** | — |
| **GET /api/admin/visitors/recent** | Recente sessies. | **voicejar_sessions** | — |
| **GET /api/admin/visitors/live** | Live voicejar-sessies. | **voicejar_sessions** | — |

---

## 14. Overige

| Functie | Doel | Supabase-tabellen | Instruments |
|--------|------|-------------------|-------------|
| **GET /api/faq** | FAQ voor site/chat. | **faq** | — |
| **GET /api/home/config** | Home-journey content + talen. | **app_configs**, **languages** | — |
| **GET /api/pricing/config** | Prijsconfiguratie. | **app_configs** | — |
| **POST /api/voicejar/record** | Voicejar-sessie/events. | **voicejar_sessions**, **voicejar_events** | — |
| **GET /api/admin/academy** | Academy-data (workshops, progress, submissions). | **workshops**, **course_progress**, **course_submissions** | — |
| **POST /api/academy/submit** | Academy-inzending (audio). | **audio-submissions** (of gelijknamige tabel), **users** | — |
| **GET /api/partner/dashboard** | Partner-dashboard data; requirePartner. | (afhankelijk van implementatie) | — |
| **POST /api/partner/generate-link** | Partner affiliate-link; requirePartner. | (afhankelijk van implementatie) | — |

---

## 15. Instrumenten (LayoutInstruments) – overzicht

Gebruik volgens **310-LAYOUT-INSTRUMENTS.mdc** (HTML Zero):

| Instrument | Gebruik |
|------------|--------|
| **PageWrapperInstrument** | Hoofdcontainer van een pagina (`<main>`). |
| **SectionInstrument** | Sectie binnen een pagina. |
| **ContainerInstrument** | Algemene layout/grouping (`<div>`). |
| **HeadingInstrument** | Titels (level 1–6). |
| **TextInstrument** | Tekst (p/span). |
| **ButtonInstrument** | Knoppen en links. |
| **InputInstrument**, **SelectInstrument**, **OptionInstrument** | Formulieren. |
| **FormInstrument**, **LabelInstrument** | Formulieren. |
| **LoadingScreenInstrument** | Full-screen loader. |
| **FixedActionDockInstrument** | Vaste actiebalk onderaan. |

Andere UI-componenten (bijv. **BentoGrid**, **BentoCard**, **AccountHeroInstrument**, **VoiceglotText**) staan in `@/components/ui/` en worden naast deze instruments gebruikt.

---

## 16. Referentie: belangrijke Supabase-tabellen (schema)

Voor de volledigheid, tabellen die in dit document voorkomen:

**Auth & gebruikers:** users, favorites  
**Orders:** orders, order_items, order_statuses  
**Casting:** casting_lists, casting_list_items, auditions  
**Content & routing:** slug_registry, content_articles, content_blocks, translations, translation_registry  
**Actors:** actors, actor_demos, actor_languages, actor_tones, media, voices  
**Studio/Academy:** workshops, workshop_editions, workshop_interest, workshop_interest_products, locations, instructors, courses, lessons, course_progress, course_submissions  
**Chat & mailbox:** chat_conversations, chat_messages, central_leads, mail_content  
**Systeem:** system_events, app_configs, worlds, journeys  
**Admin/operational:** approval_queue, funnel_events, visitors, visitor_logs, voicejar_sessions, voicejar_events  
**Overig:** faq, reviews, ademing_tracks, nav_menus, market_configs, notifications  

Schema-definities: `packages/database/src/schema/index.ts`.
