import { db, genders, languages, journeys, mediaTypes, actors, actorDemos } from '@/lib/system/voices-config';
import { eq, isNull, sql } from 'drizzle-orm';

async function auditData() {
  console.log('🔍 STARTING NUCLEAR DATA AUDIT (Handshake Truth 2026)\n');

  try {
    // 1. Audit Genders
    const allGenders = await db.select().from(genders);
    console.log(`🚻 Genders in DB: ${allGenders.length}`);
    allGenders.forEach(g => console.log(`   - [${g.id}] ${g.code}: ${g.label}`));

    const actorsMissingGenderId = await db.select({ count: sql<number>`count(*)` }).from(actors).where(isNull(actors.genderId));
    console.log(`\n🎙️ Actors missing genderId: ${actorsMissingGenderId[0].count}`);

    // 2. Audit Languages
    const allLangs = await db.select().from(languages);
    console.log(`\n🗣️ Languages in DB: ${allLangs.length}`);
    
    const actorsMissingLangId = await db.select({ count: sql<number>`count(*)` }).from(actors).where(isNull(actors.nativeLanguageId));
    console.log(`🎙️ Actors missing nativeLanguageId: ${actorsMissingLangId[0].count}`);

    // 3. Audit Journeys
    const allJourneys = await db.select().from(journeys);
    console.log(`\n🛤️ Journeys in DB: ${allJourneys.length}`);
    allJourneys.forEach(j => console.log(`   - [${j.id}] ${j.code}: ${j.label}`));

    // 4. Audit Media Types
    const allMediaTypes = await db.select().from(mediaTypes);
    console.log(`\n📺 Media Types in DB: ${allMediaTypes.length}`);
    allMediaTypes.forEach(m => console.log(`   - [${m.id}] ${m.code}: ${m.label}`));

    // 5. Audit Actor Demos types
    const demoTypes = await db.select({ type: actorDemos.type, count: sql<number>`count(*)` })
      .from(actorDemos)
      .groupBy(actorDemos.type);
    console.log('\n🎵 Actor Demo Types:');
    demoTypes.forEach(dt => console.log(`   - ${dt.type || 'NULL'}: ${dt.count}`));

    console.log('\n✅ AUDIT COMPLETE.');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err);
  }
  process.exit(0);
}

auditData();
