import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/web
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedMarkets() {
  const MARKETS = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'Vlaams',
      supported_languages: [
        'Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits', 
        'Spaans', 'Italiaans', 'Pools', 'Portugees', 'Turks', 
        'Deens', 'Zweeds', 'Noors', 'Fins', 'Grieks', 
        'Russisch', 'Arabisch', 'Chinees', 'Japans'
      ],
      popular_languages: ['Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits'],
      name: 'België',
      logo_url: '/assets/common/branding/Voices-Artists-LOGO.png',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'Nederlands',
      supported_languages: ['Nederlands', 'Vlaams', 'Engels', 'Duits', 'Frans', 'Spaans', 'Italiaans'],
      popular_languages: ['Nederlands', 'Vlaams', 'Engels', 'Duits', 'Frans'],
      name: 'Nederland',
      phone: '+31 (0)85 016 34 60',
      email: 'johfrah@voices.nl',
      logo_url: '/assets/common/branding/Voices-Artists-LOGO.png',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'Frans',
      supported_languages: ['Frans', 'Engels', 'Nederlands', 'Vlaams', 'Duits', 'Spaans', 'Italiaans'],
      popular_languages: ['Frans', 'Engels', 'Nederlands', 'Vlaams', 'Duits'],
      name: 'France',
      email: 'johfrah@voices.fr',
      logo_url: '/assets/common/branding/Voices-Artists-LOGO.png',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.de': {
      market_code: 'DE',
      language: 'de',
      primary_language: 'Duits',
      supported_languages: ['Duits', 'Engels', 'Frans', 'Nederlands', 'Vlaams', 'Italiaans', 'Spaans'],
      popular_languages: ['Duits', 'Engels', 'Frans', 'Nederlands', 'Vlaams'],
      name: 'Deutschland',
      email: 'johfrah@voices.de',
      logo_url: '/assets/common/branding/Voices-Artists-LOGO.png',
      theme: 'voices',
      is_inclusive: true
    }
  };

  console.log('🚀 Seeding Market Configs via Supabase SDK...');

  for (const [host, config] of Object.entries(MARKETS)) {
    const { error } = await supabase
      .from('app_configs')
      .upsert({
        key: `market_config_${host}`,
        value: config,
        description: `Market configuration for ${host}`
      }, { onConflict: 'key' });

    if (error) {
      console.error(`❌ Failed to seed ${host}:`, error);
    } else {
      console.log(`✅ Seeded ${host}`);
    }
  }

  const { error: activeError } = await supabase
    .from('app_configs')
    .upsert({
      key: 'active_markets',
      value: Object.keys(MARKETS),
      description: 'List of active market hosts'
    }, { onConflict: 'key' });

  if (activeError) {
    console.error('❌ Failed to seed active_markets:', activeError);
  } else {
    console.log('✅ Seeded active_markets');
  }

  console.log('✨ Market Seeding Complete!');
  process.exit(0);
}

seedMarkets().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
