import { db } from '../1-SITE/packages/database/src/index';
import { appConfigs } from '../1-SITE/packages/database/src/schema/index';
import { VOICES_CONFIG } from '../1-SITE/packages/config/config';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/web
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

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
      logo_url: VOICES_CONFIG.assets.logos.be,
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
      logo_url: VOICES_CONFIG.assets.logos.nl,
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
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices',
      is_inclusive: true
    }
  };

  console.log('🚀 Seeding Market Configs...');

  for (const [host, config] of Object.entries(MARKETS)) {
    try {
      await db.insert(appConfigs).values({
        key: `market_config_${host}`,
        value: config,
        description: `Market configuration for ${host}`
      }).onConflictDoUpdate({
        target: [appConfigs.key],
        set: { value: config }
      });
      console.log(`✅ Seeded ${host}`);
    } catch (e) {
      console.error(`❌ Failed to seed ${host}:`, e);
    }
  }

  try {
    await db.insert(appConfigs).values({
      key: 'active_markets',
      value: Object.keys(MARKETS),
      description: 'List of active market hosts'
    }).onConflictDoUpdate({
      target: [appConfigs.key],
      set: { value: Object.keys(MARKETS) }
    });
    console.log('✅ Seeded active_markets');
  } catch (e) {
    console.error('❌ Failed to seed active_markets:', e);
  }

  console.log('✨ Market Seeding Complete!');
  process.exit(0);
}

seedMarkets().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
