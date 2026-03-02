import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR DEMO AUDIT\n');

  try {
    const demoTypes = await db.execute(sql`SELECT type, count(*) FROM actor_demos GROUP BY type`);
    console.log('🎵 Current demo types (string):');
    demoTypes.forEach(dt => console.log(`   - ${dt.type || 'NULL'}: ${dt.count}`));

    const mediaTypes = await db.execute(sql`SELECT * FROM media_types`);
    console.log('\n📺 Available media_types:');
    mediaTypes.forEach(mt => console.log(`   - [${mt.id}] ${mt.code}: ${mt.label}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
