import { db } from './1-SITE/apps/web/src/lib/db';
import { sql } from 'drizzle-orm';

async function fixConstraint() {
  try {
    console.log('🛠️ Adding unique constraint to translations table...');
    await db.execute(sql`
      ALTER TABLE "translations" 
      ADD CONSTRAINT "translations_key_lang_unique" 
      UNIQUE ("translation_key", "lang");
    `);
    console.log('✅ Constraint added successfully!');
  } catch (e) {
    console.error('❌ Failed to add constraint (it might already exist):', e);
  }
}

fixConstraint();
