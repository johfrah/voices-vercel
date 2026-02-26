import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function activateDiscoveryEngine() {
  console.log('🚀 [MASTERCLASS] Activating Discovery Engine: Linking 4.631 Media files to 1.640 Sectors...');

  try {
    // 0. Ensure unique constraint on media_id for actor_demos
    console.log('Step 0: Ensuring database constraints...');
    await sql`ALTER TABLE public.actor_demos ADD CONSTRAINT actor_demos_media_id_unique UNIQUE (media_id)`;
    console.log('✅ Unique constraint added.');
  } catch (e) {
    console.log('ℹ️ Constraint already exists or handled.');
  }

  try {
    // 1. Ensure all 4.631 audio files from 'media' are in 'actor_demos'
    console.log('Step 1: Promoting media files to actor_demos...');
    const mediaFiles = await sql`
      SELECT id, file_path, labels, journey
      FROM public.media
      WHERE file_type ILIKE 'audio/%'
    `;

    let promotedCount = 0;
    for (const file of mediaFiles) {
      const actorMatch = file.file_path.match(/-A-(\d+)/);
      if (actorMatch) {
        const wpId = parseInt(actorMatch[1]);
        const [actor] = await sql`SELECT id FROM public.actors WHERE wp_product_id = ${wpId}`;
        
        if (actor) {
          let type = 'telephony';
          if (file.labels?.includes('commercial')) type = 'commercial';
          else if (file.labels?.includes('corporate') || file.labels?.includes('video')) type = 'video';
          else if (file.journey === 'video') type = 'video';
          else if (file.journey === 'commercial') type = 'commercial';

          await sql`
            INSERT INTO public.actor_demos (actor_id, name, url, type, media_id, is_public)
            VALUES (${actor.id}, ${path.basename(file.file_path, '.mp3')}, '', ${type}, ${file.id}, true)
            ON CONFLICT (media_id) DO UPDATE SET type = EXCLUDED.type
          `;
          promotedCount++;
        }
      }
    }
    console.log(`✅ Promoted ${promotedCount} media files to actor_demos.`);

    // 2. Map Sectors to Demos based on Order History
    console.log('Step 2: Mapping 1.640 user sectors to their bestelde demos...');
    const usersWithSector = await sql`
      SELECT id, customer_insights
      FROM public.users
      WHERE customer_insights IS NOT NULL
    `;

    const dbSectors = await sql`SELECT id, name FROM public.sectors`;
    const sectorMap = new Map();
    dbSectors.forEach(s => sectorMap.set(s.name, s.id));

    let sectorLinkCount = 0;
    for (const user of usersWithSector) {
      const insights = user.customer_insights;
      const sectorName = insights.sector || insights.industry || (insights.company && insights.company.sector);
      const sectorId = sectorMap.get(sectorName);

      if (sectorId) {
        const demos = await sql`
          SELECT ad.id
          FROM public.actor_demos ad
          JOIN public.order_items oi ON ad.actor_id = oi.actor_id
          JOIN public.orders o ON oi.order_id = o.id
          WHERE o.user_id = ${user.id}
        `;

        for (const demo of demos) {
          await sql`
            INSERT INTO public.demo_sectors (demo_id, sector_id, confidence)
            VALUES (${demo.id}, ${sectorId}, 0.9)
            ON CONFLICT (demo_id, sector_id) DO NOTHING
          `;
          sectorLinkCount++;
        }
      }
    }
    console.log(`✅ Linked ${sectorLinkCount} demos to specific sectors.`);

    // 3. Import "Clean" Blueprints with Placeholders
    console.log('Step 3: Importing clean blueprints from src/content/library...');
    const telephonyDir = path.join(process.cwd(), '1-SITE/apps/web/src/content/library/scripts/telephony');
    const files = fs.readdirSync(telephonyDir).filter(f => f.endsWith('.md'));

    let blueprintCount = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(telephonyDir, file), 'utf-8');
      const { data, content: body } = matter(content);
      
      const slug = file.replace('.md', '');
      const title = data.title || slug.replace(/-/g, ' ');

      await sql`
        INSERT INTO public.script_blueprints (title, slug, content, is_anonymous)
        VALUES (${title}, ${slug}, ${body.trim()}, true)
        ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content
      `;
      blueprintCount++;
    }
    console.log(`✅ Imported ${blueprintCount} clean blueprints.`);

    console.log('🏁 [MASTERCLASS] Discovery Engine is now fully fueled and ready!');
  } catch (error) {
    console.error('❌ Activation failed:', error);
  } finally {
    await sql.end();
  }
}

activateDiscoveryEngine();
