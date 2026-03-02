import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR TABLE AUDIT\n');

  try {
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    console.log('📋 Tables in public schema:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
