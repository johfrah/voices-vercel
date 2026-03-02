/**
 * ⚡ VOICES CONFIGURATION (2026)
 * Central source of truth for API endpoints and Asset paths.
 * 
 * ☢️ STATUS: SHARED - Safe for Browser and Server.
 * 
 * 🛡️ CHRIS-PROTOCOL: Nuclear Internal Bridge (v2.14.503)
 * This file exports both configuration and schema, ensuring Vercel
 * can resolve all database entities within the app source tree.
 */

import { VOICES_CONFIG as REAL_CONFIG } from '../core-internal/config.ts';
export const VOICES_CONFIG = REAL_CONFIG;

// 🛡️ CHRIS-PROTOCOL: Internalized Schema for Vercel
// We only export the actual schema objects on the server.
// On the client, we export null to prevent the minifier from creating 'tl'/'tr' collisions
// and to keep the bundle size at zero for database logic.
const fullSchema = typeof window === 'undefined' 
  ? require('../core-internal/database/schema/index.ts')
  : null;

// 🛡️ NUCLEAR BUNDLE PROTECTION (v2.16.081)
// Explicit exports for critical tables to ensure tree-shaking and prevent ReferenceErrors.
// On the client, these are all null to prevent minifier collisions and bundle bloat.
export const actors = fullSchema?.actors || null;
export const workshops = fullSchema?.workshops || null;
export const workshopEditions = fullSchema?.workshopEditions || null;
export const locations = fullSchema?.locations || null;
export const instructors = fullSchema?.instructors || null;
export const orders = fullSchema?.orders || null;
export const orderItems = fullSchema?.orderItems || null;
export const users = fullSchema?.users || null;
export const contentArticles = fullSchema?.contentArticles || null;
export const castingLists = fullSchema?.castingLists || null;
export const faq = fullSchema?.faq || null;
export const workshopMedia = fullSchema?.workshopMedia || null;
export const media = fullSchema?.media || null;
export const appConfigs = fullSchema?.appConfigs || null;
export const systemEvents = fullSchema?.systemEvents || null;
export const languages = fullSchema?.languages || null;
export const worlds = fullSchema?.worlds || null;
export const journeys = fullSchema?.journeys || null;
export const orderStatuses = fullSchema?.orderStatuses || null;
export const actorStatuses = fullSchema?.actorStatuses || null;
export const paymentMethods = fullSchema?.paymentMethods || null;
export const countries = fullSchema?.countries || null;
export const genders = fullSchema?.genders || null;
export const experienceLevels = fullSchema?.experienceLevels || null;
export const voiceTones = fullSchema?.voiceTones || null;
export const actorLanguages = fullSchema?.actorLanguages || null;
export const actorTones = fullSchema?.actorTones || null;
export const favorites = fullSchema?.favorites || null;
export const utmTouchpoints = fullSchema?.utmTouchpoints || null;
export const dialects = fullSchema?.dialects || null;
export const proficiencies = fullSchema?.proficiencies || null;
export const actorDialects = fullSchema?.actorDialects || null;
export const demoTypes = fullSchema?.demoTypes || null;
export const actorDemos = fullSchema?.actorDemos || null;
export const actorVideos = fullSchema?.actorVideos || null;
export const workshopInterest = fullSchema?.workshopInterest || null;
export const workshopInterestProducts = fullSchema?.workshopInterestProducts || null;
export const courses = fullSchema?.courses || null;
export const lessons = fullSchema?.lessons || null;
export const courseProgress = fullSchema?.courseProgress || null;
export const courseSubmissions = fullSchema?.courseSubmissions || null;
export const academyTips = fullSchema?.academyTips || null;
export const ordersLegacyBloat = fullSchema?.ordersLegacyBloat || null;
export const ordersV2 = fullSchema?.ordersV2 || null;
export const coupons = fullSchema?.coupons || null;
export const refunds = fullSchema?.refunds || null;
export const deliveryStatuses = fullSchema?.deliveryStatuses || null;
export const orderNotes = fullSchema?.orderNotes || null;
export const appointments = fullSchema?.appointments || null;
export const ademingMakers = fullSchema?.ademingMakers || null;
export const ademingTracks = fullSchema?.ademingTracks || null;
export const ademingSeries = fullSchema?.ademingSeries || null;
export const ademingBackgroundMusic = fullSchema?.ademingBackgroundMusic || null;
export const ademingReflections = fullSchema?.ademingReflections || null;
export const ademingStats = fullSchema?.ademingStats || null;
export const partnerWidgets = fullSchema?.partnerWidgets || null;
export const quizSteps = fullSchema?.quizSteps || null;
export const translationRegistry = fullSchema?.translationRegistry || null;
export const voucherBatches = fullSchema?.voucherBatches || null;
export const vouchers = fullSchema?.vouchers || null;
export const systemKnowledge = fullSchema?.systemKnowledge || null;
export const approvalQueue = fullSchema?.approvalQueue || null;
export const aiLogs = fullSchema?.aiLogs || null;
export const aiClones = fullSchema?.aiClones || null;
export const yukiOutstanding = fullSchema?.yukiOutstanding || null;
export const voiceAffinity = fullSchema?.voiceAffinity || null;
export const centralLeads = fullSchema?.centralLeads || null;
export const voicejarSessions = fullSchema?.voicejarSessions || null;
export const voicejarEvents = fullSchema?.voicejarEvents || null;
export const chatConversations = fullSchema?.chatConversations || null;
export const chatMessages = fullSchema?.chatMessages || null;
export const chatPushSubscriptions = fullSchema?.chatPushSubscriptions || null;
export const aiRecommendations = fullSchema?.aiRecommendations || null;
export const pageLayouts = fullSchema?.pageLayouts || null;
export const contentBlocks = fullSchema?.contentBlocks || null;
export const contentBlockVersions = fullSchema?.contentBlockVersions || null;
export const visitors = fullSchema?.visitors || null;
export const visitorLogs = fullSchema?.visitorLogs || null;
export const reviews = fullSchema?.reviews || null;
export const workshopGallery = fullSchema?.workshopGallery || null;
export const freePreviews = fullSchema?.freePreviews || null;
export const costs = fullSchema?.costs || null;
export const recordingSessions = fullSchema?.recordingSessions || null;
export const recordingScripts = fullSchema?.recordingScripts || null;
export const recordingFeedback = fullSchema?.recordingFeedback || null;
export const rateCards = fullSchema?.rateCards || null;
export const pronunciationDictionary = fullSchema?.pronunciationDictionary || null;
export const navMenus = fullSchema?.navMenus || null;
export const marketConfigs = fullSchema?.marketConfigs || null;
export const siteSettings = fullSchema?.siteSettings || null;
export const fameRegistry = fullSchema?.fameRegistry || null;
export const mailContent = fullSchema?.mailContent || null;
export const vaultFiles = fullSchema?.vaultFiles || null;
export const agentPrompts = fullSchema?.agentPrompts || null;
export const agentPromptVersions = fullSchema?.agentPromptVersions || null;
export const notifications = fullSchema?.notifications || null;
export const products = fullSchema?.products || null;
export const castingListItems = fullSchema?.castingListItems || null;
export const actorReviews = fullSchema?.actorReviews || null;
export const translationsTable = fullSchema?.translations || null;

/**
 * 🚀 DYNAMIC TABLE LOADER
 */
export function getTable(tableName: string) {
  if (typeof window !== 'undefined') return null;
  return fullSchema ? (fullSchema as any)[tableName] : null;
}

// 🛡️ CHRIS-PROTOCOL: Conditional DB Export
// We only export 'db' on the server to prevent bundling 'postgres' in the browser.
export const db = typeof window === 'undefined' 
  ? require('../core-internal/database/index.ts').db 
  : null;

export default VOICES_CONFIG;
