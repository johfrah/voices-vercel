import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const faqDir = '4-KELDER/0-GRONDSTOFFEN-FABRIEK/nuclear-content-relevant/faq/';
const containerDir = '4-KELDER/CONTAINER/';

async function processAllFaqs() {
  console.log("🚀 MARK: Starting Global FAQ Transformation Protocol (V2)...");

  if (!fs.existsSync(containerDir)) {
    fs.mkdirSync(containerDir, { recursive: true });
  }

  const files = fs.readdirSync(faqDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} FAQ files.`);

  for (const file of files) {
    const filePath = path.join(faqDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract metadata and content
    const titleMatch = content.match(/title: "(.+)"/);
    const slugMatch = content.match(/slug: (.+)/);
    const wpIdMatch = content.match(/legacy_id: (\d+)/);
    const body = content.split('---').pop()?.trim() || '';

    if (titleMatch && slugMatch) {
      const title = titleMatch[1];
      const slug = slugMatch[1];
      const wpId = wpIdMatch ? parseInt(wpIdMatch[1]) : null;

      console.log(`📝 Injecting FAQ: ${slug}`);
      
      // Check if it exists by wp_id or question_nl
      let existingFaq = null;
      if (wpId) {
        const { data } = await supabase.from('faq').select('id').eq('wp_id', wpId).maybeSingle();
        existingFaq = data;
      } else {
        const { data } = await supabase.from('faq').select('id').eq('question_nl', title).maybeSingle();
        existingFaq = data;
      }

      if (existingFaq) {
        console.log(`⏭️ FAQ already exists: ${slug}`);
        fs.renameSync(filePath, path.join(containerDir, file));
        continue;
      }

      const { error } = await supabase
        .from('faq')
        .insert({
          wp_id: wpId,
          question_nl: title,
          answer_nl: body,
          category: 'Algemeen',
          is_public: true
        });

      if (error) {
        console.error(`❌ Error FAQ ${slug}:`, error);
      } else {
        // Move to CONTAINER
        fs.renameSync(filePath, path.join(containerDir, file));
      }
    }
  }

  console.log("🏁 Global FAQ Transformation Protocol completed.");
}

processAllFaqs().catch(console.error);
