import { db } from '../../1-SITE/packages/database/src/index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🚀 Starting manual table creation and data migration...');

  try {
    // 1. Create the table manually if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS world_configs (
        id SERIAL PRIMARY KEY,
        world_id INTEGER NOT NULL REFERENCES worlds(id),
        language_id INTEGER NOT NULL REFERENCES languages(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        vat_number TEXT,
        coc_number TEXT,
        address JSONB,
        social_links JSONB,
        legal JSONB,
        seo_data JSONB,
        localization JSONB,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(world_id, language_id)
      );
    `);
    console.log('✅ world_configs table ensured.');

    // 2. Fetch existing market configs
    const marketConfigs = await db.execute(sql`SELECT * FROM market_configs`);
    const worlds = await db.execute(sql`SELECT * FROM worlds`);
    const languages = await db.execute(sql`SELECT * FROM languages`);

    console.log(`📊 Found ${marketConfigs.length} market configs, ${worlds.length} worlds, ${languages.length} languages.`);

    for (const mc of marketConfigs) {
      // Find matching world
      const world = worlds.find(w => w.code.toLowerCase() === mc.market.toLowerCase() || (mc.market === 'BE' && w.code === 'agency') || (mc.market === 'NLNL' && w.code === 'agency'));
      
      if (!world) {
        console.log(`⚠️ No matching world found for market: ${mc.market}`);
        continue;
      }

      // Determine language ID (default to nl-be if not found)
      const langCode = mc.localization?.default_lang === 'nl-BE' ? 'nl-be' : (mc.localization?.default_lang || 'nl-be').toLowerCase();
      let lang = languages.find(l => l.code.toLowerCase() === langCode);
      if (!lang) lang = languages.find(l => l.code === 'nl-be');

      if (!lang) {
        console.log(`❌ Language nl-be not found!`);
        continue;
      }

      console.log(`🔄 Migrating ${mc.market} -> World: ${world.code} (${world.id}), Lang: ${lang.code} (${lang.id})`);

      await db.execute(sql`
        INSERT INTO world_configs (
          world_id, language_id, name, email, phone, vat_number, coc_number, address, social_links, legal, localization
        ) VALUES (
          ${world.id}, 
          ${lang.id}, 
          ${mc.name}, 
          ${mc.email}, 
          ${mc.phone}, 
          ${mc.vat_number}, 
          ${mc.coc_number}, 
          ${mc.address ? JSON.stringify(mc.address) : null}, 
          ${mc.social_links ? JSON.stringify(mc.social_links) : null}, 
          ${mc.legal ? JSON.stringify(mc.legal) : null}, 
          ${mc.localization ? JSON.stringify(mc.localization) : null}
        ) ON CONFLICT (world_id, language_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          vat_number = EXCLUDED.vat_number,
          coc_number = EXCLUDED.coc_number,
          address = EXCLUDED.address,
          social_links = EXCLUDED.social_links,
          legal = EXCLUDED.legal,
          localization = EXCLUDED.localization,
          updated_at = NOW();
      `);
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Error during manual migration:', err);
  }
}

main().catch(console.error);
