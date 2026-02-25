import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAgencyArticles() {
  console.log("🚀 MARK: Re-aligning articles to Agency (Telefonie) journey...");

  const updates = [
    {
      slug: 'stem-voor-telefoonboodschappen',
      iap_context: { journey: 'agency', persona: 'entrepreneur', theme: 'Telefonie', intent: 'Inspiration' }
    },
    {
      slug: 'zakelijke-voicemail-inspreken',
      iap_context: { journey: 'agency', persona: 'entrepreneur', theme: 'Telefonie', intent: 'Education' }
    },
    {
      slug: 'X-price',
      title: 'Hoeveel kost een voice-over?',
      iap_context: { journey: 'agency', persona: 'quality-seeker', theme: 'Tarieven', intent: 'Transparency' }
    },
    {
      slug: 'tips-klantenservice',
      iap_context: { journey: 'agency', persona: 'corporate', theme: 'Telefonie', intent: 'Strategy' }
    },
    {
      slug: 'dos-en-donts-wachtcentrale',
      iap_context: { journey: 'agency', persona: 'corporate', theme: 'Telefonie', intent: 'Compliance' }
    }
  ];

  for (const update of updates) {
    console.log(`📝 Updating IAP context for: ${update.slug}`);
    const { error } = await supabase
      .from('content_articles')
      .update({
        title: update.title, // Only defined for X-price to clean it up
        iap_context: update.iap_context,
        updated_at: new Date().toISOString()
      })
      .eq('slug', update.slug);

    if (error) {
      console.error(`❌ Error updating ${update.slug}:`, error);
    }
  }

  // Also ensure blocks use Agency-aligned instruments where possible
  // For 'Hoeveel kost een voice-over?', let's check its blocks
  const { data: priceArticle } = await supabase.from('content_articles').select('id').eq('slug', 'X-price').single();
  if (priceArticle) {
    console.log("🛠️ Refining blocks for 'Hoeveel kost een voice-over?' to match Agency Mandate...");
    
    // Check if it has blocks, if not, create them from the old content
    const { data: blocks } = await supabase.from('content_blocks').select('*').eq('article_id', priceArticle.id);
    
    if (!blocks || blocks.length === 0) {
      await supabase.from('content_blocks').insert([
        {
          article_id: priceArticle.id,
          type: 'split-screen',
          content: "## Transparantie in Tarieven\nBij Voices geloven we in eerlijke prijzen voor vakmanschap. Geen verborgen kosten, maar heldere tarieven die de waarde van een professionele stem reflecteren.",
          display_order: 1
        },
        {
          article_id: priceArticle.id,
          type: 'thematic',
          content: "### Waarom investeren in kwaliteit?\n01. **Merkwaarde**: Een stem is de auditieve handdruk van je bedrijf.\n02. **Conversie**: Professionele audio houdt bellers langer vast.\n03. **Autoriteit**: Straal vertrouwen uit vanaf de eerste seconde.",
          display_order: 2
        }
      ]);
    }
  }

  console.log("🏁 Agency alignment completed.");
}

updateAgencyArticles().catch(console.error);
