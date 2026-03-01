/**
 * 🚀 NUCLEAR DB SCHEMA REPAIR (v2.16.095)
 * 
 * Verifies and adds missing world_id columns to workshops and slug_registry.
 * This ensures the database matches the Drizzle schema.
 */

import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function repairWorldIdColumns() {
  console.log('🛡️ Starting Nuclear DB Schema Repair...');

  try {
    // 1. Check workshops
    console.log('📦 Checking workshops table columns...');
    const workshopsCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'workshops';`);
    const hasWorldIdWorkshop = (workshopsCols.rows || workshopsCols).some((c: any) => c.column_name === 'world_id');
    
    if (!hasWorldIdWorkshop) {
      console.log('⚠️ world_id missing in workshops. Adding...');
      await db.execute(sql`ALTER TABLE workshops ADD COLUMN world_id integer;`);
      console.log('✅ Added world_id to workshops');
    } else {
      console.log('✅ world_id already exists in workshops.');
    }

    // 2. Check slug_registry
    console.log('🛤️ Checking slug_registry table columns...');
    const slugCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'slug_registry';`);
    const hasWorldIdSlug = (slugCols.rows || slugCols).some((c: any) => c.column_name === 'world_id');
    
    if (!hasWorldIdSlug) {
      console.log('⚠️ world_id missing in slug_registry. Adding...');
      await db.execute(sql`ALTER TABLE slug_registry ADD COLUMN world_id integer;`);
      console.log('✅ Added world_id to slug_registry');
    } else {
      console.log('✅ world_id already exists in slug_registry.');
    }

    console.log('🏁 Nuclear DB Schema Repair Complete.');
  } catch (err) {
    console.error('💥 Fatal Error during schema repair:', err);
    process.exit(1);
  }
}

repairWorldIdColumns().catch(err => {
  console.error('💥 Uncaught Error:', err);
  process.exit(1);
});
