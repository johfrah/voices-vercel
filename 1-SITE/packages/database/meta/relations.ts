import { relations } from "drizzle-orm/relations";
import { lessons, academyTips, actors, actorDemos, media, users, ademingReflections, aiClones, aiLogs, appointments, chatConversations, aiRecommendations, chatMessages, instructors, workshopEditions, courses, courseProgress, courseSubmissions, favorites, contentArticles, contentBlocks, visitors, voicejarSessions, orders, utmTouchpoints, voucherBatches, vouchers, ademingStats, chatPushSubscriptions, voiceAffinity, orderNotes, workshops, actorVideos, orderItems, approvalQueue, actorDialects, vaultFiles, contentBlockVersions, ademingTracks, refunds, workshopInterest, workshopInterestProducts } from "./schema";

export const academyTipsRelations = relations(academyTips, ({one}) => ({
	lesson: one(lessons, {
		fields: [academyTips.lessonId],
		references: [lessons.id]
	}),
}));

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	academyTips: many(academyTips),
	courseProgresses: many(courseProgress),
	courseSubmissions: many(courseSubmissions),
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id]
	}),
}));

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
	actor_videos: many(actorVideos),
	orderItems: many(orderItems),
	actorDialects: many(actorDialects),
	vaultFiles: many(vaultFiles),
	media: one(media, {
		fields: [actors.photo_id],
		references: [media.id]
	}),
	user: one(users, {
		fields: [actors.user_id],
		references: [users.id]
	}),
}));

export const mediaRelations = relations(media, ({many}) => ({
	actorDemos: many(actorDemos),
	workshops: many(workshops),
	actor_videos: many(actorVideos),
	vaultFiles: many(vaultFiles),
	ademingTracks: many(ademingTracks),
	actors: many(actors),
	instructors: many(instructors),
}));

export const ademingReflectionsRelations = relations(ademingReflections, ({one}) => ({
	user: one(users, {
		fields: [ademingReflections.user_id],
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
	contentArticles_lockedBy: many(contentArticles, {
		relationName: "contentArticles_lockedBy_users_id"
	}),
	contentArticles_userId: many(contentArticles, {
		relationName: "contentArticles_userId_users_id"
	}),
	contentBlocks: many(contentBlocks),
	visitors: many(visitors),
	voicejarSessions: many(voicejarSessions),
	utmTouchpoints: many(utmTouchpoints),
	vouchers: many(vouchers),
	ademingStats: many(ademingStats),
	chatPushSubscriptions: many(chatPushSubscriptions),
	orders: many(orders),
	approvalQueues: many(approvalQueue),
	vaultFiles: many(vaultFiles),
	contentBlockVersions: many(contentBlockVersions),
	actors: many(actors),
	instructors: many(instructors),
}));

export const aiClonesRelations = relations(aiClones, ({one}) => ({
	actor: one(actors, {
		fields: [aiClones.actorId],
		references: [actors.id]
	}),
}));

export const aiLogsRelations = relations(aiLogs, ({one}) => ({
	user: one(users, {
		fields: [aiLogs.user_id],
		references: [users.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	user: one(users, {
		fields: [appointments.user_id],
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
	instructor: one(instructors, {
		fields: [chatConversations.instructorId],
		references: [instructors.id]
	}),
	user: one(users, {
		fields: [chatConversations.user_id],
		references: [users.id]
	}),
	workshopEdition: one(workshopEditions, {
		fields: [chatConversations.workshopEditionId],
		references: [workshopEditions.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one, many}) => ({
	aiRecommendations: many(aiRecommendations),
	chatConversation: one(chatConversations, {
		fields: [chatMessages.conversationId],
		references: [chatConversations.id]
	}),
}));

export const instructorsRelations = relations(instructors, ({one, many}) => ({
	chatConversations: many(chatConversations),
	workshops: many(workshops),
	media: one(media, {
		fields: [instructors.photo_id],
		references: [media.id]
	}),
	user: one(users, {
		fields: [instructors.user_id],
		references: [users.id]
	}),
}));

export const workshopEditionsRelations = relations(workshopEditions, ({many}) => ({
	chatConversations: many(chatConversations),
	orderItems: many(orderItems),
}));

export const courseProgressRelations = relations(courseProgress, ({one}) => ({
	course: one(courses, {
		fields: [courseProgress.courseId],
		references: [courses.id]
	}),
	lesson: one(lessons, {
		fields: [courseProgress.lessonId],
		references: [lessons.id]
	}),
	user: one(users, {
		fields: [courseProgress.user_id],
		references: [users.id]
	}),
}));

export const coursesRelations = relations(courses, ({many}) => ({
	courseProgresses: many(courseProgress),
	lessons: many(lessons),
}));

export const courseSubmissionsRelations = relations(courseSubmissions, ({one}) => ({
	lesson: one(lessons, {
		fields: [courseSubmissions.lessonId],
		references: [lessons.id]
	}),
	user: one(users, {
		fields: [courseSubmissions.user_id],
		references: [users.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	actor: one(actors, {
		fields: [favorites.actorId],
		references: [actors.id]
	}),
	user: one(users, {
		fields: [favorites.user_id],
		references: [users.id]
	}),
}));

export const contentArticlesRelations = relations(contentArticles, ({one, many}) => ({
	user_lockedBy: one(users, {
		fields: [contentArticles.lockedBy],
		references: [users.id],
		relationName: "contentArticles_lockedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [contentArticles.user_id],
		references: [users.id],
		relationName: "contentArticles_userId_users_id"
	}),
	contentBlocks: many(contentBlocks),
}));

export const contentBlocksRelations = relations(contentBlocks, ({one, many}) => ({
	contentArticle: one(contentArticles, {
		fields: [contentBlocks.articleId],
		references: [contentArticles.id]
	}),
	user: one(users, {
		fields: [contentBlocks.lockedBy],
		references: [users.id]
	}),
	contentBlockVersions: many(contentBlockVersions),
}));

export const visitorsRelations = relations(visitors, ({one}) => ({
	user: one(users, {
		fields: [visitors.user_id],
		references: [users.id]
	}),
}));

export const voicejarSessionsRelations = relations(voicejarSessions, ({one}) => ({
	user: one(users, {
		fields: [voicejarSessions.user_id],
		references: [users.id]
	}),
}));

export const utmTouchpointsRelations = relations(utmTouchpoints, ({one}) => ({
	order: one(orders, {
		fields: [utmTouchpoints.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [utmTouchpoints.user_id],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	utmTouchpoints: many(utmTouchpoints),
	orderNotes: many(orderNotes),
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.user_id],
		references: [users.id]
	}),
	vaultFiles: many(vaultFiles),
	refunds: many(refunds),
}));

export const vouchersRelations = relations(vouchers, ({one}) => ({
	voucherBatch: one(voucherBatches, {
		fields: [vouchers.batchId],
		references: [voucherBatches.id]
	}),
	user: one(users, {
		fields: [vouchers.user_id],
		references: [users.id]
	}),
}));

export const voucherBatchesRelations = relations(voucherBatches, ({many}) => ({
	vouchers: many(vouchers),
}));

export const ademingStatsRelations = relations(ademingStats, ({one}) => ({
	user: one(users, {
		fields: [ademingStats.user_id],
		references: [users.id]
	}),
}));

export const chatPushSubscriptionsRelations = relations(chatPushSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [chatPushSubscriptions.user_id],
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

export const workshopsRelations = relations(workshops, ({one}) => ({
	instructor: one(instructors, {
		fields: [workshops.instructorId],
		references: [instructors.id]
	}),
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
	workshopEdition: one(workshopEditions, {
		fields: [orderItems.editionId],
		references: [workshopEditions.id]
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
}));

export const approvalQueueRelations = relations(approvalQueue, ({one}) => ({
	user: one(users, {
		fields: [approvalQueue.approvedBy],
		references: [users.id]
	}),
}));

export const actorDialectsRelations = relations(actorDialects, ({one}) => ({
	actor: one(actors, {
		fields: [actorDialects.actorId],
		references: [actors.id]
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

export const contentBlockVersionsRelations = relations(contentBlockVersions, ({one}) => ({
	contentBlock: one(contentBlocks, {
		fields: [contentBlockVersions.blockId],
		references: [contentBlocks.id]
	}),
	user: one(users, {
		fields: [contentBlockVersions.createdBy],
		references: [users.id]
	}),
}));

export const ademingTracksRelations = relations(ademingTracks, ({one}) => ({
	media: one(media, {
		fields: [ademingTracks.mediaId],
		references: [media.id]
	}),
}));

export const refundsRelations = relations(refunds, ({one}) => ({
	order: one(orders, {
		fields: [refunds.orderId],
		references: [orders.id]
	}),
}));

export const workshopInterestProductsRelations = relations(workshopInterestProducts, ({one}) => ({
	workshopInterest: one(workshopInterest, {
		fields: [workshopInterestProducts.interestId],
		references: [workshopInterest.id]
	}),
}));

export const workshopInterestRelations = relations(workshopInterest, ({many}) => ({
	workshopInterestProducts: many(workshopInterestProducts),
}));