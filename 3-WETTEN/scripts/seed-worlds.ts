import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../1-SITE/packages/database/src/schema/index';
import { worlds, journeys } from '../../1-SITE/packages/database/src/schema/index';
import { eq } from 'drizzle-orm';

async function seedWorlds() {
  console.log('🌍 Seeding Worlds and Linking Journeys...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });
  const db = drizzle(client, { schema });

  const worldData = [
    { code: 'agency', label: 'Agency World', description: 'Stemmen, Casting & Productie', isPublic: true },
    { code: 'studio', label: 'Studio World', description: 'Fysieke Workshops & Trainingen', isPublic: true },
    { code: 'academy', label: 'Academy World', description: 'Online Learning & Cursussen', isPublic: true },
    { code: 'artist', label: 'Artist World', description: 'Personal Branding & Artist Services', isPublic: true },
    { code: 'portfolio', label: 'Portfolio World', description: 'Abonnementen & Commissies', isPublic: true },
    { code: 'ademing', label: 'Ademing World', description: 'Meditatie & Mentale Rust', isPublic: true },
    { code: 'freelance', label: 'Freelance World', description: 'Backend Facturatie & B2B Direct', isPublic: false },
  ];

  try {
    for (const w of worldData) {
      console.log(`✨ Creating World: ${w.label}...`);
      await db.insert(worlds).values(w).onConflictDoUpdate({
        target: worlds.code,
        set: { label: w.label, description: w.description, isPublic: w.isPublic }
      });
    }

    const allWorlds = await db.select().from(worlds);
    const worldMap = Object.fromEntries(allWorlds.map(w => [w.code, w.id]));

    console.log('🛤️ Linking existing Journeys to Worlds...');

    const mapping = [
      { journey: 'agency_vo', world: 'agency' },
      { journey: 'agency_ivr', world: 'agency' },
      { journey: 'agency_commercial', world: 'agency' },
      { journey: 'agency_music', world: 'agency' },
      { journey: 'telephony', world: 'agency' },
      { journey: 'video', world: 'agency' },
      { journey: 'commercial', world: 'agency' },
      { journey: 'studio', world: 'studio' },
      { journey: 'academy', world: 'academy' },
    ];

    for (const m of mapping) {
      const worldId = worldMap[m.world];
      if (worldId) {
        await db.update(journeys)
          .set({ worldId })
          .where(eq(journeys.code, m.journey));
        console.log(`✅ Linked Journey ${m.journey} to World ${m.world}`);
      }
    }

    console.log('🏁 Seeding and Linking Completed.');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
  }
  process.exit(0);
}

seedWorlds();
