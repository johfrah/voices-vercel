
import { db } from '../../1-SITE/apps/web/src/lib/system/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const workshopIds = [260250, 260261, 260263, 260265, 260266, 260271, 260272, 260273, 260274, 263913, 267780, 267781, 272702, 272907, 274488];

async function consolidate() {
  console.log('🚀 Starting Atomic Consolidation...');

  // 1. Load legacy data
  const legacyLines = fs.readFileSync('4-KELDER/legacy_extraction.txt', 'utf-8').split('\n');
  const legacyData: Record<number, any> = {};

  legacyLines.forEach(line => {
    const match = line.match(/^\((\d+), (\d+), '([^']+)', '(.+)'\),?$/);
    if (match) {
      const postId = parseInt(match[2]);
      const key = match[3];
      let value = match[4];
      
      // Basic unescape for SQL strings
      value = value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\'/g, "'");

      if (!legacyData[postId]) legacyData[postId] = {};
      legacyData[postId][key] = value;
    }
  });

  // 2. Load current Supabase data
  const currentSupabase = JSON.parse(fs.readFileSync('4-KELDER/supabase_current_state.json', 'utf-8'));

  // 3. Prepare updates
  const updates = currentSupabase.map((w: any) => {
    const legacy = legacyData[w.id] || {};
    const newMeta = { ...(w.meta || {}) };

    // Mapping logic
    if (legacy.ineenzin) newMeta.tagline = legacy.ineenzin;
    if (legacy.workshopinhoud) newMeta.workshop_content_detail = legacy.workshopinhoud;
    if (legacy.aftermovie_beschrijving) newMeta.aftermovie_description = legacy.aftermovie_beschrijving;
    if (legacy.dagindeling) newMeta.day_schedule = legacy.dagindeling;

    // Media mapping with 404 fix (Supabase Storage pattern)
    const storageBase = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/assets/common/branding/';
    
    if (legacy.videoask) {
      const fileName = legacy.videoask.split('/').pop();
      newMeta.videoask_url = `${storageBase}johfrah/portfolio/${fileName}`;
    }
    if (legacy.aftermovie_videoask) {
      const fileName = legacy.aftermovie_videoask.split('/').pop();
      newMeta.aftermovie_url = `${storageBase}johfrah/portfolio/${fileName}`;
    }

    return { id: w.id, meta: newMeta };
  });

  // 4. Atomic Transaction
  console.log('📝 Executing atomic transaction for 15 workshops...');
  
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx.execute(sql`
        UPDATE workshops 
        SET meta = ${JSON.stringify(update.meta)}::jsonb 
        WHERE id = ${update.id}
      `);
    }
  });

  console.log('✅ Atomic Consolidation Completed Successfully!');
  process.exit(0);
}

consolidate().catch(err => {
  console.error('❌ Consolidation Failed:', err);
  process.exit(1);
});
