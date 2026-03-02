import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR DEMO ID AUDIT\n');

  try {
    const demosWithMediaId = await db.execute(sql`SELECT media_type_id, count(*) FROM actor_demos GROUP BY media_type_id`);
    console.log('🎵 Current media_type_id distribution in actor_demos:');
    demosWithMediaId.forEach(d => console.log(`   - ${d.media_type_id || 'NULL'}: ${d.count}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
