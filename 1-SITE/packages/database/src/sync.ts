import { db } from './index';
import { navMenus, actors, actorDemos, translations } from './schema';
import { sql } from 'drizzle-orm';

async function sync() {
  console.log('🚀 Starting manual sync...');
  try {
    // Check if nav_menus exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "nav_menus" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" text NOT NULL,
        "items" jsonb NOT NULL,
        "market" text DEFAULT 'ALL',
        "is_manually_edited" boolean DEFAULT false,
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "nav_menus_key_unique" UNIQUE("key")
      );
    `);
    console.log('✅ Table nav_menus ensured.');

    // Add some default nav if empty
    const existingNav = await db.select().from(navMenus).limit(1);
    if (existingNav.length === 0) {
      await db.insert(navMenus).values([
        {
          key: 'main_nav',
          items: [
            { label: 'Stemmen', href: '/agency', order: 1 },
            { label: 'Hoe het werkt', href: '/#how-it-works', order: 2 },
            { label: 'Tarieven', href: '/#pricing', order: 3 }
          ],
          market: 'ALL'
        }
      ]);
      console.log('✅ Default main_nav inserted.');
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
  process.exit(0);
}

sync();
