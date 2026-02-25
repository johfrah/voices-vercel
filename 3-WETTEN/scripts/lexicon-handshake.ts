import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 MARK: Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 🎭 VOICES LEXICON SYNC
 * 
 * Doel: Synchroniseer de nieuwe "Founder-taal" direct naar de Voiceglot database.
 * Dit herstelt de 'handshake' tussen code en data.
 */

const LEXICON_UPDATES = [
  // Spotlight & Navigatie
  { key: 'admin.users.title', nl: 'Klantprofielen' },
  { key: 'admin.menu.user_dna', nl: 'Klantprofielen' },
  { key: 'admin.menu.media_engine', nl: 'Audiopost Studio' },
  { key: 'admin.menu.control_center', nl: 'Beheer' },
  { key: 'admin.menu.command_center', nl: 'Dashboard' },
  { key: 'admin.menu.visitor_intel', nl: 'Bezoekers' },
  { key: 'admin.menu.analytics_hub', nl: 'Statistieken' },
  { key: 'admin.menu.openai_intelligence', nl: 'AI Instellingen' },
  
  // Bestellingen / Regie
  { key: 'admin.orders.badge', nl: 'Bestellingen' },
  { key: 'admin.orders.title', nl: 'Bestellingen' },
  { key: 'admin.orders.back_to_list', nl: 'Terug naar overzicht' },
  
  // Academy
  { key: 'admin.academy.badge', nl: 'Academy' },
  { key: 'admin.academy.title', nl: 'Academy Overzicht' },
  
  // AI / Assistenten
  { key: 'admin.agents.badge', nl: 'Assistent Beheer' },
  { key: 'admin.agents.title', nl: 'Slimme Assistenten' },
  { key: 'admin.agents.subtitle', nl: 'Beheer de instructies van alle AI-assistenten binnen het platform.' },
  
  // VUME / Mail
  { key: 'admin.vume.title', nl: 'Audiopost Mail' },
  { key: 'admin.vume.subtitle', nl: 'Berichtenbeheer' }
];

async function syncLexicon() {
  console.log('🚀 Start Lexicon Handshake Sync...');

  for (const update of LEXICON_UPDATES) {
    console.log(`📝 Syncing key: ${update.key} -> ${update.nl}`);

    // We updaten zowel de 'nl' vertaling als de 'original_text' (indien van toepassing)
    // om de handshake zuiver te houden.
    const { data, error } = await supabase
      .from('translations')
      .upsert({
        translation_key: update.key,
        lang: 'nl',
        translated_text: update.nl,
        original_text: update.nl, // We maken de nieuwe taal de nieuwe standaard
        status: 'active',
        is_manually_edited: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'translation_key,lang'
      });

    if (error) {
      console.error(`   ❌ Fout bij ${update.key}:`, error.message);
    } else {
      console.log(`   ✅ Handshake hersteld voor ${update.key}`);
    }
  }

  console.log('🏁 Lexicon Handshake voltooid.');
}

syncLexicon();
