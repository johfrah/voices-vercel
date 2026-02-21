import { db } from '../1-SITE/packages/db';
import { translations, translationRegistry } from '../1-SITE/packages/db/schema';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { GeminiService } from '../1-SITE/apps/web/src/services/GeminiService';

/**
 * 🚀 TURBO HEAL TRANSLATIONS (2026)
 * 
 * Dit script scant de 'translationRegistry' op alle unieke teksten
 * en genereert direct AI vertalingen voor FR, EN, DE, ES, PT
 * als deze nog ontbreken in de 'translations' tabel.
 */

async function turboHeal() {
  console.log('🚀 Starting Turbo Heal for all languages...');

  const targetLanguages = ['fr', 'en', 'de', 'es', 'pt'];
  
  // 1. Haal alle unieke bronteksten op
  const allStrings = await db.select().from(translationRegistry);
  console.log(`Found ${allStrings.length} unique strings in registry.`);

  for (const lang of targetLanguages) {
    console.log(`\n🌍 Processing language: ${lang.toUpperCase()}`);
    
    // 2. Haal bestaande vertalingen op voor deze taal
    const existingTranslations = await db
      .select({ key: translations.translationKey })
      .from(translations)
      .where(eq(translations.lang, lang));
    
    const existingKeys = new Set(existingTranslations.map(t => t.key));
    
    // 3. Filter strings die nog vertaald moeten worden
    const missingStrings = allStrings.filter(s => !existingKeys.has(s.translationKey));
    console.log(`- Missing: ${missingStrings.length} translations.`);

    for (const item of missingStrings) {
      try {
        console.log(`  🩹 Healing [${item.translationKey}]...`);
        
        const prompt = `
          Vertaal de volgende tekst van het Nederlands naar het ${lang === 'en' ? 'Engels' : lang === 'fr' ? 'Frans' : lang === 'de' ? 'Duits' : lang === 'es' ? 'Spaans' : 'Portugees'}.
          Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
          Geen AI-bingo woorden, geen em-dashes, max 20 woorden.
          
          Tekst: "${item.defaultText}"
          Vertaling:
        `;

        const translatedText = await GeminiService.generateText(prompt, { lang: lang });
        const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

        // 4. Injecteer in database
        await db.insert(translations).values({
          translationKey: item.translationKey,
          lang: lang,
          originalText: item.defaultText,
          translatedText: cleanTranslation,
          status: 'active',
          isManuallyEdited: false,
          updatedAt: new Date()
        });

        console.log(`  ✅ [${lang}] Fixed: ${cleanTranslation}`);
      } catch (err) {
        console.error(`  ❌ Failed to heal [${item.translationKey}]:`, err);
      }
    }
  }

  console.log('\n🏁 Turbo Heal completed!');
}

// turboHeal().catch(console.error);
