import { relations } from 'drizzle-orm';
import { bigint, boolean, decimal, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, unique, customType, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';

/**
 * VOICES OS - MASTER DATABASE SCHEMA (2026)
 * 
 * Absolute Source of Truth voor de data-architectuur van Voices.be.
 * 100% compliant met de Voices-architectuur.
 */

// 🏷️ ENUMS
export const senderTypeEnum = pgEnum('sender_type', ['user', 'admin', 'ai']);
export const statusEnum = pgEnum('status', ['pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled', 'unavailable']);
export const leadVibeEnum = pgEnum('lead_vibe', ['cold', 'warm', 'hot', 'burning']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['waiting', 'uploaded', 'admin_review', 'client_review', 'approved', 'rejected', 'revision']);
export const experienceLevelEnum = pgEnum('experience_level', ['junior', 'pro', 'senior', 'legend']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'approved', 'paid', 'cancelled']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'non-binary']);

// 🌍 WORLDS (The High-Level Units)
export const worlds = pgTable('worlds', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // agency, studio, academy, artist, portfolio, ademing, freelance
  label: text('label').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🛤️ JOURNEYS (The Flow Architecture)
export const journeys = pgTable('journeys', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 Link naar de World
  code: text('code').unique().notNull(), // bijv. 'studio', 'agency_vo', 'agency_ivr'
  label: text('label').notNull(), // bijv. 'Voices Studio', 'Agency: Voice-over'
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🚦 ORDER STATUSES
export const orderStatuses = pgTable('order_statuses', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // bijv. 'completed', 'refunded', 'waiting_po'
  label: text('label').notNull(),
  color: text('color'), // Voor UI in admin
  createdAt: timestamp('created_at').defaultNow(),
});

// 🎙️ ACTOR STATUSES
export const actorStatuses = pgTable('actor_statuses', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // live, pending, rejected
  label: text('label').notNull(), // Live, Wacht op goedkeuring, Afgewezen
  color: text('color'), // #22c55e, etc
  isPublic: boolean('is_public').default(false),
  canOrder: boolean('can_order').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 💳 PAYMENT METHODS
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // bijv. 'mollie_bancontact', 'manual_invoice'
  label: text('label').notNull(),
  isOnline: boolean('is_online').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🌐 LANGUAGES & GEOGRAPHY
export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  label: text('label').notNull(),
  isPopular: boolean('is_popular').default(false),
  isNativeOnly: boolean('is_native_only').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🚻 GENDERS
export const genders = pgTable('genders', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // male, female, non-binary, boy, girl
  label: text('label').notNull(), // Man, Vrouw, Non-binair, Jongen, Meisje
  createdAt: timestamp('created_at').defaultNow(),
});

// 🎓 EXPERIENCE LEVELS
export const experienceLevels = pgTable('experience_levels', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // junior, pro, senior, legend
  label: text('label').notNull(), // Junior, Pro, Senior, Legend
  basePriceModifier: decimal('base_price_modifier', { precision: 3, scale: 2 }).default('1.00'),
  icon: text('icon'), // lucide icon name
  createdAt: timestamp('created_at').defaultNow(),
});

export const voiceTones = pgTable('voice_tones', {
  id: serial('id').primaryKey(),
  label: text('label').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actorLanguages = pgTable('actor_languages', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id, { onDelete: 'cascade' }).notNull(),
  languageId: integer('language_id').references(() => languages.id, { onDelete: 'cascade' }).notNull(),
  isNative: boolean('is_native').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('actor_languages_actor_id_language_id_key').on(table.actorId, table.languageId),
]);

export const actorTones = pgTable('actor_tones', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id, { onDelete: 'cascade' }).notNull(),
  toneId: integer('tone_id').references(() => voiceTones.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('actor_tones_actor_id_tone_id_key').on(table.actorId, table.toneId),
]);

// 👤 USERS & DNA
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  wpUserId: bigint('wp_user_id', { mode: 'number' }).unique(),
  email: text('email').notNull().unique(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  phone: text('phone'),
  companyName: text('company_name'),
  companySector: text('company_sector'),
  companySize: text('company_size'),
  vatNumber: text('vat_number'),
  iban: text('iban'),
  addressStreet: text('address_street'),
  addressZip: text('address_zip'),
  addressCity: text('address_city'),
  addressCountry: text('address_country').default('BE'),
  role: text('role').default('guest'),
  howHeard: text('how_heard'), // 🔍 Hoe heeft de gebruiker ons gevonden? (Privé/Admin)
  customerType: text('customer_type'), // mediabedrijf, reseller, etc.
  subroles: jsonb('subroles').default([]), // Klant segmenten (academy_student, etc.)
  approvedFlows: jsonb('approved_flows').default(['commercial', 'corporate', 'telephony']), // Admin curation
  journeyState: text('journey_state'), // De huidige fase in hun journey
  preferences: jsonb('preferences').default({}), // Master JSON: preferred_language, market, etc.
  customerInsights: jsonb('customer_insights'), // AI-analyzed data
  activityLog: jsonb('activity_log').default([]),
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  wpId: bigint('wp_id', { mode: 'number' }), // 🛡️ CHRIS-PROTOCOL: Legacy ID (v2.14.446)
  photo_id: integer('photo_id'), // 🛡️ CHRIS-PROTOCOL: Legacy ID (v2.14.446)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
});

// ❤️ FAVORITES
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 📈 UTM & ATTRIBUTION
export const utmTouchpoints = pgTable('utm_touchpoints', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  orderId: integer('order_id').references(() => orders.id),
  source: text('source'),
  medium: text('medium'),
  campaign: text('campaign'),
  content: text('content'),
  term: text('term'),
  url: text('url'),
  referrer: text('referrer'),
  vibe: text('vibe'), // cold, warm, hot
  isFirstTouch: boolean('is_first_touch').default(false),
  isLastTouch: boolean('is_last_touch').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🎙️ ACTORS (The Gold)
export const actors = pgTable('actors', {
  id: serial('id').primaryKey(),
  wp_product_id: bigint('wp_product_id', { mode: 'number' }).unique(),
  user_id: integer('user_id').references(() => users.id),
  first_name: text('first_name').notNull(),
  last_name: text('last_name'),
  email: text('email'), // Added for silent user creation logic
  gender: genderEnum('gender'),
  genderId: integer('gender_id').references(() => genders.id), // 🛡️ Handshake Truth
  native_lang: text('native_lang'),
  nativeLanguageId: integer('native_language_id').references(() => languages.id), // 🛡️ Handshake Truth
  country: text('country'),
  countryId: integer('country_id').references(() => countries.id),
  deliveryTime: text('delivery_time'),
  delivery_days_min: integer('delivery_days_min').default(1),
  delivery_days_max: integer('delivery_days_max').default(3),
  cutoff_time: text('cutoff_time').default('18:00'), // ⏰ De dagelijkse deadline (bijv. 12:00 voor Johfrah)
  sameday_delivery: boolean('sameday_delivery').default(false), // 🚀 Support voor levering op dezelfde dag
  extra_langs: text('extra_langs'),
  bio: text('bio'),
  pending_bio: text('pending_bio'), // 📝 Voorgestelde bio (admin approval nodig)
  why_voices: text('why_voices'), // 💡 Waarom een professionele stem? (SEO Goud - klantgericht)
  tagline: text('tagline'),
  pending_tagline: text('pending_tagline'), // 📝 Voorgestelde tagline (admin approval nodig)
  tone_of_voice: text('tone_of_voice'), // 🎭 De artistieke kenmerken (warm, zakelijk, etc.)
  birth_year: integer('birth_year'), // 📅 Geboortejaar (Privé/Admin - voor leeftijdscategorie matching)
  location: text('location'), // 📍 Stad/Regio (Privé/Admin)
  clients: text('clients'), // 🏢 Merknamen/Klantenlijst (voor SEO en matching)
  delivery_date_min: timestamp('delivery_date_min', { mode: 'string' }), // 📅 Nuclear God Mode: Pre-calculated delivery date
  delivery_date_min_priority: integer('delivery_date_min_priority').default(0), // 🚀 Nuclear God Mode: Priority offset
  deliveryConfig: jsonb('delivery_config').default({}), // 📦 Nuclear Delivery Profile
  photo_id: integer('photo_id').references(() => media.id), // 📸 De Actor-specifieke foto (voor Agency)
  logo_id: integer('logo_id'),
  voice_score: integer('voice_score').default(10),
  totalSales: integer('total_sales').default(0),
  experience_level: experienceLevelEnum('experience_level').default('pro'),
  experienceLevelId: integer('experience_level_id').references(() => experienceLevels.id), // 🛡️ Handshake Truth
  studio_specs: jsonb('studio_specs').default({}), // 🎙️ Publiek: { microphone: string, preamp: string, interface: string, booth: string }
  connectivity: jsonb('connectivity').default({}), // 🌐 Publiek: { source_connect: boolean, zoom: boolean, cleanfeed: boolean, session_link: boolean }
  availability: jsonb('availability').default([]), // Array of objects: { start: string, end: string, reason: string }
  menu_order: integer('menu_order').default(0), // Manual sort override (Drag & Drop)
  price_unpaid: decimal('price_unpaid', { precision: 10, scale: 2 }),
  price_online: decimal('price_online', { precision: 10, scale: 2 }),
  price_ivr: decimal('price_ivr', { precision: 10, scale: 2 }),
  price_live_regie: decimal('price_live_regie', { precision: 10, scale: 2 }),
  rates: jsonb('rates').default({}), // Master Rates JSON: { "BE": { "online": 250, ... }, "FR": { ... } }
  dropbox_url: text('dropbox_url'),
  status: statusEnum('status').default('pending'), // 'live' = public, others = private, 'unavailable' = holiday
  statusId: integer('status_id').references(() => actorStatuses.id), // 🛡️ Handshake Truth
  is_public: boolean('is_public').default(false), // Expliciete vlag voor frontend zichtbaarheid
  is_ai: boolean('is_ai').default(false),
  ai_tags: text('ai_tags'), // 🤖 AI-generated tags voor matching/search
  elevenlabs_id: text('elevenlabs_id'),
  youtubeUrl: text('youtube_url'), // 📺 YouTube koppeling
  slug: text('slug').unique(),
  website: text('website'), // 🌐 Persoonlijke website van de acteur (Privé/Admin)
  linkedin: text('linkedin'), // 🔗 LinkedIn profiel (Privé/Admin)
  instagram: text('instagram'), // 📸 Instagram profiel
  internal_notes: text('internal_notes'), // Privé veld voor admin
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  averageDeliveryTimeHours: decimal('average_delivery_time_hours', { precision: 10, scale: 2 }), // 📊 Accountability: Gemiddelde levertijd in uren
  onTimeDeliveryRate: decimal('on_time_delivery_rate', { precision: 5, scale: 2 }), // 📊 Accountability: Percentage op tijd geleverd
  deliveryPenaltyDays: integer('delivery_penalty_days').default(0), // ⚠️ Accountability: Automatische vertraging bij slechte prestaties
  allow_free_trial: boolean('allow_free_trial').default(true), // 🎁 Opt-out voor gratis proefopnames
});

// 🗣️ DIALECTS (Linguistic Nuance)
export const dialects = pgTable('dialects', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // bijv. 'nl_vlaams', 'fr_be'
  label: text('label').notNull(), // bijv. 'Vlaams', 'Belgisch Frans'
  languageId: integer('language_id').references(() => languages.id), // Koppeling aan de hoofdtaal
  createdAt: timestamp('created_at').defaultNow(),
});

export const proficiencies = pgTable('proficiencies', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // native, fluent, imitation
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actorDialects = pgTable('actor_dialects', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id, { onDelete: 'cascade' }).notNull(),
  dialect: text('dialect'), // Legacy string
  dialectId: integer('dialect_id').references(() => dialects.id), // 🛡️ Handshake Truth
  proficiency: text('proficiency').default('native'), // Legacy string
  proficiencyId: integer('proficiency_id').references(() => proficiencies.id), // 🛡️ Handshake Truth
  createdAt: timestamp('created_at').defaultNow(),
});

// 🎙️ DEMO TYPES
export const demoTypes = pgTable('demo_types', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // bijv. 'commercial', 'telephony', 'corporate'
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actorDemos = pgTable('actor_demos', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Added for traceability
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type'), // Legacy string
  typeId: integer('type_id').references(() => demoTypes.id), // 🛡️ Handshake Truth
  is_public: boolean('is_public').default(true), // Sommige demo's kunnen privé blijven voor offertes
  menu_order: integer('menu_order').default(0),
});

export const actorVideos = pgTable('actor_videos', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine (External of Local)
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type'), // youtube, vimeo, videoask, local
  is_public: boolean('is_public').default(true),
  menu_order: integer('menu_order').default(0),
});

  // 🎧 WORKSHOPS (Studio Journey)
export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Link naar voices_workshop_teachers ID
  user_id: integer('user_id').references(() => users.id), // 👤 Link naar de user account (voor dashboard toegang)
  name: text('name').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  slug: text('slug').unique(), // 🔗 URL-vriendelijke naam
  tagline: text('tagline'),
  bio: text('bio'),
  photo_id: integer('photo_id').references(() => media.id), // 📸 De Instructor-specifieke foto (voor Studio)
  vatNumber: text('vat_number'), // 🤫 Privé BTW nummer voor facturatie
  socials: jsonb('socials').default({}), // 📱 LinkedIn, Instagram, etc.
  internal_notes: text('internal_notes'), // 🔒 Privé admin notities (GF data etc.)
  adminMeta: jsonb('admin_meta').default({}), // 🔒 Gestructureerde admin data
  is_public: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workshops = pgTable('workshops', {
  id: bigint('id', { mode: 'number' }).primaryKey(), // Gebruik originele WooCommerce Product ID
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World (Studio/Academy)
  journeyId: integer('journey_id').references(() => journeys.id), // 🛤️ V2: Koppeling naar Journey
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine (Video/Aftermovie)
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  capacity: integer('capacity').default(8),
  price: decimal('price', { precision: 10, scale: 2 }),
  slug: text('slug').unique(),
  status: text('status').default('upcoming'),
  
  // 🔄 REPEATER FIELDS (Legacy Compatibility)
  duration: text('duration'), // Duurtijd (bijv. "1 dag", "3 uur")
  instructorId: integer('instructor_id').references(() => instructors.id), // De gekozen workshopgever
  program: jsonb('program'), // Het programma/dagindeling (voorheen dagindeling meta)
  meta: jsonb('meta'), // Catch-all voor overige repeater info
  wp_product_id: bigint('wp_product_id', { mode: 'number' }).unique(), // Gebruik originele WooCommerce Product ID
});

// 📍 LOCATIONS (Studio & Academy)
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // bijv. 'Voices Studio Gent'
  slug: text('slug').unique().notNull(),
  address: text('address'),
  city: text('city'),
  zip: text('zip'),
  country: text('country').default('BE'),
  description: text('description'),
  photo_id: integer('photo_id').references(() => media.id),
  mapUrl: text('map_url'),
  vatNumber: text('vat_number'), // 🤫 Privé BTW nummer voor facturatie
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workshopEditions = pgTable('workshop_editions', {
  id: serial('id').primaryKey(),
  workshopId: bigint('workshop_id', { mode: 'number' }).references(() => workshops.id).notNull(),
  title: text('title'), // bijv. 'Zomereditie'
  date: timestamp('date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }), // ⏰ Eindtijd
  locationId: integer('location_id').references(() => locations.id), // 📍 Gekoppeld aan centrale locatie
  instructorId: integer('instructor_id').references(() => instructors.id), // 👤 Specifieke instructeur voor deze editie
  price: decimal('price', { precision: 10, scale: 2 }), // 💰 Afwijkende prijs per editie mogelijk
  capacity: integer('capacity').default(8),
  status: text('status').default('upcoming'),
  program: jsonb('program'), // 📝 Specifieke dagindeling voor deze editie
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const workshopInterest = pgTable('workshop_interest', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Added for traceability
  user_id: integer('user_id').references(() => users.id), // Link to the silent user
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  age: integer('age'),
  profession: text('profession'),
  experience: text('experience'),
  goal: text('goal'),
  sample: text('sample'), // 'voorbeeld' veld
  preferredDates: text('preferred_dates'),
  howHeard: text('how_heard'), // 'hoe_gehoord' veld
  productIds: text('product_ids'), // Keep legacy for safety
  gfEntryId: integer('gf_entry_id'),
  sourceUrl: text('source_url'),
  ipAddress: text('ip_address'),
  status: text('status').default('pending'),
  optOut: boolean('opt_out').default(false),
  optOutToken: text('opt_out_token'),
  optOutDate: timestamp('opt_out_date'),
  smartMailSentAt: timestamp('smart_mail_sent_at'),
  aiIdentikit: text('ai_identikit'), // De AI samenvatting van de persoon
  aiIdentikitUpdated: timestamp('ai_identikit_updated'),
  iapContext: jsonb('iap_context'), // Next Nuclear Enrichment
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workshopInterestProducts = pgTable('workshop_interest_products', {
  id: serial('id').primaryKey(),
  interestId: integer('interest_id').references(() => workshopInterest.id).notNull(),
  workshopId: bigint('workshop_id', { mode: 'number' }).references(() => workshops.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🎓 ACADEMY (LMS)
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  courseId: integer('course_id').references(() => courses.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  videoUrl: text('video_url'),
  displayOrder: integer('display_order').default(0),
  introScript: text('intro_script'),
  deepDiveScript: text('deep_dive_script'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courseProgress = pgTable('course_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  status: text('status').default('in_progress'), // in_progress, completed
  videoTimestamp: integer('video_timestamp').default(0),
  completedAt: timestamp('completed_at'),
});

export const courseSubmissions = pgTable('course_submissions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  filePath: text('file_path').notNull(),
  status: text('status').default('pending'),
  feedbackText: text('feedback_text'),
  feedbackAudioPath: text('feedback_audio_path'),
  scorePronunciation: integer('score_pronunciation'),
  scoreIntonation: integer('score_intonation'),
  scoreCredibility: integer('score_credibility'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
});

export const academyTips = pgTable('academy_tips', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id), // Optioneel: koppeling aan een specifiek hoofdstuk
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'), // bijv. 'morning', 'commute', 'practice'
  createdAt: timestamp('created_at').defaultNow(),
});

// 📦 LEGACY BLOAT (The Rugzak)
export const ordersLegacyBloat = pgTable('orders_legacy_bloat', {
  wpOrderId: bigint('wp_order_id', { mode: 'number' }).primaryKey(),
  rawMeta: jsonb('raw_meta'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🛒 ORDERS V2 (Nuclear Clean)
export const ordersV2 = pgTable('orders_v2', {
  id: bigint('id', { mode: 'number' }).primaryKey(), // 🛡️ WP Order ID is nu de PK
  userId: integer('user_id').references(() => users.id),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  journeyId: integer('journey_id').references(() => journeys.id),
  statusId: integer('status_id').references(() => orderStatuses.id),
  paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id),
  amountNet: decimal('amount_net', { precision: 10, scale: 2 }),
  amountTotal: decimal('amount_total', { precision: 10, scale: 2 }),
  purchaseOrder: text('purchase_order'),
  billingEmailAlt: text('billing_email_alt'),
  createdAt: timestamp('created_at'),
  legacyInternalId: integer('legacy_internal_id'), // 🛡️ Link naar de hybride order ID voor items
});

// 🛒 COMMERCE
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  description: text('description'),
  discountType: text('discount_type').notNull(), // percent, fixed_cart, fixed_product
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp('expiry_date'),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  individualUse: boolean('individual_use').default(false),
  excludeSaleItems: boolean('exclude_sale_items').default(false),
  minimumAmount: decimal('minimum_amount', { precision: 10, scale: 2 }),
  maximumAmount: decimal('maximum_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  wpOrderId: bigint('wp_order_id', { mode: 'number' }).unique(),
  user_id: integer('user_id').references(() => users.id),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  journeyId: integer('journey_id').references(() => journeys.id), // 🛤️ V2: Koppeling naar journeys tabel
  statusId: integer('status_id').references(() => orderStatuses.id), // 🚦 V2: Koppeling naar statuses tabel
  paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id), // 💳 V2: Koppeling naar payment_methods
  total: decimal('total', { precision: 10, scale: 2 }),
  tax: decimal('total_tax', { precision: 10, scale: 2 }),
  amountNet: decimal('amount_net', { precision: 10, scale: 2 }), // 💰 V2: Netto bedrag
  purchaseOrder: text('purchase_order'), // 🏢 V2: PO Nummer
  billingEmailAlt: text('billing_email_alt'), // 📧 V2: Facturatie e-mail
  status: text('status').default('pending'),
  journey: text('journey').notNull(), // studio, academy, agency (Legacy)
  market: text('market').default('BE'), // 🌍 BE, NL, FR, etc.
  iapContext: jsonb('iap_context'), // Intent, Persona, Flow
  rawMeta: jsonb('raw_meta'), // 📦 Catch-all voor ALLE legacy WooCommerce meta-data
  displayOrderId: text('display_order_id'),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  totalProfit: decimal('total_profit', { precision: 10, scale: 2 }),
  expectedDeliveryDate: timestamp('expected_delivery_date', { withTimezone: true }),
  billingVatNumber: text('billing_vat_number'),
  yukiInvoiceId: text('yuki_invoice_id'),
  dropboxFolderUrl: text('dropbox_folder_url'),
  isQuote: boolean('is_quote').default(false), // 📄 Offerte modus
  quoteMessage: text('quote_message'), // 💬 Bericht bij offerte
  quoteSentAt: timestamp('quote_sent_at'), // 📅 Wanneer verzonden
  internal_notes: text('internal_notes'), // Privé admin notities over de order
  isPrivate: boolean('is_private').default(false), // Voor gevoelige of handmatige orders
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  
  // 🛡️ KELLY'S INTEGRITY (B2B & Fraud)
  viesValidatedAt: timestamp('vies_validated_at'),
  viesCountryCode: text('vies_country_code'),
  ipAddress: text('ip_address'), // Hashed IP for fraud analysis
  createdAt: timestamp('created_at').defaultNow(),
});

// 🚚 DELIVERY STATUSES
export const deliveryStatuses = pgTable('delivery_statuses', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(), // bijv. 'waiting', 'uploaded', 'approved'
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id'), // WP Product ID
  actorId: integer('actor_id').references(() => actors.id), // Link naar de stem
  name: text('name').notNull(),
  quantity: integer('quantity').default(1),
  price: decimal('price', { precision: 10, scale: 2 }),
  cost: decimal('cost', { precision: 10, scale: 2 }), // 🤫 De COG per line item (inkoopwaarde stem)
  tax: decimal('tax', { precision: 10, scale: 2 }),
  deliveryStatus: text('delivery_status').default('waiting'), // Legacy string
  deliveryStatusId: integer('delivery_status_id').references(() => deliveryStatuses.id), // 🛡️ Handshake Truth
  deliveryFileUrl: text('delivery_file_url'), // Pad naar de audio in Supabase Storage
  invoiceFileUrl: text('invoice_file_url'), // De geüploade factuur van de acteur
  payoutStatus: payoutStatusEnum('payout_status').default('pending'), // pending, approved, paid, cancelled
  payoutStatusId: integer('payout_status_id'), // 🛡️ Handshake Truth (Future)
  metaData: jsonb('meta_data'), // Bevat script, usage, instructions, deadline, etc.
  meta: jsonb('meta'), // 📦 Extra meta data
  editionId: integer('edition_id').references(() => workshopEditions.id), // 📅 Link naar specifieke workshop editie
  dropbox_url: text('dropbox_url'), // 📦 Link naar de audio/bestanden voor deze specifieke deelnemer
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  createdAt: timestamp('created_at').defaultNow(),
  deliveredAt: timestamp('delivered_at'), // 🎤 Accountability: Wanneer de stemacteur het bestand heeft geüpload
  expectedDeliveryDate: timestamp('expected_delivery_date'), // 📅 Accountability: De beloofde deadline
});

export const orderNotes = pgTable('order_notes', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  note: text('note').notNull(),
  isCustomerNote: boolean('is_customer_note').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 📅 APPOINTMENTS (Studio & Agency)
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  googleEventId: text('google_event_id'),
  user_id: integer('user_id').references(() => users.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('confirmed'),
  rescheduleToken: text('reschedule_token'),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🧘 ADEMING JOURNEY (Meditatie & Rust)
export const ademingMakers = pgTable('ademing_makers', {
  id: serial('id').primaryKey(),
  short_name: text('short_name').unique().notNull(), // "Julie" | "Johfrah"
  full_name: text('full_name').notNull(),
  avatar_url: text('avatar_url'),
  hero_image_url: text('hero_image_url'),
  bio: text('bio'),
  website: text('website'),
  instagram: text('instagram'),
  is_public: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ademingTracks = pgTable('ademing_tracks', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  journeyId: integer('journey_id').references(() => journeys.id), // 🛤️ V2: Koppeling naar Journey
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  url: text('url').notNull(), // audio_url
  duration: integer('duration'),
  vibe: text('vibe'),
  theme: text('theme'), // "rust" | "energie" | "ritme"
  element: text('element'), // "aarde" | "water" | "lucht" | "vuur"
  makerId: integer('maker_id').references(() => ademingMakers.id),
  seriesId: integer('series_id').references(() => ademingSeries.id),
  seriesOrder: integer('series_order'),
  short_description: text('short_description'),
  long_description: text('long_description'),
  cover_image_url: text('cover_image_url'),
  video_background_url: text('video_background_url'),
  subtitle_data: jsonb('subtitle_data'),
  transcript: text('transcript'),
  is_public: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ademingSeries = pgTable('ademing_series', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  cover_image_url: text('cover_image_url'),
  theme: text('theme').default('rust'),
  is_public: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ademingBackgroundMusic = pgTable('ademing_background_music', {
  id: serial('id').primaryKey(),
  element: text('element').notNull(), // "aarde" | "water" | "lucht" | "vuur"
  audio_url: text('audio_url').notNull(),
  mediaId: integer('media_id').references(() => media.id),
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ademingReflections = pgTable('ademing_reflections', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  intention: text('intention'),
  reflection: text('reflection'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ademingStats = pgTable('ademing_stats', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  streakDays: integer('streak_days').default(0),
  totalListenSeconds: integer('total_listen_seconds').default(0),
  lastActivity: timestamp('last_activity'),
});

// 🤝 PARTNERS & RESELLERS
export const partnerWidgets = pgTable('partner_widgets', {
  id: serial('id').primaryKey(),
  partnerId: text('partner_id').unique().notNull(),
  name: text('name').notNull(),
  companyName: text('company_name'),
  primaryColor: text('primary_color'),
  allowedVoices: text('allowed_voices'), // JSON string of IDs
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🧠 QUIZ & FUNNELS
export const quizSteps = pgTable('quiz_steps', {
  id: serial('id').primaryKey(),
  quizSlug: text('quiz_slug').notNull(),
  stepOrder: integer('step_order').notNull(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // Array of choices with weights
});

// 🌐 VOICEGLOT REGISTRY (Advanced)
export const translationRegistry = pgTable('translation_registry', {
  id: serial('id').primaryKey(),
  stringHash: text('string_hash').unique().notNull(),
  originalText: text('original_text').notNull(),
  context: text('context'),
  lastSeen: timestamp('last_seen').defaultNow(),
});

// 🎟️ VOUCHERS & BATCHES
export const voucherBatches = pgTable('voucher_batches', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  batchId: integer('batch_id').references(() => voucherBatches.id),
  status: text('status').default('active'), // active, used, expired
  usedBy: integer('user_id').references(() => users.id),
  usedAt: timestamp('used_at'),
});

// 📚 SYSTEM KNOWLEDGE (De 'Grondwet' van Voicy)
export const systemKnowledge = pgTable('system_knowledge', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  slug: text('slug').unique().notNull(), // bijv. 'de-grondwet'
  title: text('title').notNull(),
  category: text('category').notNull(), // 'finance', 'brand', 'communication'
  content: text('content').notNull(), // De eigenlijke tekst/regels
  metadata: jsonb('metadata'), // { version: '1.1.0', priority: 'nuclear' }
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
});

// 🛡️ APPROVAL SYSTEM (Human-in-the-Loop)
export const approvalQueue = pgTable('approval_queue', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'email', 'payment', 'quote', 'payout'
  status: text('status').default('pending'), // pending, approved, rejected, executed
  priority: text('priority').default('normal'), // low, normal, high, nuclear
  
  // ☢️ NUCLEAR SENSITIVITY FLAGS
  isValueSensitive: boolean('is_value_sensitive').default(false), // Bevat dit korting of prijsafwijkingen?
  isBrandSensitive: boolean('is_brand_sensitive').default(false), // Gaat dit over een 'Fame' klant of merk?
  
  // Intelligence Context
  reasoning: text('reasoning'), // Waarom stelt de AI dit voor?
  iapContext: jsonb('iap_context'), // Persona, Journey, Intent
  
  // The Payload (Het concrete resultaat)
  payload: jsonb('payload').notNull(), // { to, subject, html, amount, recipient_iban, quote_data, etc. }
  originalPayload: jsonb('original_payload'), // De oorspronkelijke suggestie van de AI (voor vergelijking)
  
  // Feedback & Learning (De 'Volwassen' laag)
  rejectionReason: text('rejection_reason'), // Waarom werd dit geweigerd?
  userCorrections: text('user_corrections'), // Wat heeft de gebruiker tekstueel aangepast of gezegd?
  isPatternShift: boolean('is_pattern_shift').default(false), // Is dit een nieuwe regel (true) of een eenmalige uitzondering (false)?
  confidenceScore: integer('confidence_score'), // Hoe zeker was de AI (0-100)?
  
  // Tracking
  targetId: text('target_id'), // Link naar order_id, user_id, etc.
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiLogs = pgTable('ai_logs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  eventType: text('event_type'), // recommendation, feedback, coaching
  eventData: jsonb('event_data'),
  fullScript: text('full_script'), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiClones = pgTable('ai_clones', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id),
  elevenlabsVoiceId: text('elevenlabs_voice_id').unique().notNull(),
  status: text('status').default('active'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🏦 YUKI MIRROR (Accounting)
export const yukiOutstanding = pgTable('yuki_outstanding', {
  id: serial('id').primaryKey(),
  contactId: text('contact_id').notNull(),
  invoiceNr: text('invoice_nr').notNull(),
  invoiceDate: timestamp('invoice_date'),
  dueDate: timestamp('due_date'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  openAmount: decimal('open_amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('EUR'),
  lastSynced: timestamp('last_synced').defaultNow(),
});

// 🎙️ VOICE AFFINITY (Matching Engine)
export const voiceAffinity = pgTable('voice_affinity', {
  id: serial('id').primaryKey(),
  voiceAId: integer('voice_a_id').references(() => actors.id),
  voiceBId: integer('voice_b_id').references(() => actors.id),
  pairCount: integer('pair_count').default(1),
});

// 🧲 CENTRAL LEADS
export const centralLeads = pgTable('central_leads', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  email: text('email').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  phone: text('phone'),
  sourceType: text('source_type'), // voicy, contact_form, etc.
  leadVibe: text('lead_vibe'), // cold, warm, hot, burning
  iapContext: jsonb('iap_context'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🏺 VOICEJAR (Audio Feedback & Session Recording)
export const voicejarSessions = pgTable('voicejar_sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  visitorHash: text('visitor_hash').notNull(),
  url: text('url'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  duration: integer('duration').default(0),
  eventCount: integer('event_count').default(0),
  iapContext: jsonb('iap_context'), // 🧠 Core System Mandate
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const voicejarEvents = pgTable('voicejar_events', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(), // visitorHash or custom UUID
  eventData: jsonb('event_data').notNull(), // rrweb chunks
  sequenceOrder: integer('sequence_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 💬 VOICY & CHAT
export const chatConversations = pgTable('chat_conversations', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  user_id: integer('user_id').references(() => users.id),
  instructorId: integer('instructor_id').references(() => instructors.id), // 👤 Koppeling naar instructeur voor directe coaching
  workshopEditionId: integer('workshop_edition_id').references(() => workshopEditions.id), // 📅 Context: specifieke workshop editie
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: text('guest_phone'),
  guestAge: integer('guest_age'),
  guestProfession: text('guest_profession'),
  locationCity: text('location_city'),
  locationCountry: text('location_country'),
  status: text('status').default('open'),
  resolved: boolean('resolved').default(false),
  journey: text('journey'),
  intent: text('intent'),
  ttfi: integer('ttfi'), // Time to first interaction in seconds
  effectivenessScore: decimal('effectiveness_score', { precision: 3, scale: 2 }),
  iapContext: jsonb('iap_context'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  conversationId: integer('conversation_id').references(() => chatConversations.id).notNull(),
  senderId: integer('sender_id'),
  senderType: text('sender_type').notNull(), // user, admin, ai
  message: text('message').notNull(),
  attachments: jsonb('attachments').default([]),
  isAiRecommendation: boolean('is_ai_recommendation').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatPushSubscriptions = pgTable('chat_push_subscriptions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiRecommendations = pgTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => chatConversations.id),
  messageId: integer('message_id').references(() => chatMessages.id),
  recommendedActorIds: text('recommended_actor_ids'), // JSON string of IDs
  userClicked: boolean('user_clicked').default(false),
  userOrdered: boolean('user_ordered').default(false),
  successScore: decimal('success_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// ❓ FAQ (AI-Powered)
export const faq = pgTable('faq', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Link naar originele post
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  category: text('category'),
  questionNl: text('question_nl'),
  answerNl: text('answer_nl'),
  questionFr: text('question_fr'),
  answerFr: text('answer_fr'),
  questionEn: text('question_en'),
  answerEn: text('answer_en'),
  questionDe: text('question_de'), // Added for Nuclear enrichment
  answerDe: text('answer_de'), // Added for Nuclear enrichment
  persona: text('persona'), // Ontdekker, Doener, etc.
  journeyPhase: text('journey_phase'), // Awareness, Consideration, etc.
  is_public: boolean('is_public').default(true), // Alleen gepubliceerde FAQs
  internal_notes: text('internal_notes'),
  displayOrder: integer('display_order').default(0),
  views: integer('views').default(0), // Added for Nuclear enrichment
  helpfulCount: integer('helpful_count').default(0), // Added for Nuclear enrichment
  notHelpfulCount: integer('not_helpful_count').default(0), // Added for Nuclear enrichment
  cta: jsonb('cta'), // Stores call_to_action in multiple languages
  metadata: jsonb('metadata'), // Stores labels, tags, internal_links, product_categories
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 📝 CONTENT & PAGES
export const contentArticles = pgTable('content_articles', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  content: text('content'), // De ruwe of opgeschoonde HTML
  excerpt: text('excerpt'),
  status: text('status').default('publish'),
  authorId: integer('user_id').references(() => users.id),
  featuredImageId: integer('featured_image_id'),
  iapContext: jsonb('iap_context'),
  seoData: jsonb('seo_data'),
  is_manually_edited: boolean('is_manually_edited').default(false),
  lockStatus: text('lock_status').default('unlocked'), // unlocked, locked
  lockedBy: integer('locked_by').references(() => users.id),
  lockedAt: timestamp('locked_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pageLayouts = pgTable('page_layouts', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title'),
  layoutJson: jsonb('layout_json').notNull(), // The Master Bento Blueprint
  iapContext: jsonb('iap_context'), // Target Persona, Journey, etc.
  isPublished: boolean('is_published').default(false),
  is_manually_edited: boolean('is_manually_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contentBlocks = pgTable('content_blocks', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => contentArticles.id),
  type: text('type'), // heading, text, image, video, cta
  content: text('content'),
  settings: jsonb('settings'), // layout info
  displayOrder: integer('display_order').default(0),
  is_manually_edited: boolean('is_manually_edited').default(false),
  lockStatus: text('lock_status').default('unlocked'),
  lockedBy: integer('locked_by').references(() => users.id),
  lockedAt: timestamp('locked_at'),
});

export const contentBlockVersions = pgTable('content_block_versions', {
  id: serial('id').primaryKey(),
  blockId: integer('block_id').references(() => contentBlocks.id).notNull(),
  content: text('content').notNull(),
  settings: jsonb('settings'),
  version: integer('version').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  changeNote: text('change_note'),
});

// 🌐 VOICEGLOT (Translations)
export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  translationKey: text('translation_key').notNull(),
  lang: text('lang').notNull(),
  originalText: text('original_text'),
  translatedText: text('translated_text'),
  context: text('context'),
  status: text('status').default('active'),
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  isLocked: boolean('is_locked').default(false), // 🔒 Weglot-style lock
  lastAuditedAt: timestamp('last_audited_at'), // 🔍 Wanneer voor het laatst gescand door AI
  auditLog: jsonb('audit_log').default([]), // 📝 Geschiedenis van wijzigingen
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique("translations_key_lang_unique").on(table.translationKey, table.lang),
]);

// 📊 System TRACKING
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  visitorHash: text('visitor_hash').unique().notNull(),
  user_id: integer('user_id').references(() => users.id),
  currentPage: text('current_page'),
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  utmTerm: text('utm_term'),
  companyName: text('company_name'),
  locationCity: text('location_city'),
  locationCountry: text('location_country'),
  isBusiness: boolean('is_business').default(false),
  journeyState: text('journey_state'), // De laatst bekende journey
  market: text('market'), // BE, NL, FR, etc.
  firstVisitAt: timestamp('first_visit_at').defaultNow(),
  lastVisitAt: timestamp('last_visit_at').defaultNow(),
});

export const visitorLogs = pgTable('visitor_logs', {
  id: serial('id').primaryKey(),
  visitorHash: text('visitor_hash').notNull(),
  pathname: text('pathname').notNull(),
  referrer: text('referrer'),
  journey: text('journey'), // agency, artist, portfolio, ademing
  market: text('market'),
  intent: text('intent'),
  event: text('event').default('pageview'), // pageview, click, conversion
  iapContext: jsonb('iap_context'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ⭐ REVIEWS (Intelligence-Rich)
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  worldIdNew: integer('world_id_new').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  provider: text('provider').default('google_places'),
  businessSlug: text('business_slug'),
  authorName: text('author_name').notNull(),
  authorUrl: text('author_url'),
  rating: integer('rating').notNull(),
  textNl: text('text_nl'),
  textFr: text('text_fr'),
  textEn: text('text_en'),
  textDe: text('text_de'),
  responseText: text('response_text'),
  conversionScore: decimal('conversion_score', { precision: 5, scale: 2 }),
  journeyId: text('journey_id'), // 🛤️ Koppeling naar specifieke journey (telephony, commercial, etc.)
  worldId: text('world_id'), // 🌍 Koppeling naar de world (agency, studio, academy)
  iapContext: jsonb('iap_context'), // Intent, Persona, Segment
  sentimentVelocity: integer('sentiment_velocity').default(0),
  language: text('language').default('nl'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  world: one(worlds, {
    fields: [reviews.worldIdNew],
    references: [worlds.id],
  }),
}));

// ⚙️ SYSTEM & CONFIG
export const appConfigs = pgTable('app_configs', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🖼️ MEDIA & ASSETS
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(), // Relatief aan /assets
  fileType: text('file_type'), // image/jpeg, audio/mpeg, etc.
  fileSize: integer('file_size'),
  altText: text('alt_text'),
  labels: text('labels').array(), // Slimme labels (AI of handmatig)
  journey: text('journey'), // agency, studio, academy, etc.
  category: text('category'), // voices, music, branding, etc.
  is_public: boolean('is_public').default(true), // Zichtbaarheid vlag
  is_manually_edited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  metadata: jsonb('metadata').default({}), // Extra info zoals resolutie, bitrate
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 📸 WORKSHOP GALLERY (Extra foto's per workshop)
export const workshopGallery = pgTable('workshop_gallery', {
  id: serial('id').primaryKey(),
  workshopId: bigint('workshop_id', { mode: 'number' }).references(() => workshops.id).notNull(),
  mediaId: integer('media_id').references(() => media.id).notNull(),
  displayOrder: integer('display_order').default(0),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🛡️ ABUSE PREVENTION (Free Preview Tracking)
export const freePreviews = pgTable('free_previews', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  companyName: text('company_name'),
  phone: text('phone'),
  agreedToTerms: boolean('agreed_to_terms').default(false),
  ipAddress: text('ip_address').notNull(),
  visitorHash: text('visitor_hash'),
  textHash: text('text_hash'), // To prevent same text being generated multiple times
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemEvents = pgTable('system_events', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  level: text('level').default('info'), // info, warn, error, critical
  source: text('source').notNull(), // sync, api, auth, etc.
  message: text('message').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 💰 COSTS (Centralized Financial Tracking)
export const costs = pgTable('costs', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'locatie', 'instructeur', 'materiaal', 'overig'
  journey: text('journey'), // Legacy string
  journeyId: integer('journey_id').references(() => journeys.id), // 🛡️ Handshake Truth
  note: text('note'),
  workshopEditionId: integer('workshop_edition_id').references(() => workshopEditions.id),
  locationId: integer('location_id').references(() => locations.id),
  instructorId: integer('instructor_id').references(() => instructors.id),
  orderItemId: integer('order_item_id').references(() => orderItems.id),
  date: timestamp('date', { withTimezone: true }), // 📅 De datum waarop de kost betrekking heeft
  isPartnerPayout: boolean('is_partner_payout').default(false), // 🤝 Is dit een uitbetaling aan een partner (Johfrah/Bernadette)?
  status: text('status').default('gepland'), // gepland, betaald
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const recordingSessionStatusEnum = pgEnum('recording_session_status', ['active', 'archived', 'completed']);
export const recordingFeedbackTypeEnum = pgEnum('recording_feedback_type', ['text', 'audio', 'waveform_marker']);

export const recordingSessions = pgTable('recording_sessions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  orderItemId: integer('order_item_id').references(() => orderItems.id),
  conversationId: integer('conversation_id').references(() => chatConversations.id),
  status: recordingSessionStatusEnum('status').default('active'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const recordingScripts = pgTable('recording_scripts', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => recordingSessions.id).notNull(),
  version: integer('version').default(1).notNull(),
  content: text('content').notNull(),
  notes: text('notes'),
  isCurrent: boolean('is_current').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const recordingFeedback = pgTable('recording_feedback', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => recordingSessions.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  type: recordingFeedbackTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  audioPath: text('audio_path'),
  waveformTimestamp: decimal('waveform_timestamp', { precision: 10, scale: 3 }),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ⚙️ CONFIGURATION SCHEMA (2026)
export const rateCards = pgTable('rate_cards', {
  id: serial('id').primaryKey(),
  market: text('market').notNull(), // BE, NL, FR, GLOBAL
  category: text('category').notNull(), // unpaid, paid, telefonie, subscription
  rules: jsonb('rules').notNull(), // { word_threshold: 200, surcharge: 0.20, etc. }
  is_manually_edited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pronunciationDictionary = pgTable('pronunciation_dictionary', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  word: text('word').notNull(),
  phonetic: text('phonetic').notNull(),
  language: text('language').default('nl-BE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const navMenus = pgTable('nav_menus', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(), // main_nav, footer_nav, admin_nav
  items: jsonb('items').notNull(), // Array: [{ label: 'Stemmen', href: '/agency', order: 1 }]
  market: text('market').default('ALL'),
  is_manually_edited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const marketConfigs = pgTable('market_configs', {
  id: serial('id').primaryKey(),
  market: text('market').unique().notNull(), // BE, NL, FR, DE
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  vatNumber: text('vat_number'),
  cocNumber: text('coc_number'), // KVK nummer voor NL
  address: jsonb('address'), // { street: '', city: '', zip: '' }
  socialLinks: jsonb('social_links'), // { instagram: '', linkedin: '', facebook: '', youtube: '' }
  legal: jsonb('legal'), // { terms_url: '', privacy_url: '', disclaimer: '' }
  localization: jsonb('localization'), // { default_lang: 'nl', currency: 'EUR', locale: 'nl-BE' }
  is_manually_edited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🌍 WORLD CONFIGURATIONS (V3 - ID-First Handshake)
export const worldConfigs = pgTable('world_configs', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id).notNull(),
  languageId: integer('language_id').references(() => languages.id).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  vatNumber: text('vat_number'),
  cocNumber: text('coc_number'),
  address: jsonb('address'),
  socialLinks: jsonb('social_links'),
  legal: jsonb('legal'),
  seoData: jsonb('seo_data'),
  localization: jsonb('localization'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique('world_configs_world_id_language_id_key').on(table.worldId, table.languageId),
]);

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(), // site_title, site_description, copyright, logo_url
  value: text('value').notNull(),
  context: text('context'), // SEO, Footer, Branding, etc.
  is_manually_edited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 💎 FAME REGISTRY
export const fameRegistry = pgTable('fame_registry', {
  id: serial('id').primaryKey(),
  brandName: text('brand_name').unique().notNull(),
  domain: text('domain'), // bijv. 'cocacola.be'
  sensitivityNote: text('sensitivity_note'), // bijv. 'Extreem gevoelig voor merkkleuren en toon'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * 🔢 VECTOR TYPE FOR PGVECTOR
 */
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});

/**
 * MAIL INTELLIGENCE - MAIL CONTENT SCHEMA
 * 
 * Beheert de opslag van volledige e-mailinhoud (versleuteld).
 */

export const mailContent = pgTable('mail_content', {
  id: serial('id').primaryKey(),
  accountId: text('account_id').notNull(),
  uid: bigint('uid', { mode: 'number' }).notNull(),
  
  // 📧 HEADER DATA (Nu in DB voor 0ms latency)
  sender: text('sender'),
  recipient: text('recipient'),
  subject: text('subject'),
  date: timestamp('date'),
  
  // 📝 BODY DATA
  htmlBody: text('html_body'), // Versleuteld
  textBody: text('text_body'), // Versleuteld
  
  // 🔗 THREADING
  threadId: text('thread_id'),
  messageId: text('message_id'),
  inReplyTo: text('in_reply_to'),
  referencesHeader: text('references_header'),
  
  // 🧠 INTELLIGENCE
  iapContext: jsonb('iap_context').default({}), // Persona, Intent, Journey
  embedding: vector('embedding'), // Semantische vector voor AI search
  
  // 🛡️ SECURITY
  isEncrypted: boolean('is_encrypted').default(true),
  isSuperPrivate: boolean('is_super_private').default(true), // 🔒 SUPER PRIVATE MANDATE
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    uidAccountIdx: uniqueIndex('uid_account_idx').on(table.uid, table.accountId),
    messageIdIdx: uniqueIndex('message_id_idx').on(table.messageId),
    accountIdIdx: index('account_id_idx').on(table.accountId), // 🚀 Snel deleten per account
  }
});

/**
 * 🔒 THE VAULT - MASTER SCHEMA (2026)
 * 
 * Doel: Beveiligde, multi-dimensionale opslag voor alle privé-documenten en inbound assets.
 * Relationeel verbonden met Stemmen, Klanten en Projecten.
 */

export const vaultFiles = pgTable('vault_files', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').references(() => worlds.id), // 🌍 V2: Koppeling naar World
  
  // 📁 FILE INFO
  fileName: text('file_name').notNull(),
  originalName: text('original_name'),
  filePath: text('file_path').notNull(), // Fysiek pad in de beveiligde kluis op de server
  mimeType: text('mime_type'),
  fileSize: integer('file_size'),
  
  // 🔗 RELATIONELE ANKERS
  actorId: integer('actor_id').references(() => actors.id), // Koppeling aan de stem
  customerId: integer('customer_id').references(() => users.id), // Koppeling aan de klant
  projectId: integer('project_id').references(() => orders.id), // Koppeling aan het project
  accountId: text('account_id'), // 📧 Bron-mailbox (voor exit-strategie)
  
  // 🏷️ CATEGORISERING
  category: text('category').notNull(), // 'script', 'briefing', 'demo_inbound', 'contract', 'example_video', 'example_audio'
  status: text('status').default('active'), // 'active', 'archived', 'promoted'
  
  // 🧠 AI INTELLIGENCE (Voicy)
  aiMetadata: jsonb('ai_metadata').default({}), // { transcription: string, summary: string, tags: string[], confidence: number }
  
  // 🚀 PROMOTIE STATUS
  isPromoted: boolean('is_promoted').default(false), // Is dit een inbound demo die naar de publieke Dropbox is gegaan?
  promotedMediaId: integer('promoted_media_id').references(() => media.id), // Link naar het publieke media record
  
  // 📅 TRACKING
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * 🤖 AGENT INTELLIGENCE SCHEMA (2026)
 * 
 * Beheert de prompts en instructies voor alle AI-agents in het Voices ecosysteem.
 */

export const agentPrompts = pgTable('agent_prompts', {
  id: serial('id').primaryKey(),
  agentSlug: text('agent_slug').unique().notNull(), // voicy, chris, moby, mark, etc.
  name: text('name').notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'), // { temperature: 0.7, model: 'gpt-4o', etc. }
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentPromptVersions = pgTable('agent_prompt_versions', {
  id: serial('id').primaryKey(),
  promptId: integer('prompt_id').references(() => agentPrompts.id).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  version: integer('version').notNull(),
  changeNote: text('change_note'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * 🔔 NOTIFICATIONS SYSTEM (2026)
 * 
 * Beheert klant-specifieke notificaties (email-first, subtiele UI).
 * Volgt de Ademing-filosofie: rust en focus.
 */
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'order_update', 'system', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata').default({}), // Bevat bijv. order_id
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🛒 PRODUCTS - MASTER SCHEMA (2026)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  wp_product_id: integer('wp_product_id').unique(), // Link naar WooCommerce
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(), // 'portfolio', 'workshop', 'service'
  tier: text('tier'), // 'mic', 'studio', 'agency'
  features: jsonb('features').default([]), // Lijst met features
  tierConfig: jsonb('tier_config').$type<{
    showLastName?: boolean;
    showContactDetails?: boolean;
    showStudioSpecs?: boolean;
    showConnectivity?: boolean;
    showPortfolioPhotos?: boolean;
    allowCustomWidget?: boolean;
    allowCustomDomain?: boolean;
  }>().default({}),
  isSubscription: boolean('is_subscription').default(false),
  billingCycle: text('billing_cycle'), // 'monthly', 'yearly'
  status: text('status').default('publish'),
  mediaId: integer('media_id').references(() => media.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🔗 RELATIONS (Moved to end to prevent 'referencedTable' undefined errors)

































export const castingLists = pgTable("casting_lists", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id"),
	name: text().notNull(),
	hash: text().unique().notNull(), // Voor de Pitch Link: /pitch/[hash]
	is_public: boolean("is_public").default(true),
	settings: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.user_id],
		foreignColumns: [users.id],
		name: "casting_lists_user_id_users_id_fk"
	}),
]);

export const castingListItems = pgTable("casting_list_items", {
	id: serial().primaryKey().notNull(),
	listId: integer("list_id").notNull(),
	actorId: integer("actor_id").notNull(),
	displayOrder: integer("display_order").default(0),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.listId],
		foreignColumns: [castingLists.id],
		name: "casting_list_items_list_id_casting_lists_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.actorId],
		foreignColumns: [actors.id],
		name: "casting_list_items_actor_id_actors_id_fk"
	}),
]);

export const mediaRelations = relations(media, ({ one }) => ({
  world: one(worlds, {
    fields: [media.worldId],
    references: [worlds.id],
  }),
}));
export const faqRelations = relations(faq, ({ one }) => ({
  world: one(worlds, {
    fields: [faq.worldId],
    references: [worlds.id],
  }),
}));
export const contentArticlesRelations = relations(contentArticles, ({ one, many }) => ({
  world: one(worlds, {
    fields: [contentArticles.worldId],
    references: [worlds.id],
  }),
  author: one(users, {
    fields: [contentArticles.authorId],
    references: [users.id],
  }),
  blocks: many(contentBlocks),
}));
export const vaultFilesRelations = relations(vaultFiles, ({ one }) => ({
  world: one(worlds, {
    fields: [vaultFiles.worldId],
    references: [worlds.id],
  }),
  actor: one(actors, {
    fields: [vaultFiles.actorId],
    references: [actors.id],
  }),
  customer: one(users, {
    fields: [vaultFiles.customerId],
    references: [users.id],
  }),
  project: one(orders, {
    fields: [vaultFiles.projectId],
    references: [orders.id],
  }),
  promotedMedia: one(media, {
    fields: [vaultFiles.promotedMediaId],
    references: [media.id],
  }),
}));
export const contentBlocksRelations = relations(contentBlocks, ({ one, many }) => ({
  article: one(contentArticles, {
    fields: [contentBlocks.articleId],
    references: [contentArticles.id],
  }),
  versions: many(contentBlockVersions),
}));
export const contentBlockVersionsRelations = relations(contentBlockVersions, ({ one }) => ({
  block: one(contentBlocks, {
    fields: [contentBlockVersions.blockId],
    references: [contentBlocks.id],
  }),
  creator: one(users, {
    fields: [contentBlockVersions.createdBy],
    references: [users.id],
  }),
}));
export const visitorsRelations = relations(visitors, ({ many }) => ({
  logs: many(visitorLogs),
}));
export const visitorLogsRelations = relations(visitorLogs, ({ one }) => ({
  visitor: one(visitors, {
    fields: [visitorLogs.visitorHash],
    references: [visitors.visitorHash],
  }),
}));
export const workshopGalleryRelations = relations(workshopGallery, ({ one }) => ({
  workshop: one(workshops, {
    fields: [workshopGallery.workshopId],
    references: [workshops.id],
  }),
  media: one(media, {
    fields: [workshopGallery.mediaId],
    references: [media.id],
  }),
}));
export const systemEventsRelations = relations(systemEvents, ({ one }) => ({
  world: one(worlds, {
    fields: [systemEvents.worldId],
    references: [worlds.id],
  }),
}));

export const costsRelations = relations(costs, ({ one }) => ({
  world: one(worlds, {
    fields: [costs.worldId],
    references: [worlds.id],
  }),
  edition: one(workshopEditions, {
    fields: [costs.workshopEditionId],
    references: [workshopEditions.id],
  }),
  location: one(locations, {
    fields: [costs.locationId],
    references: [locations.id],
  }),
  instructor: one(instructors, {
    fields: [costs.instructorId],
    references: [instructors.id],
  }),
  orderItem: one(orderItems, {
    fields: [costs.orderItemId],
    references: [orderItems.id],
  }),
  journey: one(journeys, {
    fields: [costs.journeyId],
    references: [journeys.id],
  }),
}));
export const recordingSessionsRelations = relations(recordingSessions, ({ one, many }) => ({
  order: one(orders, {
    fields: [recordingSessions.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [recordingSessions.orderItemId],
    references: [orderItems.id],
  }),
  conversation: one(chatConversations, {
    fields: [recordingSessions.conversationId],
    references: [chatConversations.id],
  }),
  scripts: many(recordingScripts),
  feedback: many(recordingFeedback),
}));
export const recordingScriptsRelations = relations(recordingScripts, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [recordingScripts.sessionId],
    references: [recordingSessions.id],
  }),
}));
export const recordingFeedbackRelations = relations(recordingFeedback, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [recordingFeedback.sessionId],
    references: [recordingSessions.id],
  }),
  user: one(users, {
    fields: [recordingFeedback.user_id],
    references: [users.id],
  }),
}));
export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
}));
export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
}));
export const ademingTracksRelations = relations(ademingTracks, ({ one }) => ({
  world: one(worlds, {
    fields: [ademingTracks.worldId],
    references: [worlds.id],
  }),
  media: one(media, {
    fields: [ademingTracks.mediaId],
    references: [media.id],
  }),
  maker: one(ademingMakers, {
    fields: [ademingTracks.makerId],
    references: [ademingMakers.id],
  }),
  series: one(ademingSeries, {
    fields: [ademingTracks.seriesId],
    references: [ademingSeries.id],
  }),
}));

export const ademingSeriesRelations = relations(ademingSeries, ({ many }) => ({
  tracks: many(ademingTracks),
}));

export const ademingMakersRelations = relations(ademingMakers, ({ many }) => ({
  tracks: many(ademingTracks),
}));

export const ademingReflectionsRelations = relations(ademingReflections, ({ one }) => ({
  user: one(users, {
    fields: [ademingReflections.user_id],
    references: [users.id],
  }),
}));

export const ademingStatsRelations = relations(ademingStats, ({ one }) => ({
  user: one(users, {
    fields: [ademingStats.user_id],
    references: [users.id],
  }),
}));

export const castingListsRelations = relations(castingLists, ({ one, many }) => ({
  user: one(users, {
    fields: [castingLists.user_id],
    references: [users.id],
  }),
  items: many(castingListItems),
}));
export const castingListItemsRelations = relations(castingListItems, ({ one }) => ({
  list: one(castingLists, {
    fields: [castingListItems.listId],
    references: [castingLists.id],
  }),
  actor: one(actors, {
    fields: [castingListItems.actorId],
    references: [actors.id],
  }),
}));
