import { db } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function checkOrdersV2Table() {
  console.log('🔍 Checking orders_v2 table...\n');

  try {
    // Check if table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders_v2'
      );
    `);
    
    console.log('Table exists check:', tableCheck);

    // Try to count rows
    try {
      const countResult = await db.execute(sql`SELECT count(*) as value FROM orders_v2`);
      console.log('\n✅ Count query successful:', countResult);
    } catch (countError: any) {
      console.error('\n❌ Count query failed:', countError.message);
      console.error('Full error:', countError);
    }

    // Check table structure
    try {
      const structure = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'orders_v2'
        ORDER BY ordinal_position;
      `);
      console.log('\n📋 Table structure:', structure);
    } catch (structError: any) {
      console.error('\n❌ Structure query failed:', structError.message);
    }

  } catch (error: any) {
    console.error('❌ Database check failed:', error.message);
    console.error('Full error:', error);
  }

  process.exit(0);
}

checkOrdersV2Table();
