import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function masterVoiceglotSync() {
  console.log("🚀 STARTING MASTER VOICEGLOT SYNC (v2.24.3)...");

  // 1. SYNC WORKSHOPS
  console.log("\n🎓 Syncing Workshop Deep-Content...");
  const { data: workshops } = await supabase.from('workshops').select('id, title, meta');
  
  for (const workshop of workshops || []) {
    const meta = workshop.meta || {};
    const baseKey = `workshop.${workshop.id}`;
    
    const fields = [
      { key: `${baseKey}.aftermovie`, text: meta.aftermovie_description, context: 'workshop_aftermovie' },
      { key: `${baseKey}.extended_content`, text: meta.workshop_content_detail, context: 'workshop_content' },
      { key: `${baseKey}.expert_note`, text: meta.expert_note, context: 'workshop_expert_note' }
    ];

    for (const field of fields) {
      if (field.text && field.text !== 'NULL' && field.text.length > 5) {
        await registerInVoiceglot(field.key, field.text, field.context);
      }
    }

    // Sync Day Schedule
    if (meta.day_schedule?.items) {
      for (let i = 0; i < meta.day_schedule.items.length; i++) {
        const item = meta.day_schedule.items[i];
        if (item.label) {
          await registerInVoiceglot(`${baseKey}.schedule.${i}`, item.label, 'workshop_schedule_item');
        }
      }
    }
  }

  // 2. SYNC ACTORS
  console.log("\n🎙️ Syncing Actor DNA & Bios...");
  const { data: actors } = await supabase.from('actors').select('id, first_name, last_name, bio, why_voices, tagline, studio_specs');
  
  for (const actor of actors || []) {
    const baseKey = `actor.${actor.id}`;
    const name = `${actor.first_name} ${actor.last_name || ''}`.trim();
    
    const fields = [
      { key: `${baseKey}.bio`, text: actor.bio, context: `bio_of_${name}` },
      { key: `${baseKey}.why_voices`, text: actor.why_voices, context: `why_voices_of_${name}` },
      { key: `${baseKey}.tagline`, text: actor.tagline, context: `tagline_of_${name}` },
      { key: `${baseKey}.studio_specs`, text: actor.studio_specs, context: `studio_specs_of_${name}` }
    ];

    for (const field of fields) {
      if (field.text && field.text !== 'NULL' && field.text.length > 5) {
        await registerInVoiceglot(field.key, field.text, field.context);
      }
    }
  }

  // 3. SYNC FAQS
  console.log("\n❓ Syncing FAQs...");
  const { data: faqs } = await supabase.from('faq').select('id, question_nl, answer_nl');
  for (const faq of faqs || []) {
    const baseKey = `faq.${faq.id}`;
    if (faq.question_nl) await registerInVoiceglot(`${baseKey}.question`, faq.question_nl, 'faq_question');
    if (faq.answer_nl) await registerInVoiceglot(`${baseKey}.answer`, faq.answer_nl, 'faq_answer');
  }

  // 4. SYNC REVIEWS
  console.log("\n⭐ Syncing Reviews...");
  const { data: reviews } = await supabase.from('reviews').select('id, text, author_name');
  for (const review of reviews || []) {
    const baseKey = `review.${review.id}`;
    if (review.text && review.text.length > 5) {
      await registerInVoiceglot(`${baseKey}.text`, review.text, `review_by_${review.author_name || 'anonymous'}`);
    }
  }

  // 5. SYNC ARTICLES / KNOWLEDGE
  console.log("\n📝 Syncing Knowledge & Articles...");
  try {
    const { data: knowledge } = await supabase.from('system_knowledge').select('id, title, content');
    for (const item of knowledge || []) {
      const baseKey = `knowledge.${item.id}`;
      if (item.title) await registerInVoiceglot(`${baseKey}.title`, item.title, 'knowledge_title');
      if (item.content && item.content.length > 10) {
        // PRIVACY GUARD: Check if content looks like a technical report or list of PII
        const isInternal = item.content.includes('| # | Naam |') || item.content.includes('DATA INTEGRITY REPORT');
        if (!isInternal) {
          await registerInVoiceglot(`${baseKey}.content`, item.content, 'knowledge_content');
        }
      }
    }
  } catch (e) {
    console.log("⚠️ Skipping system_knowledge (table might not exist or error occurred)");
  }

  // 6. SYNC ADEMING
  console.log("\n🧘 Syncing Ademing Tracks & Series...");
  const { data: ademingTracks } = await supabase.from('ademing_tracks').select('id, title, description');
  for (const track of ademingTracks || []) {
    const baseKey = `ademing.track.${track.id}`;
    if (track.title) await registerInVoiceglot(`${baseKey}.title`, track.title, 'ademing_track_title');
    if (track.description) await registerInVoiceglot(`${baseKey}.description`, track.description, 'ademing_track_description');
  }

  const { data: ademingSeries } = await supabase.from('ademing_series').select('id, title, description');
  for (const series of ademingSeries || []) {
    const baseKey = `ademing.series.${series.id}`;
    if (series.title) await registerInVoiceglot(`${baseKey}.title`, series.title, 'ademing_series_title');
    if (series.description) await registerInVoiceglot(`${baseKey}.description`, series.description, 'ademing_series_description');
  }

  // 7. SYNC CONTENT BLOCKS & ARTICLES
  console.log("\n📄 Syncing Content Blocks & Articles...");
  const { data: contentBlocks } = await supabase.from('content_blocks').select('id, key, content');
  for (const block of contentBlocks || []) {
    const baseKey = `block.${block.key || block.id}`;
    if (block.content) await registerInVoiceglot(`${baseKey}.content`, block.content, 'content_block');
  }

  const { data: contentArticles } = await supabase.from('content_articles').select('id, title, content');
  for (const article of contentArticles || []) {
    const baseKey = `article.${article.id}`;
    if (article.title) await registerInVoiceglot(`${baseKey}.title`, article.title, 'article_title');
    if (article.content) await registerInVoiceglot(`${baseKey}.content`, article.content, 'article_content');
  }

  // 8. SYNC PRODUCTS
  console.log("\n🛒 Syncing Products...");
  const { data: products } = await supabase.from('products').select('id, name, description');
  for (const product of products || []) {
    const baseKey = `product.${product.id}`;
    if (product.name) await registerInVoiceglot(`${baseKey}.name`, product.name, 'product_name');
    if (product.description) await registerInVoiceglot(`${baseKey}.description`, product.description, 'product_description');
  }

  // 9. SYNC SYSTEM KNOWLEDGE (The "Lessons" and "Tips")
  console.log("\n💡 Syncing Academy Tips & Lessons...");
  const { data: lessons } = await supabase.from('lessons').select('id, title, content');
  for (const lesson of lessons || []) {
    const baseKey = `lesson.${lesson.id}`;
    if (lesson.title) await registerInVoiceglot(`${baseKey}.title`, lesson.title, 'lesson_title');
    if (lesson.content) await registerInVoiceglot(`${baseKey}.content`, lesson.content, 'lesson_content');
  }

  const { data: academyTips } = await supabase.from('academy_tips').select('id, title, content');
  for (const tip of academyTips || []) {
    const baseKey = `academy_tip.${tip.id}`;
    if (tip.title) await registerInVoiceglot(`${baseKey}.title`, tip.title, 'academy_tip_title');
    if (tip.content) await registerInVoiceglot(`${baseKey}.content`, tip.content, 'academy_tip_content');
  }

  console.log("\n🏁 MASTER SYNC COMPLETED.");
}

async function registerInVoiceglot(key: string, text: string, context: string) {
  try {
    // CHRIS-PROTOCOL: Clean HTML, Markdown headers and slop from source text before registration
    let cleanText = text
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/^#+\s+/gm, '')   // Remove Markdown headers (##, ###, etc) at start of lines
      .replace(/\\"/g, '"')      // Fix escaped quotes
      .replace(/&nbsp;/g, ' ')   // Clean entities
      .trim();

    if (!cleanText || cleanText.length < 2) return;

    // First, check if it exists and has HTML (to force update if needed)
    const { data: existing } = await supabase
      .from('translation_registry')
      .select('original_text')
      .eq('string_hash', key)
      .maybeSingle();

    if (existing && existing.original_text.includes('<')) {
      // Force update to clean version
      const { error: updateError } = await supabase.from('translation_registry').update({
        original_text: cleanText,
        last_seen: new Date()
      }).eq('string_hash', key);
      
      if (updateError) console.error(`❌ Update Error for ${key}:`, updateError.message);
      else console.log(`✨ Cleaned HTML from existing: ${key}`);
    } else {
      const { error: upsertError } = await supabase.from('translation_registry').upsert({
        string_hash: key,
        original_text: cleanText,
        context: context,
        last_seen: new Date(),
        source_lang_id: 1 // nl-be
      }, { onConflict: 'string_hash' });
      
      if (upsertError) console.error(`❌ Registry Error for ${key}:`, upsertError.message);
      else console.log(`✅ Registered: ${key.padEnd(45)} | ${cleanText.substring(0, 30)}...`);
    }
  } catch (err: any) {
    console.error(`❌ Failed for ${key}:`, err.message);
  }
}

masterVoiceglotSync().catch(console.error);
