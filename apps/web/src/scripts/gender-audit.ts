import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR GENDER TABLE AUDIT\n');

  try {
    const genders = await db.execute(sql`SELECT * FROM genders`);
    console.log('🚻 Rows in genders table:');
    genders.forEach(g => console.log(`   - [${g.id}] ${g.code}: ${g.label}`));

    const actorsWithGenderId = await db.execute(sql`SELECT gender_id, count(*) FROM actors GROUP BY gender_id`);
    console.log('\n🎙️ Current gender_id distribution in actors:');
    actorsWithGenderId.forEach(g => console.log(`   - ${g.gender_id || 'NULL'}: ${g.count}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
