import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAtomicList() {
  console.log('🔍 Generating Atomic URL List (Live Actors Focus)...');

  const { data: actors, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, slug, native_lang')
    .eq('status', 'live')
    .eq('is_public', true)
    .order('voice_score', { ascending: false });

  if (error) {
    console.error('Error fetching actors:', error);
    return;
  }

  let markdown = `# 🎙️ Atomic URL List: Live Actors (Handshake Truth)\n\n`;
  markdown += `Dit document toont de onwrikbare koppeling tussen URL en Database ID voor alle live acteurs.\n\n`;
  markdown += `| URL (Slug) | Type | Database ID | Naam | Taal |\n`;
  markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

  actors.forEach(actor => {
    const slug = actor.slug || actor.first_name.toLowerCase();
    markdown += `| \`/voice/${slug}/\` | actor | \`${actor.id}\` | ${actor.first_name} ${actor.last_name || ''} | ${actor.native_lang} |\n`;
    markdown += `| \`/portfolio/${slug}/\` | portfolio | \`${actor.id}\` | ${actor.first_name} ${actor.last_name || ''} | ${actor.native_lang} |\n`;
  });

  const outputPath = path.join(process.cwd(), '3-WETTEN/docs/ATOMIC_URL_LIST_LIVE.md');
  fs.writeFileSync(outputPath, markdown);
  console.log(`✅ List generated at: ${outputPath}`);
}

generateAtomicList();
