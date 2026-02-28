
import { db } from '../../1-SITE/apps/web/src/lib/system/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function restructureInstructors() {
  console.log('🚀 Starting Atomic Instructor Restructuring (v2)...');

  const instructorMappings = [
    { name: 'Korneel De Clercq', tagline: 'Radiopresentator en journalist', workshop_id: 260272 },
    { name: 'Lucas Derycke', tagline: 'audio- en theatermaker, docent en voorzitter van Klankverbond', workshop_id: 260274 },
    { name: 'Johfrah Lefebvre', tagline: 'Voice-over en coach', workshop_id: 260250 },
    { name: 'Bernadette Timmermans', tagline: 'Stemcoach en auteur van “Klink Klaar”', workshop_ids: [272702, 263913, 267780, 267781, 274488] },
    { name: 'Annemie Tweepenninckx', tagline: 'documentairestem', workshop_id: 260266 },
    { name: 'Kristien Maes', tagline: 'Coach televisiepresentatoren', workshop_id: 260271 },
    { name: 'Guido Godon', tagline: 'stemregisseur audiodescriptie', workshop_id: 260265 }
  ];

  await db.transaction(async (tx) => {
    for (const mapping of instructorMappings) {
      console.log(`Processing ${mapping.name}...`);
      
      // 1. Update Instructor Tagline
      await tx.execute(sql`
        UPDATE instructors 
        SET tagline = ${mapping.tagline}
        WHERE name = ${mapping.name}
      `);

      // 2. Remove tagline from workshops
      const ids = mapping.workshop_ids || [mapping.workshop_id];
      for (const id of ids) {
        const result = await tx.execute(sql`SELECT meta FROM workshops WHERE id = ${id}`);
        const currentMeta = result[0]?.meta || {};
        
        // Atomic delete from JSONB
        const newMeta = { ...currentMeta };
        delete newMeta.tagline;

        await tx.execute(sql`
          UPDATE workshops 
          SET meta = ${JSON.stringify(newMeta)}::jsonb 
          WHERE id = ${id}
        `);

        // 3. Ensure coupling exists in edition_instructors
        const editions = await tx.execute(sql`SELECT id FROM workshop_editions WHERE workshop_id = ${id} LIMIT 1`);
        const instructor = await tx.execute(sql`SELECT id FROM instructors WHERE name = ${mapping.name} LIMIT 1`);
        
        if (editions.length > 0 && instructor.length > 0) {
          const editionId = editions[0].id;
          const instructorId = instructor[0].id;
          
          await tx.execute(sql`
            INSERT INTO edition_instructors (edition_id, instructor_id)
            VALUES (${editionId}, ${instructorId})
            ON CONFLICT DO NOTHING
          `);
        }
      }
    }
  });

  console.log('✅ Atomic Restructuring Completed!');
  process.exit(0);
}

restructureInstructors().catch(err => {
  console.error('❌ Restructuring failed:', err);
  process.exit(1);
});
