import { boolean, pgTable, serial, text, timestamp, integer, bigint, uniqueIndex, index, jsonb, customType } from 'drizzle-orm/pg-core';

/**
 * 🔢 VECTOR TYPE FOR PGVECTOR
 */
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});

/**
 * MAIL INTELLIGENCE - MAIL CONTENT SCHEMA
 * 
 * Beheert de opslag van volledige e-mailinhoud (versleuteld).
 */

export const mailContent = pgTable('mail_content', {
  id: serial('id').primaryKey(),
  accountId: text('account_id').notNull(),
  uid: bigint('uid', { mode: 'number' }).notNull(),
  
  // 📧 HEADER DATA (Nu in DB voor 0ms latency)
  sender: text('sender'),
  recipient: text('recipient'),
  subject: text('subject'),
  date: timestamp('date'),
  
  // 📝 BODY DATA
  htmlBody: text('html_body'), // Versleuteld
  textBody: text('text_body'), // Versleuteld
  
  // 🔗 THREADING
  threadId: text('thread_id'),
  messageId: text('message_id'),
  inReplyTo: text('in_reply_to'),
  referencesHeader: text('references_header'),
  
  // 🧠 INTELLIGENCE
  iapContext: jsonb('iap_context').default({}), // Persona, Intent, Journey
  embedding: vector('embedding'), // Semantische vector voor AI search
  
  // 🛡️ SECURITY
  isEncrypted: boolean('is_encrypted').default(true),
  isSuperPrivate: boolean('is_super_private').default(true), // 🔒 SUPER PRIVATE MANDATE
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    uidAccountIdx: uniqueIndex('uid_account_idx').on(table.uid, table.accountId),
    messageIdIdx: uniqueIndex('message_id_idx').on(table.messageId),
    accountIdIdx: index('account_id_idx').on(table.accountId), // 🚀 Snel deleten per account
  }
});
