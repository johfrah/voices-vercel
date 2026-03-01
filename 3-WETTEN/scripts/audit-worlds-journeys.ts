/**
 * 🚀 NUCLEAR WORLD & JOURNEY AUDIT (v2.16.112)
 * 
 * Fetches all Worlds and their associated Journeys from Supabase.
 * This is the Forensic Truth for the ID-First Architecture.
 */

import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function auditWorldsAndJourneys() {
  console.log('🛡️ Starting Nuclear World & Journey Audit...');

  try {
    // 1. Fetch all Worlds
    console.log('🌍 Fetching Worlds...');
    const worldsRaw = await db.execute(sql`SELECT id, code, label FROM worlds ORDER BY id ASC;`);
    const worlds = worldsRaw.rows || worldsRaw;

    // 2. Fetch all Journeys
    console.log('🛤️ Fetching Journeys...');
    const journeysRaw = await db.execute(sql`SELECT id, world_id, code, label FROM journeys ORDER BY world_id ASC, id ASC;`);
    const journeys = journeysRaw.rows || journeysRaw;

    // 3. Group and Report
    console.log('\n📊 --- FORENSIC WORLD HIERARCHY REPORT ---');
    
    (worlds as any[]).forEach(world => {
      console.log(`\n🌍 WORLD [ID: ${world.id}] - ${world.label} (${world.code})`);
      
      const worldJourneys = (journeys as any[]).filter(j => j.world_id === world.id);
      
      if (worldJourneys.length > 0) {
        worldJourneys.forEach(j => {
          console.log(`   🛤️ JOURNEY [ID: ${j.id}] - ${j.label} (${j.code})`);
        });
      } else {
        console.log(`   ⚠️ No journeys linked to this world.`);
      }
    });

    console.log('\n🏁 Audit Complete.');
  } catch (err) {
    console.error('💥 Fatal Error during audit:', err);
    process.exit(1);
  }
}

auditWorldsAndJourneys().catch(err => {
  console.error('💥 Uncaught Error:', err);
  process.exit(1);
});
