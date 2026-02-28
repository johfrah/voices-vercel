
import { db } from '../../1-SITE/apps/web/src/lib/system/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function fetchSupabaseData() {
  const workshopIds = [260250, 260261, 260263, 260265, 260266, 260271, 260272, 260273, 260274, 263913, 267780, 267781, 272702, 272907, 274488];
  
  console.log('Fetching current Supabase data for workshops...');
  
  const workshops = await db.execute(sql`
    SELECT id, title, slug, status, meta 
    FROM workshops 
    WHERE id IN (${sql.join(workshopIds, sql`, `)})
  `);

  fs.writeFileSync('4-KELDER/supabase_current_state.json', JSON.stringify(workshops, null, 2));
  console.log('Current Supabase state saved to 4-KELDER/supabase_current_state.json');
  process.exit(0);
}

fetchSupabaseData().catch(err => {
  console.error(err);
  process.exit(1);
});
