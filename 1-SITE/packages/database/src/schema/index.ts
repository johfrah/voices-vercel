import { relations } from 'drizzle-orm';
import { bigint, boolean, decimal, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

export * from './config';
export * from './fame';
export * from './mailbox';
export * from './vault';
export * from './agents';

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
  wp_id: bigint('wp_id', { mode: 'number' }), // Keep legacy ID to avoid data loss prompts
  photoId: integer('photo_id'), // Keep legacy ID to avoid data loss prompts
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
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
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
});

// ❤️ FAVORITES
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 📈 UTM & ATTRIBUTION
export const utmTouchpoints = pgTable('utm_touchpoints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
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
  wpProductId: bigint('wp_product_id', { mode: 'number' }).unique(),
  userId: integer('user_id').references(() => users.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'), // Added for silent user creation logic
  gender: genderEnum('gender'),
  gender_new: genderEnum('gender_new'), // Temporary for migration
  nativeLang: text('native_lang'),
  country: text('country'),
  countryId: integer('country_id').references(() => countries.id),
  deliveryTime: text('delivery_time'),
  deliveryDaysMin: integer('delivery_days_min').default(1),
  deliveryDaysMax: integer('delivery_days_max').default(3),
  cutoffTime: text('cutoff_time').default('18:00'), // ⏰ De dagelijkse deadline (bijv. 12:00 voor Johfrah)
  samedayDelivery: boolean('sameday_delivery').default(false), // 🚀 Support voor levering op dezelfde dag
  extraLangs: text('extra_langs'),
  bio: text('bio'),
  pendingBio: text('pending_bio'), // 📝 Voorgestelde bio (admin approval nodig)
  whyVoices: text('why_voices'), // 💡 Waarom een professionele stem? (SEO Goud - klantgericht)
  tagline: text('tagline'),
  pendingTagline: text('pending_tagline'), // 📝 Voorgestelde tagline (admin approval nodig)
  toneOfVoice: text('tone_of_voice'), // 🎭 De artistieke kenmerken (warm, zakelijk, etc.)
  birthYear: integer('birth_year'), // 📅 Geboortejaar (Privé/Admin - voor leeftijdscategorie matching)
  location: text('location'), // 📍 Stad/Regio (Privé/Admin)
  clients: text('clients'), // 🏢 Merknamen/Klantenlijst (voor SEO en matching)
  photoId: integer('photo_id').references(() => media.id), // 📸 De Actor-specifieke foto (voor Agency)
  logoId: integer('logo_id'),
  voiceScore: integer('voice_score').default(10),
  experienceLevel: experienceLevelEnum('experience_level').default('pro'),
  experience_level_new: experienceLevelEnum('experience_level_new').default('pro'), // Temporary for migration
  studioSpecs: jsonb('studio_specs').default({}), // 🎙️ Publiek: { microphone: string, preamp: string, interface: string, booth: string }
  connectivity: jsonb('connectivity').default({}), // 🌐 Publiek: { source_connect: boolean, zoom: boolean, cleanfeed: boolean, session_link: boolean }
  availability: jsonb('availability').default([]), // Array of objects: { start: string, end: string, reason: string }
  menuOrder: integer('menu_order').default(0), // Manual sort override (Drag & Drop)
  priceUnpaid: decimal('price_unpaid', { precision: 10, scale: 2 }),
  priceOnline: decimal('price_online', { precision: 10, scale: 2 }),
  priceIvr: decimal('price_ivr', { precision: 10, scale: 2 }),
  priceLiveRegie: decimal('price_live_regie', { precision: 10, scale: 2 }),
  rates: jsonb('rates').default({}), // Master Rates JSON: { "BE": { "online": 250, ... }, "FR": { ... } }
  dropboxUrl: text('dropbox_url'),
  status: statusEnum('status').default('pending'), // 'live' = public, others = private, 'unavailable' = holiday
  isPublic: boolean('is_public').default(false), // Expliciete vlag voor frontend zichtbaarheid
  isAi: boolean('is_ai').default(false),
  aiTags: text('ai_tags'), // 🤖 AI-generated tags voor matching/search
  elevenlabsId: text('elevenlabs_id'),
  youtubeUrl: text('youtube_url'), // 📺 YouTube koppeling
  slug: text('slug').unique(),
  website: text('website'), // 🌐 Persoonlijke website van de acteur (Privé/Admin)
  linkedin: text('linkedin'), // 🔗 LinkedIn profiel (Privé/Admin)
  internalNotes: text('internal_notes'), // Privé veld voor admin
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🗣️ DIALECTS (Linguistic Nuance)
export const actorDialects = pgTable('actor_dialects', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  dialect: text('dialect').notNull(), // e.g., 'West-Vlaams', 'Limburgs-NL', 'Paulista'
  proficiency: text('proficiency').default('native'), // native, fluent, imitation
  createdAt: timestamp('created_at').defaultNow(),
});

export const actorDemos = pgTable('actor_demos', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Added for traceability
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type'), // demo, telephony, corporate, etc.
  isPublic: boolean('is_public').default(true), // Sommige demo's kunnen privé blijven voor offertes
  menuOrder: integer('menu_order').default(0),
});

export const actorVideos = pgTable('actor_videos', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => actors.id).notNull(),
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine (External of Local)
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type'), // youtube, vimeo, videoask, local
  isPublic: boolean('is_public').default(true),
  menuOrder: integer('menu_order').default(0),
});

// 🔗 RELATIONS
export const actorsRelations = relations(actors, ({ one, many }) => ({
  user: one(users, {
    fields: [actors.userId],
    references: [users.id],
  }),
  demos: many(actorDemos),
  videos: many(actorVideos),
  dialects: many(actorDialects),
  orderItems: many(orderItems), // 📦 Project historie voor de acteur
  actorLanguages: many(actorLanguages),
  actorTones: many(actorTones),
  country: one(countries, {
    fields: [actors.countryId],
    references: [countries.id],
  }),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  actorLanguages: many(actorLanguages),
}));

export const actorLanguagesRelations = relations(actorLanguages, ({ one }) => ({
  actor: one(actors, {
    fields: [actorLanguages.actorId],
    references: [actors.id],
  }),
  language: one(languages, {
    fields: [actorLanguages.languageId],
    references: [languages.id],
  }),
}));

export const voiceTonesRelations = relations(voiceTones, ({ many }) => ({
  actorTones: many(actorTones),
}));

export const actorTonesRelations = relations(actorTones, ({ one }) => ({
  actor: one(actors, {
    fields: [actorTones.actorId],
    references: [actors.id],
  }),
  tone: one(voiceTones, {
    fields: [actorTones.toneId],
    references: [voiceTones.id],
  }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  actors: many(actors),
}));

export const actorDialectsRelations = relations(actorDialects, ({ one }) => ({
  actor: one(actors, {
    fields: [actorDialects.actorId],
    references: [actors.id],
  }),
}));

export const actorDemosRelations = relations(actorDemos, ({ one }) => ({
  actor: one(actors, {
    fields: [actorDemos.actorId],
    references: [actors.id],
  }),
}));

export const actorVideosRelations = relations(actorVideos, ({ one }) => ({
  actor: one(actors, {
    fields: [actorVideos.actorId],
    references: [actors.id],
  }),
}));

  // 🎧 WORKSHOPS (Studio Journey)
export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Link naar voices_workshop_teachers ID
  userId: integer('user_id').references(() => users.id), // 👤 Link naar de user account (voor dashboard toegang)
  name: text('name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  slug: text('slug').unique(), // 🔗 URL-vriendelijke naam
  tagline: text('tagline'),
  bio: text('bio'),
  photoId: integer('photo_id').references(() => media.id), // 📸 De Instructor-specifieke foto (voor Studio)
  vatNumber: text('vat_number'), // 🤫 Privé BTW nummer voor facturatie
  socials: jsonb('socials').default({}), // 📱 LinkedIn, Instagram, etc.
  internalNotes: text('internal_notes'), // 🔒 Privé admin notities (GF data etc.)
  adminMeta: jsonb('admin_meta').default({}), // 🔒 Gestructureerde admin data
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workshops = pgTable('workshops', {
  id: bigint('id', { mode: 'number' }).primaryKey(), // Gebruik originele WooCommerce Product ID
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
  wpProductId: bigint('wp_product_id', { mode: 'number' }).unique(), // Gebruik originele WooCommerce Product ID
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
  photoId: integer('photo_id').references(() => media.id),
  mapUrl: text('map_url'),
  vatNumber: text('vat_number'), // 🤫 Privé BTW nummer voor facturatie
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const locationsRelations = relations(locations, ({ many }) => ({
  costs: many(costs),
  editions: many(workshopEditions),
}));

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

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  media: one(media, {
    fields: [workshops.mediaId],
    references: [media.id],
  }),
  instructor: one(instructors, {
    fields: [workshops.instructorId],
    references: [instructors.id],
  }),
  editions: many(workshopEditions),
  gallery: many(workshopGallery),
  costs: many(costs),
}));

export const workshopEditionsRelations = relations(workshopEditions, ({ one, many }) => ({
  participants: many(orderItems),
  workshop: one(workshops, {
    fields: [workshopEditions.workshopId],
    references: [workshops.id],
  }),
  location: one(locations, {
    fields: [workshopEditions.locationId],
    references: [locations.id],
  }),
  instructor: one(instructors, {
    fields: [workshopEditions.instructorId],
    references: [instructors.id],
  }),
  costs: many(costs),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  photo: one(media, {
    fields: [instructors.photoId],
    references: [media.id],
  }),
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  workshops: many(workshops),
  costs: many(costs),
}));

export const workshopInterest = pgTable('workshop_interest', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(), // Added for traceability
  userId: integer('user_id').references(() => users.id), // Link to the silent user
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
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
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
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
  userId: integer('user_id').references(() => users.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  status: text('status').default('in_progress'), // in_progress, completed
  videoTimestamp: integer('video_timestamp').default(0),
  completedAt: timestamp('completed_at'),
});

export const courseSubmissions = pgTable('course_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
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
  userId: integer('user_id').references(() => users.id),
  total: decimal('total', { precision: 10, scale: 2 }),
  tax: decimal('total_tax', { precision: 10, scale: 2 }),
  status: text('status').default('pending'),
  journey: text('journey').notNull(), // studio, academy, agency
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
  internalNotes: text('internal_notes'), // Privé admin notities over de order
  isPrivate: boolean('is_private').default(false), // Voor gevoelige of handmatige orders
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  
  // 🛡️ KELLY'S INTEGRITY (B2B & Fraud)
  viesValidatedAt: timestamp('vies_validated_at'),
  viesCountryCode: text('vies_country_code'),
  ipAddress: text('ip_address'), // Hashed IP for fraud analysis
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
  deliveryStatus: text('delivery_status').default('waiting'), // waiting, uploaded, admin_review, client_review, approved, rejected
  deliveryFileUrl: text('delivery_file_url'), // Pad naar de audio in Supabase Storage
  invoiceFileUrl: text('invoice_file_url'), // De geüploade factuur van de acteur
  payoutStatus: payoutStatusEnum('payout_status').default('pending'), // pending, approved, paid, cancelled
  metaData: jsonb('meta_data'), // Bevat script, usage, instructions, deadline, etc.
  meta: jsonb('meta'), // 📦 Extra meta data
  editionId: integer('edition_id').references(() => workshopEditions.id), // 📅 Link naar specifieke workshop editie
  dropboxUrl: text('dropbox_url'), // 📦 Link naar de audio/bestanden voor deze specifieke deelnemer
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  createdAt: timestamp('created_at').defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  actor: one(actors, {
    fields: [orderItems.actorId],
    references: [actors.id],
  }),
  edition: one(workshopEditions, {
    fields: [orderItems.editionId],
    references: [workshopEditions.id],
  }),
  costs: many(costs),
}));

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
  userId: integer('user_id').references(() => users.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('confirmed'),
  rescheduleToken: text('reschedule_token'),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🧘 ADEMING JOURNEY (Meditatie & Rust)
export const ademingTracks = pgTable('ademing_tracks', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  mediaId: integer('media_id').references(() => media.id), // 🔗 Link naar Media Engine
  title: text('title').notNull(),
  url: text('url').notNull(),
  duration: integer('duration'),
  vibe: text('vibe'),
  isPublic: boolean('is_public').default(true),
});

export const ademingSeries = pgTable('ademing_series', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(true),
});

export const ademingReflections = pgTable('ademing_reflections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  intention: text('intention'),
  reflection: text('reflection'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ademingStats = pgTable('ademing_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
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

export const approvalQueueRelations = relations(approvalQueue, ({ one }) => ({
  approver: one(users, {
    fields: [approvalQueue.approvedBy],
    references: [users.id],
  }),
}));
export const aiLogs = pgTable('ai_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
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
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  sourceType: text('source_type'), // voicy, contact_form, etc.
  leadVibe: text('lead_vibe'), // cold, warm, hot, burning
  iapContext: jsonb('iap_context'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 🏺 VOICEJAR (Audio Feedback & Session Recording)
export const voicejarSessions = pgTable('voicejar_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
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

export const voicejarSessionsRelations = relations(voicejarSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [voicejarSessions.userId],
    references: [users.id],
  }),
  events: many(voicejarEvents),
}));

export const voicejarEventsRelations = relations(voicejarEvents, ({ one }) => ({
  session: one(voicejarSessions, {
    fields: [voicejarEvents.sessionId],
    references: [voicejarSessions.visitorHash],
  }),
}));

// 💬 VOICY & CHAT
export const chatConversations = pgTable('chat_conversations', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
  userId: integer('user_id').references(() => users.id),
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
  userId: integer('user_id').references(() => users.id),
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
  isPublic: boolean('is_public').default(true), // Alleen gepubliceerde FAQs
  internalNotes: text('internal_notes'),
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
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  content: text('content'), // De ruwe of opgeschoonde HTML
  excerpt: text('excerpt'),
  status: text('status').default('publish'),
  authorId: integer('user_id').references(() => users.id),
  featuredImageId: integer('featured_image_id'),
  iapContext: jsonb('iap_context'),
  seoData: jsonb('seo_data'),
  isManuallyEdited: boolean('is_manually_edited').default(false),
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
  isManuallyEdited: boolean('is_manually_edited').default(false),
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
  isManuallyEdited: boolean('is_manually_edited').default(false),
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

// 🔗 CONTENT RELATIONS
export const contentArticlesRelations = relations(contentArticles, ({ one, many }) => ({
  author: one(users, {
    fields: [contentArticles.authorId],
    references: [users.id],
  }),
  blocks: many(contentBlocks),
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

// 🌐 VOICEGLOT (Translations)
export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  translationKey: text('translation_key').notNull(),
  lang: text('lang').notNull(),
  originalText: text('original_text'),
  translatedText: text('translated_text'),
  context: text('context'),
  status: text('status').default('active'),
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique("translations_key_lang_unique").on(table.translationKey, table.lang),
]);

// 📊 System TRACKING
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  visitorHash: text('visitor_hash').unique().notNull(),
  userId: integer('user_id').references(() => users.id),
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

export const visitorsRelations = relations(visitors, ({ many }) => ({
  logs: many(visitorLogs),
}));

export const visitorLogsRelations = relations(visitorLogs, ({ one }) => ({
  visitor: one(visitors, {
    fields: [visitorLogs.visitorHash],
    references: [visitors.visitorHash],
  }),
}));

// ⭐ REVIEWS (Intelligence-Rich)
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  wpId: bigint('wp_id', { mode: 'number' }).unique(),
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
  iapContext: jsonb('iap_context'), // Intent, Persona, Segment
  sentimentVelocity: integer('sentiment_velocity').default(0),
  language: text('language').default('nl'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(), // Relatief aan /assets
  fileType: text('file_type'), // image/jpeg, audio/mpeg, etc.
  fileSize: integer('file_size'),
  altText: text('alt_text'),
  labels: text('labels').array(), // Slimme labels (AI of handmatig)
  journey: text('journey'), // agency, studio, academy, etc.
  category: text('category'), // voices, music, branding, etc.
  isPublic: boolean('is_public').default(true), // Zichtbaarheid vlag
  isManuallyEdited: boolean('is_manually_edited').default(false), // 🛡️ NUCLEAR LOCK MANDATE
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

// 🛡️ ABUSE PREVENTION (Free Preview Tracking)
export const freePreviews = pgTable('free_previews', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
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
  level: text('level').default('info'), // info, warn, error, critical
  source: text('source').notNull(), // sync, api, auth, etc.
  message: text('message').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 💰 COSTS (Centralized Financial Tracking)
export const costs = pgTable('costs', {
  id: serial('id').primaryKey(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'locatie', 'instructeur', 'materiaal', 'overig'
  journey: text('journey').notNull().default('studio'), // 🎭 'studio', 'agency', 'academy'
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

export const costsRelations = relations(costs, ({ one }) => ({
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
}));

export const studioSessionStatusEnum = pgEnum('studio_session_status', ['active', 'archived', 'completed']);
export const studioFeedbackTypeEnum = pgEnum('studio_feedback_type', ['text', 'audio', 'waveform_marker']);

export const studioSessions = pgTable('studio_sessions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  orderItemId: integer('order_item_id').references(() => orderItems.id),
  conversationId: integer('conversation_id').references(() => chatConversations.id),
  status: studioSessionStatusEnum('status').default('active'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studioScripts = pgTable('studio_scripts', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => studioSessions.id).notNull(),
  version: integer('version').default(1).notNull(),
  content: text('content').notNull(),
  notes: text('notes'),
  isCurrent: boolean('is_current').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studioFeedback = pgTable('studio_feedback', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => studioSessions.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: studioFeedbackTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  audioPath: text('audio_path'),
  waveformTimestamp: decimal('waveform_timestamp', { precision: 10, scale: 3 }),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studioSessionsRelations = relations(studioSessions, ({ one, many }) => ({
  order: one(orders, {
    fields: [studioSessions.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [studioSessions.orderItemId],
    references: [orderItems.id],
  }),
  conversation: one(chatConversations, {
    fields: [studioSessions.conversationId],
    references: [chatConversations.id],
  }),
  scripts: many(studioScripts),
  feedback: many(studioFeedback),
}));

export const studioScriptsRelations = relations(studioScripts, ({ one }) => ({
  session: one(studioSessions, {
    fields: [studioScripts.sessionId],
    references: [studioSessions.id],
  }),
}));

export const studioFeedbackRelations = relations(studioFeedback, ({ one }) => ({
  session: one(studioSessions, {
    fields: [studioFeedback.sessionId],
    references: [studioSessions.id],
  }),
  user: one(users, {
    fields: [studioFeedback.userId],
    references: [users.id],
  }),
}));
