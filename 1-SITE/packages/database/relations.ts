import { relations } from "drizzle-orm/relations";
import { actors, actorDemos, media, users, ademingReflections, aiClones, aiLogs, chatConversations, aiRecommendations, chatMessages, appointments, courseProgress, courseSubmissions, favorites, contentArticles, contentBlocks, visitors, voicejarSessions, orders, utmTouchpoints, voucherBatches, vouchers, ademingStats, chatPushSubscriptions, voiceAffinity, orderNotes, ademingTracks, workshops, actorVideos, orderItems, vaultFiles } from "./schema";

export const actorDemosRelations = relations(actorDemos, ({one}) => ({
	actor: one(actors, {
		fields: [actorDemos.actorId],
		references: [actors.id]
	}),
	media: one(media, {
		fields: [actorDemos.mediaId],
		references: [media.id]
	}),
}));

export const actorsRelations = relations(actors, ({one, many}) => ({
	actorDemos: many(actorDemos),
	aiClones: many(aiClones),
	favorites: many(favorites),
	voiceAffinities_voiceAId: many(voiceAffinity, {
		relationName: "voiceAffinity_voiceAId_actors_id"
	}),
	voiceAffinities_voiceBId: many(voiceAffinity, {
		relationName: "voiceAffinity_voiceBId_actors_id"
	}),
	actorVideos: many(actorVideos),
	user: one(users, {
		fields: [actors.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
	vaultFiles: many(vaultFiles),
}));

export const mediaRelations = relations(media, ({many}) => ({
	actorDemos: many(actorDemos),
	ademingTracks: many(ademingTracks),
	workshops: many(workshops),
	actorVideos: many(actorVideos),
	vaultFiles: many(vaultFiles),
}));

export const ademingReflectionsRelations = relations(ademingReflections, ({one}) => ({
	user: one(users, {
		fields: [ademingReflections.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	ademingReflections: many(ademingReflections),
	aiLogs: many(aiLogs),
	appointments: many(appointments),
	chatConversations: many(chatConversations),
	courseProgresses: many(courseProgress),
	courseSubmissions: many(courseSubmissions),
	favorites: many(favorites),
	contentArticles: many(contentArticles),
	visitors: many(visitors),
	voicejarSessions: many(voicejarSessions),
	utmTouchpoints: many(utmTouchpoints),
	vouchers: many(vouchers),
	ademingStats: many(ademingStats),
	chatPushSubscriptions: many(chatPushSubscriptions),
	actors: many(actors),
	orders: many(orders),
	vaultFiles: many(vaultFiles),
}));

export const aiClonesRelations = relations(aiClones, ({one}) => ({
	actor: one(actors, {
		fields: [aiClones.actorId],
		references: [actors.id]
	}),
}));

export const aiLogsRelations = relations(aiLogs, ({one}) => ({
	user: one(users, {
		fields: [aiLogs.userId],
		references: [users.id]
	}),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({one}) => ({
	chatConversation: one(chatConversations, {
		fields: [aiRecommendations.conversationId],
		references: [chatConversations.id]
	}),
	chatMessage: one(chatMessages, {
		fields: [aiRecommendations.messageId],
		references: [chatMessages.id]
	}),
}));

export const chatConversationsRelations = relations(chatConversations, ({one, many}) => ({
	aiRecommendations: many(aiRecommendations),
	chatMessages: many(chatMessages),
	user: one(users, {
		fields: [chatConversations.userId],
		references: [users.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one, many}) => ({
	aiRecommendations: many(aiRecommendations),
	chatConversation: one(chatConversations, {
		fields: [chatMessages.conversationId],
		references: [chatConversations.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	user: one(users, {
		fields: [appointments.userId],
		references: [users.id]
	}),
}));

export const courseProgressRelations = relations(courseProgress, ({one}) => ({
	user: one(users, {
		fields: [courseProgress.userId],
		references: [users.id]
	}),
}));

export const courseSubmissionsRelations = relations(courseSubmissions, ({one}) => ({
	user: one(users, {
		fields: [courseSubmissions.userId],
		references: [users.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	actor: one(actors, {
		fields: [favorites.actorId],
		references: [actors.id]
	}),
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
}));

export const contentBlocksRelations = relations(contentBlocks, ({one}) => ({
	contentArticle: one(contentArticles, {
		fields: [contentBlocks.articleId],
		references: [contentArticles.id]
	}),
}));

export const contentArticlesRelations = relations(contentArticles, ({one, many}) => ({
	contentBlocks: many(contentBlocks),
	user: one(users, {
		fields: [contentArticles.userId],
		references: [users.id]
	}),
}));

export const visitorsRelations = relations(visitors, ({one}) => ({
	user: one(users, {
		fields: [visitors.userId],
		references: [users.id]
	}),
}));

export const voicejarSessionsRelations = relations(voicejarSessions, ({one}) => ({
	user: one(users, {
		fields: [voicejarSessions.userId],
		references: [users.id]
	}),
}));

export const utmTouchpointsRelations = relations(utmTouchpoints, ({one}) => ({
	order: one(orders, {
		fields: [utmTouchpoints.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [utmTouchpoints.userId],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	utmTouchpoints: many(utmTouchpoints),
	orderNotes: many(orderNotes),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
	vaultFiles: many(vaultFiles),
}));

export const vouchersRelations = relations(vouchers, ({one}) => ({
	voucherBatch: one(voucherBatches, {
		fields: [vouchers.batchId],
		references: [voucherBatches.id]
	}),
	user: one(users, {
		fields: [vouchers.userId],
		references: [users.id]
	}),
}));

export const voucherBatchesRelations = relations(voucherBatches, ({many}) => ({
	vouchers: many(vouchers),
}));

export const ademingStatsRelations = relations(ademingStats, ({one}) => ({
	user: one(users, {
		fields: [ademingStats.userId],
		references: [users.id]
	}),
}));

export const chatPushSubscriptionsRelations = relations(chatPushSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [chatPushSubscriptions.userId],
		references: [users.id]
	}),
}));

export const voiceAffinityRelations = relations(voiceAffinity, ({one}) => ({
	actor_voiceAId: one(actors, {
		fields: [voiceAffinity.voiceAId],
		references: [actors.id],
		relationName: "voiceAffinity_voiceAId_actors_id"
	}),
	actor_voiceBId: one(actors, {
		fields: [voiceAffinity.voiceBId],
		references: [actors.id],
		relationName: "voiceAffinity_voiceBId_actors_id"
	}),
}));

export const orderNotesRelations = relations(orderNotes, ({one}) => ({
	order: one(orders, {
		fields: [orderNotes.orderId],
		references: [orders.id]
	}),
}));

export const ademingTracksRelations = relations(ademingTracks, ({one}) => ({
	media: one(media, {
		fields: [ademingTracks.mediaId],
		references: [media.id]
	}),
}));

export const workshopsRelations = relations(workshops, ({one}) => ({
	media: one(media, {
		fields: [workshops.mediaId],
		references: [media.id]
	}),
}));

export const actorVideosRelations = relations(actorVideos, ({one}) => ({
	actor: one(actors, {
		fields: [actorVideos.actorId],
		references: [actors.id]
	}),
	media: one(media, {
		fields: [actorVideos.mediaId],
		references: [media.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	actor: one(actors, {
		fields: [orderItems.actorId],
		references: [actors.id]
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
}));

export const vaultFilesRelations = relations(vaultFiles, ({one}) => ({
	actor: one(actors, {
		fields: [vaultFiles.actorId],
		references: [actors.id]
	}),
	user: one(users, {
		fields: [vaultFiles.customerId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [vaultFiles.projectId],
		references: [orders.id]
	}),
	media: one(media, {
		fields: [vaultFiles.promotedMediaId],
		references: [media.id]
	}),
}));