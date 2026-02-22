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
      primary_language: 'nl-be',
      supported_languages: [
        'nl-be', 'nl-nl', 'en-gb', 'fr-fr', 'de-de', 
        'es-es', 'it-it', 'pl-pl', 'pt-pt', 'tr-tr', 
        'da-dk', 'sv-se', 'no-no', 'fi-fi', 'el-gr', 
        'ru-ru', 'ar-sa', 'zh-cn', 'ja-jp'
      ],
      popular_languages: ['nl-be', 'nl-nl', 'fr-fr', 'en-gb', 'de-de'],
      name: 'België',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      is_inclusive: true
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'nl-nl',
      supported_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr', 'es-es', 'it-it'],
      popular_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
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
      primary_language: 'fr-fr',
      supported_languages: ['fr-fr', 'en-gb', 'nl-nl', 'nl-be', 'de-de', 'es-es', 'it-it'],
      popular_languages: ['fr-fr', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
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
