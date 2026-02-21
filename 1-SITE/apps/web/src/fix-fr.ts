import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { db } from './lib/sync/bridge';
import { translations } from '../../../packages/database/src/schema';
import { eq, and, ilike } from 'drizzle-orm';

async function fixFrTranslations() {
  console.log(" CHRIS-PROTOCOL: Fixing French translations (Polite form & Hero)...");

  try {
    // 1. Fix Hero Video
    await db.update(translations)
      .set({ translatedText: 'Donnez à votre' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part1_video')));
    
    await db.update(translations)
      .set({ translatedText: 'sa propre voix.' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part2_video')));

    // 2. Fix 'Vertaling' leak in French
    await db.update(translations)
      .set({ translatedText: 'Traduction' })
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '%Vertaling%')));

    // 3. Fix 'ton' -> 'votre' (general polite form mandate)
    const tonResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% ton %')));
    
    console.log(`Found ${tonResults.length} instances of ' ton ' in French translations.`);
    
    for (const row of tonResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\bton\b/g, 'votre').replace(/\bDonne\b/g, 'Donnez');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    // 4. Fix 'ta' -> 'votre' (feminine informal)
    const taResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% ta %')));
    
    for (const row of taResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\bta\b/g, 'votre');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    // 5. Fix 'tes' -> 'vos' (plural informal)
    const tesResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% tes %')));
    
    for (const row of tesResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\btes\b/g, 'vos');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    console.log(' French translations fixed successfully.');
  } catch (e) {
    console.error(' Error fixing French translations:', e);
  }
  process.exit(0);
}

fixFrTranslations();
