import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function refineAcademyArticle() {
  console.log("🚀 MARK: Refining Academy article 'Waar vind je voice-over werk?'...");

  const slug = 'vind-voice-werk';
  const iap_context = { 
    journey: 'academy', 
    persona: 'student', 
    theme: 'Marketing & Business', 
    intent: 'Career Growth' 
  };

  // 1. Update IAP Context
  const { error: updateError } = await supabase
    .from('content_articles')
    .update({ iap_context, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (updateError) {
    console.error(`❌ Error updating article:`, updateError);
    return;
  }

  // 2. Refine Blocks to include the 50/50 rule
  const { data: article } = await supabase.from('content_articles').select('id').eq('slug', slug).single();
  
  if (article) {
    console.log("🛠️ Injecting '50-50 Regel' blocks...");
    
    // Clear existing blocks to ensure clean orchestration
    await supabase.from('content_blocks').delete().eq('article_id', article.id);

    await supabase.from('content_blocks').insert([
      {
        article_id: article.id,
        type: 'lifestyle-overlay',
        content: "## De 50-50 Regel voor Succes\nVeel beginnende voice-overs maken de fout om 100% van hun tijd te besteden aan hun stemtechniek. De realiteit? Succes is 50% inspreken en 50% marketing.",
        display_order: 1,
        settings: {
          image_url: '/assets/content/blog/images/academy-marketing.jpg',
          overlay_opacity: 0.4
        }
      },
      {
        article_id: article.id,
        type: 'thematic',
        content: "### De Balans van een Pro\n01. **Inspreken**: Blijf je techniek verfijnen, pick-ups oefenen en je bereik vergroten.\n02. **Marketing**: Bouw je netwerk, optimaliseer je demo's en wees zichtbaar waar klanten zoeken.\n03. **Consistentie**: Zonder marketing hoort niemand je stem. Zonder techniek boeken ze je niet nogmaals.",
        display_order: 2
      },
      {
        article_id: article.id,
        type: 'split-screen',
        content: "## Waar begin je?\nHet vinden van werk begint niet bij een castingbureau, maar bij je eigen positionering. In de Academy leren we je hoe je een business bouwt rondom je stem, zodat je niet afhankelijk bent van geluk.",
        display_order: 3
      }
    ]);
  }

  console.log("🏁 Academy refinement completed.");
}

refineAcademyArticle().catch(console.error);
