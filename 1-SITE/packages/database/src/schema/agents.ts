import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './index';

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
