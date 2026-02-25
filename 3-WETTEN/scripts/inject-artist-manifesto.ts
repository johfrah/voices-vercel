import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectArtistManifesto() {
  console.log("🚀 MARK: Injecting Artist Manifesto...");

  const now = new Date().toISOString();

  const article = {
    title: "The Artist Manifesto",
    slug: "artist-manifesto",
    content: "We believe the most moving music comes from honesty. From real voices that are pure and full of life.",
    status: 'publish',
    iap_context: { journey: 'artist', persona: 'artist', theme: 'Vision' },
    is_manually_edited: true,
    updated_at: now
  };

  try {
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
    
    await supabase.from('content_blocks').insert([
      {
        article_id: art.id,
        type: 'story-layout',
        content: "## We believe\nthe most moving music comes from honesty. From real voices that are pure and full of life. Voices that touch before they impress.",
        display_order: 1,
        is_manually_edited: true
      },
      {
        article_id: art.id,
        type: 'deep-read',
        content: "## By working with singers\nwho dare to be themselves. By honoring authenticity, emotion and ownership. By creating a space of care and respect, where artists keep control over their music and their story.",
        display_order: 2,
        is_manually_edited: true
      },
      {
        article_id: art.id,
        type: 'story-layout',
        content: "## voices.be/artists\nAn independent label for singers who dare to be real. Supporting and presenting voices from Belgium to their audience. A place for music that feels real.\n\nIt was not created as a business idea. It was created from a love for voices.",
        display_order: 3,
        is_manually_edited: true
      }
    ]);

    console.log("🏁 Artist Manifesto Injection completed.");
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

injectArtistManifesto().catch(console.error);
