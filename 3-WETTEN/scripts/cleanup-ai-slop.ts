/**
 * 🧹 CLEANUP: AI-SLOP REMOVAL (2026)
 * 
 * Doel: Verwijdert automatisch gegenereerde vertalingen voor nl-be 
 * die afwijken van de nuchtere 'Default is Truth' filosofie.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Laad env vanuit de web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Run from root with access to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('🚀 Start uitzuiveren van nl-be AI-slop...');

  // 1. Identificeer de verdachte patronen
  const slopPatterns = [
    'In het Vlaams.',
    'Ontdek onze stemtalenten',
    'Kies de stem die bij je past.',
    'Ontdek onze stemmen'
  ];

  for (const pattern of slopPatterns) {
    const { data, error } = await supabase
      .from('translations')
      .delete()
      .eq('lang', 'nl-be')
      .eq('translated_text', pattern);

    if (error) {
      console.error(`❌ Fout bij verwijderen van "${pattern}":`, error.message);
    } else {
      console.log(`✅ Verwijderd (indien aanwezig): "${pattern}"`);
    }
  }

  // 2. Navigatie opschonen (JSONB in nav_menus)
  console.log('🔍 Navigatie controleren op slop...');
  const { data: menus, error: navError } = await supabase
    .from('nav_menus')
    .select('*');

  if (navError) {
    console.error('❌ Fout bij ophalen nav_menus:', navError.message);
  } else {
    for (const menu of (menus || [])) {
      let changed = false;
      const items = menu.items;

      if (items && items.links) {
        items.links = items.links.map((link: any) => {
          if (link.name === 'Ontdek onze stemtalenten') {
            console.log(`🧹 Navigatie hersteld: ${menu.key} -> "Onze Stemmen"`);
            changed = true;
            return { ...link, name: 'Onze Stemmen' };
          }
          return link;
        });
      }

      if (changed) {
        const { error: updateError } = await supabase
          .from('nav_menus')
          .update({ items: items, is_manually_edited: true })
          .eq('id', menu.id);
        
        if (updateError) {
          console.error(`❌ Fout bij updaten menu ${menu.key}:`, updateError.message);
        }
      }
    }
  }

  console.log('✨ Uitzuivering voltooid. nl-be is weer puur.');
}

cleanup();
