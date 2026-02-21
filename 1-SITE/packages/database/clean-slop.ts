import { db } from './src/index';
import { translations } from './src/schema';
import { like, or } from 'drizzle-orm';

async function cleanSlop() {
  console.log('🧹 Cleaning translation slop...');
  
  const slopPatterns = [
    '%Het lijkt erop dat de tekst%',
    '%Zou je de tekst%',
    '%niet compleet is%',
    '%Initial Load%'
  ];

  try {
    const conditions = slopPatterns.map(pattern => like(translations.translatedText, pattern));
    
    const deleted = await db.delete(translations)
      .where(or(...conditions))
      .returning({ id: translations.id, key: translations.translationKey, text: translations.translatedText });

    console.log(`✅ Deleted ${deleted.length} slop translations.`);
    deleted.forEach(d => console.log(`   - [${d.key}]: ${d.text?.substring(0, 50)}...`));

  } catch (error) {
    console.error('❌ Failed to clean slop:', error);
  }
}

cleanSlop();
