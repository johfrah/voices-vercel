import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR SCHEMA AUDIT\n');

  try {
    const schemas = await db.execute(sql`SELECT schema_name FROM information_schema.schemata`);
    console.log('📋 Available schemas:');
    schemas.forEach(s => console.log(`   - ${s.schema_name}`));

    const allTables = await db.execute(sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'genders'`);
    console.log('\n🚻 Locations of "genders" table:');
    allTables.forEach(t => console.log(`   - ${t.table_schema}.${t.table_name}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
