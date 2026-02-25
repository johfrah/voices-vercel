
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditLanguages() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: SUPABASE LANGUAGE AUDIT ---');
  
  try {
    // 1. Fetch all languages
    const { data: allLangs, error: langError } = await supabase
      .from('languages')
      .select('*')
      .order('id');

    if (langError) throw langError;

    console.log('\n[Languages Table Content]:');
    console.table(allLangs.map(l => ({ id: l.id, code: l.code, label: l.label })));

    // 2. Sample actors and their native language links
    const { data: actorSamples, error: actorError } = await supabase
      .from('actors')
      .select('id, first_name, native_language_id')
      .limit(15);

    if (actorError) throw actorError;

    console.log('\n[Actor Language Links Sample]:');
    const enrichedSamples = actorSamples.map(a => {
      const lang = allLangs.find(l => l.id === a.native_language_id);
      return {
        actor_id: a.id,
        actor_name: a.first_name,
        lang_id: a.native_language_id,
        lang_code: lang?.code || 'MISSING/NULL',
        lang_label: lang?.label || 'MISSING/NULL'
      };
    });
    console.table(enrichedSamples);

    // 3. Check for invalid links
    const { data: invalidData, error: invalidError } = await supabase
      .from('actors')
      .select('id')
      .not('native_language_id', 'is', null);

    if (invalidError) throw invalidError;

    const invalidCount = invalidData.filter(a => !allLangs.find(l => l.id === (a as any).native_language_id)).length;
    console.log('\n[Integrity Check]:');
    console.log(`Actors with non-null native_language_id: ${invalidData.length}`);
    console.log(`Actors with invalid native_language_id (not in languages table): ${invalidCount}`);

  } catch (err) {
    console.error('Audit failed:', err);
  }
}

auditLanguages();
