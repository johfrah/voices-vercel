import { pgTable, serial, text, timestamp, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';

/**
 * ⚙️ CONFIGURATION SCHEMA (2026)
 * 
 * Bevat alle dynamische instellingen die voorheen hardcoded waren.
 * Dit is de sleutel tot de Cursorloze wereld.
 */

// 💰 RATE CARDS (Dynamic Pricing Rules)
export const rateCards = pgTable('rate_cards', {
  id: serial('id').primaryKey(),
  market: text('market').notNull(), // BE, NL, FR, GLOBAL
  category: text('category').notNull(), // unpaid, paid, telefonie, subscription
  rules: jsonb('rules').notNull(), // { word_threshold: 200, surcharge: 0.20, etc. }
  isManuallyEdited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 📚 PRONUNCIATION DICTIONARY (Studio Plan)
export const pronunciationDictionary = pgTable('pronunciation_dictionary', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  word: text('word').notNull(),
  phonetic: text('phonetic').notNull(),
  language: text('language').default('nl-BE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🗺️ NAVIGATION & MENUS
export const navMenus = pgTable('nav_menus', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(), // main_nav, footer_nav, admin_nav
  items: jsonb('items').notNull(), // Array: [{ label: 'Stemmen', href: '/agency', order: 1 }]
  market: text('market').default('ALL'),
  isManuallyEdited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 🏢 MARKET CONFIG (Contact, VAT, Legal, Social)
export const marketConfigs = pgTable('market_configs', {
  id: serial('id').primaryKey(),
  market: text('market').unique().notNull(), // BE, NL, FR, DE
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  vatNumber: text('vat_number'),
  cocNumber: text('coc_number'), // KVK nummer voor NL
  address: jsonb('address'), // { street: '', city: '', zip: '' }
  socialLinks: jsonb('social_links'), // { instagram: '', linkedin: '', facebook: '', twitter: '' }
  legal: jsonb('legal'), // { terms_url: '', privacy_url: '', disclaimer: '' }
  localization: jsonb('localization'), // { default_lang: 'nl', currency: 'EUR', locale: 'nl-BE' }
  isManuallyEdited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 📝 SITE SETTINGS (SEO, Global Text, Branding)
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(), // site_title, site_description, copyright, logo_url
  value: text('value').notNull(),
  context: text('context'), // SEO, Footer, Branding, etc.
  isManuallyEdited: boolean('is_manually_edited').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});
