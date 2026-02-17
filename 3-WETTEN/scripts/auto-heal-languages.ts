import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { actors, languages, actorLanguages } from '../../1-SITE/packages/database/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 🛠️ AUTO-HEAL: LANGUAGE RELATION MIGRATOR (2026)
 */
async function autoHealLanguages() {
  console.log('🚀 Starting Auto-Heal: Language Relations...');

  try {
    const dbLangs = await db.select().from(languages);
    console.log(`📚 Found ${dbLangs.length} languages in taxonomy.`);

    const allActors = await db.select().from(actors).where(eq(actors.status, 'live'));
    console.log(`🎙️ Processing ${allActors.length} live actors...`);

    let healedCount = 0;
    let skippedCount = 0;

    for (const actor of allActors) {
      const nativeText = actor.nativeLang?.toLowerCase() || '';
      if (!nativeText) {
        skippedCount++;
        continue;
      }

      let targetCode = '';
      if (nativeText.includes('vlaams') || nativeText.includes('be')) targetCode = 'nl-be';
      else if (nativeText.includes('nederlands') || nativeText.includes('nl')) targetCode = 'nl-nl';
      else if (nativeText.includes('frans') || nativeText.includes('fr')) targetCode = 'fr-fr';
      else if (nativeText.includes('engels') || nativeText.includes('en')) targetCode = 'en-gb';
      else if (nativeText.includes('duits') || nativeText.includes('de')) targetCode = 'de-de';
      else if (nativeText.includes('spaans') || nativeText.includes('es')) targetCode = 'es-es';
      else if (nativeText.includes('italiaans') || nativeText.includes('it')) targetCode = 'it-it';
      
      const targetLang = dbLangs.find(l => l.code === targetCode || l.label.toLowerCase() === nativeText);

      if (targetLang) {
        const existing = await db.select().from(actorLanguages).where(
          sql`${actorLanguages.actorId} = ${actor.id} AND ${actorLanguages.languageId} = ${targetLang.id}`
        );

        if (existing.length === 0) {
          await db.insert(actorLanguages).values({
            actorId: actor.id,
            languageId: targetLang.id,
            isNative: true
          });
          
          await db.update(actors)
            .set({ nativeLang: targetLang.code })
            .where(eq(actors.id, actor.id));

          console.log(`✅ Healed: ${actor.firstName} -> ${targetLang.label} (${targetLang.code})`);
          healedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✨ Auto-Heal Completed! healed: ${healedCount}, skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Auto-Heal Failed:', error);
    process.exit(1);
  }
}

autoHealLanguages();
