import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function consolidateAndLink() {
  console.log('🚀 [MASTERCLASS] Final Consolidation & Linking...');

  try {
    // 1. Link Blueprints to Sectors based on keywords
    console.log('Step 1: Linking blueprints to sectors...');
    const blueprints = await sql`SELECT id, title, content FROM public.script_blueprints`;
    const sectors = await sql`SELECT id, name FROM public.sectors`;

    for (const blueprint of blueprints) {
      const combinedText = (blueprint.title + ' ' + blueprint.content).toLowerCase();
      let matchedSectorId = null;

      for (const sector of sectors) {
        const sectorName = sector.name.toLowerCase();
        if (combinedText.includes(sectorName) || 
            (sectorName === 'it' && combinedText.includes(' informatica ')) ||
            (sectorName === 'zorg' && combinedText.includes('medisch'))) {
          matchedSectorId = sector.id;
          break;
        }
      }

      if (matchedSectorId) {
        await sql`
          UPDATE public.script_blueprints 
          SET sector_id = ${matchedSectorId} 
          WHERE id = ${blueprint.id}
        `;
      }
    }
    console.log('✅ Blueprints linked to sectors.');

    // 2. Link Demos to Blueprints based on name matching
    console.log('Step 2: Linking demos to blueprints...');
    const demos = await sql`SELECT id, name FROM public.actor_demos`;
    
    let demoLinkCount = 0;
    for (const demo of demos) {
      const demoName = demo.name.toLowerCase();
      
      // Try to find a blueprint with a similar title
      const matchedBlueprint = blueprints.find(b => 
        demoName.includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(demoName)
      );

      if (matchedBlueprint) {
        await sql`
          INSERT INTO public.demo_blueprints (demo_id, blueprint_id)
          VALUES (${demo.id}, ${matchedBlueprint.id})
          ON CONFLICT (demo_id, blueprint_id) DO NOTHING
        `;
        demoLinkCount++;
      }
    }
    console.log(`✅ Linked ${demoLinkCount} demos to blueprints.`);

    // 3. Populate Media Intelligence for demos that have blueprints
    console.log('Step 3: Initializing media_intelligence from blueprints...');
    const demoBlueprints = await sql`
      SELECT db.demo_id, b.content, b.language_id
      FROM public.demo_blueprints db
      JOIN public.script_blueprints b ON db.blueprint_id = b.id
    `;

    for (const db of demoBlueprints) {
      await sql`
        INSERT INTO public.media_intelligence (demo_id, transcript, detected_language_id)
        VALUES (${db.demo_id}, ${db.content}, ${db.language_id})
        ON CONFLICT (demo_id) DO UPDATE 
        SET transcript = EXCLUDED.transcript, detected_language_id = EXCLUDED.detected_language_id
      `;
    }
    console.log('✅ Media intelligence initialized.');

    console.log('🏁 [MASTERCLASS] Consolidation complete!');
  } catch (error) {
    console.error('❌ Consolidation failed:', error);
  } finally {
    await sql.end();
  }
}

consolidateAndLink();
