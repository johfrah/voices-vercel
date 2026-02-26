import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function setupSonicIntelligence() {
  console.log('🏗️ [MASTERCLASS] Setting up Sonic Intelligence Infrastructure via Direct Postgres...');

  try {
    // 1. Create Tables
    console.log('Step 1: Creating tables...');
    await sql`
      -- Sectors Master List
      CREATE TABLE IF NOT EXISTS public.sectors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      -- Script Blueprints (The "DATAGOLD" Templates)
      CREATE TABLE IF NOT EXISTS public.script_blueprints (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER,
        sector_id INTEGER REFERENCES public.sectors(id),
        language_id INTEGER,
        is_anonymous BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      -- Demo Sectors Junction
      CREATE TABLE IF NOT EXISTS public.demo_sectors (
        demo_id INTEGER REFERENCES public.actor_demos(id) ON DELETE CASCADE,
        sector_id INTEGER REFERENCES public.sectors(id) ON DELETE CASCADE,
        confidence FLOAT DEFAULT 1.0,
        PRIMARY KEY (demo_id, sector_id)
      );
    `;

    await sql`
      -- Demo Blueprints Junction
      CREATE TABLE IF NOT EXISTS public.demo_blueprints (
        demo_id INTEGER REFERENCES public.actor_demos(id) ON DELETE CASCADE,
        blueprint_id INTEGER REFERENCES public.script_blueprints(id) ON DELETE CASCADE,
        PRIMARY KEY (demo_id, blueprint_id)
      );
    `;

    await sql`
      -- Media Intelligence (Deep Metadata)
      CREATE TABLE IF NOT EXISTS public.media_intelligence (
        demo_id INTEGER PRIMARY KEY REFERENCES public.actor_demos(id) ON DELETE CASCADE,
        transcript TEXT,
        detected_language_id INTEGER,
        energy_level INTEGER,
        bpm INTEGER,
        pitch_hz FLOAT,
        ai_metadata JSONB DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ Tables created successfully.');

    // 2. Seed Initial Sectors
    console.log('Step 2: Seeding initial sectors...');
    const initialSectors = [
      { name: 'Bouw en Constructie', slug: 'bouw-en-constructie', icon: 'HardHat' },
      { name: 'E-commerce', slug: 'e-commerce', icon: 'ShoppingBag' },
      { name: 'Informatietechnologie', slug: 'it', icon: 'Laptop' },
      { name: 'Marketing & Communicatie', slug: 'marketing', icon: 'Megaphone' },
      { name: 'Elektronica en Technologie', slug: 'technologie', icon: 'Cpu' },
      { name: 'Audiovisuele Productie', slug: 'media', icon: 'Video' },
      { name: 'Gezondheidszorg & Biotechnologie', slug: 'zorg', icon: 'Stethoscope' },
      { name: 'Financiële Dienstverlening', slug: 'finance', icon: 'Banknote' },
      { name: 'Vastgoed', slug: 'vastgoed', icon: 'Home' },
      { name: 'Automotive', slug: 'automotive', icon: 'Car' },
      { name: 'Overheid & Publieke Sector', slug: 'overheid', icon: 'Building2' },
      { name: 'Horeca & Toerisme', slug: 'horeca', icon: 'Utensils' }
    ];

    for (const sector of initialSectors) {
      await sql`
        INSERT INTO public.sectors (name, slug, icon)
        VALUES (${sector.name}, ${sector.slug}, ${sector.icon})
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
      `;
    }
    console.log('✅ Initial sectors seeded.');

    // 3. Data Inheritance
    console.log('Step 3: Inheriting sector data from users to their demos...');
    
    const usersWithSector = await sql`
      SELECT id, customer_insights
      FROM public.users
      WHERE customer_insights IS NOT NULL
    `;

    const dbSectors = await sql`SELECT id, name FROM public.sectors`;
    const sectorMap = new Map();
    dbSectors.forEach(s => sectorMap.set(s.name, s.id));

    let inheritedCount = 0;

    for (const user of usersWithSector) {
      const insights = user.customer_insights;
      const sectorName = insights.sector || insights.industry || (insights.company && insights.company.sector);
      const sectorId = sectorMap.get(sectorName);

      if (sectorId) {
        // Find actor_id from order_items linked to this user's orders
        const actorIds = await sql`
          SELECT DISTINCT oi.actor_id
          FROM public.order_items oi
          JOIN public.orders o ON oi.order_id = o.id
          WHERE o.user_id = ${user.id} AND oi.actor_id IS NOT NULL
        `;

        for (const { actor_id } of actorIds) {
          const demos = await sql`
            SELECT id FROM public.actor_demos WHERE actor_id = ${actor_id}
          `;

          for (const demo of demos) {
            await sql`
              INSERT INTO public.demo_sectors (demo_id, sector_id, confidence)
              VALUES (${demo.id}, ${sectorId}, 0.8)
              ON CONFLICT (demo_id, sector_id) DO NOTHING
            `;
            inheritedCount++;
          }
        }
      }
    }
    console.log(`✅ Inherited sector data for ${inheritedCount} demo-sector links.`);

    console.log('🏁 [MASTERCLASS] Setup complete!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await sql.end();
  }
}

setupSonicIntelligence();
