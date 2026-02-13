import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const shadowDir = '4-KELDER/0-GRONDSTOFFEN-FABRIEK/nuclear-content-relevant/multilingual-shadow/';
const containerDir = '4-KELDER/CONTAINER/';

async function processTranslations() {
  console.log("🚀 MARK: Starting Multilingual Shadow Transformation (V2)...");

  const files = fs.readdirSync(shadowDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(shadowDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Determine language from filename suffix (e.g., -fr.md)
    const langMatch = file.match(/-([a-z]{2})\.md$/);
    if (!langMatch) continue;
    
    const lang = langMatch[1];
    const baseSlug = file.replace(`-${lang}.md`, '');
    
    // The translation key is usually the slug of the article
    const translationKey = baseSlug;
    
    const body = content.split('---').pop()?.trim() || '';
    const titleMatch = content.match(/title: "(.+)"/);
    const title = titleMatch ? titleMatch[1] : '';

    console.log(`📝 Injecting translation for: ${translationKey} (${lang})`);

    // Check if exists first
    const { data: existing } = await supabase
      .from('translations')
      .select('id')
      .eq('translation_key', translationKey)
      .eq('lang', lang)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️ Translation already exists: ${translationKey} (${lang})`);
      fs.renameSync(filePath, path.join(containerDir, file));
      continue;
    }

    const { error } = await supabase
      .from('translations')
      .insert({
        translation_key: translationKey,
        lang: lang,
        translated_text: body,
        context: 'article_body',
        is_manually_edited: true
      });

    if (error) {
      console.error(`❌ Error translation ${translationKey} (${lang}):`, error);
    } else {
      // Also inject title translation if found
      if (title) {
        const { data: existingTitle } = await supabase
          .from('translations')
          .select('id')
          .eq('translation_key', `${translationKey}_title`)
          .eq('lang', lang)
          .maybeSingle();

        if (!existingTitle) {
          await supabase.from('translations').insert({
            translation_key: `${translationKey}_title`,
            lang: lang,
            translated_text: title,
            context: 'article_title',
            is_manually_edited: true
          });
        }
      }
      
      fs.renameSync(filePath, path.join(containerDir, file));
    }
  }

  console.log("🏁 Multilingual Shadow Transformation completed.");
}

processTranslations().catch(console.error);
