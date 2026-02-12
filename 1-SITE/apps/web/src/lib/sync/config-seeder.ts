import { db } from '@db';
import { navMenus, marketConfigs, rateCards, siteSettings } from '@db/schema/config';
import { eq } from 'drizzle-orm';

/**
 * 🚀 NUCLEAR CONFIG SEEDER
 * Verhuist alle hardcoded data naar de database.
 * Dit is de 'Big Bang' voor de Cursorloze wereld.
 */

export async function seedFutureproofConfig() {
  console.log('🚀 Starting Core Config Seeding...');

  // 1. Navigation Menus
  const mainMenu = {
    key: 'main_nav',
    items: [
      { label: 'Stemmen', href: '/agency', order: 1 },
      { label: 'Coaching', href: '/studio', order: 2 },
      { label: 'Leren', href: '/academy', order: 3 },
      { label: 'Rust', href: '/ademing', order: 4 },
      { label: 'Portfolio', href: '/artist', order: 5 }
    ]
  };

  await db.insert(navMenus).values(mainMenu).onConflictDoUpdate({
    target: navMenus.key,
    set: { items: mainMenu.items }
  });

  // 2. Pricing Rules (Rate Cards)
  const rules = [
    {
      market: 'GLOBAL',
      category: 'unpaid',
      rules: { word_threshold: 200, surcharge_per_word: 0.20, fallback_base: 239 }
    },
    {
      market: 'GLOBAL',
      category: 'telefonie',
      rules: {
        base_words: 25,
        extra_prompt_price: 19.95,
        extra_word_price: 1.00,
        processing_fee_multiplier: 0.10,
        bulk_threshold: 750,
        bulk_base_price: 915.35,
        bulk_surcharge_per_word: 0.25,
        fallback_base: 89
      }
    }
  ];

  for (const rule of rules) {
    await db.insert(rateCards).values(rule);
  }

  // 3. Market Configs
  const markets = [
    {
      market: 'BE',
      name: 'Voices.be',
      email: 'johfrah@voices.be',
      phone: '+32 (0)2 793 19 91',
      vatNumber: 'BE 0741.852.159',
      address: { street: 'Dascottelei 95', city: 'Deurne', zip: '2100' }
    }
  ];

  for (const market of markets) {
    await db.insert(marketConfigs).values(market).onConflictDoUpdate({
      target: marketConfigs.market,
      set: market
    });
  }

  console.log('✅ Core Config Seeding Complete!');
}
