import { pgTable, foreignKey, serial, integer, text, timestamp, unique, boolean, bigint, jsonb, numeric, uniqueIndex, vector, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const deliveryStatus = pgEnum("delivery_status", ['waiting', 'uploaded', 'admin_review', 'client_review', 'approved', 'rejected', 'revision'])
export const experienceLevel = pgEnum("experience_level", ['beginner', 'intermediate', 'pro', 'elite'])
export const leadVibe = pgEnum("lead_vibe", ['cold', 'warm', 'hot', 'burning'])
export const payoutStatus = pgEnum("payout_status", ['pending', 'approved', 'paid', 'cancelled'])
export const senderType = pgEnum("sender_type", ['user', 'admin', 'ai'])
export const status = pgEnum("status", ['pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled', 'unavailable'])


export const academyTips = pgTable("academy_tips", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id"),
	title: text().notNull(),
	content: text().notNull(),
	category: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "academy_tips_lesson_id_lessons_id_fk"
		}),
]);

export const actorDemos = pgTable("actor_demos", {
	id: serial().primaryKey().notNull(),
	actorId: integer("actor_id").notNull(),
	name: text().notNull(),
	url: text().notNull(),
	type: text(),
	is_public: boolean("is_public").default(true),
	menu_order: integer("menu_order").default(0),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	mediaId: integer("media_id"),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "actor_demos_actor_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "actor_demos_media_id_media_id_fk"
		}),
	unique("actor_demos_wp_id_unique").on(table.wpId),
]);

export const ademingReflections = pgTable("ademing_reflections", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id").notNull(),
	intention: text(),
	reflection: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "ademing_reflections_user_id_users_id_fk"
		}),
]);

export const ademingSeries = pgTable("ademing_series", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	is_public: boolean("is_public").default(true),
});

export const aiClones = pgTable("ai_clones", {
	id: serial().primaryKey().notNull(),
	actorId: integer("actor_id"),
	elevenlabsVoiceId: text("elevenlabs_voice_id").notNull(),
	status: text().default('active'),
	settings: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "ai_clones_actor_id_actors_id_fk"
		}),
	unique("ai_clones_elevenlabs_voice_id_unique").on(table.elevenlabsVoiceId),
]);

export const aiLogs = pgTable("ai_logs", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id"),
	eventType: text("event_type"),
	eventData: jsonb("event_data"),
	fullScript: text("full_script"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "ai_logs_user_id_users_id_fk"
		}),
]);

export const appointments = pgTable("appointments", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	googleEventId: text("google_event_id"),
	user_id: integer("user_id"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	status: text().default('confirmed'),
	rescheduleToken: text("reschedule_token"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "appointments_user_id_users_id_fk"
		}),
	unique("appointments_wp_id_unique").on(table.wpId),
]);

export const aiRecommendations = pgTable("ai_recommendations", {
	id: serial().primaryKey().notNull(),
	conversationId: integer("conversation_id"),
	messageId: integer("message_id"),
	recommendedActorIds: text("recommended_actor_ids"),
	userClicked: boolean("user_clicked").default(false),
	userOrdered: boolean("user_ordered").default(false),
	successScore: numeric("success_score", { precision: 3, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [chatConversations.id],
			name: "ai_recommendations_conversation_id_chat_conversations_id_fk"
		}),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [chatMessages.id],
			name: "ai_recommendations_message_id_chat_messages_id_fk"
		}),
]);

export const centralLeads = pgTable("central_leads", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	first_name: text("first_name"),
	last_name: text("last_name"),
	phone: text(),
	sourceType: text("source_type"),
	leadVibe: text("lead_vibe"),
	iapContext: jsonb("iap_context"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	conversationId: integer("conversation_id").notNull(),
	senderId: integer("sender_id"),
	senderType: text("sender_type").notNull(),
	message: text().notNull(),
	attachments: jsonb().default([]),
	isAiRecommendation: boolean("is_ai_recommendation").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [chatConversations.id],
			name: "chat_messages_conversation_id_chat_conversations_id_fk"
		}),
	unique("chat_messages_wp_id_unique").on(table.wpId),
]);

export const chatConversations = pgTable("chat_conversations", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	user_id: integer("user_id"),
	guestName: text("guest_name"),
	guestEmail: text("guest_email"),
	guestPhone: text("guest_phone"),
	guestAge: integer("guest_age"),
	guestProfession: text("guest_profession"),
	locationCity: text("location_city"),
	locationCountry: text("location_country"),
	status: text().default('open'),
	resolved: boolean().default(false),
	journey: text(),
	intent: text(),
	ttfi: integer(),
	effectivenessScore: numeric("effectiveness_score", { precision: 3, scale:  2 }),
	iapContext: jsonb("iap_context"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	instructorId: integer("instructor_id"),
	workshopEditionId: integer("workshop_edition_id"),
}, (table) => [
	foreignKey({
			columns: [table.instructorId],
			foreignColumns: [instructors.id],
			name: "chat_conversations_instructor_id_instructors_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "chat_conversations_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.workshopEditionId],
			foreignColumns: [workshopEditions.id],
			name: "chat_conversations_workshop_edition_id_workshop_editions_id_fk"
		}),
	unique("chat_conversations_wp_id_unique").on(table.wpId),
]);

export const courseProgress = pgTable("course_progress", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	status: text().default('in_progress'),
	videoTimestamp: integer("video_timestamp").default(0),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_progress_course_id_courses_id_fk"
		}),
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "course_progress_lesson_id_lessons_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "course_progress_user_id_users_id_fk"
		}),
]);

export const courseSubmissions = pgTable("course_submissions", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	filePath: text("file_path").notNull(),
	status: text().default('pending'),
	feedbackText: text("feedback_text"),
	feedbackAudioPath: text("feedback_audio_path"),
	scorePronunciation: integer("score_pronunciation"),
	scoreIntonation: integer("score_intonation"),
	scoreCredibility: integer("score_credibility"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "course_submissions_lesson_id_lessons_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "course_submissions_user_id_users_id_fk"
		}),
]);

export const favorites = pgTable("favorites", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id").notNull(),
	actorId: integer("actor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "favorites_actor_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "favorites_user_id_users_id_fk"
		}),
]);

export const contentArticles = pgTable("content_articles", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	title: text().notNull(),
	slug: text().notNull(),
	content: text(),
	excerpt: text(),
	status: text().default('publish'),
	user_id: integer("user_id"),
	featuredImageId: integer("featured_image_id"),
	iapContext: jsonb("iap_context"),
	seoData: jsonb("seo_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	is_manually_edited: boolean("is_manually_edited").default(false),
}, (table) => [
	foreignKey({
			columns: [table.lockedBy],
			foreignColumns: [users.id],
			name: "content_articles_locked_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "content_articles_user_id_users_id_fk"
		}),
	unique("content_articles_wp_id_unique").on(table.wpId),
	unique("content_articles_slug_unique").on(table.slug),
]);

export const contentBlocks = pgTable("content_blocks", {
	id: serial().primaryKey().notNull(),
	articleId: integer("article_id"),
	type: text(),
	content: text(),
	settings: jsonb(),
	displayOrder: integer("display_order").default(0),
	is_manually_edited: boolean("is_manually_edited").default(false),
}, (table) => [
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [contentArticles.id],
			name: "content_blocks_article_id_content_articles_id_fk"
		}),
	foreignKey({
			columns: [table.lockedBy],
			foreignColumns: [users.id],
			name: "content_blocks_locked_by_users_id_fk"
		}),
]);

export const faq = pgTable("faq", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	category: text(),
	questionNl: text("question_nl"),
	answerNl: text("answer_nl"),
	questionFr: text("question_fr"),
	answerFr: text("answer_fr"),
	questionEn: text("question_en"),
	answerEn: text("answer_en"),
	persona: text(),
	journeyPhase: text("journey_phase"),
	is_public: boolean("is_public").default(true),
	internal_notes: text("internal_notes"),
	displayOrder: integer("display_order").default(0),
	questionDe: text("question_de"),
	answerDe: text("answer_de"),
	views: integer().default(0),
	helpfulCount: integer("helpful_count").default(0),
	notHelpfulCount: integer("not_helpful_count").default(0),
	cta: jsonb(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("faq_wp_id_unique").on(table.wpId),
]);

export const translations = pgTable("translations", {
	id: serial().primaryKey().notNull(),
	translationKey: text("translation_key").notNull(),
	lang: text().notNull(),
	originalText: text("original_text"),
	translatedText: text("translated_text"),
	context: text(),
	status: text().default('active'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	is_manually_edited: boolean("is_manually_edited").default(false),
});

export const partnerWidgets = pgTable("partner_widgets", {
	id: serial().primaryKey().notNull(),
	partnerId: text("partner_id").notNull(),
	name: text().notNull(),
	companyName: text("company_name"),
	primaryColor: text("primary_color"),
	allowedVoices: text("allowed_voices"),
	discountPercentage: numeric("discount_percentage", { precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("partner_widgets_partner_id_unique").on(table.partnerId),
]);

export const quizSteps = pgTable("quiz_steps", {
	id: serial().primaryKey().notNull(),
	quizSlug: text("quiz_slug").notNull(),
	stepOrder: integer("step_order").notNull(),
	question: text().notNull(),
	options: jsonb().notNull(),
});

export const translationRegistry = pgTable("translation_registry", {
	id: serial().primaryKey().notNull(),
	stringHash: text("string_hash").notNull(),
	originalText: text("original_text").notNull(),
	context: text(),
	lastSeen: timestamp("last_seen", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("translation_registry_string_hash_unique").on(table.stringHash),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	provider: text().default('google_places'),
	businessSlug: text("business_slug"),
	authorName: text("author_name").notNull(),
	authorUrl: text("author_url"),
	rating: integer().notNull(),
	textNl: text("text_nl"),
	textFr: text("text_fr"),
	textEn: text("text_en"),
	textDe: text("text_de"),
	responseText: text("response_text"),
	conversionScore: numeric("conversion_score", { precision: 5, scale:  2 }),
	iapContext: jsonb("iap_context"),
	sentimentVelocity: integer("sentiment_velocity").default(0),
	language: text().default('nl'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("reviews_wp_id_unique").on(table.wpId),
]);

export const visitors = pgTable("visitors", {
	id: serial().primaryKey().notNull(),
	visitorHash: text("visitor_hash").notNull(),
	user_id: integer("user_id"),
	currentPage: text("current_page"),
	referrer: text(),
	utmSource: text("utm_source"),
	utmMedium: text("utm_medium"),
	utmCampaign: text("utm_campaign"),
	companyName: text("company_name"),
	locationCity: text("location_city"),
	locationCountry: text("location_country"),
	isBusiness: boolean("is_business").default(false),
	lastVisitAt: timestamp("last_visit_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "visitors_user_id_users_id_fk"
		}),
	unique("visitors_visitor_hash_unique").on(table.visitorHash),
]);

export const voicejarSessions = pgTable("voicejar_sessions", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id"),
	visitorHash: text("visitor_hash").notNull(),
	url: text(),
	status: text().default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "voicejar_sessions_user_id_users_id_fk"
		}),
]);

export const voucherBatches = pgTable("voucher_batches", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const utmTouchpoints = pgTable("utm_touchpoints", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id"),
	orderId: integer("order_id"),
	source: text(),
	medium: text(),
	campaign: text(),
	content: text(),
	term: text(),
	url: text(),
	referrer: text(),
	vibe: text(),
	isFirstTouch: boolean("is_first_touch").default(false),
	isLastTouch: boolean("is_last_touch").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "utm_touchpoints_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "utm_touchpoints_user_id_users_id_fk"
		}),
]);

export const vouchers = pgTable("vouchers", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	batchId: integer("batch_id"),
	status: text().default('active'),
	user_id: integer("user_id"),
	usedAt: timestamp("used_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [voucherBatches.id],
			name: "vouchers_batch_id_voucher_batches_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "vouchers_user_id_users_id_fk"
		}),
	unique("vouchers_code_unique").on(table.code),
]);

export const yukiOutstanding = pgTable("yuki_outstanding", {
	id: serial().primaryKey().notNull(),
	contactId: text("contact_id").notNull(),
	invoiceNr: text("invoice_nr").notNull(),
	invoiceDate: timestamp("invoice_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	amount: numeric({ precision: 10, scale:  2 }),
	openAmount: numeric("open_amount", { precision: 10, scale:  2 }),
	currency: text().default('EUR'),
	lastSynced: timestamp("last_synced", { mode: 'string' }).defaultNow(),
});

export const ademingStats = pgTable("ademing_stats", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id").notNull(),
	streakDays: integer("streak_days").default(0),
	totalListenSeconds: integer("total_listen_seconds").default(0),
	lastActivity: timestamp("last_activity", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "ademing_stats_user_id_users_id_fk"
		}),
]);

export const chatPushSubscriptions = pgTable("chat_push_subscriptions", {
	id: serial().primaryKey().notNull(),
	user_id: integer("user_id"),
	endpoint: text().notNull(),
	p256Dh: text().notNull(),
	auth: text().notNull(),
	userAgent: text("user_agent"),
	enabled: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "chat_push_subscriptions_user_id_users_id_fk"
		}),
]);

export const voiceAffinity = pgTable("voice_affinity", {
	id: serial().primaryKey().notNull(),
	voiceAId: integer("voice_a_id"),
	voiceBId: integer("voice_b_id"),
	pairCount: integer("pair_count").default(1),
}, (table) => [
	foreignKey({
			columns: [table.voiceAId],
			foreignColumns: [actors.id],
			name: "voice_affinity_voice_a_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.voiceBId],
			foreignColumns: [actors.id],
			name: "voice_affinity_voice_b_id_actors_id_fk"
		}),
]);

export const appConfigs = pgTable("app_configs", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	description: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("app_configs_key_unique").on(table.key),
]);

export const systemEvents = pgTable("system_events", {
	id: serial().primaryKey().notNull(),
	level: text().default('info'),
	source: text().notNull(),
	message: text().notNull(),
	details: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const orderNotes = pgTable("order_notes", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	note: text().notNull(),
	isCustomerNote: boolean("is_customer_note").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_notes_order_id_orders_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpUserId: bigint("wp_user_id", { mode: "number" }),
	email: text().notNull(),
	first_name: text("first_name"),
	last_name: text("last_name"),
	phone: text(),
	companyName: text("company_name"),
	companySector: text("company_sector"),
	companySize: text("company_size"),
	vatNumber: text("vat_number"),
	role: text().default('guest'),
	customerType: text("customer_type"),
	journeyState: text("journey_state"),
	preferences: jsonb().default({}),
	customerInsights: jsonb("customer_insights"),
	activityLog: jsonb("activity_log").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	lastActive: timestamp("last_active", { mode: 'string' }).defaultNow(),
	subroles: jsonb().default([]),
	approvedFlows: jsonb("approved_flows").default(["commercial","corporate","telephony"]),
	iban: text(),
	addressStreet: text("address_street"),
	addressZip: text("address_zip"),
	addressCity: text("address_city"),
	addressCountry: text("address_country").default('BE'),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	is_manually_edited: boolean("is_manually_edited").default(false),
	howHeard: text("how_heard"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	photo_id: integer("photo_id"),
}, (table) => [
	unique("users_wp_user_id_unique").on(table.wpUserId),
	unique("users_email_unique").on(table.email),
]);

export const workshops = pgTable("workshops", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	date: timestamp({ mode: 'string' }).notNull(),
	capacity: integer().default(8),
	price: numeric({ precision: 10, scale:  2 }),
	status: text().default('upcoming'),
	mediaId: integer("media_id"),
	slug: text(),
	duration: text(),
	instructorId: integer("instructor_id"),
	program: jsonb(),
	meta: jsonb(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wp_product_id: bigint("wp_product_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.instructorId],
			foreignColumns: [instructors.id],
			name: "workshops_instructor_id_instructors_id_fk"
		}),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "workshops_media_id_media_id_fk"
		}),
	unique("workshops_slug_unique").on(table.slug),
	unique("workshops_wp_product_id_unique").on(table.wp_product_id),
]);

export const actorVideos = pgTable("actor_videos", {
	id: serial().primaryKey().notNull(),
	actorId: integer("actor_id").notNull(),
	mediaId: integer("media_id"),
	name: text().notNull(),
	url: text().notNull(),
	type: text(),
	is_public: boolean("is_public").default(true),
	menu_order: integer("menu_order").default(0),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "actor_videos_actor_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "actor_videos_media_id_media_id_fk"
		}),
]);

export const media = pgTable("media", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileType: text("file_type"),
	fileSize: integer("file_size"),
	altText: text("alt_text"),
	labels: text().array(),
	journey: text(),
	category: text(),
	is_public: boolean("is_public").default(true),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	is_manually_edited: boolean("is_manually_edited").default(false),
}, (table) => [
	unique("media_wp_id_unique").on(table.wpId),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id"),
	productId: integer("product_id"),
	actorId: integer("actor_id"),
	name: text().notNull(),
	quantity: integer().default(1),
	price: numeric({ precision: 10, scale:  2 }),
	cost: numeric({ precision: 10, scale:  2 }),
	tax: numeric({ precision: 10, scale:  2 }),
	deliveryStatus: text("delivery_status").default('waiting'),
	deliveryFileUrl: text("delivery_file_url"),
	metaData: jsonb("meta_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	is_manually_edited: boolean("is_manually_edited").default(false),
	invoiceFileUrl: text("invoice_file_url"),
	payoutStatus: payoutStatus("payout_status").default('pending'),
	meta: jsonb(),
	editionId: integer("edition_id"),
	dropbox_url: text("dropbox_url"),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "order_items_actor_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.editionId],
			foreignColumns: [workshopEditions.id],
			name: "order_items_edition_id_workshop_editions_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
]);

export const navMenus = pgTable("nav_menus", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	items: jsonb().notNull(),
	market: text().default('ALL'),
	is_manually_edited: boolean("is_manually_edited").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("nav_menus_key_unique").on(table.key),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpOrderId: bigint("wp_order_id", { mode: "number" }),
	user_id: integer("user_id"),
	total: numeric({ precision: 10, scale:  2 }),
	totalTax: numeric("total_tax", { precision: 10, scale:  2 }),
	totalProfit: numeric("total_profit", { precision: 10, scale:  2 }),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }),
	status: text().default('pending'),
	journey: text().notNull(),
	iapContext: jsonb("iap_context"),
	billingVatNumber: text("billing_vat_number"),
	yukiInvoiceId: text("yuki_invoice_id"),
	dropboxFolderUrl: text("dropbox_folder_url"),
	internal_notes: text("internal_notes"),
	isPrivate: boolean("is_private").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	rawMeta: jsonb("raw_meta"),
	displayOrderId: text("display_order_id"),
	expectedDeliveryDate: timestamp("expected_delivery_date", { withTimezone: true, mode: 'string' }),
	is_manually_edited: boolean("is_manually_edited").default(false),
	market: text().default('BE'),
	isQuote: boolean("is_quote").default(false),
	quoteMessage: text("quote_message"),
	quoteSentAt: timestamp("quote_sent_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	unique("orders_wp_order_id_unique").on(table.wpOrderId),
]);

export const approvalQueue = pgTable("approval_queue", {
	id: serial().primaryKey().notNull(),
	type: text().notNull(),
	status: text().default('pending'),
	priority: text().default('normal'),
	reasoning: text(),
	iapContext: jsonb("iap_context"),
	payload: jsonb().notNull(),
	originalPayload: jsonb("original_payload"),
	rejectionReason: text("rejection_reason"),
	userCorrections: text("user_corrections"),
	isPatternShift: boolean("is_pattern_shift").default(false),
	confidenceScore: integer("confidence_score"),
	targetId: text("target_id"),
	approvedBy: integer("approved_by"),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	executedAt: timestamp("executed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	isValueSensitive: boolean("is_value_sensitive").default(false),
	isBrandSensitive: boolean("is_brand_sensitive").default(false),
}, (table) => [
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "approval_queue_approved_by_users_id_fk"
		}),
]);

export const systemKnowledge = pgTable("system_knowledge", {
	id: serial().primaryKey().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	category: text().notNull(),
	content: text().notNull(),
	metadata: jsonb(),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("system_knowledge_slug_unique").on(table.slug),
]);

export const fameRegistry = pgTable("fame_registry", {
	id: serial().primaryKey().notNull(),
	brandName: text("brand_name").notNull(),
	domain: text(),
	sensitivityNote: text("sensitivity_note"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("fame_registry_brand_name_unique").on(table.brandName),
]);

export const mailContent = pgTable("mail_content", {
	id: serial().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	uid: integer().notNull(),
	sender: text(),
	recipient: text(),
	subject: text(),
	date: timestamp({ mode: 'string' }),
	htmlBody: text("html_body"),
	textBody: text("text_body"),
	threadId: text("thread_id"),
	messageId: text("message_id"),
	inReplyTo: text("in_reply_to"),
	referencesHeader: text("references_header"),
	iapContext: jsonb("iap_context").default({}),
	embedding: vector({ dimensions: 1536 }),
	isEncrypted: boolean("is_encrypted").default(true),
	isSuperPrivate: boolean("is_super_private").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("message_id_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops")),
	uniqueIndex("uid_account_idx").using("btree", table.uid.asc().nullsLast().op("int8_ops"), table.accountId.asc().nullsLast().op("int8_ops")),
]);

export const actorDialects = pgTable("actor_dialects", {
	id: serial().primaryKey().notNull(),
	actorId: integer("actor_id").notNull(),
	dialect: text().notNull(),
	proficiency: text().default('native'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "actor_dialects_actor_id_actors_id_fk"
		}),
]);

export const vaultFiles = pgTable("vault_files", {
	id: serial().primaryKey().notNull(),
	fileName: text("file_name").notNull(),
	originalName: text("original_name"),
	filePath: text("file_path").notNull(),
	mimeType: text("mime_type"),
	fileSize: integer("file_size"),
	actorId: integer("actor_id"),
	customerId: integer("customer_id"),
	projectId: integer("project_id"),
	category: text().notNull(),
	status: text().default('active'),
	aiMetadata: jsonb("ai_metadata").default({}),
	isPromoted: boolean("is_promoted").default(false),
	promotedMediaId: integer("promoted_media_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	accountId: text("account_id"),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [actors.id],
			name: "vault_files_actor_id_actors_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "vault_files_customer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [orders.id],
			name: "vault_files_project_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.promotedMediaId],
			foreignColumns: [media.id],
			name: "vault_files_promoted_media_id_media_id_fk"
		}),
]);

export const contentBlockVersions = pgTable("content_block_versions", {
	id: serial().primaryKey().notNull(),
	blockId: integer("block_id").notNull(),
	content: text().notNull(),
	settings: jsonb(),
	version: integer().notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	changeNote: text("change_note"),
}, (table) => [
	foreignKey({
			columns: [table.blockId],
			foreignColumns: [contentBlocks.id],
			name: "content_block_versions_block_id_content_blocks_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "content_block_versions_created_by_users_id_fk"
		}),
]);

export const courses = pgTable("courses", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("courses_slug_unique").on(table.slug),
]);

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	title: text().notNull(),
	description: text(),
	content: text(),
	videoUrl: text("video_url"),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	introScript: text("intro_script"),
	deepDiveScript: text("deep_dive_script"),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "lessons_course_id_courses_id_fk"
		}),
]);

export const pageLayouts = pgTable("page_layouts", {
	id: serial().primaryKey().notNull(),
	slug: text().notNull(),
	title: text(),
	layoutJson: jsonb("layout_json").notNull(),
	iapContext: jsonb("iap_context"),
	isPublished: boolean("is_published").default(false),
	is_manually_edited: boolean("is_manually_edited").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("page_layouts_slug_unique").on(table.slug),
]);

export const voicejarEvents = pgTable("voicejar_events", {
	id: serial().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	eventData: jsonb("event_data").notNull(),
	sequenceOrder: integer("sequence_order").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const marketConfigs = pgTable("market_configs", {
	id: serial().primaryKey().notNull(),
	market: text().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	vatNumber: text("vat_number"),
	cocNumber: text("coc_number"),
	address: jsonb(),
	socialLinks: jsonb("social_links"),
	legal: jsonb(),
	localization: jsonb(),
	is_manually_edited: boolean("is_manually_edited").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("market_configs_market_unique").on(table.market),
]);

export const rateCards = pgTable("rate_cards", {
	id: serial().primaryKey().notNull(),
	market: text().notNull(),
	category: text().notNull(),
	rules: jsonb().notNull(),
	is_manually_edited: boolean("is_manually_edited").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	context: text(),
	is_manually_edited: boolean("is_manually_edited").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("site_settings_key_unique").on(table.key),
]);

export const ademingTracks = pgTable("ademing_tracks", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	title: text().notNull(),
	url: text().notNull(),
	duration: integer(),
	vibe: text(),
	is_public: boolean("is_public").default(true),
	mediaId: integer("media_id"),
}, (table) => [
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "ademing_tracks_media_id_media_id_fk"
		}),
	unique("ademing_tracks_wp_id_unique").on(table.wpId),
]);

export const actors = pgTable("actors", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wp_product_id: bigint("wp_product_id", { mode: "number" }),
	user_id: integer("user_id"),
	first_name: text("first_name").notNull(),
	last_name: text("last_name"),
	gender: text(),
	native_lang: text("native_lang"),
	country: text(),
	deliveryTime: text("delivery_time"),
	extra_langs: text("extra_langs"),
	bio: text(),
	why_voices: text("why_voices"),
	tagline: text(),
	tone_of_voice: text("tone_of_voice"),
	photo_id: integer("photo_id"),
	logo_id: integer("logo_id"),
	voice_score: integer("voice_score").default(10),
	price_unpaid: numeric("price_unpaid", { precision: 10, scale:  2 }),
	price_online: numeric("price_online", { precision: 10, scale:  2 }),
	price_ivr: numeric("price_ivr", { precision: 10, scale:  2 }),
	price_live_regie: numeric("price_live_regie", { precision: 10, scale:  2 }),
	dropbox_url: text("dropbox_url"),
	status: status().default('pending'),
	is_public: boolean("is_public").default(false),
	is_ai: boolean("is_ai").default(false),
	elevenlabs_id: text("elevenlabs_id"),
	internal_notes: text("internal_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	slug: text(),
	youtubeUrl: text("youtube_url"),
	email: text(),
	menu_order: integer("menu_order").default(0),
	rates: jsonb().default({}),
	delivery_days_min: integer("delivery_days_min").default(1),
	delivery_days_max: integer("delivery_days_max").default(3),
	cutoff_time: text("cutoff_time").default('18:00'),
	sameday_delivery: boolean("sameday_delivery").default(false),
	pending_bio: text("pending_bio"),
	pending_tagline: text("pending_tagline"),
	experience_level: experienceLevel("experience_level").default('pro'),
	studio_specs: jsonb("studio_specs").default({}),
	connectivity: jsonb().default({}),
	availability: jsonb().default([]),
	is_manually_edited: boolean("is_manually_edited").default(false),
	website: text(),
	clients: text(),
	linkedin: text(),
	birth_year: integer("birth_year"),
	location: text(),
	ai_tags: text("ai_tags"),
}, (table) => [
	foreignKey({
			columns: [table.photo_id],
			foreignColumns: [media.id],
			name: "actors_photo_id_media_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "actors_user_id_users_id_fk"
		}),
	unique("actors_wp_product_id_unique").on(table.wp_product_id),
	unique("actors_slug_unique").on(table.slug),
]);

export const instructors = pgTable("instructors", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	name: text().notNull(),
	tagline: text(),
	bio: text(),
	photo_id: integer("photo_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	slug: text(),
	socials: jsonb().default({}),
	is_public: boolean("is_public").default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	user_id: integer("user_id"),
	internal_notes: text("internal_notes"),
	adminMeta: jsonb("admin_meta").default({}),
}, (table) => [
	foreignKey({
			columns: [table.photo_id],
			foreignColumns: [media.id],
			name: "instructors_photo_id_media_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "instructors_user_id_users_id_fk"
		}),
	unique("instructors_wp_id_unique").on(table.wpId),
	unique("instructors_slug_unique").on(table.slug),
]);

export const freePreviews = pgTable("free_previews", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	first_name: text("first_name"),
	last_name: text("last_name"),
	companyName: text("company_name"),
	phone: text(),
	agreedToTerms: boolean("agreed_to_terms").default(false),
	ipAddress: text("ip_address").notNull(),
	visitorHash: text("visitor_hash"),
	textHash: text("text_hash"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const pronunciationDictionary = pgTable("pronunciation_dictionary", {
	id: serial().primaryKey().notNull(),
	user_id: text("user_id").notNull(),
	word: text().notNull(),
	phonetic: text().notNull(),
	language: text().default('nl-BE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const coupons = pgTable("coupons", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	description: text(),
	discountType: text("discount_type").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	usageLimit: integer("usage_limit"),
	usageCount: integer("usage_count").default(0),
	individualUse: boolean("individual_use").default(false),
	excludeSaleItems: boolean("exclude_sale_items").default(false),
	minimumAmount: numeric("minimum_amount", { precision: 10, scale:  2 }),
	maximumAmount: numeric("maximum_amount", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("coupons_code_unique").on(table.code),
]);

export const refunds = pgTable("refunds", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	orderId: integer("order_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "refunds_order_id_orders_id_fk"
		}),
	unique("refunds_wp_id_unique").on(table.wpId),
]);

export const workshopInterestProducts = pgTable("workshop_interest_products", {
	id: serial().primaryKey().notNull(),
	interestId: integer("interest_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	workshopId: bigint("workshop_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.interestId],
			foreignColumns: [workshopInterest.id],
			name: "workshop_interest_products_interest_id_workshop_interest_id_fk"
		}),
]);

export const workshopInterest = pgTable("workshop_interest", {
	id: serial().primaryKey().notNull(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	email: text().notNull(),
	phone: text(),
	age: integer(),
	profession: text(),
	experience: text(),
	goal: text(),
	sample: text(),
	preferredDates: text("preferred_dates"),
	howHeard: text("how_heard"),
	productIds: text("product_ids"),
	gfEntryId: integer("gf_entry_id"),
	sourceUrl: text("source_url"),
	ipAddress: text("ip_address"),
	status: text().default('pending'),
	optOut: boolean("opt_out").default(false),
	optOutToken: text("opt_out_token"),
	optOutDate: timestamp("opt_out_date", { mode: 'string' }),
	smartMailSentAt: timestamp("smart_mail_sent_at", { mode: 'string' }),
	aiIdentikit: text("ai_identikit"),
	aiIdentikitUpdated: timestamp("ai_identikit_updated", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	wpId: bigint("wp_id", { mode: "number" }),
	user_id: integer("user_id"),
	iapContext: jsonb("iap_context"),
}, (table) => [
	unique("workshop_interest_email_unique").on(table.email),
	unique("workshop_interest_wp_id_unique").on(table.wpId),
]);

export const locations = pgTable("locations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	address: text(),
	city: text(),
	zip: text(),
	country: text().default('BE'),
	description: text(),
	photo_id: integer("photo_id"),
	mapUrl: text("map_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("locations_slug_unique").on(table.slug),
]);

export const workshopEditions = pgTable("workshop_editions", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	workshopId: bigint("workshop_id", { mode: "number" }).notNull(),
	title: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	capacity: integer().default(8),
	status: text().default('upcoming'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	program: jsonb(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	locationId: integer("location_id"),
	instructorId: integer("instructor_id"),
	price: numeric({ precision: 10, scale:  2 }),
});

export const workshopGallery = pgTable("workshop_gallery", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	workshopId: bigint("workshop_id", { mode: "number" }).notNull(),
	mediaId: integer("media_id").notNull(),
	displayOrder: integer("display_order").default(0),
	caption: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
