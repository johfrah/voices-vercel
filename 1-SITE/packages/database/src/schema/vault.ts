import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { actors, users, orders, media } from './index';

/**
 * 🔒 THE VAULT - MASTER SCHEMA (2026)
 * 
 * Doel: Beveiligde, multi-dimensionale opslag voor alle privé-documenten en inbound assets.
 * Relationeel verbonden met Stemmen, Klanten en Projecten.
 */

export const vaultFiles = pgTable('vault_files', {
  id: serial('id').primaryKey(),
  
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

// 🔗 RELATIONS
export const vaultFilesRelations = relations(vaultFiles, ({ one }) => ({
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
