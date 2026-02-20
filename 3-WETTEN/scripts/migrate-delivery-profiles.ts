import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';
import { sql } from 'drizzle-orm';

async function migrateProfiles() {
  console.log("🚀 START: Initializing Delivery Profiles for all actors...");
  
  try {
    const allActors = await db.select().from(actors);
    console.log(`Processing ${allActors.length} actors...`);

    let updatedCount = 0;

    for (const actor of allActors) {
      // Bepaal type op basis van huidige dagen
      let type: 'sameday' | '24h' | '72u' = '24h';
      if (actor.deliveryDaysMin === 0) {
        type = 'sameday';
      } else if (actor.deliveryDaysMax && actor.deliveryDaysMax > 1) {
        type = '72u';
      }

      const config = {
        type: type,
        cutoff: actor.cutoffTime || '18:00',
        weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'], // Standaard werkweek
      };

      await db.execute(sql`
        UPDATE actors 
        SET delivery_config = ${JSON.stringify(config)}::jsonb
        WHERE id = ${actor.id}
      `);

      updatedCount++;
    }

    console.log(`✅ Klaar! ${updatedCount} profielen geïnitialiseerd.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migratie Error:", error);
    process.exit(1);
  }
}

migrateProfiles();
