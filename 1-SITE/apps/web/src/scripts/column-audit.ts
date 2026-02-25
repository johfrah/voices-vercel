import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR COLUMN AUDIT\n');

  try {
    const columns = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'actors' AND table_schema = 'public'`);
    console.log('🎙️ Columns in actors table:');
    columns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

    const genderCount = await db.execute(sql`SELECT gender, count(*) FROM actors GROUP BY gender`);
    console.log('\n🚻 Current gender distribution (string):');
    genderCount.forEach(g => console.log(`   - ${g.gender || 'NULL'}: ${g.count}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
