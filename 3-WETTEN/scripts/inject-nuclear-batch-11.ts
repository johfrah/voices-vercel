import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectBatch11() {
  console.log("🚀 MARK: Start Nuclear Injection Batch 11 (Partner Network)...");

  const now = new Date().toISOString();

  const partners = [
    { name: "Fonzer", slug: "partner-fonzer", text: "Wij kiezen maar voor 1 partnership voor het inspreken van telefoonboodschappen en dat is Voices. Een fijne samenwerking om onze klanten te ontzorgen. Zo voorzien we hen van een kwalitatieve cloud telefooncentrale in combinatie met de meest professionele ingesproken begroetingen." },
    { name: "Hello", slug: "partner-hello", text: "Onze klanten verwachten een professionele en klantgerichte call afhandeling. Voices.be ondersteunt onze klanten in het opmaken van de juiste boodschap voor een optimale totaalervaring." },
    { name: "Teamtel", slug: "partner-teamtel", text: "Voor al onze audio en prompt berichten werken we samen met Voices. De uitgebreide keuze aan stemmen en de snelle oplevering zorgt voor een efficiënte en aangename manier van samenwerken." },
    { name: "Voiceking", slug: "partner-voiceking", text: "We bieden onze klanten een professionele telefooncentrale aan, dan is het ook logisch dat we onze klanten graag doorverwijzen naar de professionele stemmen van voices.be om de digitale verwelkoming rond te maken." },
    { name: "Wimnet", slug: "partner-wimnet", text: "WimNet begeleidt heel wat bedrijven met de overgang naar het telewerken en denkt graag mee over hoe wij hun klanten beleving kunnen optimaliseren. Daarom is voices.be een logische structurele partner." }
  ];

  const article = {
    title: "Ons Partner Netwerk",
    slug: "partner-netwerk",
    content: "Ontdek de IT-bedrijven en VoIP-resellers die vertrouwen op de stemmen van Voices.be voor hun klanten.",
    status: 'publish',
    iap_context: { journey: 'agency', persona: 'partner', theme: 'Netwerk' },
    is_manually_edited: true,
    updated_at: now
  };

  try {
    console.log(`📝 Upserting article: ${article.slug}`);
    const { data: art, error: artError } = await supabase
      .from('content_articles')
      .upsert({
        title: article.title,
        slug: article.slug,
        content: article.content,
        status: article.status,
        iap_context: article.iap_context,
        is_manually_edited: article.is_manually_edited,
        updated_at: article.updated_at
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (artError) {
      console.error(`❌ Error article ${article.slug}:`, artError);
      return;
    }

    await supabase.from('content_blocks').delete().eq('article_id', art.id);
    
    // Create a carousel block for partners
    await supabase.from('content_blocks').insert({
      article_id: art.id,
      type: 'carousel',
      content: `## Onze Partners\n${partners.map(p => p.name).join('\n')}`,
      display_order: 1,
      is_manually_edited: true
    });

    // Create a bento grid for the testimonials
    await supabase.from('content_blocks').insert({
      article_id: art.id,
      type: 'bento',
      content: partners.map(p => `### ${p.name}\n${p.text}`).join('\n\n'),
      display_order: 2,
      is_manually_edited: true
    });

    console.log("🏁 Batch 11 Injection completed.");
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

injectBatch11().catch(console.error);
