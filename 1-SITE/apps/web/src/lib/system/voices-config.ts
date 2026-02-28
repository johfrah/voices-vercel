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

// 🛡️ CHRIS-PROTOCOL: Schema Exports (Internalized for Vercel)
// We only export schema on the server to prevent bundling large schema objects in the browser,
// which can lead to minification collisions (e.g. 'tl' ReferenceError).
export const schema = typeof window === 'undefined' 
  ? require('../core-internal/database/schema/index.ts')
  : {};

// 🛡️ NUCLEAR BUNDLE PROTECTION: Only export critical tables
// This prevents the minifier from creating 'tl' collisions by overwhelming the bundle.
const fullSchema = typeof window === 'undefined' 
  ? require('../core-internal/database/schema/index.ts')
  : {};

export const { 
  actors, 
  workshops, 
  workshopEditions, 
  locations, 
  instructors, 
  orders, 
  orderItems, 
  users, 
  contentArticles,
  castingLists,
  faq,
  workshopMedia,
  media,
  appConfigs,
  systemEvents,
  languages,
  // 🛡️ CHRIS-PROTOCOL: Full Schema Exports (v2.16.078)
  // We exclude 'translations' to prevent the fatale 'tl' ReferenceError collision in the browser.
  worlds,
  journeys,
  orderStatuses,
  actorStatuses,
  paymentMethods,
  countries,
  genders,
  experienceLevels,
  voiceTones,
  actorLanguages,
  actorTones,
  favorites,
  utmTouchpoints,
  dialects,
  proficiencies,
  actorDialects,
  demoTypes,
  actorDemos,
  actorVideos,
  workshopInterest,
  workshopInterestProducts,
  courses,
  lessons,
  courseProgress,
  courseSubmissions,
  academyTips,
  ordersLegacyBloat,
  ordersV2,
  coupons,
  refunds,
  deliveryStatuses,
  orderNotes,
  appointments,
  ademingMakers,
  ademingTracks,
  ademingSeries,
  ademingBackgroundMusic,
  ademingReflections,
  ademingStats,
  partnerWidgets,
  quizSteps,
  translationRegistry,
  voucherBatches,
  vouchers,
  systemKnowledge,
  approvalQueue,
  aiLogs,
  aiClones,
  yukiOutstanding,
  voiceAffinity,
  centralLeads,
  voicejarSessions,
  voicejarEvents,
  chatConversations,
  chatMessages,
  chatPushSubscriptions,
  aiRecommendations,
  pageLayouts,
  contentBlocks,
  contentBlockVersions,
  visitors,
  visitorLogs,
  reviews,
  workshopGallery,
  freePreviews,
  costs,
  recordingSessions,
  recordingScripts,
  recordingFeedback,
  rateCards,
  pronunciationDictionary,
  navMenus,
  marketConfigs,
  siteSettings,
  fameRegistry,
  mailContent,
  vaultFiles,
  agentPrompts,
  agentPromptVersions,
  notifications,
  products,
  castingListItems,
  actorReviews
} = fullSchema;

/**
 * 🚀 DYNAMIC TABLE LOADER
 * Use this for non-critical tables to keep the client bundle small.
 */
export function getTable(tableName: string) {
  if (typeof window !== 'undefined') return null;
  return fullSchema[tableName];
}

// 🛡️ CHRIS-PROTOCOL: Conditional DB Export
// We only export 'db' on the server to prevent bundling 'postgres' in the browser.
export const db = typeof window === 'undefined' 
  ? require('../core-internal/database/index.ts').db 
  : null;

export default VOICES_CONFIG;
