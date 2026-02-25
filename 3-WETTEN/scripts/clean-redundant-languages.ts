import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { sql } from 'drizzle-orm';
import { MarketManager } from '../../1-SITE/packages/config/market-manager';

/**
 * 🛡️ CHRIS-PROTOCOL: Data Integrity - Redundancy Elimination
 * This script removes extra languages that are identical to the native language.
 * Example: Native 'nl-NL' (Nederlands) should not have 'Nederlands' as extra language.
 */

async function cleanRedundantLanguages() {
  console.log('🚀 Starting Redundancy Elimination in Language Data...');

  try {
    // 1. Get all actors
    const actorsResult = await db.execute(sql`SELECT id, first_name, native_lang, extra_langs FROM actors`);
    const actors = (actorsResult.rows || actorsResult) as any[];
    console.log(`Analyzing ${actors.length} actors...`);

    let cleanedCount = 0;

    for (const actor of actors) {
      if (!actor.native_lang || !actor.extra_langs) continue;

      const nativeCode = MarketManager.getLanguageCode(actor.native_lang);
      const extraLangs = actor.extra_langs.split(',').map((l: string) => l.trim());
      
      const filteredExtraLangs = extraLangs.filter((l: string) => {
        const extraCode = MarketManager.getLanguageCode(l);
        // 🛡️ CHRIS-PROTOCOL: Exclude native language and its variations
        const isRedundant = extraCode === nativeCode || 
                           extraCode.startsWith(nativeCode + '-') ||
                           nativeCode.startsWith(extraCode + '-') ||
                           (nativeCode === 'nl-be' && extraCode === 'nl-nl') ||
                           (nativeCode === 'nl-nl' && extraCode === 'nl-be');
        return !isRedundant;
      });

      if (filteredExtraLangs.length !== extraLangs.length) {
        const newExtraLangsStr = filteredExtraLangs.join(', ');
        console.log(`✨ Cleaning ${actor.first_name} (ID ${actor.id}): "${actor.extra_langs}" -> "${newExtraLangsStr}"`);
        
        // Update flat field
        await db.execute(sql`
          UPDATE actors SET extra_langs = ${newExtraLangsStr || null} WHERE id = ${actor.id}
        `);

        // Update relational table: Remove non-native entries that match native language
        const nativeCode = MarketManager.getLanguageCode(actor.native_lang);
        
        // Find language ID for native language
        const langResult = await db.execute(sql`SELECT id FROM languages WHERE code = ${nativeCode}`);
        const dbLang = (langResult.rows || langResult) as any[];
        const langId = dbLang[0]?.id;

        if (langId) {
          await db.execute(sql`
            DELETE FROM actor_languages 
            WHERE actor_id = ${actor.id} 
            AND language_id = ${langId} 
            AND is_native = false
          `);
        }

        cleanedCount++;
      }
    }

    console.log(`✅ Successfully cleaned ${cleanedCount} actors.`);

  } catch (err) {
    console.error('❌ Cleaning failed:', err);
  }
}

cleanRedundantLanguages();
