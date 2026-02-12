import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * 💎 FAME REGISTRY
 * 
 * Beheert de lijst van topmerken (Fame) en hun specifieke gevoeligheden.
 */

export const fameRegistry = pgTable('fame_registry', {
  id: serial('id').primaryKey(),
  brandName: text('brand_name').unique().notNull(),
  domain: text('domain'), // bijv. 'cocacola.be'
  sensitivityNote: text('sensitivity_note'), // bijv. 'Extreem gevoelig voor merkkleuren en toon'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
