import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR ACTOR_LANGUAGES AUDIT\n');

  try {
    const actorLangs = await db.execute(sql`SELECT count(*) FROM actor_languages`);
    console.log(`🗣️ Total rows in actor_languages: ${actorLangs[0].count}`);

    const nativeLangs = await db.execute(sql`SELECT count(*) FROM actor_languages WHERE is_native = true`);
    console.log(`🎙️ Native languages mapped: ${nativeLangs[0].count}`);

    const actorsWithNativeId = await db.execute(sql`SELECT count(*) FROM actors WHERE native_language_id IS NOT NULL`);
    console.log(`🎙️ Actors with native_language_id set: ${actorsWithNativeId[0].count}`);

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
